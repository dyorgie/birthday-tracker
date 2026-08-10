import { useState, useEffect } from "react";
import BirthdayForm from "./components/BirthdayForm";
import BirthdayList from "./components/BirthdayList";
import { getUserId } from "./utils/userId";
import { registerServiceWorker, subscribeToPush } from "./utils/push";
import "./index.css";
import { daysUntilNextBirthday } from "./utils/birthdayMath";
import NotificationBell from "./components/NotificationBell";
import SkeletonEntry from "./components/SkeletonEntry";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

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
  const [monthFilter, setMonthFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

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

  const visibleEntries = entries
    .filter((entry) => monthFilter === "all" || entry.month === parseInt(monthFilter, 10))
    .sort(
      (a, b) =>
        daysUntilNextBirthday(a.month, a.day) - daysUntilNextBirthday(b.month, b.day)
    );

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎂 Birthday Tracker</h1>
        <NotificationBell />
      </header>
      <main>
        {notifStatus !== "granted" && notifStatus !== "unsupported" && (
          <button className="enable-notif-btn" onClick={handleEnableNotifications}>
            🔔 Enable Notifications
          </button>
        )}
        {!isFormOpen && !editingEntry && (
          <button className="add-birthday-btn" onClick={() => setIsFormOpen(true)}>
            + Add Birthday
          </button>
        )}

        {(isFormOpen || editingEntry) && (
          <BirthdayForm
            onAdd={(entry) => {
              handleAdd(entry);
              setIsFormOpen(false);
            }}
            onUpdate={handleUpdate}
            editingEntry={editingEntry}
            onCancelEdit={() => {
              setEditingEntry(null);
              setIsFormOpen(false);
            }}
          />
        )}
        {!loading && entries.length > 0 && (
          <div className="filter-bar">
            <label htmlFor="month-filter">Show:</label>
            <select
              id="month-filter"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <option value="all">All months</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div className="entries" aria-busy="true" aria-label="Loading birthdays">
            <SkeletonEntry />
            <SkeletonEntry />
            <SkeletonEntry />
          </div>
        ) : (
          <BirthdayList entries={visibleEntries} onDelete={handleDelete} onEdit={setEditingEntry} />
        )}
      </main>
    </div>
  );
}

export default App;