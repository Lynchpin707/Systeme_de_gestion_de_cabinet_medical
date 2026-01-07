// Palette de couleurs centralisée - Cabinet Médical
export const colors = {
  // Couleurs principales turquoise/teal
  primary: '#3EAEB1',
  primaryLight: '#2a8b9cff',
  primaryDark: '#1D837F',
  
  // Couleurs d'accent
  accent: '#9CD1CE',
  accentLight: '#9FD8EF',
  teal: '#D7EAEE',
  
  // Couleurs de texte
  textDark: '#1F2937',
  textLight: '#6B7280',
  
  // Couleurs de fond
  bgWhite: '#FFFFFF',
  bgLight: '#F8FAFB',
  bgTealLight: '#F0F9FA',
  
  // Couleurs de statut
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Bordures
  border: '#E5E7EB',
};

// Gradients prédéfinis
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.accent} 100%)`,
  primarySimple: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
  leftPanel: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 50%, ${colors.primaryDark} 100%)`,
  hero: `linear-gradient(135deg, rgba(62, 174, 177, 0.15), rgba(156, 209, 206, 0.15))`,
  text: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight}, ${colors.accent})`,
};

// Ombres prédéfinies
export const shadows = {
  primary: `0 4px 20px rgba(62, 174, 177, 0.4)`,
  primaryHover: `0 6px 30px rgba(62, 174, 177, 0.5), 0 0 30px rgba(97, 186, 202, 0.3)`,
  card: `0 8px 30px rgba(0, 0, 0, 0.08)`,
  cardHover: `0 12px 40px rgba(62, 174, 177, 0.2)`,
  logo: `0 4px 12px rgba(62, 174, 177, 0.3)`,
};

// Particules de couleurs
export const particleColors = [
  `linear-gradient(135deg, ${colors.primary}, ${colors.primaryLight})`,
  `linear-gradient(135deg, ${colors.primaryLight}, ${colors.accent})`,
  `linear-gradient(135deg, ${colors.accentLight}, ${colors.teal})`,
  `linear-gradient(135deg, ${colors.primaryDark}, ${colors.primary})`,
  `linear-gradient(135deg, ${colors.teal}, ${colors.accentLight})`,
  `linear-gradient(135deg, ${colors.accent}, ${colors.primaryLight})`,
];

// Icônes de fonctionnalités (pour les couleurs)
export const featureIconColors = [
  {
    background: `linear-gradient(135deg, rgba(62, 174, 177, 0.2), rgba(97, 186, 202, 0.1))`,
    shadow: `0 4px 12px rgba(62, 174, 177, 0.3)`,
  },
  {
    background: `linear-gradient(135deg, rgba(156, 209, 206, 0.2), rgba(159, 216, 239, 0.1))`,
    shadow: `0 4px 12px rgba(156, 209, 206, 0.3)`,
  },
  {
    background: `linear-gradient(135deg, rgba(29, 131, 127, 0.2), rgba(62, 174, 177, 0.1))`,
    shadow: `0 4px 12px rgba(29, 131, 127, 0.3)`,
  },
];

export default colors;
