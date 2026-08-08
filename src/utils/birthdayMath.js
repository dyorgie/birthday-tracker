// Returns how many days from today until this person's next birthday
// (0 if today, rolls over to next year if this year's date has passed).
export function daysUntilNextBirthday(month, day) {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  let next = new Date(Date.UTC(todayUTC.getUTCFullYear(), month - 1, day));
  if (next < todayUTC) {
    next = new Date(Date.UTC(todayUTC.getUTCFullYear() + 1, month - 1, day));
  }

  const diffMs = next.getTime() - todayUTC.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Returns the age this person will be turning on their next birthday,
// or null if the birth year is unknown.
export function getUpcomingAge(month, day, year) {
  if (!year) return null;

  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  let nextBirthdayYear = todayUTC.getUTCFullYear();
  const thisYearsBirthday = new Date(Date.UTC(nextBirthdayYear, month - 1, day));

  if (thisYearsBirthday < todayUTC) {
    nextBirthdayYear += 1;
  }

  return nextBirthdayYear - year;
}