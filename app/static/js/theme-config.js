(function (root) {
  const storageKeys = Object.freeze({
    mode: 'theme-mode',
    accent: 'theme-accent',
    lastCustomAccent: 'last-custom-accent',
  });

  const accentPalette = Object.freeze({
    red: { color: '#B22222' },
    salmon: { color: '#FA8072' },
    orange: { color: '#D2691E' },
    amber: { color: '#FFBF00' },
    goldenrod: { color: '#DAA520' },
    sand: { color: '#C2B280' },
    olive: { color: '#808000' },
    sage: { color: '#5A7A39' },
    forest: { color: '#1E5631' },
    teal: { color: '#008080' },
    cyan: { color: '#40E0D0' },
    blue: { color: '#1E4D8F' },
    berry: { color: '#9F5F9F' },
    purple: { color: '#6A0DAD' },
    pink: { color: '#FF69B4' },
    brown: { color: '#964B00' },
    bronze: { color: '#CD7F32' },
    gray: { color: '#808080' },
    black: { color: '#000000' },
    ivory: { color: '#F5F5DC' },
    white: { color: '#FFFFFF' },
  });

  const ThemeConfig = Object.freeze({
    storageKeys,
    accentPalette,
    defaultMode: 'system',
    defaultAccent: 'holiday',
    iconLightAccents: ['white', 'ivory'],
  });

  root.ThemeConfig = ThemeConfig;
})(typeof window !== 'undefined' ? window : globalThis);
