# Design System - Mon Équipe IA

## Vue d'ensemble
Ce document définit le système de design de l'application "Mon Équipe IA", une plateforme d'assistants IA dédiée aux clients Invest Malin ayant acheté la formation "conciergerie clé en main" pour la gestion immobilière locative.

## 🎨 Palette de couleurs

### Couleurs primaires
- **Primaire dorée** : `#dbae61` - Couleur principale de la marque Invest Malin
- **Primaire dorée hover** : `#c49a4f` - État survol des éléments interactifs
- **Noir** : `#000000` - Texte principal et arrière-plans sombres
- **Blanc cassé** : `#f8f8f8` - Arrière-plans secondaires

### Couleurs secondaires
- **Blanc** : `#ffffff` - Contraste et arrière-plans
- **Gris foncé** : `#374151` - Texte secondaire
- **Gris moyen** : `#6b7280` - Texte tertiaire
- **Gris clair** : `#d1d5db` - Bordures et séparateurs
- **Gris très clair** : `#f3f4f6` - Arrière-plans légers

### Usage des couleurs dans le code
```html
<!-- Bouton primaire -->
<button class="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold px-8 py-3 rounded-md transition-colors">
  Action principale
</button>

<!-- Section sombre -->
<section class="bg-black text-white">
  Contenu sur fond noir
</section>

<!-- Section claire -->
<section class="bg-[#f8f8f8] text-black">
  Contenu sur fond clair
</section>
```

## 📝 Typographie

### Police principale
- **Famille** : Montserrat
- **Import HTML** : `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">`
- **CSS** : `font-family: 'Montserrat', sans-serif;`

### Hiérarchie typographique utilisée

#### Titres
- **H1 Hero** : `text-3xl md:text-4xl font-bold` - Titre principal de landing page
- **H1 Standard** : `text-3xl font-bold` - Titre de section principale
- **H2** : `text-2xl font-bold` - Sous-titres importants
- **H3** : `text-xl font-bold` - Titres de cartes/composants
- **H4** : `text-lg font-semibold` - Petits titres

#### Corps de texte
- **Texte principal** : `text-lg` (18px) - Paragraphes importants
- **Texte standard** : `text-base` (16px) - Texte par défaut
- **Petit texte** : `text-sm` (14px) - Labels, metadata
- **Très petit** : `text-xs` (12px) - Mentions légales

#### Exemples réels du code
```html
<!-- Titre hero de la landing page -->
<h1 class="text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">
  UNE ÉQUIPE <span class="font-normal">IA</span> DÉDIÉE À VOTRE CONCIERGERIE
</h1>

<!-- Titre de section -->
<h2 class="text-3xl font-bold mb-6">
  <span class="text-[#dbae61]">MON ÉQUIPE IA</span>, Révolutionne votre conciergerie
</h2>

<!-- Paragraphe standard -->
<p class="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
  Contenu descriptif...
</p>
```

## 📐 Espacement et mise en page

### Système d'espacement (Tailwind standard)
- **px-6** : Padding horizontal mobile (24px)
- **md:px-20** : Padding horizontal desktop (80px)
- **py-16** : Padding vertical sections (64px)
- **py-8** : Padding vertical composants (32px)
- **gap-4/6/8** : Espacement entre éléments (16px/24px/32px)

### Conteneurs standards
```html
<!-- Conteneur de section -->
<section class="px-6 md:px-20 py-16">
  <div class="max-w-6xl mx-auto">
    <!-- Contenu centré avec max-width -->
  </div>
</section>

<!-- Conteneur hero -->
<section class="px-6 md:px-20 py-20 text-center">
  <div class="max-w-5xl mx-auto">
    <!-- Contenu hero centré -->
  </div>
</section>
```

## 🧩 Composants UI

### Boutons

#### Bouton primaire
```html
<button class="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold px-8 py-3 rounded-md text-center transition-colors">
  Action principale
</button>
```

#### Bouton secondaire
```html
<button class="bg-white text-black border-2 border-[#dbae61] hover:bg-gray-50 font-semibold px-8 py-3 rounded-md text-center transition-colors">
  Action secondaire
</button>
```

#### Bouton de retour/navigation
```html
<Link class="p-2 text-white hover:text-[#dbae61] transition-colors border border-white/80 hover:border-[#dbae61] rounded-md">
  <ArrowLeft class="w-4 h-4" />
</Link>
```

### Formulaires

#### Champ de saisie standard
```html
<input 
  type="text" 
  class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#dbae61] transition-colors"
  placeholder="Votre texte"
/>
```

#### Label de formulaire
```html
<label class="block text-sm font-semibold text-gray-700 mb-2">
  Libellé du champ
</label>
```

#### Messages d'erreur
```html
<div class="bg-red-50 border border-red-200 rounded-lg p-4">
  <p class="text-red-600 text-sm">Message d'erreur</p>
</div>
```

### Cartes

#### Carte d'assistant
```html
<div class="bg-white rounded-lg shadow-lg overflow-hidden max-w-sm">
  <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <img src="..." alt="..." class="w-24 h-24 object-contain">
  </div>
  <div class="p-6">
    <h3 class="text-xl font-bold text-black mb-3">Nom Assistant</h3>
    <p class="text-gray-600 mb-4">Description</p>
    <button class="w-full bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold py-3 px-4 rounded-md transition-colors">
      Accéder
    </button>
  </div>
</div>
```

## 🎯 Iconographie

### Bibliothèque d'icônes
- **Lucide React** : Bibliothèque principale d'icônes
- Style : Outline, épaisseur 2px par défaut
- Tailles standards : `w-4 h-4`, `w-6 h-6`, `w-8 h-8`

### Icônes couramment utilisées
```jsx
import {
  Menu, X,           // Navigation mobile
  User,              // Profil utilisateur  
  CheckCircle,       // Validation/avantages
  ArrowLeft,         // Retour
  MessageCircle,     // Chat/conversation
  Plus,              // Ajouter/nouveau
  GraduationCap      // Formation
} from 'lucide-react'
```

### Usage dans le code
```html
<CheckCircle class="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
<Menu class="w-6 h-6" />
```

## 📱 Responsive Design

### Breakpoints Tailwind utilisés
- **Mobile first** : Classes sans préfixe (< 768px)
- **md:** : 768px et plus (desktop)

### Patterns responsive courants

#### Navigation
```html
<!-- Menu desktop -->
<nav class="hidden md:flex gap-8 text-sm font-medium">
  <a href="#" class="hover:text-[#dbae61] transition-colors">Lien</a>
</nav>

<!-- Menu mobile -->
<button class="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
  {isMenuOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
</button>
```

#### Grilles split-screen
```html
<!-- Image + contenu -->
<div class="flex flex-col md:grid md:grid-cols-[40%_60%] md:h-[500px]">
  <div class="relative overflow-hidden h-64 md:h-auto">
    <img class="w-full h-full object-cover object-center" />
  </div>
  <div class="px-6 md:px-8 lg:px-12 py-8 flex flex-col justify-center">
    <!-- Contenu -->
  </div>
</div>
```

#### Headers adaptables
```html
<!-- Header mobile compact -->
<div class="md:hidden px-6 py-4 flex items-center justify-between">
  <!-- Logo + menu hamburger -->
</div>

<!-- Header desktop complet -->
<div class="hidden md:flex px-6 md:px-20 items-center justify-between">
  <!-- Logo + navigation + actions -->
</div>
```

## 🏗️ Architecture des sections

### Section Hero (landing page)
```html
<section class="bg-[#f8f8f8] px-6 md:px-20 py-20 text-center">
  <div class="max-w-5xl mx-auto">
    <h1 class="text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">
      Titre principal
    </h1>
    <p class="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
      Description
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <!-- Boutons CTA -->
    </div>
  </div>
</section>
```

### Section avec fond noir
```html
<section class="bg-black text-white">
  <div class="flex flex-col md:grid md:grid-cols-[40%_60%] md:h-[500px]">
    <!-- Image + contenu -->
  </div>
</section>
```

### Section assistants (grille)
```html
<section id="assistants" class="bg-white px-6 md:px-20 py-16">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-black mb-12">NOS ASSISTANTS IA</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Cartes assistants -->
    </div>
  </div>
</section>
```

## 🔧 Configuration technique actuelle

### Tailwind CSS (tailwind.config.js)
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### Police (index.html)
```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### CSS de base (index.css)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900;
  font-family: 'Montserrat', sans-serif;
}
```

## 🎨 Principes UX

### 1. Hiérarchie visuelle
- Couleur dorée `#dbae61` pour les éléments prioritaires (CTA, liens actifs)
- Contraste élevé : sections noires/blanches alternées
- Typographie en gras pour les titres importants

### 2. Cohérence
- Espacement uniforme : `py-16` pour les sections, `px-6 md:px-20` pour les marges
- Arrondi constant : `rounded-md` pour tous les boutons
- Transitions fluides : `transition-colors` sur tous les éléments interactifs

### 3. Mobile-first
- Classes sans préfixe pour mobile, `md:` pour desktop
- Navigation hamburger sur mobile
- Grilles qui se transforment en colonnes empilées

### 4. Accessibilité
- Contrastes respectés (noir sur blanc, blanc sur noir)
- Focus states : `focus:outline-none focus:border-[#dbae61]`
- Structure sémantique HTML (nav, section, h1-h4)

### 5. Performance
- Classes Tailwind purgées automatiquement par Vite
- Images optimisées avec `object-cover` et `object-contain`
- Transitions CSS légères

## 📁 Conventions de nommage

### Fichiers et composants
- **PascalCase** pour les composants React : `AssistantFormation.jsx`
- **Versioning explicite** : `MonCompte-v2.jsx`, `AssistantFormationWithHistory-v3.jsx`
- **Kebab-case** pour les assets : `assistant-formation.png`, `invest-malin-logo.png`

### Classes et couleurs
- Couleurs hex complètes : `bg-[#dbae61]` plutôt que raccourcis
- Classes Tailwind standard plutôt que CSS custom
- Préfixes logiques pour les routes : `/mon-compte/assistant-formation`

### Structure des images
```
public/images/
├── invest-malin-logo.png          # Logo principal
├── assistant-formation.png        # Image assistant formation
├── assistant-formation-rectangle.png
├── fiscaliste-ia.png             # Images assistants spécialisés
├── legalbnb-ia.png
├── negociateur-ia.png
├── hero-image.png                # Images de contenu
├── hero-illustration.png
└── login-illustration.png        # Images d'interface
```

Cette documentation reflète l'état actuel du codebase et sert de référence pour maintenir la cohérence du design system de Mon Équipe IA.