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
  if (!response.ok) throw new Error("VAPID public key ontbreekt.");
  const data = await response.json();
  if (!data.publicKey) throw new Error("VAPID public key ontbreekt.");
  return data.publicKey;
}

async function getPushSubscription() {
  const registration = await getServiceWorkerRegistration();
  return registration.pushManager.getSubscription();
}

async function enablePushNotifications() {
  if (!isPushSupported()) {
    setPushStatus("Niet ondersteund op dit apparaat of in deze browser.");
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    setPushStatus("Toestemming geweigerd.");
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

    if (!response.ok) throw new Error("Subscription kon niet worden opgeslagen.");
    setPushStatus("Meldingen ingeschakeld.");
    return subscription;
  } catch (error) {
    setPushStatus("Fout bij inschakelen.");
    return null;
  }
}

async function sendTestNotification() {
  if (!isPushSupported()) {
    setPushStatus("Niet ondersteund op dit apparaat of in deze browser.");
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

    if (!response.ok) throw new Error("Testmelding kon niet worden verstuurd.");
    setPushStatus("Testmelding verstuurd.");
  } catch (error) {
    setPushStatus("Fout bij inschakelen.");
  }
}

if (location.protocol === "file:") {
  setPushStatus("Niet ondersteund via een lokaal bestand. Gebruik een HTTPS-url.");
} else if (!isPushSupported()) {
  setPushStatus("Niet ondersteund op dit apparaat of in deze browser.");
} else if (Notification.permission === "denied") {
  setPushStatus("Toestemming geweigerd.");
} else {
  window.addEventListener("load", () => {
    getServiceWorkerRegistration().catch(() => setPushStatus("Fout bij inschakelen."));
  });
}

enablePushButton?.addEventListener("click", enablePushNotifications);
sendTestButton?.addEventListener("click", sendTestNotification);
