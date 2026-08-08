import { getUserId } from "../utils/userId";
import { useState, useEffect, useRef } from "react";

function formatTimeAgo(sentAt) {
  const sentDate = new Date(sentAt);
  const diffMs = Date.now() - sentDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const userId = getUserId();
  const wrapperRef = useRef(null);

  useEffect(() => {
    fetch("/api/notifications", {
      headers: { "x-user-id": userId },
    })
      .then((res) => res.json())
      .then(setNotifications)
      .catch((err) => console.error("Failed to load notifications:", err));
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.some((n) => !n.read);

  async function handleToggle() {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen && hasUnread) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "x-user-id": userId },
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    }
  }

  return (
    <div className="notification-bell-wrapper" ref={wrapperRef}>
      <button className="notification-bell-btn" onClick={handleToggle} aria-label="Notifications">
        🔔
        {hasUnread && <span className="unread-dot" />}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <strong className="notification-panel-title">Recent Notifications</strong>
          {notifications.length === 0 ? (
            <p className="empty-state">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="notification-item">
                <div className="notification-item-body">{n.body}</div>
                <div className="notification-item-time">{formatTimeAgo(n.sent_at)}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}