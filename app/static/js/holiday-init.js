(function () {
  if (typeof document === 'undefined' || typeof HolidaySchedule === 'undefined') return;

  try {
    var emoji = HolidaySchedule.getHolidayEmoji();
    if (!emoji) return;

    var root = document.documentElement;
    if (root && root.style) {
      root.style.setProperty('--holiday-emoji', '"' + emoji + '"');
    }
  } catch (err) {
    // Ignore failures so the footer script can try again later.
  }
})();
