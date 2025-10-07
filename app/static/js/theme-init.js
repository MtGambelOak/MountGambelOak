(function () {
  var root = document.documentElement;
  var accentClasses = [
    'accent-berry', 'accent-black', 'accent-brown',
    'accent-goldenrod', 'accent-gray', 'accent-green', 'accent-orange',
    'accent-purple', 'accent-red', 'accent-sage', 'accent-salmon',
    'accent-white'
  ];

  var accentHexMap = {
    berry: '#9F5F9F',
    black: '#000000',
    brown: '#964B00',
    goldenrod: '#DAA520',
    gray: '#808080',
    green: '#228B22',
    orange: '#d2691e',
    purple: '#6A0DAD',
    red: '#8B0000',
    sage: '#5A7A39',
    salmon: '#fa8072',
    white: '#ffffff'
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function clampChannel(value) {
    if (!isFinite(value)) return 0;
    return clamp(Math.round(value), 0, 255);
  }

  function parseColor(value) {
    if (!value) return null;
    var v = value.trim();
    if (!v) return null;

    if (v.charAt(0) === '#') {
      var hex = v.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex.charAt(0) + hex.charAt(0), 16),
          g: parseInt(hex.charAt(1) + hex.charAt(1), 16),
          b: parseInt(hex.charAt(2) + hex.charAt(2), 16),
          a: 1
        };
      }
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
          a: 1
        };
      }
      return null;
    }

    var rgbMatch = v.match(/^rgba?\(([^)]+)\)$/i);
    if (rgbMatch) {
      var parts = rgbMatch[1].split(',').map(function (part) { return part.trim(); });
      if (parts.length < 3) return null;
      var r = parseFloat(parts[0]);
      var g = parseFloat(parts[1]);
      var b = parseFloat(parts[2]);
      var a = parts.length > 3 ? parseFloat(parts[3]) : 1;
      return {
        r: clampChannel(r),
        g: clampChannel(g),
        b: clampChannel(b),
        a: isFinite(a) ? clamp(a, 0, 1) : 1
      };
    }

    return null;
  }

  function compositeColor(topColor, bottomColor) {
    if (!topColor) return bottomColor || null;
    var alpha = typeof topColor.a === 'number' ? clamp(topColor.a, 0, 1) : 1;
    if (alpha >= 1 || !bottomColor) {
      return {
        r: clampChannel(topColor.r),
        g: clampChannel(topColor.g),
        b: clampChannel(topColor.b)
      };
    }
    return {
      r: clampChannel(topColor.r * alpha + bottomColor.r * (1 - alpha)),
      g: clampChannel(topColor.g * alpha + bottomColor.g * (1 - alpha)),
      b: clampChannel(topColor.b * alpha + bottomColor.b * (1 - alpha))
    };
  }

  function componentToHex(channel) {
    var hex = clampChannel(channel).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  function toHex(color) {
    if (!color) return '';
    return '#' + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
  }

  function mixColors(colorA, colorB, amount) {
    var t = clamp(amount, 0, 1);
    return {
      r: colorA.r + (colorB.r - colorA.r) * t,
      g: colorA.g + (colorB.g - colorA.g) * t,
      b: colorA.b + (colorB.b - colorA.b) * t
    };
  }

  function srgbToLinear(channel) {
    var c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(color) {
    return (
      0.2126 * srgbToLinear(color.r) +
      0.7152 * srgbToLinear(color.g) +
      0.0722 * srgbToLinear(color.b)
    );
  }

  function contrastRatio(colorA, colorB) {
    var lumA = relativeLuminance(colorA);
    var lumB = relativeLuminance(colorB);
    var lighter = Math.max(lumA, lumB);
    var darker = Math.min(lumA, lumB);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function ensureContrastColor(foreground, background, mode) {
    var targetContrast = 4.5;
    var mixTarget = mode === 'light'
      ? { r: 0, g: 0, b: 0 }
      : { r: 255, g: 255, b: 255 };

    var best = foreground;
    var bestRatio = contrastRatio(foreground, background);
    if (bestRatio >= targetContrast) return best;

    for (var step = 1; step <= 10; step++) {
      var candidate = mixColors(foreground, mixTarget, step / 10);
      var ratio = contrastRatio(candidate, background);
      if (ratio >= targetContrast) return candidate;
      if (ratio > bestRatio) {
        best = candidate;
        bestRatio = ratio;
      }
    }

    return best;
  }

  function getAccentName() {
    for (var i = 0; i < root.classList.length; i++) {
      var cls = root.classList[i];
      if (cls.indexOf('accent-') === 0) return cls.slice(7);
    }
    return null;
  }

  function defaultBackground(mode) {
    return mode === 'light'
      ? { r: 255, g: 255, b: 255 }
      : { r: 18, g: 18, b: 18 };
  }

  function updateAccentTextColor(mode) {
    try {
      var resolvedMode = mode === 'light' || mode === 'dark'
        ? mode
        : (root.classList.contains('light') ? 'light' : 'dark');

      var styles = window.getComputedStyle ? window.getComputedStyle(root) : null;
      var accentValue = styles ? (styles.getPropertyValue('--accent') || '').trim() : '';
      var mainBackgroundValue = styles ? (styles.getPropertyValue('--main-bg') || '').trim() : '';
      var pageBackgroundValue = styles ? (styles.getPropertyValue('--bg') || '').trim() : '';

      var accentColor = parseColor(accentValue);
      if (!accentColor) {
        var accentName = getAccentName();
        if (accentName && accentHexMap[accentName]) {
          accentColor = parseColor(accentHexMap[accentName]);
        }
      }

      if (!accentColor) return;

      var pageBackground = parseColor(pageBackgroundValue) || defaultBackground(resolvedMode);
      var mainBackground = parseColor(mainBackgroundValue);
      var backgroundColor = compositeColor(mainBackground, pageBackground) || pageBackground;
      var accessibleColor = ensureContrastColor({
        r: clampChannel(accentColor.r),
        g: clampChannel(accentColor.g),
        b: clampChannel(accentColor.b)
      }, backgroundColor, resolvedMode);

      root.style.setProperty('--accent-text', toHex(accessibleColor));
    } catch (err) {
      /* If contrast logic fails, fall back to CSS default */
      root.style.removeProperty('--accent-text');
    }
  }

  var themeUtils = window.__themeUtils || {};
  themeUtils.updateAccentTextColor = updateAccentTextColor;
  window.__themeUtils = themeUtils;

  try {
    var storedMode = localStorage.getItem('theme-mode');
    var storedAccent = localStorage.getItem('theme-accent');

    if (storedMode || storedAccent) {
      root.classList.remove('light', 'dark');
      accentClasses.forEach(function (cls) { root.classList.remove(cls); });

      var modeClass = storedMode === 'light' ? 'light' : 'dark';
      var accentClass = storedAccent ? 'accent-' + storedAccent : 'accent-sage';

      root.classList.add(modeClass);
      root.classList.add(accentClass);
    }
  } catch (err) {
    /* localStorage disabled (private mode, etc.); keep defaults */
  }

  updateAccentTextColor(root.classList.contains('light') ? 'light' : 'dark');
  window.addEventListener('load', function () {
    updateAccentTextColor(root.classList.contains('light') ? 'light' : 'dark');
  });
})();
