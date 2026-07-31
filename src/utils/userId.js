const USER_ID_KEY = "birthday_tracker_user_id";

// Returns this browser's anonymous ID, generating and saving
// one the very first time this function is called.
export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}