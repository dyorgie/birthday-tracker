import { getUserId } from "./userId";

// Converts the VAPID public key (base64 string) into the Uint8Array
// format required by the browser's Push API.
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Registers the service worker. Safe to call multiple times.
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }

  return navigator.serviceWorker.register("/sw.js");
}

// Asks the user for notification permission, subscribes them to push,
// and saves the subscription to your backend.
export async function subscribeToPush() {
  if (!("PushManager" in window)) {
    alert("Push notifications aren't supported in this browser.");
    return false;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    alert("Notifications were not allowed. You won't receive birthday reminders.");
    return false;
  }

  const registration = await registerServiceWorker();

  const keyRes = await fetch("/api/vapid-public-key");
  const { publicKey } = await keyRes.json();

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const userId = getUserId();

  await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ subscription }),
  });

  return true;
}