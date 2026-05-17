var AppState = (() => {
  const state = {
    appointments: [],
    dayItems: [],
    rememberItems: [],
    memoryNotes: [],
    settings: {},
    brainEntries: [],
    selectedDate: "",
    currentWeekOffset: 0,
    planningData: null,
    planningText: "",
    expandedMemoryItem: "",
  };
  const subscribers = {};

  function set(key, value) {
    if (state[key] === value) return state[key];
    state[key] = value;
    notify(key);
    return state[key];
  }

  function update(key, updater) {
    return set(key, updater(state[key]));
  }

  function notify(key) {
    (subscribers[key] || []).forEach((callback) => callback(state[key], state));
  }

  return {
    init(initialState) {
      Object.assign(state, initialState);
    },
    set,
    update,
    notify,
    subscribe(key, callback) {
      subscribers[key] = subscribers[key] || [];
      subscribers[key].push(callback);
      return () => {
        subscribers[key] = subscribers[key].filter((item) => item !== callback);
      };
    },
    get appointments() {
      return state.appointments;
    },
    set appointments(value) {
      set("appointments", value);
    },
    setAppointments(value) {
      return set("appointments", value);
    },
    updateAppointments(updater) {
      return update("appointments", updater);
    },
    get dayItems() {
      return state.dayItems;
    },
    set dayItems(value) {
      set("dayItems", value);
    },
    setDayItems(value) {
      return set("dayItems", value);
    },
    updateDayItems(updater) {
      return update("dayItems", updater);
    },
    get rememberItems() {
      return state.rememberItems;
    },
    set rememberItems(value) {
      set("rememberItems", value);
    },
    setRememberItems(value) {
      return set("rememberItems", value);
    },
    updateRememberItems(updater) {
      return update("rememberItems", updater);
    },
    get memoryNotes() {
      return state.memoryNotes;
    },
    set memoryNotes(value) {
      set("memoryNotes", value);
    },
    setMemoryNotes(value) {
      return set("memoryNotes", value);
    },
    updateMemoryNotes(updater) {
      return update("memoryNotes", updater);
    },
    get settings() {
      return state.settings;
    },
    set settings(value) {
      set("settings", value);
    },
    setSettings(value) {
      return set("settings", value);
    },
    setSetting(key, value) {
      if (state.settings[key] === value) return state.settings;
      state.settings[key] = value;
      notify("settings");
      return state.settings;
    },
    get brainEntries() {
      return state.brainEntries;
    },
    set brainEntries(value) {
      set("brainEntries", value);
    },
    setBrainEntries(value) {
      return set("brainEntries", value);
    },
    updateBrainEntries(updater) {
      return update("brainEntries", updater);
    },
    get selectedDate() {
      return state.selectedDate;
    },
    set selectedDate(value) {
      set("selectedDate", value);
    },
    setSelectedDate(value) {
      return set("selectedDate", value);
    },
    get currentWeekOffset() {
      return state.currentWeekOffset;
    },
    set currentWeekOffset(value) {
      set("currentWeekOffset", value);
    },
    setCurrentWeekOffset(value) {
      return set("currentWeekOffset", value);
    },
    get planningData() {
      return state.planningData;
    },
    set planningData(value) {
      set("planningData", value);
    },
    setPlanningData(value) {
      return set("planningData", value);
    },
    get planningText() {
      return state.planningText;
    },
    set planningText(value) {
      set("planningText", value);
    },
    setPlanningText(value) {
      return set("planningText", value);
    },
    get expandedMemoryItem() {
      return state.expandedMemoryItem;
    },
    set expandedMemoryItem(value) {
      set("expandedMemoryItem", value);
    },
    setExpandedMemoryItem(value) {
      return set("expandedMemoryItem", value);
    },
  };
})();
