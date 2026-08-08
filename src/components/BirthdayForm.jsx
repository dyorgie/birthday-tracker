import { useState, useEffect } from "react";

const FREQUENCY_OPTIONS = [
  { key: "week", label: "1 week before" },
  { key: "threeDay", label: "3 days before" },
  { key: "oneDay", label: "1 day before" },
  { key: "dayOf", label: "Day itself" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EMPTY_FREQUENCY = { week: false, threeDay: false, oneDay: false, dayOf: false };

export default function BirthdayForm({ onAdd, onUpdate, editingEntry, onCancelEdit }) {
  const [name, setName] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [frequency, setFrequency] = useState(EMPTY_FREQUENCY);

  const isEditing = Boolean(editingEntry);

  // When editingEntry changes (user clicked "Edit" on a different entry,
  // or clicked it for the first time), populate the form with its values.
  useEffect(() => {
    if (editingEntry) {
      setName(editingEntry.name);
      setMonth(String(editingEntry.month));
      setDay(String(editingEntry.day));
      setYear(editingEntry.year ? String(editingEntry.year) : "");
      setNotes(editingEntry.notes || "");
      setFrequency(editingEntry.frequency);
    }
  }, [editingEntry]);

  function resetForm() {
    setName("");
    setMonth("");
    setDay("");
    setYear("");
    setNotes("");
    setFrequency(EMPTY_FREQUENCY);
  }

  function toggleFrequency(key) {
    setFrequency((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !month || !day) return;

    const entryData = {
      name,
      month: parseInt(month, 10),
      day: parseInt(day, 10),
      year: year ? parseInt(year, 10) : null,
      notes: notes || null,
      frequency,
    };

    if (isEditing) {
      onUpdate(editingEntry.id, entryData);
    } else {
      onAdd(entryData);
    }

    resetForm();
  }

  function handleCancel() {
    resetForm();
    onCancelEdit();
  }

  return (
    <form onSubmit={handleSubmit} className="birthday-form">
      <label htmlFor="name">Name</label>
      <input
        id="name"
        type="text"
        placeholder="e.g. Mom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        required
      />

      <label>Birthday</label>
      <div className="date-fields">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
          aria-label="Month"
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Day"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
          aria-label="Day"
        />

        <input
          type="number"
          placeholder="Year (optional)"
          min="1900"
          max="2100"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          aria-label="Year (optional)"
        />
      </div>

      <label htmlFor="notes">Notes (optional)</label>
      <textarea
        id="notes"
        placeholder="Gift ideas, preferences, anything to remember..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={500}
        rows={3}
      />

      <label>Remind me:</label>
      <div className="checkboxes">
        {FREQUENCY_OPTIONS.map((opt) => (
          <label key={opt.key}>
            <input
              type="checkbox"
              checked={frequency[opt.key]}
              onChange={() => toggleFrequency(opt.key)}
            />
            {opt.label}
          </label>
        ))}
      </div>

      <button type="submit">{isEditing ? "Save Changes" : "Save Birthday"}</button>
      {isEditing && (
        <button type="button" className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
      )}
    </form>
  );
}