import { useState, useEffect } from "react";
import BirthdayForm from "./components/BirthdayForm";
import BirthdayList from "./components/BirthdayList";
import "./index.css";

const STORAGE_KEY = "birthdays";

function App() {
  // Load saved entries directly when state is first created —
  // avoids the race condition of loading in a separate effect
  const [entries, setEntries] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // Whenever entries change, save them back to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  function handleAdd(newEntry) {
    setEntries((prev) => [...prev, newEntry]);
  }

  function handleDelete(id) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div className="app">
      <h1>🎂 Birthday Tracker</h1>
      <BirthdayForm onAdd={handleAdd} />
      <BirthdayList entries={entries} onDelete={handleDelete} />
    </div>
  );
}

export default App;