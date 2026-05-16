const pushStatus = document.querySelector("#pushStatus");
const enablePushButton = document.querySelector("#enablePushNotifications");
const sendTestButton = document.querySelector("#sendTestNotification");

let serviceWorkerRegistration = null;

function setPushStatus(message) {
  if (pushStatus) pushStatus.textContent = message;
}

function isPushSupported() {
  return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
}

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((character) => character.charCodeAt(0)));
}

async function getServiceWorkerRegistration() {
  if (serviceWorkerRegistration) return serviceWorkerRegistration;
  serviceWorkerRegistration = await navigator.serviceWorker.register("./service-worker.js");
  return navigator.serviceWorker.ready;
}

async function getVapidPublicKey() {
  const response = await fetch("/api/push/config");
  if (!response.ok) throw new Error(t("subscriptionMissing"));
  const data = await response.json();
  if (!data.publicKey) throw new Error(t("subscriptionMissing"));
  return data.publicKey;
}

async function getPushSubscription() {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

async function enablePushNotifications() {
  if (!isPushSupported()) {
    setPushStatus(t("pushUnsupported"));
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    setPushStatus(t("pushDenied"));
    return null;
  }

  try {
    const registration = await getServiceWorkerRegistration();
    const existingSubscription = await registration.pushManager.getSubscription();
    const subscription = existingSubscription || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(await getVapidPublicKey()),
    });

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) throw new Error(t("subscriptionSaveError"));
    setPushStatus(t("pushEnabled"));
    return subscription;
  } catch (error) {
    setPushStatus(t("pushError"));
    return null;
  }
}

async function sendTestNotification() {
  if (!isPushSupported()) {
    setPushStatus(t("pushUnsupported"));
    return;
  }

  try {
    const subscription = await getPushSubscription() || await enablePushNotifications();
    if (!subscription) return;

    const response = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) throw new Error(t("testNotificationError"));
    setPushStatus(t("pushSent"));
  } catch (error) {
    setPushStatus(t("pushError"));
  }
}

if (location.protocol === "file:") {
  setPushStatus(t("pushLocalFile"));
} else if (!isPushSupported()) {
  setPushStatus(t("pushUnsupported"));
} else if (Notification.permission === "denied") {
  setPushStatus(t("pushDenied"));
} else {
  window.addEventListener("load", () => {
    getServiceWorkerRegistration().catch(() => setPushStatus(t("pushError")));
  });
}

enablePushButton?.addEventListener("click", enablePushNotifications);
sendTestButton?.addEventListener("click", sendTestNotification);
