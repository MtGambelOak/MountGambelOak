(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HolidaySchedule = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const HOLIDAY_RANGES = [
    { name: 'newyear',         start: '01-01', end: '01-04', emoji: '🎊' },
    { name: 'mlkday',          nthWeekday: { month: 1, weekday: 1, nth: 3 }, emoji: '📜' },
    { name: 'valentine',       start: '02-14', end: '02-14', emoji: '💌' },
    { name: 'superbowl',       nthWeekday: { month: 2, weekday: 0, nth: 2 }, emoji: '🏈' },
    { name: 'leapday',         start: '02-29', end: '02-29', emoji: '🐸' },
    { name: 'piday',           start: '03-14', end: '03-14', emoji: '🥧' },
    { name: 'stpatricks',      start: '03-17', end: '03-17', emoji: '☘️' },
    { name: 'marchmadness',    emoji: '🏀' },
    { name: 'springequinox',   start: '03-20', end: '03-20', emoji: '🌅' },
    { name: 'aprilfools',      start: '04-01', end: '04-01', emoji: '🎭' },
    { name: 'easter',          bufferBefore: 2, bufferAfter: 2, emoji: '🐇' },
    { name: 'earthday',        start: '04-22', end: '04-22', emoji: '🌍' },
    { name: 'cincodemayo',     start: '05-05', end: '05-05', emoji: '🎺' },
    { name: 'juneteenth',      start: '06-19', end: '06-19', emoji: '✊🏿' },
    { name: 'summersolstice',  start: '06-21', end: '06-21', emoji: '☀️' },
    { name: 'utahindependence',start: '07-24', end: '07-24', emoji: '🎆' },
    { name: 'perseids',        start: '08-11', end: '08-13', emoji: '🌠' },
    { name: 'laborday',        nthWeekday: { month: 9, weekday: 1, nth: 1 }, emoji: '💪' },
    { name: 'fallequinox',     start: '09-21', end: '09-21', emoji: '🌇' },
    { name: 'halloween',       start: '10-20', end: '10-31', emoji: '🎃' },
    { name: 'thanksgivingUS',  nthWeekday: { month: 11, weekday: 4, nth: 4 }, bufferBefore: 3, bufferAfter: 3, emoji: '🦃' },
    { name: 'wintersolstice',  start: '12-21', end: '12-21', emoji: '❄️' },
    { name: 'holidays',        start: '12-10', end: '12-23', emoji: '🎄' },
    { name: 'christmaseve',    start: '12-24', end: '12-24', emoji: '🎅' },
    { name: 'christmas',       start: '12-25', end: '12-25', emoji: '🎁' },
    { name: 'afterxmas',       start: '12-26', end: '12-30', emoji: '🪾' },
    { name: 'newyearseve',     start: '12-31', end: '12-31', emoji: '🪩' },
  ];

  const MONTHLY_FALLBACKS = ['🗻', '🌨️', '🍃', '🌷', '🐝', '🌳', '🌞', '🌻', '🪵', '🍂', '🍠', '🌲'];

  function parseMonthDay(md) {
    const [month, day] = md.split('-').map(Number);
    return { month, day };
  }

  function dateInRange(date, startMD, endMD) {
    const year = date.getFullYear();
    const { month: sm, day: sd } = parseMonthDay(startMD);
    const { month: em, day: ed } = parseMonthDay(endMD);
    const start = new Date(year, sm - 1, sd);
    let end = new Date(year, em - 1, ed, 23, 59, 59, 999);

    if (end < start) {
      if (date >= start) return true;
      end = new Date(year + 1, em - 1, ed, 23, 59, 59, 999);
    }
    return date >= start && date <= end;
  }

  function isInBufferRange(date, target, before, after) {
    const diff = (date - target) / 86400000;
    return diff >= -before && diff <= after;
  }

  function isSelectionSunday(date) {
    return (
      date.getMonth() === 2 &&
      date.getDay() === 0 &&
      date.getDate() >= 11 &&
      date.getDate() <= 17
    );
  }

  function isEaster(date, bufferBefore = 0, bufferAfter = 0) {
    const Y = date.getFullYear();
    const a = Y % 19;
    const b = Math.floor(Y / 100);
    const c = Y % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    const easter = new Date(Y, month - 1, day);
    return isInBufferRange(date, easter, bufferBefore, bufferAfter);
  }

  function getNthWeekdayOfMonth(year, month, weekday, n) {
    let count = 0;
    for (let day = 1; day <= 31; day++) {
      const candidate = new Date(year, month - 1, day);
      if (candidate.getMonth() + 1 !== month) break;
      if (candidate.getDay() === weekday) {
        count += 1;
        if (count === n) return candidate;
      }
    }
    return null;
  }

  function getHolidayEmoji(date = new Date()) {
    const source = date instanceof Date ? date : new Date(date);
    const now = new Date(source.getTime());
    const year = now.getFullYear();

    for (const holiday of HOLIDAY_RANGES) {
      if (holiday.name === 'marchmadness') {
        if (isSelectionSunday(now)) return holiday.emoji;
        continue;
      }

      if (holiday.name === 'easter') {
        if (isEaster(now, holiday.bufferBefore, holiday.bufferAfter)) return holiday.emoji;
        continue;
      }

      if (holiday.nthWeekday) {
        const { month, weekday, nth } = holiday.nthWeekday;
        const target = getNthWeekdayOfMonth(year, month, weekday, nth);
        if (
          target &&
          isInBufferRange(
            now,
            target,
            holiday.bufferBefore || 0,
            holiday.bufferAfter || 0
          )
        ) {
          return holiday.emoji;
        }
        continue;
      }

      if (holiday.start && holiday.end && dateInRange(now, holiday.start, holiday.end)) {
        return holiday.emoji;
      }
    }

    return MONTHLY_FALLBACKS[now.getMonth()];
  }

  // === Namespaced accent mappings ===
  const HOLIDAY_ACCENTS = {
    newyear:        'goldenrod',
    mlkday:         'brown',
    valentine:      'pink',
    superbowl:      'forest',
    leapday:        'sage',
    piday:          'salmon',
    stpatricks:     'sage',
    marchmadness:   'orange',
    springequinox:  'olive',
    aprilfools:     'purple',
    easter:         'cyan',
    earthday:       'forest',
    cincodemayo:    'red',
    juneteenth:     'black',
    summersolstice: 'amber',
    utahindependence:'sand',
    perseids:       'blue',
    laborday:       'bronze',
    fallequinox:    'salmon',
    halloween:      'orange',
    thanksgivingUS: 'brown',
    wintersolstice: 'ivory',
    holidays:       'forest',
    christmaseve:   'red',
    christmas:      'red',
    afterxmas:      'black',
    newyearseve:    'gray',
  };

  const MONTH_ACCENTS = [
    'white', 'gray', 'teal', 'pink', 'sage', 'forest',
    'berry', 'orange', 'goldenrod', 'red', 'bronze', 'black'
  ];

  function getHolidayAccent(date = new Date()) {
    const emoji = getHolidayEmoji(date);
    for (const h of HOLIDAY_RANGES) {
      if (h.emoji === emoji) return HOLIDAY_ACCENTS[h.name];
    }
    return MONTH_ACCENTS[date.getMonth()];
  }

  // === Export ===
  return {
    HOLIDAY_RANGES,
    MONTHLY_FALLBACKS,
    HOLIDAY_ACCENTS,
    MONTH_ACCENTS,
    getHolidayEmoji,
    getHolidayAccent,
    utils: {
      dateInRange,
      isEaster,
      isInBufferRange,
      isSelectionSunday,
      getNthWeekdayOfMonth,
    },
  };
});
