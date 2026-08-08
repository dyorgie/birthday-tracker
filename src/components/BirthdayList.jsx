const FREQUENCY_LABELS = {
  week: "1 week before",
  threeDay: "3 days before",
  oneDay: "1 day before",
  dayOf: "Day itself",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(month, day, year) {
  const monthName = MONTHS[month - 1];
  return year ? `${monthName} ${day}, ${year}` : `${monthName} ${day}`;
}

// Returns the age this person will be turning on their next birthday,
// or null if the birth year is unknown.
function getUpcomingAge(month, day, year) {
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

export default function BirthdayList({ entries, onDelete }) {
  if (entries.length === 0) {
    return <p className="empty-state">No birthdays saved yet.</p>;
  }

  return (
    <div className="entries">
      {entries.map((entry) => {
        const activeReminders = Object.keys(entry.frequency).filter(
          (key) => entry.frequency[key]
        );
        const upcomingAge = getUpcomingAge(entry.month, entry.day, entry.year);

        return (
          <div key={entry.id} className="entry">
            <strong>{entry.name}</strong>
            <span>
              {formatDate(entry.month, entry.day, entry.year)}
              {upcomingAge !== null && ` · turning ${upcomingAge}`}
            </span>
            {entry.notes && <p className="entry-notes">{entry.notes}</p>}
            <small>
              {activeReminders.length > 0
                ? activeReminders.map((key) => FREQUENCY_LABELS[key]).join(", ")
                : "No reminders set"}
            </small>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${entry.name}'s birthday? This can't be undone.`)) {
                  onDelete(entry.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}