const tabs = document.querySelectorAll(".nav-tab");
const pages = document.querySelectorAll(".page");
const dumpInput = document.querySelector("#brainDump");
const makeOverviewButton = document.querySelector("#makeOverview");
const wordCount = document.querySelector("#wordCount");
const summaryText = document.querySelector("#summaryText");
const overviewGrid = document.querySelector("#overviewGrid");
const focusList = document.querySelector("#focusList");
const actionList = document.querySelector("#actionList");
const ignoreList = document.querySelector("#ignoreList");
const planningGrid = document.querySelector("#planningGrid");
const weekInsight = document.querySelector("#weekInsight");
const weekDeadlines = document.querySelector("#weekDeadlines");
const weekAppointments = document.querySelector("#weekAppointments");
const weekWarnings = document.querySelector("#weekWarnings");
const todayAgendaList = document.querySelector("#todayAgendaList");
const deadlineCount = document.querySelector("#deadlineCount");
const appointmentCount = document.querySelector("#appointmentCount");
const sportCount = document.querySelector("#sportCount");
const schoolCount = document.querySelector("#schoolCount");
const holidayList = document.querySelector("#holidayList");
const calendarPanel = document.querySelector("#calendarPanel");
const prevWeek = document.querySelector("#prevWeek");
const nextWeek = document.querySelector("#nextWeek");
const selectedDayTitle = document.querySelector("#selectedDayTitle");
const selectedDayCount = document.querySelector("#selectedDayCount");
const selectedDayItems = document.querySelector("#selectedDayItems");
const quickEntryForm = document.querySelector("#quickEntryForm");
const quickEntryInput = document.querySelector("#quickEntryInput");
const quickTimeInput = document.querySelector("#quickTimeInput");
const quickCategoryInput = document.querySelector("#quickCategoryInput");
const quickReminderInput = document.querySelector("#quickReminderInput");
const quickActionButtons = document.querySelectorAll("[data-quick-type]");
const appointmentForm = document.querySelector("#appointmentForm");
const appointmentInput = document.querySelector("#appointmentInput");
const appointmentCategory = document.querySelector("#appointmentCategory");
const remindTomorrow = document.querySelector("#remindTomorrow");
const remindHour = document.querySelector("#remindHour");
const appointmentFeedback = document.querySelector("#appointmentFeedback");
const enableReminders = document.querySelector("#enableReminders");
const personalAppointmentList = document.querySelector("#personalAppointmentList");
const rememberSituations = document.querySelector("#rememberSituations");
const rememberItemForm = document.querySelector("#rememberItemForm");
const rememberItemInput = document.querySelector("#rememberItemInput");
const rememberLocationInput = document.querySelector("#rememberLocationInput");
const rememberAutoInput = document.querySelector("#rememberAutoInput");
const rememberUpcoming = document.querySelector("#rememberUpcoming");
const memoryForm = document.querySelector("#memoryForm");
const memoryThingInput = document.querySelector("#memoryThingInput");
const memoryPlaceInput = document.querySelector("#memoryPlaceInput");
const memorySearchInput = document.querySelector("#memorySearchInput");
const memoryResults = document.querySelector("#memoryResults");
const settingsLayout = document.querySelector("#settingsLayout");
const exportDataButton = document.querySelector("#exportData");

const overviewSections = [
  { key: "projects", title: "Projecten", dot: "blue", icon: "□" },
  { key: "tasks", title: "Losse taken", dot: "mint", icon: "✓" },
  { key: "goals", title: "Doelen", dot: "gold", icon: "◇" },
  { key: "worries", title: "Zorgen en stresspunten", dot: "rose", icon: "○" },
  { key: "ideas", title: "Ideeën", dot: "lavender", icon: "✦" },
  { key: "routines", title: "Routines", dot: "mint", icon: "↻" },
  { key: "social", title: "Sociale afspraken", dot: "blue", icon: "◌" },
  { key: "priorities", title: "Prioriteiten", dot: "gold", icon: "△" },
];

const categoryRules = {
  projects: [
    "project",
    "scriptie",
    "presentatie",
    "website",
    "portfolio",
    "campagne",
    "opleiding",
    "verbouwing",
    "verhuizen",
    "planning voor",
    "traject",
    "aanvraag",
  ],
  tasks: [
    "ik moet",
    "moet",
    "nog",
    "mail",
    "bel",
    "stuur",
    "maak",
    "regel",
    "koop",
    "betaal",
    "plan",
    "boek",
    "check",
    "schrijf",
    "afronden",
    "afmaken",
    "opruimen",
    "voorbereiden",
    "uitzoeken",
    "inleveren",
    "betalen",
  ],
  goals: [
    "wil",
    "doel",
    "leren",
    "beter worden",
    "opbouwen",
    "gezonder",
    "meer rust",
    "minder",
    "sparen",
    "groeien",
    "richting",
    "toekomst",
  ],
  worries: [
    "zorg",
    "zorgen",
    "bang",
    "stress",
    "druk",
    "twijfel",
    "onzeker",
    "overweldigd",
    "te veel",
    "vergeten",
    "spannend",
    "geen tijd",
    "loopt achter",
  ],
  ideas: [
    "idee",
    "misschien",
    "ooit",
    "zou kunnen",
    "concept",
    "experiment",
    "probeer",
    "lijkt me",
    "brainstorm",
    "inspiratie",
  ],
  routines: [
    "elke dag",
    "dagelijks",
    "wekelijks",
    "routine",
    "gewoonte",
    "ochtend",
    "avond",
    "sporten",
    "wandelen",
    "slapen",
    "gezond eten",
    "mediteren",
  ],
  social: [
    "afspreken",
    "afspraak",
    "vriend",
    "vriendin",
    "familie",
    "ouders",
    "collega",
    "team",
    "bellen met",
    "eten met",
    "verjaardag",
    "bezoek",
    "appje",
  ],
};

const domainRules = {
  school: ["school", "studie", "tentamen", "examen", "les", "college", "huiswerk", "scriptie", "stage"],
  werk: ["werk", "klant", "meeting", "deadline", "collega", "team", "factuur", "sollicitatie"],
  gezondheid: ["gezondheid", "sport", "slapen", "slaap", "dokter", "therapie", "eten", "wandelen", "energie"],
  administratie: ["belasting", "factuur", "verzekering", "administratie", "rekening", "betaal", "bank"],
  huis: ["huis", "kamer", "opruimen", "schoonmaken", "verhuizen", "verbouwing", "boodschappen"],
  relaties: ["vriend", "vriendin", "familie", "ouders", "partner", "collega", "afspraak", "verjaardag"],
  toekomstplannen: ["toekomst", "later", "doel", "droombaan", "opleiding", "verhuizen", "sparen", "plan"],
};

const urgentWords = ["vandaag", "morgen", "deadline", "urgent", "belangrijk", "eerst", "nu", "deze week", "inleveren"];
const calmFallback = "Je hoofd lijkt nu vooral bezig met rust, overzicht en een haalbare volgorde.";
const personalAppointmentsKey = "restructure.personalAppointments";
const dayItemsKey = "restructure.dayItems";
const rememberListsKey = "restructure.rememberItems";
const memoryNotesKey = "restructure.memoryNotes";
const settingsKey = "restructure.settings";
const defaultSettings = {
  theme: "Donker",
  accent: "Teal",
  language: "Nederlands",
  notifications: false,
  reminderTiming: "Op tijdstip",
  quietNotifications: true,
  dndStart: "22:00",
  dndEnd: "08:00",
  weekStart: "Maandag",
  showVacations: true,
  showHolidays: true,
  time24: true,
  weekScroll: "Horizontaal",
  rememberAuto: true,
  rememberSchool: true,
  rememberWork: true,
  rememberSport: true,
  rememberFree: true,
  smartRemember: true,
  aiTone: "Rustig",
  aiHelp: "Normaal",
  dailyFocus: true,
  smallSteps: true,
  backup: false,
  storage: "Lokaal",
  animations: "Subtiel",
  compact: false,
  calmMode: false,
};
const accentPalettes = {
  Teal: { mint: "#47d8c8", glow: "71, 216, 200" },
  Blauw: { mint: "#8fb4e8", glow: "143, 180, 232" },
  Paars: { mint: "#c6b4e8", glow: "198, 180, 232" },
  Groen: { mint: "#8bd6a3", glow: "139, 214, 163" },
};
let settings = loadSettings();
let personalAppointments = loadPersonalAppointments();
let dayItems = loadDayItems();
let currentPlanningData = null;
let currentPlanningText = "";
let visibleWeekStart = startOfWeek(new Date());
let selectedDate = toISODate(new Date());
let quickEntryType = "appointment";
let lastWeekScroll = 0;
let touchStartX = 0;
let expandedMemoryItem = "";
quickActionButtons[0]?.classList.add("active");

const dutchHolidays = [
  { title: "Nieuwjaarsdag", date: "2026-01-01", type: "holiday" },
  { title: "Goede Vrijdag", date: "2026-04-03", type: "holiday" },
  { title: "Eerste paasdag", date: "2026-04-05", type: "holiday" },
  { title: "Tweede paasdag", date: "2026-04-06", type: "holiday" },
  { title: "Koningsdag", date: "2026-04-27", type: "holiday" },
  { title: "Bevrijdingsdag", date: "2026-05-05", type: "holiday" },
  { title: "Hemelvaartsdag", date: "2026-05-14", type: "holiday" },
  { title: "Eerste pinksterdag", date: "2026-05-24", type: "holiday" },
  { title: "Tweede pinksterdag", date: "2026-05-25", type: "holiday" },
  { title: "Eerste kerstdag", date: "2026-12-25", type: "holiday" },
  { title: "Tweede kerstdag", date: "2026-12-26", type: "holiday" },
];

const schoolVacations = [
  { title: "Meivakantie", date: "2026-04-25", end: "2026-05-03", type: "vacation", meta: "Alle regio's" },
  { title: "Zomervakantie", date: "2026-07-04", end: "2026-08-16", type: "vacation", meta: "Regio Noord" },
  { title: "Zomervakantie", date: "2026-07-18", end: "2026-08-30", type: "vacation", meta: "Regio Midden" },
  { title: "Zomervakantie", date: "2026-07-11", end: "2026-08-23", type: "vacation", meta: "Regio Zuid" },
  { title: "Herfstvakantie", date: "2026-10-10", end: "2026-10-18", type: "vacation", meta: "Regio Noord" },
  { title: "Herfstvakantie", date: "2026-10-17", end: "2026-10-25", type: "vacation", meta: "Regio Midden en Zuid" },
  { title: "Kerstvakantie", date: "2026-12-19", end: "2027-01-03", type: "vacation", meta: "Alle regio's" },
  { title: "Voorjaarsvakantie", date: "2027-02-20", end: "2027-02-28", type: "vacation", meta: "Regio Noord en Midden" },
  { title: "Voorjaarsvakantie", date: "2027-02-13", end: "2027-02-21", type: "vacation", meta: "Regio Zuid" },
  { title: "Meivakantie", date: "2027-04-24", end: "2027-05-02", type: "vacation", meta: "Alle regio's" },
];

const defaults = {
  projects: ["Geen duidelijk project gevonden. Dat is oké; losse gedachten mogen eerst los blijven."],
  tasks: ["Geen concrete taak gevonden. Kies straks hooguit één kleine volgende stap."],
  goals: ["Geen expliciet doel gevonden. Misschien is overzicht krijgen voor nu al genoeg."],
  worries: ["Geen duidelijke zorg benoemd."],
  ideas: ["Geen los idee gevonden. Nieuwe ideeën hoeven vandaag niet afgedwongen te worden."],
  routines: ["Geen routine gevonden. Rust mag ook zonder nieuw systeem."],
  social: ["Geen sociale afspraak gevonden."],
  priorities: ["Begin met wat urgent of belangrijk voelt, en houd het klein."],
};

const sampleData = {
  summary: calmFallback,
  projects: ["Weekplanning maken", "Inbox opruimen", "Gezonde routine bewaken"],
  tasks: ["Plan 20 minuten administratie", "Beantwoord de belangrijkste mail", "Leg spullen klaar voor morgen"],
  goals: ["Meer rust in de agenda", "Minder wisselen tussen taken"],
  worries: ["Te veel losse afspraken tegelijk", "Niet weten waar te beginnen"],
  ideas: ["Een vaste reflectie op vrijdag", "Een rustige ochtend zonder telefoon"],
  routines: ["Wekelijks plannen op vrijdag", "Telefoon later op de ochtend pakken"],
  social: ["Bel een vriend terug wanneer er ruimte is"],
  priorities: ["Rust in de agenda", "Eerst afronden wat al open staat", "Morgen voorbereiden"],
};

const seededRememberItemIds = new Set(["school-sleutels", "schoolpas", "oplader", "laptop", "waterfles", "sportkleding"]);

const rememberLabels = {
  school: "School",
  werk: "Werk",
  sport: "Sport",
  "vrije tijd": "Vrije tijd",
};

let rememberLists = loadRememberLists();
let memoryNotes = loadMemoryNotes();

function showPage(pageId) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === pageId));
  pages.forEach((page) => page.classList.toggle("active", page.id === pageId));
}

function analyzeBrainDump(text) {
  const thoughts = splitThoughts(text);
  const buckets = Object.fromEntries(overviewSections.map((section) => [section.key, []]));
  const priorityCandidates = [];

  thoughts.forEach((thought) => {
    const categories = detectCategories(thought);
    const score = getPriorityScore(thought, categories);
    const targetCategories = categories.length ? categories : ["tasks"];

    targetCategories.forEach((category) => addUnique(buckets[category], thought, score));

    if (score >= 3 || categories.includes("worries") || categories.includes("tasks")) {
      priorityCandidates.push({ text: thought, score });
    }
  });

  buckets.priorities = uniqueRanked(priorityCandidates).slice(0, 5);

  Object.keys(defaults).forEach((key) => {
    if (!buckets[key].length) buckets[key] = defaults[key].map((text) => ({ text, score: 0 }));
  });

  const cleaned = Object.fromEntries(
    Object.entries(buckets).map(([key, items]) => [
      key,
      items
        .sort((a, b) => b.score - a.score || a.text.length - b.text.length)
        .slice(0, 6)
        .map((item) => item.text),
    ])
  );

  return {
    ...cleaned,
    summary: buildSummary(text, cleaned),
  };
}

function splitThoughts(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/[\n.!?;•]+|(?:\s+-\s+)|(?:,\s+maar\s+)|(?:,\s+en\s+)|(?:\s+en ik\s+)/i)
    .map((item) => item.trim())
    .map((item) => item.replace(/^(ik\s+)?(moet|wil|denk dat|ben bang dat)\s+/i, (match) => match.trim() + " "))
    .filter((item) => item.length > 2);
}

function detectCategories(thought) {
  const normalized = normalize(thought);
  return Object.entries(categoryRules)
    .filter(([, words]) => words.some((word) => normalized.includes(normalize(word))))
    .map(([category]) => category);
}

function getPriorityScore(thought, categories) {
  const normalized = normalize(thought);
  let score = 0;

  urgentWords.forEach((word) => {
    if (normalized.includes(normalize(word))) score += 3;
  });

  if (/\b(voor|op)\s+(maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)\b/i.test(thought)) score += 2;
  if (/\b\d{1,2}(:\d{2})?\b/.test(thought)) score += 1;
  if (categories.includes("tasks")) score += 2;
  if (categories.includes("projects")) score += 1;
  if (categories.includes("worries")) score += 1;
  if (categories.includes("ideas")) score -= 1;

  return score;
}

function buildSummary(text, data) {
  const domains = Object.entries(domainRules)
    .map(([domain, words]) => ({
      domain,
      score: words.reduce((total, word) => total + countMatches(text, word), 0),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.domain);

  if (domains.length) {
    return `Je hoofd lijkt nu vooral bezig met ${joinDutch(domains)}. Dat hoeft niet allemaal vandaag opgelost te worden; er is genoeg aan een rustige eerste volgorde.`;
  }

  const activeCategories = overviewSections
    .filter((section) => section.key !== "priorities")
    .filter((section) => !data[section.key][0].startsWith("Geen"))
    .map((section) => section.title.toLowerCase())
    .slice(0, 3);

  if (!activeCategories.length) return calmFallback;

  return `Je hoofd lijkt nu vooral bezig met ${joinDutch(activeCategories)}. Je mag dit stap voor stap bekijken, zonder alles meteen te moeten fixen.`;
}

function countMatches(text, word) {
  const normalizedText = normalize(text);
  const normalizedWord = normalize(word);
  return normalizedText.split(normalizedWord).length - 1;
}

function hasAny(text, words) {
  return words.some((word) => text.includes(normalize(word)));
}

function joinDutch(items) {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} en ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} en ${items.at(-1)}`;
}

function addUnique(bucket, text, score) {
  const key = normalizeForDuplicate(text);
  const existing = bucket.find((item) => normalizeForDuplicate(item.text) === key);

  if (existing) {
    existing.score = Math.max(existing.score, score);
    return;
  }

  bucket.push({ text: softenItem(text), score });
}

function uniqueRanked(items) {
  return items.reduce((unique, item) => {
    const key = normalizeForDuplicate(item.text);
    const existing = unique.find((candidate) => normalizeForDuplicate(candidate.text) === key);

    if (existing) {
      existing.score = Math.max(existing.score, item.score);
    } else {
      unique.push({ text: softenItem(item.text), score: item.score });
    }

    return unique;
  }, []).sort((a, b) => b.score - a.score || a.text.length - b.text.length);
}

function softenItem(text) {
  return text
    .replace(/\s+/g, " ")
    .replace(/^(en|maar|ook)\s+/i, "")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeForDuplicate(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^((ik\s+)?(moet|wil|ga|kan|zal)\s+)?(nog\s+)?(vandaag|morgen|eerst|deze week)?\s*/i, "")
    .replace(/\s+(doen|maken|afmaken|regelen)$/i, "")
    .trim();
}

function renderOverview(data) {
  summaryText.textContent = data.summary;
  overviewGrid.innerHTML = overviewSections
    .map(
      (section) => `
        <article class="section-card">
          <div class="card-title">
            <span class="section-icon ${section.dot}">${section.icon}</span>
            <h3>${section.title}</h3>
          </div>
          <ul class="quiet-list">
            ${data[section.key].map((item) => renderOverviewItem(item, section.key)).join("")}
          </ul>
        </article>
      `
    )
    .join("");
}

function renderOverviewItem(item, key) {
  const isTask = key === "tasks" && !item.startsWith("Geen");

  if (!isTask) return `<li>${escapeHtml(item)}</li>`;

  return `
    <li class="task-item">
      <span>${escapeHtml(item)}</span>
      <button class="soft-button" type="button" data-small-task="${escapeHtml(item)}">Maak kleiner</button>
    </li>
  `;
}

function renderToday(data) {
  const realPriorities = data.priorities.filter((item) => !item.startsWith("Begin met"));
  const fallbackFocus = [...data.tasks, ...data.projects, ...data.goals].filter((item) => !item.startsWith("Geen"));
  const focus = (realPriorities.length ? realPriorities : fallbackFocus).slice(0, 3);
  const actions = data.tasks
    .filter((task) => !task.startsWith("Geen"))
    .slice(0, 5)
    .map((task) => makeSmallStep(task));
  const ignore = [...data.ideas, ...data.worries]
    .filter((item) => !item.startsWith("Geen"))
    .filter((item) => !realPriorities.includes(item))
    .slice(0, 5);

  focusList.innerHTML = listMarkup(focus.length ? focus : ["Kies één klein beginpunt"]);
  actionList.innerHTML = listMarkup(actions.length ? actions : ["Neem 10 minuten om een volgende stap te kiezen"]);
  ignoreList.innerHTML = listMarkup(ignore.length ? ignore : ["Alles wat niet bij je top 3 hoort"]);
}

function renderPlanning(data, text = "") {
  currentPlanningData = data;
  currentPlanningText = text;
  const events = buildPlanningEvents(text, data);
  renderTodayAgenda(events);
  renderWeekOverview(events);
  renderAgenda(events);
  renderHolidayList(events);
  renderPersonalAppointments(events);
  renderRemember(events);
  checkReminderMoments(events);
}

function buildPlanningEvents(text, data) {
  const thoughts = text ? splitThoughts(text) : [];
  const userEvents = thoughts
    .map((thought) => createPlanningEvent(thought))
    .filter(Boolean);
  const personalEvents = personalAppointments.map((appointment) => ({ ...appointment, source: "personal" }));
  const selectedDayEvents = dayItems.map((item) => ({
    id: item.id,
    title: item.text,
    type: eventTypeForCategory(item.type, item.category),
    date: item.date,
    time: item.time || "",
    meta: item.category ? rememberLabels[item.category] || typeLabel(item.type) : typeLabel(item.type),
    category: item.category || categoryFromEvent(item),
    source: "day",
    reminders: item.reminder ? [item.reminder] : [],
    note: item.type === "note" ? item.text : "",
  }));
  const fallbackRoutines = data.routines
    .filter((item) => !item.startsWith("Geen"))
    .map((item) => ({ title: item, type: "routine", date: null, meta: "Wekelijkse routine", source: "user" }));
  const calendarEvents = [
    ...(settings.showHolidays ? dutchHolidays : []),
    ...(settings.showVacations ? schoolVacations : []),
  ];

  return uniquePlanningEvents([...personalEvents, ...selectedDayEvents, ...userEvents, ...fallbackRoutines, ...calendarEvents]).sort(compareEvents);
}

function createPlanningEvent(thought) {
  const normalized = normalize(thought);
  const date = parseDateFromThought(thought);
  const time = parseTimeFromText(thought);
  const personalType = detectAppointmentType(thought);
  const isPersonal = personalType.eventType === "personal";
  const isDeadline = hasAny(normalized, ["deadline", "inlever", "afmaken", "afronden", "tentamen", "examen", "voor "]);
  const isAppointment = hasAny(normalized, ["afspraak", "afspreken", "meeting", "gesprek", "dokter", "tandarts", "eten met", "bellen met", "bel ik", "verjaardag"]);
  const isSport = hasAny(normalized, ["sport", "training", "fitness", "hardlopen", "wandelen", "yoga", "zwemmen"]);
  const isSchool = hasAny(normalized, ["school", "studie", "huiswerk", "scriptie", "college", "les", "tentamen", "bewijstuk"]);
  const isRoutine = hasAny(normalized, ["elke dag", "dagelijks", "wekelijks", "routine", "gewoonte", "elke ochtend", "elke avond"]);

  if (!date && !isRoutine && !isDeadline && !isAppointment && !isSport && !isSchool) return null;

  let type = "deadline";
  if (isRoutine && !date) type = "routine";
  else if (isPersonal) type = "personal";
  else if (isSchool) type = "school";
  else if (isSport) type = "sport";
  else if (isAppointment) type = "appointment";
  else if (isDeadline) type = "deadline";

  return {
    title: softenItem(thought),
    type,
    date,
    time,
    meta: type === "personal" ? personalType.label : date ? typeLabel(type) : "Wekelijks terugkerend",
    category: personalType.category || categoryFromEvent({ title: thought, type, meta: personalType.label }),
    source: "user",
  };
}

function renderWeekOverview(events) {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);
  const weekEvents = events.filter((event) => ["user", "personal", "day"].includes(event.source) && event.date && isBetween(parseISODate(event.date), weekStart, weekEnd));
  const deadlines = weekEvents.filter((event) => event.type === "deadline" || event.type === "school").slice(0, 4);
  const appointments = weekEvents.filter((event) => ["appointment", "personal", "sport"].includes(event.type)).slice(0, 4);
  const allDeadlines = weekEvents.filter((event) => event.type === "deadline");
  const allAppointments = weekEvents.filter((event) => ["appointment", "personal"].includes(event.type));
  const allSports = weekEvents.filter((event) => event.type === "sport");
  const allSchool = weekEvents.filter((event) => event.type === "school");
  const busiestDay = getBusiestDay(weekEvents);
  const warnings = [];

  if (weekEvents.length >= 8) warnings.push("Je week lijkt vol. Kies één ding dat lichter mag.");
  if (deadlines.length >= 3) warnings.push("Meerdere deadlines staan dicht bij elkaar. Maak één voorbereiding kleiner.");
  if (busiestDay.count >= 4) warnings.push(`${formatShortDate(busiestDay.date)} is gevuld. Misschien kan iets schuiven.`);
  if (!warnings.length) warnings.push("Er lijkt ademruimte te zijn. Laat lege ruimte ook leeg.");

  weekInsight.textContent =
    weekEvents.length >= 8
      ? "Je week lijkt vol. Je hoeft dit niet harder te dragen; kleiner maken en schuiven mag."
      : weekEvents.length >= 4
        ? "Er staat wat op je week. Houd de belangrijkste afspraken zichtbaar en laat de rest zacht op de achtergrond."
        : "Je week is rustig - dat kan fijn zijn.";

  deadlineCount.textContent = allDeadlines.length;
  appointmentCount.textContent = allAppointments.length;
  sportCount.textContent = allSports.length;
  schoolCount.textContent = allSchool.length;
  weekDeadlines.innerHTML = listMarkup(deadlines.length ? deadlines.map(formatEventLine) : ["Geen duidelijke deadline deze week."]);
  weekAppointments.innerHTML = listMarkup(appointments.length ? appointments.map(formatEventLine) : ["Geen komende afspraak gevonden."]);
  weekWarnings.innerHTML = listMarkup(warnings);
}

function renderTodayAgenda(events) {
  const today = toISODate(new Date());
  const todayEvents = events
    .filter((event) => event.date === today && ["personal", "appointment", "sport", "school", "deadline"].includes(event.type))
    .sort(compareEvents)
    .slice(0, 4);

  todayAgendaList.innerHTML = todayEvents.length
    ? todayEvents.map(renderAgendaFocusItem).join("")
    : `<p class="quiet-note">Niets dringends vandaag. Laat deze ruimte rustig blijven.</p>`;
}

function renderAgendaFocusItem(event) {
  return `
    <div class="agenda-focus-item">
      <strong>${escapeHtml(event.title)}</strong>
      <span>${escapeHtml(formatEventLine(event))}</span>
      ${event.reminders?.filter(Boolean).length ? `<span>${escapeHtml(formatReminderLabels(event.reminders.filter(Boolean)))}</span>` : ""}
    </div>
  `;
}

function renderAgenda(events) {
  const today = startOfDay(new Date());
  const weekStart = startOfDay(visibleWeekStart);
  const weekEnd = addDays(weekStart, 6);
  const datedEvents = events.filter((event) => event.date && isBetween(parseISODate(event.date), weekStart, weekEnd));
  const agendaDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const calendarTitle = document.querySelector("#calendar-title");
  calendarTitle.textContent = weekStart.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  planningGrid.innerHTML = agendaDays.map((date) => renderDayCard(date, datedEvents)).join("");
  renderWeekdayLabels(agendaDays);
  renderSelectedDay(events);
}

function renderWeekdayLabels(agendaDays) {
  const weekdayRow = document.querySelector(".calendar-weekdays");
  if (!weekdayRow) return;
  weekdayRow.innerHTML = agendaDays
    .map((date) => `<span>${date.toLocaleDateString("nl-NL", { weekday: "short" }).replace(".", "")}</span>`)
    .join("");
}

function renderHolidayList(events) {
  const today = startOfDay(new Date());
  const upcoming = events
    .filter((event) => ["holiday", "vacation"].includes(event.type))
    .filter((event) => event.date && parseISODate(event.date) >= today)
    .slice(0, 4);

  holidayList.innerHTML = upcoming.length
    ? upcoming.map((event) => `<li>${escapeHtml(event.title)}${event.date ? ` - ${escapeHtml(formatShortDate(parseISODate(event.date)))}` : ""}</li>`).join("")
    : `<li>Geen feestdagen of vakanties dichtbij.</li>`;
}

function renderRemember(events = buildPlanningEvents(currentPlanningText, currentPlanningData || sampleData)) {
  renderRememberSituations();
  renderUpcomingRemember(events);
  renderMemoryResults(memorySearchInput?.value || "");
}

function renderRememberSituations() {
  if (!rememberSituations) return;
  rememberSituations.innerHTML = "";
}

function renderUpcomingRemember(events) {
  if (!rememberUpcoming) return;

  if (!settings.rememberAuto) {
    rememberUpcoming.innerHTML = `<p class="quiet-note">Automatische geheugensteuntjes staan uit. Je spullen blijven wel rustig bewaard.</p>`;
    return;
  }

  const today = startOfDay(new Date());
  const horizon = addDays(today, 7);
  const hints = events
    .filter((event) => event.date && isBetween(parseISODate(event.date), today, horizon))
    .map((event) => ({ event, situation: detectRememberSituation(event) }))
    .filter((item) => item.situation && isRememberContextEnabled(item.situation))
    .map((item) => ({ ...item, items: rememberLists.filter((rememberItem) => rememberItem.autoRemind !== false && rememberItem.contexts.includes(item.situation)) }))
    .filter((item) => item.situation && item.items.length)
    .slice(0, 4);

  rememberUpcoming.innerHTML = hints.length
    ? hints.map(renderRememberHint).join("")
    : `<p class="quiet-note">Geen automatische geheugensteun nodig voor de komende dagen.</p>`;
}

function renderRememberHint({ event, situation, items }) {
  const dayLabel = isToday(event.date) ? "Vandaag" : isTomorrow(event.date) ? "Morgen" : formatShortDate(parseISODate(event.date));
  return `
    <div class="day-detail-item reminder">
      <strong>${dayLabel} ${rememberLabels[situation].toLowerCase()} - vergeet niet:</strong>
      <span>${items.map((item) => `• ${escapeHtml(item.name)}`).join(" ")}</span>
    </div>
  `;
}

function renderMemoryResults(query = "") {
  if (!memoryResults) return;

  const cleanQuery = normalize(query)
    .replace(/waar\s+(liggen|ligt)\s+(mijn\s+)?/g, "")
    .replace(/[?]/g, "")
    .trim();
  const results = cleanQuery
    ? [
        ...memoryNotes.map((note) => ({ ...note, source: "memory" })),
        ...rememberLists.map((item) => ({
          id: item.id,
          thing: item.name,
          place: item.location,
          contexts: item.contexts,
          autoRemind: item.autoRemind,
          source: "remember",
        })),
      ].filter((note) => normalize(`${note.thing} ${note.place}`).includes(cleanQuery))
    : [
        ...rememberLists.map((item) => ({
          id: item.id,
          thing: item.name,
          place: item.location,
          contexts: item.contexts,
          autoRemind: item.autoRemind,
          source: "remember",
        })),
        ...memoryNotes.map((note) => ({ ...note, source: "memory" })),
      ];

  memoryResults.innerHTML = results.length
    ? results.map(renderMemoryAccordionItem).join("")
    : `<p class="quiet-note">Nog niets gevonden. Je kunt hierboven rustig een plek bewaren.</p>`;
}

function renderMemoryAccordionItem(note) {
  const id = `${note.source}-${note.id || normalizeForDuplicate(note.thing)}`;
  const isOpen = expandedMemoryItem === id;
  const deleteAttr = note.source === "remember" ? "data-delete-remember" : "data-delete-memory";
  const categoryText = note.contexts?.length
    ? note.contexts.map((context) => rememberLabels[context] || context).join(", ")
    : "Niet gekoppeld";
  const autoText = note.source === "remember" ? (note.autoRemind === false ? "uit" : "aan") : "niet ingesteld";

  return `
    <div class="memory-result ${isOpen ? "open" : ""}">
      <button class="memory-summary" type="button" data-memory-toggle="${escapeHtml(id)}" aria-expanded="${isOpen}">
        <strong>${escapeHtml(note.thing)}</strong>
        <span>${isOpen ? "Sluit" : "Open"}</span>
      </button>
      ${
        isOpen
          ? `
            <div class="memory-detail">
              <p><span>Locatie</span>${escapeHtml(note.place || "Geen locatie opgeslagen")}</p>
              <p><span>Nodig voor</span>${escapeHtml(categoryText)}</p>
              <p><span>Automatisch herinneren</span>${escapeHtml(autoText)}</p>
              <button class="delete-item" type="button" ${deleteAttr}="${escapeHtml(note.id || note.thing)}" aria-label="${escapeHtml(note.thing)} verwijderen">⌫</button>
            </div>
          `
          : ""
      }
    </div>
  `;
}

function detectRememberSituation(event) {
  if (event.category && isRememberContextEnabled(event.category)) return event.category;

  const text = normalize(`${event.title} ${event.meta || ""} ${event.type || ""}`);
  if (hasAny(text, ["school", "studie", "college", "les", "mentor", "tentamen", "huiswerk"])) return "school";
  if (hasAny(text, ["werk", "meeting", "kantoor", "klant", "collega", "laptop"])) return "werk";
  if (hasAny(text, ["sport", "training", "voetbal", "fitness", "yoga", "zwemmen", "hardlopen"])) return "sport";
  if (hasAny(text, ["vriend", "vriendin", "familie", "ouders", "eten", "kapper", "tandarts", "dokter", "film", "game", "vrije tijd", "verjaardag"])) return "vrije tijd";
  return "";
}

function categoryFromEvent(event) {
  const situation = detectRememberSituation({ ...event, category: "" });
  return situation || "vrije tijd";
}

function eventTypeForCategory(fallbackType, category) {
  if (fallbackType !== "appointment") return fallbackType;
  if (category === "school") return "school";
  if (category === "sport") return "sport";
  return "appointment";
}

function isRememberContextEnabled(context) {
  return {
    school: settings.rememberSchool,
    werk: settings.rememberWork,
    sport: settings.rememberSport,
    "vrije tijd": settings.rememberFree,
  }[context] !== false;
}

function isTomorrow(date) {
  return date === toISODate(addDays(new Date(), 1));
}

function isToday(date) {
  return date === toISODate(new Date());
}

function renderDayCard(date, events) {
  const iso = toISODate(date);
  const dayEvents = events
    .filter((event) => event.date === iso)
    .sort(compareEvents)
    .slice(0, 5);
  const isQuiet = !dayEvents.length;

  return `
    <article class="day-card ${isQuiet ? "rest-day" : ""} ${iso === selectedDate ? "selected" : ""}" data-date="${iso}" tabindex="0">
      <div class="day-heading">
        <h3>${date.getDate()}</h3>
      </div>
      <div class="event-list">
        ${
          dayEvents.length
            ? dayEvents.map(renderEventCard).join("")
            : ""
        }
      </div>
    </article>
  `;
}

function renderSelectedDay(events) {
  const date = parseISODate(selectedDate);
  const items = events
    .filter((event) => event.date === selectedDate && ["personal", "appointment", "sport", "school", "deadline", "task", "reminder", "note"].includes(event.type))
    .sort(compareEvents);

  selectedDayTitle.textContent = date.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
  selectedDayCount.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;
  selectedDayItems.innerHTML = items.length
    ? items.map(renderDayDetailItem).join("")
    : `<p class="quiet-note">Nog niets voor deze dag. Je mag hem leeg laten.</p>`;
}

function renderDayDetailItem(event) {
  const timeLabel = event.time ? `${escapeHtml(formatTime(event.time))} uur` : "hele dag";
  const deleteButton = renderAgendaDeleteButton(event);
  return `
    <div class="day-detail-item ${event.type}">
      ${deleteButton}
      <strong>${escapeHtml(event.title)}</strong>
      <span>${escapeHtml(event.meta || typeLabel(event.type))} · ${timeLabel}</span>
      ${event.reminders?.length ? `<span>${escapeHtml(formatReminderLabels(event.reminders))}</span>` : ""}
    </div>
  `;
}

function renderAgendaDeleteButton(event) {
  if (!event.id || !["personal", "day"].includes(event.source)) return "";
  const attribute = event.source === "personal" ? "data-delete-appointment" : "data-delete-day-item";
  return `<button class="delete-item agenda-delete" type="button" ${attribute}="${escapeHtml(event.id)}" aria-label="${escapeHtml(event.title)} verwijderen">⌫</button>`;
}

function renderEventCard(event) {
  return `
    <div class="event-card ${event.type}">
      <span>${escapeHtml(getEventMeta(event))}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <small class="event-time">${event.time ? escapeHtml(formatTime(event.time)) : "hele dag"}</small>
      ${event.reminders?.filter(Boolean).length ? `<small class="event-reminder">${escapeHtml(formatReminderLabels(event.reminders.filter(Boolean)))}</small>` : ""}
    </div>
  `;
}

function getEventMeta(event) {
  if (event.type === "vacation" && event.end) {
    return `${event.meta} t/m ${formatShortDate(parseISODate(event.end))}`;
  }

  return event.meta || typeLabel(event.type);
}

function parseDateFromThought(thought) {
  const normalized = normalize(thought);
  const today = startOfDay(new Date());
  const dateMatch = normalized.match(/\b(\d{1,2})[-/ ](\d{1,2})(?:[-/ ](\d{4}))?\b/);

  if (normalized.includes("overmorgen")) return toISODate(addDays(today, 2));
  if (normalized.includes("vandaag")) return toISODate(today);
  if (normalized.includes("morgen")) return toISODate(addDays(today, 1));
  if (normalized.includes("deze week")) return toISODate(addDays(today, 2));

  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const year = dateMatch[3] ? Number(dateMatch[3]) : today.getFullYear();
    return toISODate(new Date(year, month, day));
  }

  const weekdays = ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"];
  const foundIndex = weekdays.findIndex((day) => normalized.includes(day));
  if (foundIndex >= 0) return toISODate(nextWeekday(today, foundIndex));

  return null;
}

function nextWeekday(from, weekday) {
  const diff = (weekday - from.getDay() + 7) % 7;
  return addDays(from, diff);
}

function getBusiestDay(events) {
  const counts = events.reduce((days, event) => {
    days[event.date] = (days[event.date] || 0) + 1;
    return days;
  }, {});
  const [date, count = 0] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || [toISODate(new Date()), 0];
  return { date: parseISODate(date), count };
}

function uniquePlanningEvents(events) {
  const seen = new Set();
  return events.filter((event) => {
    const key = `${event.date || "routine"}-${event.type}-${normalizeForDuplicate(event.title)}-${event.meta || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function compareEvents(a, b) {
  if (!a.date && !b.date) return a.title.localeCompare(b.title);
  if (!a.date) return 1;
  if (!b.date) return -1;
  const dateDiff = parseISODate(a.date) - parseISODate(b.date);
  if (dateDiff !== 0) return dateDiff;
  return (a.time || "23:59").localeCompare(b.time || "23:59");
}

function typeLabel(type) {
  return {
    deadline: "deadline",
    appointment: "afspraak",
    personal: "vrije tijd",
    sport: "sport",
    school: "school",
    task: "taak",
    reminder: "reminder",
    note: "notitie",
    routine: "routine",
    holiday: "feestdag",
    vacation: "schoolvakantie",
  }[type];
}

function formatEventLine(event) {
  const time = event.time ? ` om ${formatTime(event.time)}` : "";
  return `${formatShortDate(parseISODate(event.date))}${time}: ${event.title}`;
}

function formatTime(time) {
  if (settings.time24 !== false) return time;
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatDayName(date) {
  return date.toLocaleDateString("nl-NL", { weekday: "long" });
}

function formatShortDate(date) {
  return date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const diff = settings?.weekStart === "Zondag" ? date.getDay() : (date.getDay() + 6) % 7;
  return addDays(startOfDay(date), -diff);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMinutes(date, minutes) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}

function isBetween(date, start, end) {
  return date >= startOfDay(start) && date <= startOfDay(end);
}

function parseISODate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parsePersonalAppointment(text, reminderChoices, chosenCategory = "") {
  const date = parseDateFromThought(text);
  const time = parseTimeFromText(text);
  const type = detectAppointmentType(text, chosenCategory);
  const cleanedTitle = cleanAppointmentTitle(text);

  if (!date) {
    return {
      error: "Ik mis nog een datum. Probeer bijvoorbeeld: vrijdag om 14:00 kapper.",
    };
  }

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: cleanedTitle,
    date,
    time,
    type: type.eventType,
    meta: type.label,
    category: type.category,
    reminders: reminderChoices,
    source: "personal",
    createdAt: new Date().toISOString(),
  };
}

function parseTimeFromText(text) {
  const normalized = normalize(text);
  const match = normalized.match(/(?:\bom\s+)?(\d{1,2})(?:(?::|\.)(\d{2})|\s*uur)\b/);
  if (!match) return "";

  const hour = Math.min(Number(match[1]), 23);
  const minutes = match[2] ? Math.min(Number(match[2]), 59) : 0;
  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function detectAppointmentType(text, chosenCategory = "") {
  if (chosenCategory) return appointmentTypeFromCategory(chosenCategory);

  const normalized = normalize(text);

  if (hasAny(normalized, ["school", "studie", "mentor", "college", "les", "tentamen", "examen", "stage"])) {
    return appointmentTypeFromCategory("school");
  }

  if (hasAny(normalized, ["werk", "kantoor", "meeting", "klant", "collega", "laptop", "dienst"])) {
    return appointmentTypeFromCategory("werk");
  }

  if (hasAny(normalized, ["sport", "training", "fitness", "voetbal", "yoga", "zwemmen", "hardlopen", "boksen"])) {
    return appointmentTypeFromCategory("sport");
  }

  if (hasAny(normalized, ["vriend", "vriendin", "familie", "ouders", "eten met", "afspreken", "verjaardag", "borrel", "kapper", "tandarts", "dokter", "huisarts", "therapie", "fysio", "film", "game"])) {
    return appointmentTypeFromCategory("vrije tijd");
  }

  return appointmentTypeFromCategory("vrije tijd");
}

function appointmentTypeFromCategory(category) {
  return {
    school: { eventType: "school", label: "school", category: "school" },
    werk: { eventType: "appointment", label: "werk", category: "werk" },
    sport: { eventType: "sport", label: "sport", category: "sport" },
    "vrije tijd": { eventType: "appointment", label: "vrije tijd", category: "vrije tijd" },
  }[category] || { eventType: "appointment", label: "vrije tijd", category: "vrije tijd" };
}

function cleanAppointmentTitle(text) {
  return softenItem(
    text
      .replace(/\b(ik heb|ik ga|ik moet|er is)\b/gi, "")
      .replace(/(?:\bom\s+)?\d{1,2}(?:(?::|\.)\d{2}|\s*uur)\b/gi, "")
      .replace(/\b(vandaag|morgen|overmorgen|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|deze week)\b/gi, "")
      .replace(/^\s*een\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.!?]+$/, "")
  );
}

function renderPersonalAppointments(events) {
  const upcoming = events
    .filter((event) => event.source === "personal")
    .filter((event) => event.date && parseISODate(event.date) >= startOfDay(new Date()))
    .slice(0, 5);

  personalAppointmentList.innerHTML = upcoming.length
    ? upcoming
        .map(
          (event) =>
            `<li class="appointment-list-item">
              ${renderAgendaDeleteButton(event)}
              <strong>${escapeHtml(event.title)}</strong><br>${escapeHtml(formatEventLine(event))}<br><span class="event-reminder">${escapeHtml(formatReminderLabels(event.reminders))}</span>
            </li>`
        )
        .join("")
    : `<li>Nog geen belangrijke afspraak. Je kunt er hierboven rustig één toevoegen.</li>`;
}

function savePersonalAppointments() {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(personalAppointmentsKey, JSON.stringify(personalAppointments));
}

function saveDayItems() {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(dayItemsKey, JSON.stringify(dayItems));
}

function saveRememberLists() {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(rememberListsKey, JSON.stringify(rememberLists));
}

function saveMemoryNotes() {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(memoryNotesKey, JSON.stringify(memoryNotes));
}

function saveSettings() {
  if (!canUseLocalStorage()) return;
  localStorage.setItem(settingsKey, JSON.stringify(settings));
}

function loadPersonalAppointments() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(personalAppointmentsKey) || "[]");
  } catch {
    return [];
  }
}

function loadDayItems() {
  if (!canUseLocalStorage()) return [];

  try {
    return JSON.parse(localStorage.getItem(dayItemsKey) || "[]");
  } catch {
    return [];
  }
}

function loadRememberLists() {
  if (!canUseLocalStorage()) return [];

  try {
    const saved = JSON.parse(localStorage.getItem(rememberListsKey) || "null");
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
    return JSON.parse(localStorage.getItem(memoryNotesKey) || "[]");
  } catch {
    return [];
  }
}

function loadSettings() {
  if (!canUseLocalStorage()) return { ...defaultSettings };

  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || "{}");
    return { ...defaultSettings, ...saved };
  } catch {
    return { ...defaultSettings };
  }
}

function canUseLocalStorage() {
  return typeof localStorage !== "undefined";
}

function bindSettings() {
  if (!settingsLayout) return;

  settingsLayout.querySelectorAll("[data-setting]").forEach((control) => {
    const key = control.dataset.setting;
    if (!(key in settings)) return;

    if (control.type === "checkbox") {
      control.checked = Boolean(settings[key]);
    } else {
      control.value = settings[key];
    }

    control.addEventListener("change", () => {
      settings[key] = control.type === "checkbox" ? control.checked : control.value;
      saveSettings();
      applySettings();
      if (key === "weekStart") visibleWeekStart = startOfWeek(visibleWeekStart);
      renderPlanning(currentPlanningData || sampleData, currentPlanningText);
    });
  });

  exportDataButton?.addEventListener("click", exportData);
}

function applySettings() {
  const palette = accentPalettes[settings.accent] || accentPalettes.Teal;
  document.documentElement.style.setProperty("--mint", palette.mint);
  document.documentElement.style.setProperty("--accent-rgb", palette.glow);

  document.body.classList.toggle("theme-light", settings.theme === "Licht");
  document.body.classList.toggle("animations-off", settings.animations === "Uit");
  document.body.classList.toggle("animations-subtle", settings.animations === "Subtiel");
  document.body.classList.toggle("compact-mode", Boolean(settings.compact));
  document.body.classList.toggle("calm-mode", Boolean(settings.calmMode));
}

function exportData() {
  const payload = {
    app: "Restructure",
    exportedAt: new Date().toISOString(),
    settings,
    personalAppointments,
    dayItems,
    rememberLists,
    memoryNotes,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `restructure-backup-${toISODate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatReminderLabels(reminders = []) {
  if (!reminders.length) return "geen herinnering";
  const labels = reminders.map(reminderLabel);
  return `Herinnering: ${joinDutch(labels)}`;
}

function reminderLabel(reminder) {
  return {
    "": "geen reminder",
    "at-time": "op het moment zelf",
    "10-min": "10 minuten van tevoren",
    "30-min": "30 minuten van tevoren",
    "1-hour": "1 uur van tevoren",
    "1-day": "1 dag van tevoren",
    tomorrow: "morgen herinneren",
    hour: "1 uur van tevoren",
  }[reminder] || reminder;
}

function getReminderDate(event, reminder) {
  if (!event.date) return null;
  const [hour = 9, minute = 0] = event.time ? event.time.split(":").map(Number) : [9, 0];
  const base = new Date(parseISODate(event.date));
  base.setHours(hour, minute, 0, 0);

  if (reminder === "tomorrow") return addDays(base, -1);
  if (reminder === "1-day") return addDays(base, -1);
  if (reminder === "at-time") return base;
  if (reminder === "10-min") return addMinutes(base, -10);
  if (reminder === "30-min") return addMinutes(base, -30);
  if (reminder === "hour" || reminder === "1-hour") return addMinutes(base, -60);

  return null;
}

function checkReminderMoments(events) {
  if (!settings.notifications) return;
  const now = new Date();
  const due = events
    .filter((event) => event.source === "personal" && event.reminders?.length)
    .flatMap((event) =>
      event.reminders.map((reminder) => ({
        event,
        reminder,
        date: getReminderDate(event, reminder),
      }))
    )
    .filter((item) => item.date && item.date <= now && item.date >= addMinutes(now, -5));

  if (!due.length) return;

  appointmentFeedback.textContent = `Rustige herinnering: ${due[0].event.title} staat gepland op ${formatEventLine(due[0].event)}.`;
  maybeNotify(due[0].event);
}

function maybeNotify(event) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification("Restructure herinnering", {
    body: `${event.title} staat gepland op ${formatEventLine(event)}.`,
  });
}

function makeSmallAction(task) {
  return makeSmallStep(task);
}

function makeSmallStep(task) {
  const clean = cleanTaskText(task);
  const normalized = normalize(clean);

  if (hasAny(normalized, ["bewijstuk", "document", "verslag", "scriptie", "essay", "rapport", "tekst"])) {
    return `Open het document en werk alleen de eerste kop of titelpagina bij.`;
  }

  if (hasAny(normalized, ["presentatie", "slides", "pitch"])) {
    return `Open de presentatie en maak alleen de titel-slide rustig kloppend.`;
  }

  if (hasAny(normalized, ["mail", "email", "stuur", "bericht"])) {
    return `Open een leeg bericht en schrijf alleen de onderwerpregel.`;
  }

  if (hasAny(normalized, ["bel", "bellen", "telefoon"])) {
    return `Zoek alleen het nummer op en leg je telefoon klaar. Je hoeft nog niet te bellen.`;
  }

  if (hasAny(normalized, ["plan", "planning", "agenda", "afspraak", "boek"])) {
    return `Open je agenda en kies alleen een rustig moment van 10 minuten.`;
  }

  if (hasAny(normalized, ["opruim", "schoon", "kamer", "huis"])) {
    return `Kies één klein oppervlak en haal daar alleen vijf dingen vanaf.`;
  }

  if (hasAny(normalized, ["betaal", "belasting", "rekening", "administratie", "verzekering"])) {
    return `Open alleen de juiste map of website en zoek het eerste benodigde document op.`;
  }

  if (hasAny(normalized, ["koop", "boodschap", "bestel"])) {
    return `Schrijf alleen op wat je precies nodig hebt, zonder het meteen te regelen.`;
  }

  if (hasAny(normalized, ["leren", "tentamen", "examen", "studie", "school"])) {
    return `Open je materiaal en lees alleen de eerste alinea of opdrachtregel.`;
  }

  return `Zet een timer op 5 minuten en doe alleen de eerste zichtbare handeling voor: ${clean}.`;
}

function cleanTaskText(task) {
  return task
    .replace(/^(ik\s+)?(moet|wil|ga|kan|zal|vandaag|morgen|eerst|nog)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.!?]+$/, "");
}

function listMarkup(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    }[character];
  });
}

function updateCount() {
  const words = dumpInput.value.trim().split(/\s+/).filter(Boolean).length;
  wordCount.textContent = `${words} ${words === 1 ? "woord" : "woorden"}`;
}

overviewGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-small-task]");
  if (!button) return;

  const item = button.closest(".task-item");
  const existing = item.querySelector(".small-step");
  const step = makeSmallStep(button.dataset.smallTask);

  if (existing) {
    existing.querySelector("p").textContent = step;
    return;
  }

  item.insertAdjacentHTML(
    "beforeend",
    `<div class="small-step"><span>Kleine eerste stap</span><p>${escapeHtml(step)}</p></div>`
  );
});

appointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = appointmentInput.value.trim();
  if (!text) {
    appointmentFeedback.textContent = "Typ rustig één afspraak in gewone taal.";
    return;
  }

  const reminders = [
    remindTomorrow.checked ? "tomorrow" : null,
    remindHour.checked ? "hour" : null,
  ].filter(Boolean);
  const appointment = parsePersonalAppointment(text, reminders, appointmentCategory.value);

  if (appointment.error) {
    appointmentFeedback.textContent = appointment.error;
    return;
  }

  personalAppointments = uniquePlanningEvents([appointment, ...personalAppointments]);
  savePersonalAppointments();
  appointmentInput.value = "";
  appointmentCategory.value = "";
  appointmentFeedback.textContent = `Toegevoegd: ${formatEventLine(appointment)}.`;
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
});

prevWeek.addEventListener("click", () => {
  moveWeek(-1);
});

nextWeek.addEventListener("click", () => {
  moveWeek(1);
});

calendarPanel.addEventListener("wheel", (event) => {
  const now = Date.now();
  const isHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.25;
  const isIntentionalShift = event.shiftKey && Math.abs(event.deltaY) > 45;
  const isVerticalIntent = Math.abs(event.deltaY) > Math.abs(event.deltaX) * 1.25 && Math.abs(event.deltaY) > 45;
  const useVerticalScroll = settings.weekScroll === "Verticaal";
  if (useVerticalScroll ? !isVerticalIntent : !isHorizontalIntent && !isIntentionalShift) return;

  const intent = useVerticalScroll ? event.deltaY : isHorizontalIntent ? event.deltaX : event.deltaY;
  if (Math.abs(intent) < 45 || now - lastWeekScroll < 650) return;
  lastWeekScroll = now;
  event.preventDefault();
  moveWeek(intent > 0 ? 1 : -1);
}, { passive: false });

calendarPanel.addEventListener("touchstart", (event) => {
  touchStartX = event.touches[0]?.clientX || 0;
}, { passive: true });

calendarPanel.addEventListener("touchend", (event) => {
  const endX = event.changedTouches[0]?.clientX || touchStartX;
  const diff = touchStartX - endX;
  if (Math.abs(diff) < 48) return;
  moveWeek(diff > 0 ? 1 : -1);
}, { passive: true });

planningGrid.addEventListener("click", (event) => {
  const day = event.target.closest("[data-date]");
  if (!day) return;
  selectedDate = day.dataset.date;
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
});

planningGrid.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const day = event.target.closest("[data-date]");
  if (!day) return;
  event.preventDefault();
  selectedDate = day.dataset.date;
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
});

selectedDayItems.addEventListener("click", (event) => {
  const appointmentButton = event.target.closest("[data-delete-appointment]");
  const dayItemButton = event.target.closest("[data-delete-day-item]");
  const button = appointmentButton || dayItemButton;
  if (!button) return;

  askThenDelete(button, () => {
    if (appointmentButton) {
      personalAppointments = personalAppointments.filter((appointment) => appointment.id !== appointmentButton.dataset.deleteAppointment);
      savePersonalAppointments();
    }

    if (dayItemButton) {
      dayItems = dayItems.filter((item) => item.id !== dayItemButton.dataset.deleteDayItem);
      saveDayItems();
    }

    renderPlanning(currentPlanningData || sampleData, currentPlanningText);
  });
});

personalAppointmentList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-appointment]");
  if (!button) return;

  askThenDelete(button, () => {
    personalAppointments = personalAppointments.filter((appointment) => appointment.id !== button.dataset.deleteAppointment);
    savePersonalAppointments();
    renderPlanning(currentPlanningData || sampleData, currentPlanningText);
  });
});

quickActionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    quickEntryType = button.dataset.quickType;
    quickActionButtons.forEach((item) => item.classList.toggle("active", item === button));
    quickEntryInput.placeholder = quickPlaceholder(quickEntryType);
    quickEntryInput.focus();
  });
});

quickEntryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = quickEntryInput.value.trim();
  if (!text) return;

  dayItems = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      date: selectedDate,
      type: quickEntryType,
      time: quickTimeInput.value || parseTimeFromText(text),
      category: quickCategoryInput.value || categoryFromEvent({ title: text, type: quickEntryType }),
      reminder: quickReminderInput.value,
      text: cleanQuickEntryText(text, quickEntryType),
      createdAt: new Date().toISOString(),
    },
    ...dayItems,
  ];
  saveDayItems();
  quickEntryInput.value = "";
  quickTimeInput.value = "";
  quickCategoryInput.value = "";
  quickReminderInput.value = "";
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
});

rememberSituations.addEventListener("change", (event) => {
  const input = event.target.closest("[data-remember-auto]");
  if (!input) return;

  rememberLists = rememberLists.map((item) =>
    item.id === input.dataset.rememberAuto ? { ...item, autoRemind: input.checked } : item
  );
  saveRememberLists();
  renderRemember();
});

rememberSituations.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-remember]");
  if (!button) return;

  askThenDelete(button, () => {
    rememberLists = rememberLists.filter((item) => item.id !== button.dataset.deleteRemember);
    saveRememberLists();
    renderRemember();
  });
});

rememberItemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = softenItem(rememberItemInput.value.trim());
  const location = softenItem(rememberLocationInput.value.trim());
  const contexts = [...rememberItemForm.querySelectorAll(".needed-for input:checked")]
    .map((input) => input.value)
    .filter((context) => ["school", "werk", "sport", "vrije tijd"].includes(context));
  const autoRemind = rememberAutoInput.checked;
  if (!name || !location || !contexts.length) return;

  rememberLists = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      location,
      contexts,
      autoRemind,
      createdAt: new Date().toISOString(),
    },
    ...rememberLists.filter((item) => normalize(item.name) !== normalize(name)),
  ];
  saveRememberLists();
  rememberItemInput.value = "";
  rememberLocationInput.value = "";
  rememberItemForm.querySelectorAll(".needed-for input").forEach((input) => {
    input.checked = false;
  });
  rememberAutoInput.checked = true;
  renderRemember();
});

memoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const thing = softenItem(memoryThingInput.value.trim());
  const place = softenItem(memoryPlaceInput.value.trim());
  if (!thing || !place) return;

  memoryNotes = [
    { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, thing, place, createdAt: new Date().toISOString() },
    ...memoryNotes.filter((note) => normalize(note.thing) !== normalize(thing)),
  ];
  saveMemoryNotes();
  memoryThingInput.value = "";
  memoryPlaceInput.value = "";
  renderMemoryResults(memorySearchInput.value);
});

memorySearchInput.addEventListener("input", () => {
  renderMemoryResults(memorySearchInput.value);
});

memoryResults.addEventListener("click", (event) => {
  const rememberButton = event.target.closest("[data-delete-remember]");
  const memoryButton = event.target.closest("[data-delete-memory]");
  const toggleButton = event.target.closest("[data-memory-toggle]");
  const button = rememberButton || memoryButton;

  if (toggleButton && !button) {
    expandedMemoryItem = expandedMemoryItem === toggleButton.dataset.memoryToggle ? "" : toggleButton.dataset.memoryToggle;
    renderMemoryResults(memorySearchInput.value);
    return;
  }

  if (!button) return;

  askThenDelete(button, () => {
    if (rememberButton) {
      rememberLists = rememberLists.filter((item) => item.id !== rememberButton.dataset.deleteRemember);
      saveRememberLists();
      expandedMemoryItem = "";
    }

    if (memoryButton) {
      memoryNotes = memoryNotes.filter((note) => (note.id || note.thing) !== memoryButton.dataset.deleteMemory);
      saveMemoryNotes();
      expandedMemoryItem = "";
    }

    renderRemember();
  });
});

function askThenDelete(button, onConfirm) {
  if (!button.classList.contains("confirming")) {
    button.classList.add("confirming");
    button.textContent = "Zeker?";
    window.setTimeout(() => {
      button.classList.remove("confirming");
      button.textContent = "⌫";
    }, 2200);
    return;
  }

  const item = button.closest(".remember-situation, .memory-result, .day-detail-item, .appointment-list-item");
  item?.classList.add("is-removing");
  window.setTimeout(onConfirm, 180);
}

enableReminders.addEventListener("click", async () => {
  if (typeof Notification === "undefined") {
    appointmentFeedback.textContent = "Je browser ondersteunt geen meldingen, maar de herinneringen blijven zichtbaar in de agenda.";
    return;
  }

  const permission = await Notification.requestPermission();
  appointmentFeedback.textContent =
    permission === "granted"
      ? "Herinneringen staan aan zolang deze app open is."
      : "Geen probleem. Je herinneringen blijven rustig zichtbaar in de app.";
});

function animateWeekChange() {
  planningGrid.classList.remove("is-shifting");
  void planningGrid.offsetWidth;
  planningGrid.classList.add("is-shifting");
}

function moveWeek(direction) {
  visibleWeekStart = addDays(visibleWeekStart, direction * 7);
  selectedDate = toISODate(visibleWeekStart);
  animateWeekChange();
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
}

function quickPlaceholder(type) {
  return {
    appointment: "Bijvoorbeeld: kapper om 14:00",
    task: "Bijvoorbeeld: tas klaarzetten",
    reminder: "Bijvoorbeeld: waterfles meenemen",
    note: "Bijvoorbeeld: rustig aan doen",
  }[type];
}

function cleanQuickEntryText(text, type) {
  const clean = type === "appointment" ? cleanAppointmentTitle(text) : softenItem(text);
  return clean.replace(/(?:\bom\s+)?\d{1,2}(?:(?::|\.)\d{2}|\s*uur)\b/gi, "").replace(/\s+/g, " ").trim();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => showPage(tab.dataset.page));
});

dumpInput.addEventListener("input", updateCount);

makeOverviewButton.addEventListener("click", () => {
  const text = dumpInput.value.trim();
  const data = text ? analyzeBrainDump(text) : sampleData;
  renderOverview(data);
  renderToday(data);
  renderPlanning(data, text);
  showPage("overview");
});

bindSettings();
applySettings();
renderOverview(sampleData);
renderToday(sampleData);
renderPlanning(sampleData);
updateCount();

setInterval(() => {
  renderPlanning(currentPlanningData || sampleData, currentPlanningText);
}, 60000);
