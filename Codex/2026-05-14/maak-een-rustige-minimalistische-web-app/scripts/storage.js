var StorageKeys = {
  appointments: "restructure.personalAppointments",
  dayItems: "restructure.dayItems",
  rememberItems: "restructure.rememberItems",
  memoryNotes: "restructure.memoryNotes",
  settings: "restructure.settings",
  brainEntries: "restructure.brainEntries",
};

function writeStoredValue(key, value) {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function saveAndSetAppointments(appointments) {
  writeStoredValue(StorageKeys.appointments, appointments);
  return AppState.setAppointments(appointments);
}

function saveAndSetDayItems(dayItems) {
  writeStoredValue(StorageKeys.dayItems, dayItems);
  return AppState.setDayItems(dayItems);
}

function saveAndSetRememberItems(rememberItems) {
  writeStoredValue(StorageKeys.rememberItems, rememberItems);
  return AppState.setRememberItems(rememberItems);
}

function saveAndSetMemoryNotes(memoryNotes) {
  writeStoredValue(StorageKeys.memoryNotes, memoryNotes);
  return AppState.setMemoryNotes(memoryNotes);
}

function saveAndSetSettings(settings) {
  writeStoredValue(StorageKeys.settings, settings);
  return AppState.setSettings(settings);
}

function saveAndSetBrainEntries(entries) {
  writeStoredValue(StorageKeys.brainEntries, entries);
  return AppState.setBrainEntries(entries);
}

function savePersonalAppointments(appointments = AppState.appointments) {
  return saveAndSetAppointments(appointments);
}

function saveDayItems(dayItems = AppState.dayItems) {
  return saveAndSetDayItems(dayItems);
}

function saveRememberLists(rememberItems = AppState.rememberItems) {
  return saveAndSetRememberItems(rememberItems);
}

function saveMemoryNotes(memoryNotes = AppState.memoryNotes) {
  return saveAndSetMemoryNotes(memoryNotes);
}

function saveSettings(settings = AppState.settings) {
  return saveAndSetSettings(settings);
}

function saveBrainEntries(entries = AppState.brainEntries) {
  return saveAndSetBrainEntries(entries);
}

function loadPersonalAppointments() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(StorageKeys.appointments) || "[]");
  } catch {
    return [];
  }
}

function loadDayItems() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(StorageKeys.dayItems) || "[]");
  } catch {
    return [];
  }
}

function loadRememberLists() {
  if (!canUseLocalStorage()) return [];

  try {
    const saved = JSON.parse(localStorage.getItem(StorageKeys.rememberItems) || "null");
    if (!saved) return [];
    if (Array.isArray(saved)) {
      return saved
        .filter((item) => !seededRememberItemIds.has(item.id) || item.createdAt)
        .map((item) => ({
          ...item,
          contexts: item.contexts.filter((context) => ["school", "werk", "sport", "vrije tijd"].includes(context)),
          autoRemind: item.autoRemind !== false,
        }));
    }

    const migrated = Object.entries(saved).flatMap(([context, items]) =>
      items.map((name) => ({
        id: `${context}-${normalizeForDuplicate(name)}`,
        name,
        contexts: ["school", "werk", "sport", "vrije tijd"].includes(context) ? [context] : ["vrije tijd"],
        location: "",
        autoRemind: true,
      }))
    );
    return migrated;
  } catch {
    return [];
  }
}

function loadMemoryNotes() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(StorageKeys.memoryNotes) || "[]");
  } catch {
    return [];
  }
}

function loadSettings() {
  if (!canUseLocalStorage()) return { ...defaultSettings };

  try {
    const saved = JSON.parse(localStorage.getItem(StorageKeys.settings) || "{}");
    return { ...defaultSettings, ...saved };
  } catch {
    return { ...defaultSettings };
  }
}

function loadBrainEntries() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(StorageKeys.brainEntries) || "[]");
  } catch {
    return [];
  }
}

function canUseLocalStorage() {
  return typeof localStorage !== "undefined";
}
