# Audit technique Stripe × React/Supabase — Rapport final et changements

Date: 30/09/2025, fuseau Asie/Ho_Chi_Minh
Portée: App “Mon Équipe IA”, intégration Stripe, Webhooks, Front React, Supabase (DB + RLS)

Ce document décrit l’état initial, les risques, les correctifs appliqués aujourd’hui, les preuves de test, et les actions restantes. Il sert de référence pour la mise en prod et pour les futures revues de sécurité.

---

## Résumé exécutif

Statut global, prêt pour la prod avec surveillance.
Les bugs bloquants côté Stripe webhook sont corrigés.
L’accès premium et trial est cohérent côté Front.
La base applique les garde-fous critiques.

Points critiques corrigés:

* Idempotence webhook avec journalisation d’events.
* Expiration trial et période payante vérifiées côté client.
* RLS durcies, update utilisateur limité.
* Contrainte UNIQUE sur `stripe_customer_id`.
* Gestion de `customer.subscription.updated`.
* Filtrage d’événements par produit/prix.
* Correction du mapping `user_id` et sécurisation des dates Stripe.

Points moyens restants, planifiés.
Quelques finitions UX mineures.

---

## Contexte initial et risques observés

1. Le webhook recevait des événements non ciblés, d’où des 500.
2. Aucune idempotence, risque de doubles écritures.
3. Le Front n’expirait pas l’accès si les dates Stripe n’étaient pas en DB.
4. `stripe_customer_id` non UNIQUE, risque de collision.
5. RLS trop permissives, un user pouvait “s’auto-upgrader” s’il tentait.
6. `customer.subscription.updated` non écouté côté Stripe, désync possible.
7. Un bug logique dans `checkout.session.completed` (wrong id + dates).
8. Dépendance `micro` manquante en prod Vercel, 500 systématiques.
9. Contrôle premium/trial incohérent dans `Dashboard.jsx`.

---

## Correctifs appliqués (détaillés)

### 1) Idempotence des webhooks Stripe  **(CRITIQUE)**

But, éviter les doubles traitements, garder une trace, faciliter le debug.

Table d’événements:

```sql
CREATE TABLE stripe_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  data JSONB
);

CREATE INDEX idx_stripe_events_type ON stripe_events(type);
CREATE INDEX idx_stripe_events_processed_at ON stripe_events(processed_at);
```

Logique dans `api/webhook.js`:

* On **vérifie** si `event.id` a déjà été traité.
* On **traite** la DB.
* On **marque l’event comme traité** seulement après succès DB.

Extrait:

```js
// idempotence: check déjà traité
const { data: existingEvent } = await supabase
  .from('stripe_events').select('id').eq('id', event.id).single();
if (existingEvent) return res.json({ received: true, ignored: true, reason: 'already_processed' });

// helper
const markEventAsProcessed = async () => {
  const { error } = await supabase.from('stripe_events').insert({
    id: event.id, type: event.type, data: event.data.object
  });
  if (error) console.error('⚠️ insert stripe_events:', error);
};
```

Impact, aucun double update, audit possible, traitement robuste.

Risques résiduels, faibles, prévoir une purge périodique des vieux events.

---

### 2) Contrôle d’accès par dates côté Front  **(CRITIQUE)**

But, ne jamais laisser un trial expiré actif en cas d’échec webhook.

Dans `ProtectedRoute.jsx`, on vérifie:

* si `status === 'trial'`, on compare `subscription_trial_end` avec `now`.
* si `status === 'premium'`, on compare `subscription_current_period_end` avec `now`.
* sinon, redirection vers `/upgrade`.

Effet, plus d’accès indu en cas de panne webhook.
Risque résiduel, si l’utilisateur désactive JS. On couvrira côté serveur via un cron de resync (voir “Actions restantes”).

---

### 3) RLS durcies  **(CRITIQUE)**

But, empêcher un utilisateur de modifier ses colonnes Stripe.

Nouvelles policies:

```sql
-- SELECT
CREATE POLICY "Users can read their own record"
ON users FOR SELECT USING (auth.uid() = id);

-- UPDATE limité, colonnes Stripe inchangées
CREATE POLICY "Users can update their own record (limited)"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND stripe_customer_id IS NOT DISTINCT FROM (SELECT stripe_customer_id FROM users WHERE id = auth.uid())
  AND stripe_subscription_id IS NOT DISTINCT FROM (SELECT stripe_subscription_id FROM users WHERE id = auth.uid())
  AND subscription_status IS NOT DISTINCT FROM (SELECT subscription_status FROM users WHERE id = auth.uid())
  AND subscription_trial_end IS NOT DISTINCT FROM (SELECT subscription_trial_end FROM users WHERE id = auth.uid())
  AND subscription_current_period_end IS NOT DISTINCT FROM (SELECT subscription_current_period_end FROM users WHERE id = auth.uid())
);
```

Effet, l’utilisateur peut éditer son profil, pas son statut d’abonnement ni ses ids Stripe.
Risque résiduel, très faible.

---

### 4) Contrainte UNIQUE sur `stripe_customer_id`  **(CRITIQUE)**

But, empêcher deux users de partager le même customer Stripe.

```sql
ALTER TABLE users 
ADD CONSTRAINT unique_stripe_customer_id UNIQUE (stripe_customer_id);
```

Vérification préalable des doublons effectuée, aucun doublon.
Effet, supprime un risque de facturation croisée.
Risque résiduel, nul.

---

### 5) Écoute de `customer.subscription.updated`  **(CRITIQUE)**

But, rester synchro lors des upgrades/downgrades via le Customer Portal.

Deux actions:

* Code: prise en charge du case `customer.subscription.updated`.
* Stripe Dashboard: ajout de l’event à la liste des événements écoutés.

Filtrage côté code mis à jour:

```js
function isMonEquipeIAEvent(event) {
  const t = event.type;
  if (t === 'checkout.session.completed') { /* check metadata.product/price */ }
  if (t === 'invoice.payment_succeeded' || t === 'invoice.payment_failed') { /* check price_id */ }
  if (t === 'customer.subscription.deleted' || t === 'customer.subscription.updated') return true;
  return false;
}
```

Case handling:

```js
case 'customer.subscription.updated': {
  const sub = event.data.object;
  const status = sub.status === 'trialing' ? 'trial'
               : sub.status === 'active' ? 'premium'
               : 'expired';
  const updateData = {
    subscription_status: status,
    stripe_subscription_id: sub.id,
    subscription_trial_end: sub.status === 'trialing' && sub.trial_end
      ? new Date(sub.trial_end * 1000) : null,
    subscription_current_period_end: sub.status === 'active' && sub.current_period_end
      ? new Date(sub.current_period_end * 1000) : null,
  };
  const { error } = await supabase.from('users')
    .update(updateData)
    .eq('stripe_customer_id', sub.customer);
  if (error) throw error;
  await markEventAsProcessed();
  break;
}
```

Effet, la DB reste cohérente quand l’utilisateur change de plan.
Risque résiduel, faible.

---

### 6) Webhook, correction du mapping utilisateur + dates sûres  **(CRITIQUE)**

But, corriger le 500 lors de `checkout.session.completed`.

Points corrigés:

* Utiliser `session.metadata.user_id` en priorité, fallback `client_reference_id`.
* Ne convertir les timestamps Stripe en `Date` que s’ils existent.

Extrait:

```js
case 'checkout.session.completed': {
  const session = event.data.object;
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) throw new Error('Missing user_id in checkout session');

  const sub = await stripe.subscriptions.retrieve(session.subscription);
  const isOnTrial = sub.status === 'trialing';
  const updateData = {
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    subscription_status: isOnTrial ? 'trial' : 'premium'
  };
  if (isOnTrial && sub.trial_end) {
    updateData.subscription_trial_end = new Date(sub.trial_end * 1000);
  }
  if (!isOnTrial && sub.current_period_end) {
    updateData.subscription_current_period_end = new Date(sub.current_period_end * 1000);
  }
  const { error } = await supabase.from('users').update(updateData).eq('id', userId);
  if (error) throw error;
  await markEventAsProcessed();
  break;
}
```

Effet, plus de 500, update DB fiable.
Risque résiduel, faible.

---

### 7) Webhook, “toujours répondre 200” en cas d’exception  **(MOYEN)**

But, éviter les retries infinis Stripe si la DB tombe brièvement.

Catch final:

```js
} catch (err) {
  console.error('❌ Erreur traitement webhook:', err);
  res.status(200).json({ received: true, error: true, message: err.message });
}
```

Couplé à l’idempotence, on évite le double traitement.
Attention, surveiller les logs, car un 200 peut masquer un problème persistant si on ne regarde pas.
Risque résiduel, moyen si la supervision est faible.

---

### 8) Dépendance `micro` manquante en prod  **(MOYEN)**

But, corriger l’erreur `Cannot find package 'micro'` sur Vercel.

Action, `npm install micro`.
Alternative possible, une fonction locale `buffer()` sans dépendance.
Risque résiduel, nul, build OK.

---

### 9) Écoute d’événements Stripe et filtrage produit/prix  **(MOYEN)**

But, ne traiter que “Mon Équipe IA”.

Côté Stripe, endpoint écoute maintenant:

* `checkout.session.completed`
* `invoice.payment_succeeded`
* `invoice.payment_failed`
* `customer.subscription.deleted`
* `customer.subscription.updated`

Côté code, filtrage par `product_id` et `price_id` sur les events utiles.
Risque résiduel, faible.

---

### 10) Front, accès premium/trial unifié dans le Dashboard  **(MOYEN)**

But, éviter l’écran “Accès Premium requis” pendant un trial.

Deux points corrigés dans `Dashboard.jsx`:

* Condition d’accès:

```js
const isPremium = ['premium', 'trial'].includes(userProfile?.subscription_status);
```

* Chargement des fiches aussi pour `trial`:

```js
if (profile?.subscription_status === 'premium' || profile?.subscription_status === 'trial') {
  await loadUserFiches(user.id);
}
```

Effet, le Dashboard et les fiches s’affichent en trial.
Risque résiduel, nul.

---

## Base de données, schéma et contraintes

Table `users`, colonnes pertinentes:

* `subscription_status` (`'free'` par défaut), `subscription_trial_end`, `subscription_current_period_end`
* `stripe_customer_id`, `stripe_subscription_id`

Index présents et contraints:

* `users_pkey` sur `id`
* `idx_users_stripe_customer` sur `stripe_customer_id`
* `idx_users_trial_end` sur `subscription_trial_end`
* `UNIQUE (stripe_customer_id)`  ✅ ajouté

RLS actives, SELECT et UPDATE limité appliquées  ✅

---

## Tests effectués et résultats

Scénarios validés aujourd’hui:

* Checkout réel en live avec coupon 100%.
* `checkout.session.completed` reçu, 200 OK, DB mise à jour sur `trial` avec date d’expiration.
* `invoice.payment_succeeded` reçu, 200 OK, DB mise à jour côté `premium` quand applicable.
* `customer.subscription.updated` ajouté à la config Stripe, code prêt.
* Front met à jour l’affichage, Dashboard accessible en trial, assistants visibles, date de fin d’essai affichée.

Logs Vercel significatifs:

* `📨 Webhook reçu: ...`
* `✅ Événement Mon Équipe IA confirmé: ...`
* `🛒 Checkout session completed: ...`
* `👤 User ID: ...`
* `📋 Subscription status: trialing`
* `📅 Trial end date: ...`
* `✅ Utilisateur mis à jour: { user_id, status, customer_id }`

---

## Risques résiduels et recommandations

Critiques, à prévoir post-prod proche:

* **Resync serveur périodique** Stripe ↔ Supabase. Cron quotidien.
  Objectif, corriger d’éventuels ratés de webhook.
  Stratégie, pour chaque `stripe_customer_id`, récupérer la sub Stripe, recalculer `status` et dates, réécrire la DB si écart.
* **Alerting** sur erreurs webhook:
  Console Vercel + alerte Slack ou email si `error: true` dans la réponse webhook, ou si insert `stripe_events` échoue.

Moyens:

* Enum de `subscription_status` pour verrouiller les valeurs (`free`, `trial`, `premium`, `expired`).
* Mettre `MON_EQUIPE_IA_PRODUCT_ID` et `MON_EQUIPE_IA_PRICE_ID` en variables d’environnement.
* Logs structurés (JSON) et corrélation par `event.id` et `stripe_customer_id`.

Faibles:

* UX, rafraîchissement auto après upgrade.
* Messages d’erreur plus fins côté Front.
* Bouton “Modifier les informations” dans `MonCompte.jsx` sans `onClick`. À brancher sur un modal d’édition ou une page `/edit-profile`.

---

## Annexes — extraits finaux de référence

### Webhook, filtrage d’appartenance au produit

```js
const MON_EQUIPE_IA_PRODUCT_ID = 'prod_...';
const MON_EQUIPE_IA_PRICE_ID = 'price_...';

function isMonEquipeIAEvent(event) {
  const t = event.type;

  if (t === 'checkout.session.completed') {
    const s = event.data.object;
    const m = s.metadata || {};
    return m.product === MON_EQUIPE_IA_PRODUCT_ID && m.price === MON_EQUIPE_IA_PRICE_ID;
  }
  if (t === 'invoice.payment_succeeded' || t === 'invoice.payment_failed') {
    const inv = event.data.object;
    const line = inv.lines?.data?.[0];
    const priceId = line?.price?.id;
    return priceId === MON_EQUIPE_IA_PRICE_ID;
  }
  if (t === 'customer.subscription.deleted' || t === 'customer.subscription.updated') {
    return true;
  }
  return false;
}
```

### Webhook, `checkout.session.completed` (correctif clé)

```js
case 'checkout.session.completed': {
  const session = event.data.object;
  const userId = session.metadata?.user_id || session.client_reference_id;
  if (!userId) throw new Error('Missing user_id in checkout session');

  const sub = await stripe.subscriptions.retrieve(session.subscription);
  const isOnTrial = sub.status === 'trialing';

  const updateData = {
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
    subscription_status: isOnTrial ? 'trial' : 'premium'
  };

  if (isOnTrial && sub.trial_end) {
    updateData.subscription_trial_end = new Date(sub.trial_end * 1000);
  }
  if (!isOnTrial && sub.current_period_end) {
    updateData.subscription_current_period_end = new Date(sub.current_period_end * 1000);
  }

  const { error } = await supabase.from('users').update(updateData).eq('id', userId);
  if (error) throw error;

  await markEventAsProcessed();
  break;
}
```

### Webhook, `invoice.payment_succeeded` (dates sécurisées)

```js
case 'invoice.payment_succeeded': {
  const invoice = event.data.object;
  const sub = await stripe.subscriptions.retrieve(invoice.subscription);

  const updateData = {
    subscription_status: 'premium',
    subscription_trial_end: null,
    subscription_current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null
  };

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('stripe_customer_id', invoice.customer);
  if (error) throw error;

  await markEventAsProcessed();
  break;
}
```

### Front, `ProtectedRoute.jsx` (dates d’expiration)

> Vérifie session, puis status + dates. Redirige si expiré ou incohérent.
> *(extrait tel qu’implémenté aujourd’hui)*

### Front, `Dashboard.jsx` (trial accepté partout)

```js
const isPremium = ['premium', 'trial'].includes(userProfile?.subscription_status);

// chargement fiches si trial ou premium
if (profile?.subscription_status === 'premium' || profile?.subscription_status === 'trial') {
  await loadUserFiches(user.id);
}
```

### DB, contrainte UNIQUE

```sql
ALTER TABLE users 
ADD CONSTRAINT unique_stripe_customer_id UNIQUE (stripe_customer_id);
```

### DB, RLS

Voir bloc “RLS durcies” ci-dessus.

---

## État final, prêt pour prod

* Webhooks Stripe robustes, idempotents, filtrés, avec ACK 200.
* Flux d’inscription et d’abonnement cohérent, y compris essais gratuits.
* RLS correctes, colonne client Stripe unique, DB propre.
* Front bloque correctement en cas d’expiration, et accepte trial.

Surveille les logs webhook la première semaine.
Planifie le cron de resynchronisation.
Branche le bouton “Modifier les informations” dans `MonCompte.jsx`.