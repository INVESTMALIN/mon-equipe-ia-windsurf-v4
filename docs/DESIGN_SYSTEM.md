# Système de Design

## Palette de Couleurs

### Couleurs Principales
```css
:root {
  --primary: #2563eb;    /* Bleu principal */
  --secondary: #475569;  /* Gris secondaire */
  --accent: #f59e0b;     /* Orange accent */
  --success: #10b981;    /* Vert succès */
  --error: #ef4444;      /* Rouge erreur */
  --warning: #f59e0b;    /* Orange avertissement */
  --info: #3b82f6;       /* Bleu info */
}
```

### Couleurs de Fond
```css
:root {
  --background: #ffffff;     /* Fond principal */
  --background-alt: #f8fafc; /* Fond alternatif */
  --background-dark: #1e293b; /* Fond sombre */
}
```

### Couleurs de Texte
```css
:root {
  --text-primary: #1e293b;   /* Texte principal */
  --text-secondary: #64748b; /* Texte secondaire */
  --text-light: #f8fafc;     /* Texte clair */
}
```

## Typographie

### Familles de Polices
```css
:root {
  --font-primary: 'Inter', sans-serif;
  --font-secondary: 'Poppins', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Tailles de Police
```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

## Espacement

### Système de Grille
```css
:root {
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
}
```

## Composants

### Boutons
```jsx
// Primary Button
<button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
  Action
</button>

// Secondary Button
<button className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary-dark">
  Action
</button>

// Outline Button
<button className="border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-light">
  Action
</button>
```

### Formulaires
```jsx
// Input
<input 
  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
  type="text"
  placeholder="Entrez votre texte"
/>

// Select
<select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Cards
```jsx
// Basic Card
<div className="bg-white rounded-lg shadow-md p-6">
  <h3 className="text-xl font-semibold mb-4">Titre</h3>
  <p className="text-gray-600">Contenu</p>
</div>

// Interactive Card
<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold mb-4">Titre</h3>
  <p className="text-gray-600">Contenu</p>
</div>
```

## Principes UX

### 1. Accessibilité
- Contraste suffisant
- Navigation au clavier
- Textes alternatifs
- ARIA labels

### 2. Responsive Design
- Mobile First
- Breakpoints cohérents
- Images adaptatives
- Grille flexible

### 3. Feedback Utilisateur
- États de chargement
- Messages d'erreur
- Confirmations d'action
- Tooltips informatifs

### 4. Performance
- Chargement progressif
- Optimisation des images
- Animations fluides
- Temps de réponse rapide

## Animations

### Transitions
```css
.transition-base {
  transition: all 0.3s ease-in-out;
}

.transition-fast {
  transition: all 0.15s ease-in-out;
}

.transition-slow {
  transition: all 0.5s ease-in-out;
}
```

### Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

## Icônes

### Système d'Icônes
- Utilisation de Lucide React
- Tailles standardisées
- Couleurs cohérentes
- Accessibilité

### Exemples d'Utilisation
```jsx
import { Home, User, Settings } from 'lucide-react';

<Home className="w-6 h-6 text-primary" />
<User className="w-6 h-6 text-secondary" />
<Settings className="w-6 h-6 text-accent" />
``` 