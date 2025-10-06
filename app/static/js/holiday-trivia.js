(function () {
  if (typeof document === 'undefined' || typeof HolidaySchedule === 'undefined') return;

  var container = document.getElementById('holiday-trivia');
  if (!container) return;

  var nameEl = container.querySelector('[data-holiday-name]');
  var emojiEl = container.querySelector('[data-holiday-emoji]');
  var factEl = container.querySelector('[data-holiday-fact]');
  if (!nameEl || !emojiEl || !factEl) return;

  var utils = HolidaySchedule.utils;

  var HOLIDAY_FACTS = {
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
    easter: { title: "Easter", fact: "The Computus algorithm decides Easter's date; Thank goodness someone else already figured it out!" },
    earthday: { title: "Earth Day", fact: "Unfortunately with the way the climate is going, this might soon be \"in remembrance\"." },
    cincodemayo: { title: "Cinco de Mayo", fact: "Even if you have no foreign language ability outside of English, you can hopefully tell when this holiday is." },
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
    christmas: { title: "Christmas Day", fact: "Even if you don't formally celebrate the holiday, this is often a time of celebration, full of gifts and family." },
    afterxmas: { title: "Boxing Week", fact: "Some countries celebrate Boxing Day right after Christmas, or even extend it until New Year's Eve. This time of year feels sluggish and ethereal, a time many have off to recover from the holidays." },
    newyearseve: { title: "New Year's Eve", fact: "The holidays offer one last gasp, as people celebrate a year that was hopefully a success, or turn their eyes to making the next something to write home about." },
    month_0: { title: "January", fact: "In the peak of winter, the landscape is covered in snow. Some may find it boring, some may find it peaceful." },
    month_1: { title: "February", fact: "As the winter drags on, find comfort in quiet, cozy evenings." },
    month_2: { title: "March", fact: "Spring might come early, or might come late. Blustery days might continue the cool weather." },
    month_3: { title: "April", fact: "Tulips are in full bloom as spring is ramping up." },
    month_4: { title: "May", fact: "The birds are chirping, the bees buzzing, as plants bloom outside" },
    month_5: { title: "June", fact: "Plants are flourishing, and the world is plenty green." },
    month_6: { title: "July", fact: "Long days and late evenings encapsulate summer memories for many." },
    month_7: { title: "August", fact: "It's back to school for many, as the sun continues to shine on warm days." },
    month_8: { title: "September", fact: "As summer draws to a close, trees show their first sign of change." },
    month_9: { title: "October", fact: "Fall colors are in full swing, and the weather starts to cool." },
    month_10: { title: "November", fact: "Days are getting shorter, and nature begins to slumber." },
    month_11: { title: "December", fact: "Winter is here, and only evergreens remain colorful in a seemingly dull world." },
  };

  function matchHoliday(now) {
    for (var i = 0; i < HolidaySchedule.HOLIDAY_RANGES.length; i++) {
      var holiday = HolidaySchedule.HOLIDAY_RANGES[i];

      if (holiday.name === 'marchmadness') {
        if (utils.isSelectionSunday(now)) return holiday;
        continue;
      }

      if (holiday.name === 'easter') {
        if (utils.isEaster(now, holiday.bufferBefore, holiday.bufferAfter)) return holiday;
        continue;
      }

      if (holiday.nthWeekday) {
        var target = utils.getNthWeekdayOfMonth(
          now.getFullYear(),
          holiday.nthWeekday.month,
          holiday.nthWeekday.weekday,
          holiday.nthWeekday.nth
        );
        if (
          target &&
          utils.isInBufferRange(
            now,
            target,
            holiday.bufferBefore || 0,
            holiday.bufferAfter || 0
          )
        ) {
          return holiday;
        }
        continue;
      }

      if (holiday.start && holiday.end && utils.dateInRange(now, holiday.start, holiday.end)) {
        return holiday;
      }
    }
    return null;
  }

  var now = new Date();
  var match = matchHoliday(now);
  var triviaKey;
  var emoji;

  if (match) {
    triviaKey = match.name;
    emoji = match.emoji;
  } else {
    triviaKey = 'month_' + now.getMonth();
    emoji = HolidaySchedule.MONTHLY_FALLBACKS[now.getMonth()] || '🗻';
  }

  var details = HOLIDAY_FACTS[triviaKey] || {
    title: 'Trail Trivia',
    fact: 'Stay curious; the holiday cron will surprise you again tomorrow.'
  };

  nameEl.textContent = details.title;
  emojiEl.textContent = emoji;
  factEl.textContent = details.fact;
  container.setAttribute('data-ready', 'true');

  var footerLink = document.querySelector('.holiday-emoji-link');
  if (footerLink) {
    footerLink.setAttribute('aria-label', 'Holiday trivia: ' + details.title);
    var footerEmoji = footerLink.querySelector('.holiday-image');
    if (footerEmoji) {
      footerEmoji.setAttribute('title', details.title);
    }
  }
})();
