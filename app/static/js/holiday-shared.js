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
    { name: 'halloween',       start: '10-25', end: '10-31', emoji: '🎃' },
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

  function normalizeDate(date) {
    return date instanceof Date ? new Date(date.getTime()) : new Date(date);
  }

  function resolveHoliday(date = new Date()) {
    const now = normalizeDate(date);
    const year = now.getFullYear();

    for (const holiday of HOLIDAY_RANGES) {
      if (holiday.name === 'marchmadness') {
        if (isSelectionSunday(now)) return { holiday, date: now };
        continue;
      }

      if (holiday.name === 'easter') {
        if (isEaster(now, holiday.bufferBefore, holiday.bufferAfter)) return { holiday, date: now };
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
          return { holiday, date: now };
        }
        continue;
      }

      if (holiday.start && holiday.end && dateInRange(now, holiday.start, holiday.end)) {
        return { holiday, date: now };
      }
    }

    return null;
  }

  function getHolidayEmoji(date = new Date()) {
    const normalized = normalizeDate(date);
    const match = resolveHoliday(normalized);
    if (match) return match.holiday.emoji;
    return MONTHLY_FALLBACKS[normalized.getMonth()];
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

  const HOLIDAY_FACTS = {
    newyear: { title: "New Year's", fact: "The new year stretches out before you, brimming with possibility. Only about 8% of people keep their New Year's resolutions until the next; but remember, change starts with habits." },
    mlkday: { title: "Martin Luther King Jr. Day", fact: "MLK Day is the only federal holiday designated as a national day of service—reminding us to show up for our communities." },
    valentine: { title: "Valentine's Day", fact: "Around 30% of adults in the US aren't in a relationship. So if you find yourself alone on Valentine's Day, remember there's plenty of fish in the lonely sea." },
    superbowl: { title: "Super Bowl", fact: "Legend has it that even the Zebras can't save Patty Cakes in every Super Bowl." },
    leapday: { title: "Leap Day", fact: "If you're born on a Leap Day, some jurisdictions don't consider your birthday (in terms of age) until March 1st if it's not a Leap Year." },
    piday: { title: "Pi Day", fact: "Nerds around the world celebrate. And possibly, foodies who aren't good with math." },
    stpatricks: { title: "St. Patrick's Day", fact: "Legend says the Shamrock represents the Holy Trinity. But one thing we can all agree on is that you better be wearing green!" },
    marchmadness: { title: "March Madness", fact: "A perfect bracket still hasn't been accomplished, with the record standing at the first 49 games predicted correctly. It remains to be seen if it will ever be done, but one thing that is clear is to never bet on Gonzaga." },
    springequinox: { title: "Spring Equinox", fact: "The specific date actually changes from year to year, but it's often around the 21st. Be sure to soak up the extra sun!" },
    aprilfools: { title: "April Fools' Day", fact: "If you're going to pull a prank today, try and make sure it's not at anyone's expense. True fools are the ones who upset others for a cheap laugh." },
    easter: { title: "Easter", fact: "The Computus algorithm decides Easter's date; thank goodness someone else already figured it out!" },
    earthday: { title: "Earth Day", fact: "Unfortunately with the way the climate is going, this might soon be \"in remembrance\"." },
    cincodemayo: { title: "Cinco de Mayo", fact: "Even if you can't speak Spanish, you can hopefully tell when this holiday is." },
    juneteenth: { title: "Juneteenth", fact: "Juneteenth was recognized as a federal holiday starting in 2025. It's important to note that this date was far from the end of systematic oppression of minorities in America, and to be respectful to one another." },
    summersolstice: { title: "Summer Solstice", fact: "In Alaska, you can expect to see around 19 hours of sun! Even further north, the sun might not set at all." },
    utahindependence: { title: "Pioneer Day", fact: "Utah celebrates the day pioneers arrived in the Salt Lake Valley, coming from Emigration Canyon." },
    perseids: { title: "Perseids Meteor Shower", fact: "This yearly meteor shower happens due to Earth passing through the debris trail left by a comet. Peak viewing times are mid August." },
    laborday: { title: "Labor Day", fact: "A day to celebrate our workers, the people who truly drive our society." },
    fallequinox: { title: "Fall Equinox", fact: "As the days get shorter, be sure to enjoy the last of warm weather." },
    halloween: { title: "Halloween", fact: "The phrase \"trick or treat\" originates from groups of young gangsters that asked people for treats, with the implication that they would have a \"trick\" played on them if they didn't oblige." },
    thanksgivingUS: { title: "Thanksgiving", fact: "Cornucopias originated as larger baskets worn on the backs of harvesters. Now, they're smaller and typically include small nuts and treats for people to enjoy at Thanksgiving." },
    wintersolstice: { title: "Winter Solstice", fact: "On the darkest day, some areas in Alaska may only see 5 hours of sunlight! Even higher north, the sun may not rise at all... but it's a great time to see the northern lights!" },
    holidays: { title: "Holiday Season", fact: "It's time to deck the halls! Despite the dark days, nights stay lit up with color." },
    christmaseve: { title: "Christmas Eve", fact: "After the family gets together, children dream of sugarplums in anticipation of the morning." },
    christmas: { title: "Christmas Day", fact: "A day of family, celebration, and coziness. It's finally here!" },
    afterxmas: { title: "Boxing Week", fact: "Some countries celebrate Boxing Day right after Christmas, or even extend it until New Year's Eve. This time of year feels sluggish and ethereal, a time many have off to recover from the holidays." },
    newyearseve: { title: "New Year's Eve", fact: "The holidays offer one last gasp, as people celebrate a year that was hopefully a success, or turn their eyes to making the next something to write home about." },
    month_0: { title: 'January', fact: 'In the peak of winter, the landscape is covered in snow. Some may find it boring, some may find it peaceful.' },
    month_1: { title: 'February', fact: 'As the winter drags on, find comfort in quiet, cozy evenings.' },
    month_2: { title: 'March', fact: 'Spring might come early, or might come late. Blustery days might continue the cool weather.' },
    month_3: { title: 'April', fact: 'Tulips are in full bloom as spring is ramping up.' },
    month_4: { title: 'May', fact: 'The birds are chirping, the bees buzzing, as plants bloom outside.' },
    month_5: { title: 'June', fact: 'Plants are flourishing, and the world is plenty green.' },
    month_6: { title: 'July', fact: 'Long days and late evenings encapsulate summer memories for many.' },
    month_7: { title: 'August', fact: "It's back to school for many, as the sun continues to shine on warm days." },
    month_8: { title: 'September', fact: 'As summer draws to a close, trees show their first sign of change.' },
    month_9: { title: 'October', fact: 'Fall colors are in full swing, and the weather starts to cool.' },
    month_10: { title: 'November', fact: 'Days are getting shorter, and nature begins to slumber.' },
    month_11: { title: 'December', fact: 'Winter is here, and only evergreens remain colorful in a seemingly dull world.' },
    default: { title: 'Trail Trivia', fact: 'Something has gone horribly wrong...' },
  };

  function getActiveHolidayDetails(date = new Date()) {
    const normalized = normalizeDate(date);
    const match = resolveHoliday(normalized);
    const monthIndex = normalized.getMonth();

    if (match) {
      const name = match.holiday.name;
      const emoji = match.holiday.emoji;
      const accent = HOLIDAY_ACCENTS[name] || MONTH_ACCENTS[monthIndex];
      const facts = HOLIDAY_FACTS[name] || HOLIDAY_FACTS.default;
      return {
        generatedAt: normalized.toISOString(),
        name,
        emoji,
        accent,
        title: facts.title,
        fact: facts.fact,
      };
    }

    const fallbackKey = `month_${monthIndex}`;
    const facts = HOLIDAY_FACTS[fallbackKey] || HOLIDAY_FACTS.default;
    return {
      generatedAt: normalized.toISOString(),
      name: null,
      emoji: MONTHLY_FALLBACKS[monthIndex],
      accent: MONTH_ACCENTS[monthIndex],
      title: facts.title,
      fact: facts.fact,
    };
  }

  function getHolidayAccent(date = new Date()) {
    const normalized = normalizeDate(date);
    const match = resolveHoliday(normalized);
    if (match) {
      const name = match.holiday.name;
      if (name && HOLIDAY_ACCENTS[name]) return HOLIDAY_ACCENTS[name];
    }
    return MONTH_ACCENTS[normalized.getMonth()];
  }

  // === Export ===
  return {
    HOLIDAY_RANGES,
    MONTHLY_FALLBACKS,
    HOLIDAY_ACCENTS,
    MONTH_ACCENTS,
    HOLIDAY_FACTS,
    getHolidayEmoji,
    getHolidayAccent,
    getActiveHolidayDetails,
    resolveHoliday,
    utils: {
      dateInRange,
      isEaster,
      isInBufferRange,
      isSelectionSunday,
      getNthWeekdayOfMonth,
    },
  };
});
