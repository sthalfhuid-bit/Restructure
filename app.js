let quickEntryType = "appointment";
let lastWeekScroll = 0;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;
let agendaView = "week";
let desktopAgendaView = "week";
let planningRenderScheduled = false;
let rememberRenderScheduled = false;

function initApp() {
  initializeState();
  registerSubscriptions();
  bindEvents();
  renderInitialUI();
  startReminderInterval();
}

function initializeState() {
  DOM.quickActionButtons[0]?.classList.add("active");

  AppState.init({
    appointments: loadPersonalAppointments(),
    dayItems: loadDayItems(),
    rememberItems: loadRememberLists(),
    memoryNotes: loadMemoryNotes(),
    settings: loadSettings(),
    brainEntries: loadBrainEntries(),
    selectedDate: toISODate(new Date()),
    currentWeekOffset: 0,
    planningData: null,
    planningText: "",
    expandedMemoryItem: "",
  });
}

function registerSubscriptions() {
  ["appointments", "dayItems", "rememberItems", "selectedDate", "currentWeekOffset"].forEach((key) => {
    AppState.subscribe(key, schedulePlanningRender);
  });

  ["rememberItems", "memoryNotes", "expandedMemoryItem"].forEach((key) => {
    AppState.subscribe(key, scheduleRememberRender);
  });

  AppState.subscribe("settings", () => {
    syncSettingsControls();
    applySettings();
    renderOverview(getCurrentBrainData());
    renderToday(getCurrentBrainData());
    scheduleRememberRender();
    schedulePlanningRender();
  });
}

function bindEvents() {
  bindNavigationEvents();
  bindBrainDumpEvents();
  bindAgendaEvents();
  bindRememberEvents();
  bindSettingsEvents();
  bindHelpEvents();
}

function renderInitialUI() {
  applySettings();
  const initialData = getCurrentBrainData();
  const initialText = getCombinedBrainText();
  renderOverview(initialData);
  renderToday(initialData);
  renderPlanning(initialData, initialText);
  updateCount();
}

function startReminderInterval() {
  setInterval(() => {
    renderPlanning(AppState.planningData || sampleData, AppState.planningText);
  }, 60000);
}

function schedulePlanningRender() {
  if (planningRenderScheduled) return;
  planningRenderScheduled = true;
  setTimeout(() => {
    planningRenderScheduled = false;
    renderPlanning(AppState.planningData || sampleData, AppState.planningText);
  }, 0);
}

function scheduleRememberRender() {
  if (rememberRenderScheduled) return;
  rememberRenderScheduled = true;
  setTimeout(() => {
    rememberRenderScheduled = false;
    renderRemember();
  }, 0);
}

initApp();
