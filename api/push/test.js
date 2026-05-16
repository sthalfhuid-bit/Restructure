const webPush = require("web-push");
const { getSubscription } = require("./store");

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:hello@restructure.local";

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys");
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { subscription: requestSubscription } = request.body || {};
  const subscription = requestSubscription || getSubscription();
  if (!subscription?.endpoint) {
    return response.status(400).json({ error: "Missing push subscription" });
  }

  try {
    configureWebPush();
    await webPush.sendNotification(
      subscription,
      JSON.stringify({
        title: "Restructure",
        body: "Dit is een testmelding. Push werkt.",
        url: "/index.html",
      })
    );

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Push test failed", error);
    return response.status(500).json({ error: "Push test failed" });
  }
};
