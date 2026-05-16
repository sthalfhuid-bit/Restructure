function getPushStore() {
  globalThis.restructurePushStore = globalThis.restructurePushStore || {
    subscription: null,
  };

  return globalThis.restructurePushStore;
}

function setSubscription(subscription) {
  getPushStore().subscription = subscription;
}

function getSubscription() {
  return getPushStore().subscription;
}

module.exports = {
  getSubscription,
  setSubscription,
};
