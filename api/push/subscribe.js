const { setSubscription } = require("./store");

module.exports = function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { subscription } = request.body || {};
  if (!subscription?.endpoint) {
    return response.status(400).json({ error: "Missing push subscription" });
  }

  setSubscription(subscription);

  console.log("Received push subscription", {
    endpoint: subscription.endpoint,
    hasKeys: Boolean(subscription.keys?.p256dh && subscription.keys?.auth),
  });

  return response.status(200).json({ ok: true });
};
