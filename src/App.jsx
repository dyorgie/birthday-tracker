import { useState, useEffect } from "react";
import BirthdayForm from "./components/BirthdayForm";
import BirthdayList from "./components/BirthdayList";
import "./index.css";

function normalizeEntry(row) {
  return {
    id: row.id,
    name: row.name,
    dob: row.dob,
    frequency: {
      week: row.notify_week,
      threeDay: row.notify_three_day,
      oneDay: row.notify_one_day,
      dayOf: row.notify_day_of,
    },
  };
}

function App() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load entries from the API when the app first opens
  useEffect(() => {
    fetch("/api/birthdays")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.map(normalizeEntry));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load birthdays:", err);
        setLoading(false);
      });
  }, []);

  async function handleAdd(newEntry) {
    try {
      const res = await fetch("/api/birthdays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newEntry.name,
          dob: newEntry.dob,
          frequency: newEntry.frequency,
        }),
      });

      if (!res.ok) throw new Error("Failed to save birthday");

      const saved = await res.json();
      setEntries((prev) => [...prev, normalizeEntry(saved)]);
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving that birthday. Please try again.");
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/birthdays?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete birthday");

      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error(err);
      alert("Something went wrong deleting that birthday. Please try again.");
    }
  }

  return (
    <div className="app">
      <h1>🎂 Birthday Tracker</h1>
      <BirthdayForm onAdd={handleAdd} />
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : (
        <BirthdayList entries={entries} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;