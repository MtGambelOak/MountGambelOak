(function () {
  var root = document.documentElement;
  var accentClasses = [
    'accent-berry', 'accent-black', 'accent-brown',
    'accent-goldenrod', 'accent-gray', 'accent-green', 'accent-orange',
    'accent-purple', 'accent-red', 'accent-sage', 'accent-salmon',
    'accent-white'
  ];

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
})();
