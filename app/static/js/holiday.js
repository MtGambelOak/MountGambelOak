(function () {
  const holidayFooter = document.getElementById('holiday-footer-image');
  if (!holidayFooter || typeof HolidaySchedule === 'undefined') return;

  const emoji = HolidaySchedule.getHolidayEmoji();

  if (emoji) {
    holidayFooter.classList.add('holiday-loaded');
    holidayFooter.textContent = emoji;
    holidayFooter.style.backgroundImage = '';
    holidayFooter.style.display = '';
    const root = document.documentElement;
    if (root && root.style) {
      root.style.removeProperty('--holiday-emoji');
    }
  } else {
    holidayFooter.style.display = 'none';
  }
})();
