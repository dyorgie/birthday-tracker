import { useState, useEffect } from "react";
import BirthdayForm from "./components/BirthdayForm";
import BirthdayList from "./components/BirthdayList";
import { getUserId } from "./utils/userId";
import { registerServiceWorker, subscribeToPush } from "./utils/push";
import "./index.css";

function normalizeEntry(row) {
  return {
    id: row.id,
    name: row.name,
    month: row.birth_month,
    day: row.birth_day,
    year: row.birth_year,
    notes: row.notes,
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
  const userId = getUserId();
  const [editingEntry, setEditingEntry] = useState(null);

  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    fetch("/api/birthdays", {
      headers: { "x-user-id": userId },
    })
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.map(normalizeEntry));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load birthdays:", err);
        setLoading(false);
      });
  }, [userId]);

  async function handleEnableNotifications() {
    const success = await subscribeToPush();
    if (success) {
      setNotifStatus("granted");
    }
  }

  async function handleAdd(newEntry) {
    try {
      const res = await fetch("/api/birthdays", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          name: newEntry.name,
          month: newEntry.month,
          day: newEntry.day,
          year: newEntry.year,
          notes: newEntry.notes,
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

  async function handleUpdate(id, updatedData) {
    try {
      const res = await fetch(`/api/birthdays?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update birthday");

      const updated = await res.json();
      setEntries((prev) =>
        prev.map((entry) => (entry.id === id ? normalizeEntry(updated) : entry))
      );
      setEditingEntry(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong updating that birthday. Please try again.");
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`/api/birthdays?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
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
      {notifStatus !== "granted" && notifStatus !== "unsupported" && (
        <button className="enable-notif-btn" onClick={handleEnableNotifications}>
          🔔 Enable Notifications
        </button>
      )}
      <BirthdayForm
        onAdd={handleAdd}
        onUpdate={handleUpdate}
        editingEntry={editingEntry}
        onCancelEdit={() => setEditingEntry(null)}
      />
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : (
        <BirthdayList entries={entries} onDelete={handleDelete} onEdit={setEditingEntry} />
      )}
      {loading ? (
        <p className="empty-state">Loading...</p>
      ) : (
        <BirthdayList entries={entries} onDelete={handleDelete} />
      )}
    </div>
  );
}

export default App;