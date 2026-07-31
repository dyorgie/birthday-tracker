const FREQUENCY_LABELS = {
  week: "1 week before",
  threeDay: "3 days before",
  oneDay: "1 day before",
  dayOf: "Day itself",
};

function formatDate(dob) {
  // dob comes in as "YYYY-MM-DD" from the date input
  const [year, month, day] = dob.split("-");
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
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

        return (
          <div key={entry.id} className="entry">
            <strong>{entry.name}</strong>
            <span>{formatDate(entry.dob)}</span>
            <small>
              {activeReminders.length > 0
                ? activeReminders.map((key) => FREQUENCY_LABELS[key]).join(", ")
                : "No reminders set"}
            </small>
            <button onClick={() => onDelete(entry.id)}>Delete</button>
          </div>
        );
      })}
    </div>
  );
}