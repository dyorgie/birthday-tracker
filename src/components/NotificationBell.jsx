import { useState, useEffect, useRef } from "react";
import { getUserId } from "../utils/userId";

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
  const buttonRef = useRef(null);

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

    function handleEscape(event) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

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
      <button
        ref={buttonRef}
        className="notification-bell-btn"
        onClick={handleToggle}
        aria-label={hasUnread ? "Notifications (unread notifications available)" : "Notifications"}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="notification-panel"
      >
        🔔
        {hasUnread && <span className="unread-dot" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id="notification-panel"
          className="notification-panel"
          role="region"
          aria-label="Recent notifications"
        >
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