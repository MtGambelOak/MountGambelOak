(function (root) {
  const storageKeys = Object.freeze({
    mode: 'theme-mode',
    accent: 'theme-accent',
    lastCustomAccent: 'last-custom-accent',
  });

  const accentPalette = Object.freeze({
    forest: { color: '#1E5631' },
    sage: { color: '#5A7A39' },
    olive: { color: '#808000' },
    sand: { color: '#C2B280' },
    goldenrod: { color: '#DAA520' },
    amber: { color: '#FFBF00' },
    orange: { color: '#D2691E' },
    salmon: { color: '#FA8072' },
    red: { color: '#B22222' },
    pink: { color: '#FF69B4' },
    berry: { color: '#9F5F9F' },
    purple: { color: '#6A0DAD' },
    bronze: { color: '#CD7F32' },
    brown: { color: '#964B00' },
    teal: { color: '#008080' },
    cyan: { color: '#40E0D0' },
    blue: { color: '#1E4D8F' },
    gray: { color: '#808080' },
    black: { color: '#000000', mixDark: 'white' },
    ivory: { color: '#F5F5DC', iconTone: 'light' },
    white: { color: '#FFFFFF', iconTone: 'light' },
  });

  const iconLightAccents = Object.freeze(
    Object.keys(accentPalette).filter((name) => accentPalette[name].iconTone === 'light')
  );

  const ThemeConfig = Object.freeze({
    storageKeys,
    accentPalette,
    defaultMode: 'system',
    defaultAccent: 'holiday',
    defaultCustomAccent: 'sage',
    iconLightAccents,
  });

  root.ThemeConfig = ThemeConfig;
})(typeof window !== 'undefined' ? window : globalThis);
