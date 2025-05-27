# Mon Équipe IA – Application React + Supabase + Vercel

Mon Équipe IA est une application web développée en React avec Vite. Elle permet aux utilisateurs d'accéder à plusieurs assistants IA spécialisés pour des tâches spécifiques comme la fiscalité, les aspects juridiques, et la gestion des appels. 

## Fonctionnalités principales

- **Authentification des utilisateurs** :  
  - Inscription avec création de compte  
  - Connexion sécurisée avec gestion des sessions utilisateurs via **Supabase**  
  - Mot de passe oublié avec réinitialisation via email  
  - Redirection automatique si l'utilisateur n'est pas connecté  

- **Stockage des utilisateurs et des conversations** :
  - **Supabase** est utilisé pour gérer l'authentification, stocker les utilisateurs et leurs sessions
  - Les **conversations** avec l'IA sont également stockées et accessibles pour chaque utilisateur connecté, permettant ainsi un suivi historique

- **Accès conditionnel aux pages** :  
  - L'accès aux assistants IA est protégé, seuls les utilisateurs connectés peuvent y accéder
  - Si l'utilisateur essaie d'accéder à une page protégée sans être connecté, il est redirigé vers la page de connexion

- **Chatbot IA** :
  - Un assistant IA appelé **Coach Malin** est disponible pour répondre aux questions sur la formation Invest Malin
  - L'IA est intégrée pour fournir des réponses instantanées à chaque question
  - Le chatbot utilise un backend pour récupérer et envoyer des réponses via un webhook

- **Assistant IA spécialisé** :  
  Plusieurs agents IA sont disponibles, chacun spécialisé pour un domaine spécifique (Fiscalité, Juridique, Résumé d'appel). Ces assistants sont accessibles depuis un tableau de bord après connexion.

## Technologies utilisées

- **React** pour la création de l'interface utilisateur
- **Vite** pour un build rapide et un démarrage de projet efficace
- **Tailwind CSS** pour la mise en page et le style réactif
- **Supabase** pour l'authentification, la gestion des utilisateurs et des conversations
- **Vercel** pour le déploiement continu
- **Lucide React Icons** pour les icônes

## Fonctionnement de l'authentification

1. **Création de compte** : L'utilisateur crée un compte en fournissant son email et un mot de passe. Ce compte est ensuite enregistré dans **Supabase**.
2. **Connexion** : Après inscription, l'utilisateur peut se connecter en utilisant ses identifiants. La session est gérée via **Supabase** et les utilisateurs connectés ont accès à leur tableau de bord personnalisé.
3. **Mot de passe oublié** : Si l'utilisateur oublie son mot de passe, il peut demander un email de réinitialisation. Un lien de réinitialisation est envoyé à l'email de l'utilisateur pour qu'il puisse définir un nouveau mot de passe.
4. **Sécurisation de l'accès** : Si un utilisateur tente d'accéder à une page protégée sans être connecté, il est redirigé vers la page de connexion.

## Stockage des données dans Supabase

1. **Utilisateurs** : Les utilisateurs sont enregistrés dans la base de données **Supabase** lors de leur inscription. Supabase gère aussi les sessions utilisateur pour maintenir la connexion active.
2. **Conversations** : Les messages échangés avec l'assistant IA sont stockés dans **Supabase**, permettant ainsi de récupérer et d'afficher l'historique des conversations pour chaque utilisateur connecté.

## Variables d'environnement

Les variables sensibles telles que l'URL de Supabase et la clé d'API anonyme sont stockées dans le fichier `.env` à la racine du projet. Ce fichier **ne doit pas** être poussé sur GitHub pour des raisons de sécurité (ajouté dans `.gitignore`).

Exemple de fichier `.env` :

VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxx

Ces variables sont utilisées dans le fichier supabaseClient.js pour initialiser la connexion avec Supabase.

## Déploiement

Le projet est déployé sur Vercel, une plateforme de déploiement continu.

Les variables d'environnement nécessaires à la connexion avec Supabase sont également définies dans les paramètres du projet sur Vercel.

Vercel :
Le fichier .env doit être configuré dans Vercel pour l'environnement de production afin de s'assurer que les clés API sont correctement sécurisées en ligne.

Les clés Supabase utilisées sont définies comme variables d'environnement sous "Settings > Environment Variables" dans le tableau de bord Vercel.

## À venir

Version 2 de l’assistant avec historique des conversations.


### Quelques points clés :

1. Le fichier `.env` contient les clés sensibles et n'est pas poussé sur GitHub grâce au `.gitignore`.
2. Supabase est utilisé pour gérer l'authentification et le stockage des utilisateurs et des conversations.
3. Le projet est déployé via Vercel, avec des variables d'environnement définies dans le tableau de bord de Vercel.


