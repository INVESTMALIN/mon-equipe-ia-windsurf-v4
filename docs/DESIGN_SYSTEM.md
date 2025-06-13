# Design System - Mon Équipe IA

## Vue d'ensemble
Ce document définit le système de design de l'application "Mon Équipe IA", une plateforme d'assistants IA dédiée aux clients Invest Malin ayant acheté la formation "conciergerie clé en main".

## 🎨 Palette de couleurs

### Couleurs primaires
- **Primaire dorée** : `#dbae61` - Couleur principale de la marque
- **Primaire dorée hover** : `#c49a4f` - État survol des éléments interactifs
- **Noir** : `#000000` - Texte principal et arrière-plans
- **Blanc cassé** : `#f8f8f8` - Arrière-plans secondaires

### Couleurs secondaires
- **Blanc** : `#ffffff` - Contraste et arrière-plans
- **Gris foncé** : `#374151` - Texte secondaire
- **Gris moyen** : `#6b7280` - Texte tertiaire
- **Gris clair** : `#d1d5db` - Bordures et séparateurs

### Usage des couleurs
```css
/* Boutons primaires */
.btn-primary {
  background-color: #dbae61;
  color: #000000;
}

.btn-primary:hover {
  background-color: #c49a4f;
}

/* Sections alternées */
.section-dark {
  background-color: #000000;
  color: #ffffff;
}

.section-light {
  background-color: #f8f8f8;
  color: #000000;
}
```

## 📝 Typographie

### Police principale
- **Famille** : Montserrat
- **Import** : `@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap')`

### Hiérarchie typographique

#### Titres
- **H1** : `text-3xl md:text-4xl font-bold` (48px desktop, 30px mobile)
- **H2** : `text-3xl font-bold` (30px)
- **H3** : `text-2xl font-bold` (24px)
- **H4** : `text-xl font-semibold` (20px)

#### Corps de texte
- **Texte principal** : `text-lg` (18px)
- **Texte secondaire** : `text-base` (16px)
- **Petit texte** : `text-sm` (14px)

#### Exemples d'usage
```html
<!-- Titre principal -->
<h1 class="text-3xl md:text-4xl font-bold text-black mb-6 leading-tight">
  UNE ÉQUIPE <span class="font-normal">IA</span> DÉDIÉE À VOTRE CONCIERGERIE
</h1>

<!-- Paragraphe -->
<p class="text-xl text-gray-700 mb-8 leading-relaxed max-w-3xl mx-auto">
  Contenu du paragraphe...
</p>
```

## 📐 Espacement et mise en page

### Système d'espacement (basé sur Tailwind)
- **xs** : `4px` (space-1)
- **sm** : `8px` (space-2)  
- **md** : `16px` (space-4)
- **lg** : `24px` (space-6)
- **xl** : `32px` (space-8)
- **2xl** : `48px` (space-12)
- **3xl** : `64px` (space-16)
- **4xl** : `80px` (space-20)

### Conteneurs et largeurs
```css
/* Conteneur principal */
.container-main {
  max-width: 1280px; /* max-w-6xl */
  margin: 0 auto;
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem;
}

/* Conteneur large */
.container-large {
  max-width: 1536px; /* max-w-7xl */
}

/* Sections padding */
.section-padding {
  padding: 4rem 1.5rem; /* py-16 px-6 */
}

/* Desktop padding */
@media (min-width: 768px) {
  .section-padding {
    padding-left: 5rem; /* md:px-20 */
    padding-right: 5rem;
  }
}
```

## 🧩 Composants UI

### Boutons

#### Bouton primaire
```html
<a class="bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold px-8 py-3 rounded-md text-center transition-colors">
  Texte du bouton
</a>
```

#### Bouton secondaire
```html
<a class="bg-white text-black border-2 border-[#dbae61] hover:bg-gray-50 font-semibold px-8 py-3 rounded-md text-center transition-colors">
  Texte du bouton
</a>
```

#### Bouton de navigation
```html
<a class="hover:text-[#dbae61] transition-colors text-sm font-medium">
  Lien de navigation
</a>
```

### Cartes

#### Carte d'assistant
```html
<div class="bg-white rounded-lg shadow-lg overflow-hidden">
  <div class="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    <img src="..." alt="..." class="w-24 h-24 object-contain">
  </div>
  <div class="p-6">
    <h3 class="text-xl font-bold text-black mb-3">Titre</h3>
    <p class="text-gray-600 mb-4">Description</p>
    <a class="w-full bg-[#dbae61] hover:bg-[#c49a4f] text-black font-semibold py-3 px-4 rounded-md transition-colors text-center block">
      Action
    </a>
  </div>
</div>
```

#### Carte de témoignage
```html
<div class="bg-[#f8f8f8] p-8 rounded-lg shadow-sm text-center max-w-sm">
  <div class="w-16 h-16 bg-[#dbae61] rounded-full flex items-center justify-center mx-auto mb-6">
    <User class="text-black w-8 h-8" />
  </div>
  <p class="text-gray-700 mb-6 italic">Citation</p>
  <h4 class="font-bold text-black">NOM</h4>
</div>
```

### Formulaires

#### Champ de saisie
```html
<input 
  type="text" 
  class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#dbae61] focus:border-transparent outline-none transition-colors"
  placeholder="Placeholder"
>
```

#### Label
```html
<label class="block text-sm font-medium text-gray-700 mb-2">
  Libellé du champ
</label>
```

## 🎯 Iconographie

### Bibliothèque d'icônes
- **Lucide React** : Bibliothèque principale d'icônes
- Style : Outline, épaisseur 2px
- Tailles communes : `w-4 h-4`, `w-6 h-6`, `w-8 h-8`

### Icônes couramment utilisées
- `Menu` : Menu hamburger mobile
- `X` : Fermeture de modal/menu
- `User` : Profil utilisateur
- `CheckCircle` : Validation/avantages
- `Lock` : Sécurité/authentification

### Usage
```html
<CheckCircle class="text-[#dbae61] w-6 h-6 mt-1 flex-shrink-0" />
```

## 📱 Responsive Design

### Breakpoints (Tailwind)
- **sm** : 640px
- **md** : 768px  
- **lg** : 1024px
- **xl** : 1280px
- **2xl** : 1536px

### Patterns responsive

#### Grilles adaptatives
```html
<!-- Mobile empilé, desktop côte à côte -->
<div class="flex flex-col md:grid md:grid-cols-2 gap-8">
  <div>Contenu 1</div>
  <div>Contenu 2</div>
</div>

<!-- Grille avec ratios spécifiques -->
<div class="flex flex-col md:grid md:grid-cols-[40%_60%] md:h-[500px]">
  <div>40% largeur</div>
  <div>60% largeur</div>
</div>
```

#### Navigation mobile
```html
<!-- Menu desktop -->
<nav class="hidden md:flex space-x-8">
  <a href="#">Lien</a>
</nav>

<!-- Bouton hamburger mobile -->
<button class="md:hidden">
  <Menu class="w-6 h-6" />
</button>
```

## 🏗️ Architecture des sections

### Section Hero
```html
<section class="bg-[#f8f8f8] px-6 md:px-20 py-20 text-center">
  <div class="max-w-5xl mx-auto">
    <h1>Titre principal</h1>
    <p>Description</p>
    <div class="flex gap-4">
      <!-- Boutons CTA -->
    </div>
  </div>
</section>
```

### Section avec image (split-screen)
```html
<section class="bg-black text-white">
  <div class="flex flex-col md:grid md:grid-cols-[40%_60%] md:h-[500px]">
    <div class="relative overflow-hidden h-64 md:h-auto">
      <img src="..." class="w-full h-full object-cover object-center">
    </div>
    <div class="px-6 md:px-8 lg:px-12 py-8 flex flex-col justify-center">
      <!-- Contenu -->
    </div>
  </div>
</section>
```

### Section témoignages
```html
<section class="bg-white px-6 md:px-20 py-16">
  <div class="max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-center text-black mb-12">TÉMOIGNAGES</h2>
    <div class="flex justify-center gap-8 flex-wrap">
      <!-- Cartes témoignages -->
    </div>
  </div>
</section>
```

## 🎨 Principes UX

### 1. Hiérarchie visuelle
- Utiliser la couleur dorée (#dbae61) pour les éléments prioritaires
- Contraste élevé entre les sections (noir/blanc cassé)
- Typographie en gras pour les titres importants

### 2. Cohérence
- Espacement uniforme entre les sections (py-16)
- Arrondi constant pour les boutons (rounded-md)
- Transitions fluides sur tous les éléments interactifs

### 3. Mobile-first
- Conception mobile en priorité
- Grilles qui s'adaptent naturellement
- Menu hamburger pour la navigation mobile

### 4. Accessibilité
- Contrastes respectant les standards WCAG
- Focus visible sur les éléments interactifs
- Structure sémantique HTML appropriée

### 5. Performance
- Images optimisées et responsive
- Classes Tailwind purgées en production
- Transitions CSS performantes

## 📁 Convention de nommage

### Classes CSS personnalisées
- Préfixe par composant : `.btn-`, `.card-`, `.section-`
- Modificateurs avec tirets : `.btn-primary`, `.btn-secondary`
- États avec double tirets : `.btn--disabled`, `.card--highlighted`

### Fichiers et composants
- PascalCase pour les composants React : `AssistantFormation.jsx`
- Versioning explicite : `MonCompte-v2.jsx`
- Kebab-case pour les assets : `assistant-formation.png`

### Variables et couleurs
- Couleurs avec hex complet : `#dbae61` plutôt que raccourcis
- Variables descriptives dans les commentaires
- Groupement logique des propriétés CSS

## 🔧 Configuration technique

### Tailwind CSS
```javascript
// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Montserrat', 'sans-serif'],
      },
      colors: {
        'primary': '#dbae61',
        'primary-hover': '#c49a4f',
      }
    }
  }
}
```

### Import des polices
```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap');
```

Cette documentation sert de référence complète pour maintenir la cohérence visuelle et l'expérience utilisateur de l'application "Mon Équipe IA".