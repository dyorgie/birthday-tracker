import { getUpcomingAge } from "../utils/birthdayMath";

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

export default function BirthdayList({ entries, onDelete, onEdit }) {
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
            <div className="entry-actions">
              <button
                className="edit-btn"
                onClick={() => onEdit(entry)}
                aria-label={`Edit ${entry.name}'s birthday`}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                aria-label={`Delete ${entry.name}'s birthday`}
                onClick={() => {
                  if (window.confirm(`Delete ${entry.name}'s birthday? This can't be undone.`)) {
                    onDelete(entry.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}