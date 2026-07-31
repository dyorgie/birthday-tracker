import { useState } from "react";

const FREQUENCY_OPTIONS = [
  { key: "week", label: "1 week before" },
  { key: "threeDay", label: "3 days before" },
  { key: "oneDay", label: "1 day before" },
  { key: "dayOf", label: "Day itself" },
];

export default function BirthdayForm({ onAdd }) {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [frequency, setFrequency] = useState({
    week: false,
    threeDay: false,
    oneDay: false,
    dayOf: false,
  });

  function toggleFrequency(key) {
    setFrequency((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !dob) return;

    const newEntry = {
      name,
      dob,
      frequency,
    };

    onAdd(newEntry);

    // reset form
    setName("");
    setDob("");
    setFrequency({ week: false, threeDay: false, oneDay: false, dayOf: false });
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

      <label htmlFor="dob">Birthday</label>
      <input
        id="dob"
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
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

      <button type="submit">Save Birthday</button>
    </form>
  );
}