function renderRemember(events = buildPlanningEvents(AppState.planningText, AppState.planningData || sampleData)) {
  renderRememberSituations();
  renderUpcomingRemember(events);
  renderMemoryResults(DOM.memorySearchInput?.value || "");
}

function addRememberItem(data) {
  const name = softenItem(String(data.name || "").trim());
  const location = softenItem(String(data.location || "").trim());
  const contexts = (data.contexts || []).filter((context) => ["school", "werk", "sport", "vrije tijd"].includes(context));
  if (!name || !location || !contexts.length) return null;

  const rememberItem = {
    id: data.id || createId(),
    name,
    location,
    contexts,
    autoRemind: data.autoRemind !== false,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  saveAndSetRememberItems([
    rememberItem,
    ...AppState.rememberItems.filter((item) => normalize(item.name) !== normalize(name)),
  ]);
  return rememberItem;
}

function deleteRememberItem(id) {
  if (!id) return;
  saveAndSetRememberItems(AppState.rememberItems.filter((item) => item.id !== id));
}

function toggleRememberItemReminder(id, autoRemind) {
  if (!id) return;
  saveAndSetRememberItems(AppState.rememberItems.map((item) =>
    item.id === id ? { ...item, autoRemind: typeof autoRemind === "boolean" ? autoRemind : !item.autoRemind } : item
  ));
}

function addMemoryNote(data) {
  const thing = softenItem(String(data.thing || "").trim());
  const place = softenItem(String(data.place || "").trim());
  if (!thing || !place) return null;

  const memoryNote = {
    id: data.id || createId(),
    thing,
    place,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  saveAndSetMemoryNotes([
    memoryNote,
    ...AppState.memoryNotes.filter((note) => normalize(note.thing) !== normalize(thing)),
  ]);
  return memoryNote;
}

function deleteMemoryNote(id) {
  if (!id) return;
  saveAndSetMemoryNotes(AppState.memoryNotes.filter((note) => (note.id || note.thing) !== id));
}

function renderRememberSituations() {
  if (!DOM.rememberSituations) return;
  DOM.rememberSituations.innerHTML = "";
}

function renderUpcomingRemember(events) {
  if (!DOM.rememberUpcoming) return;

  if (!AppState.settings.rememberAuto) {
    DOM.rememberUpcoming.innerHTML = `<p class="quiet-note">${t("rememberOff")}</p>`;
    return;
  }

  const today = startOfDay(new Date());
  const horizon = addDays(today, 7);
  const hints = events
    .filter((event) => event.date && isBetween(parseISODate(event.date), today, horizon))
    .map((event) => ({ event, situation: detectRememberSituation(event) }))
    .filter((item) => item.situation && isRememberContextEnabled(item.situation))
    .map((item) => ({ ...item, items: AppState.rememberItems.filter((rememberItem) => rememberItem.autoRemind !== false && rememberItem.contexts.includes(item.situation)) }))
    .filter((item) => item.situation && item.items.length)
    .slice(0, 4);

  DOM.rememberUpcoming.innerHTML = hints.length
    ? hints.map(renderRememberHint).join("")
    : `<p class="quiet-note">${t("rememberEmptyHint")}</p>`;
}

function renderRememberHint({ event, situation, items }) {
  const dayLabel = isToday(event.date) ? t("today") : isTomorrow(event.date) ? (getLanguageCode() === "en" ? "Tomorrow" : "Morgen") : formatShortDate(parseISODate(event.date));
  const context = rememberContextLabel(situation);
  return `
    <div class="day-detail-item reminder">
      <strong>${t("forgetNot", { day: dayLabel, context: context.toLowerCase() })}</strong>
      <span>${items.map((item) => `• ${escapeHtml(item.name)}`).join(" ")}</span>
    </div>
  `;
}

function renderMemoryResults(query = "") {
  if (!DOM.memoryResults) return;

  const cleanQuery = normalize(query)
    .replace(/waar\s+(liggen|ligt)\s+(mijn\s+)?/g, "")
    .replace(/[?]/g, "")
    .trim();
  const results = cleanQuery
    ? [
        ...AppState.memoryNotes.map((note) => ({ ...note, source: "memory" })),
        ...AppState.rememberItems.map((item) => ({
          id: item.id,
          thing: item.name,
          place: item.location,
          contexts: item.contexts,
          autoRemind: item.autoRemind,
          source: "remember",
        })),
      ].filter((note) => normalize(`${note.thing} ${note.place}`).includes(cleanQuery))
    : [
        ...AppState.rememberItems.map((item) => ({
          id: item.id,
          thing: item.name,
          place: item.location,
          contexts: item.contexts,
          autoRemind: item.autoRemind,
          source: "remember",
        })),
        ...AppState.memoryNotes.map((note) => ({ ...note, source: "memory" })),
      ];

  DOM.memoryResults.innerHTML = results.length
    ? results.map(renderMemoryAccordionItem).join("")
    : `<div class="quiet-note empty-memory">
        <p>${t("saveThingsEmpty")}</p>
        <ul class="quiet-list">
          <li>${t("keys")}</li>
          <li>${t("charger")}</li>
          <li>${t("cards")}</li>
          <li>${t("spareCables")}</li>
        </ul>
      </div>`;
}

function renderMemoryAccordionItem(note) {
  const id = `${note.source}-${note.id || normalizeForDuplicate(note.thing)}`;
  const isOpen = AppState.expandedMemoryItem === id;
  const deleteAttr = note.source === "remember" ? "data-delete-remember" : "data-delete-memory";
  const categoryText = note.contexts?.length
    ? note.contexts.map(rememberContextLabel).join(", ")
    : t("notLinked");
  const autoText = note.source === "remember" ? (note.autoRemind === false ? t("autoOff") : t("autoOn")) : t("notSet");

  return `
    <div class="memory-result ${isOpen ? "open" : ""}">
      <button class="memory-summary" type="button" data-memory-toggle="${escapeHtml(id)}" aria-expanded="${isOpen}">
        <strong>${escapeHtml(note.thing)}</strong>
        <span>${isOpen ? t("close") : t("open")}</span>
      </button>
      ${
        isOpen
          ? `
            <div class="memory-detail">
              <p><span>${t("location")}</span>${escapeHtml(note.place || t("noLocation"))}</p>
              <p><span>${t("neededFor")}</span>${escapeHtml(categoryText)}</p>
              <p><span>${t("autoRemindLabel")}</span>${escapeHtml(autoText)}</p>
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
  if (hasAny(text, ["deadline", "inlever", "tentamen", "examen", "afronden", "afmaken"])) return "deadline";
  if (hasAny(text, ["school", "studie", "college", "les", "mentor", "tentamen", "huiswerk"])) return "school";
  if (hasAny(text, ["werk", "meeting", "kantoor", "klant", "collega", "laptop"])) return "werk";
  if (hasAny(text, ["sport", "training", "voetbal", "fitness", "yoga", "zwemmen", "hardlopen", "boksen"])) return "sport";
  if (hasAny(text, ["vriend", "vriendin", "familie", "ouders", "eten", "kapper", "tandarts", "dokter", "film", "game", "vrije tijd", "verjaardag"])) return "vrije tijd";
  return "";
}

function rememberContextLabel(context) {
  return {
    school: t("school"),
    werk: t("work"),
    sport: t("sport"),
    "vrije tijd": t("freeTime"),
    deadline: t("deadline"),
  }[context] || context;
}

function categoryFromEvent(event) {
  if (event.category) return event.category;
  if (event.type === "deadline") return "deadline";
  if (event.type === "sport") return "sport";
  if (event.type === "school") return "school";
  const situation = detectRememberSituation({ ...event, category: "" });
  return situation || "vrije tijd";
}

function eventTypeForCategory(fallbackType, category) {
  if (category === "deadline") return "deadline";
  if (category === "school") return "school";
  if (category === "sport") return "sport";
  if (fallbackType !== "appointment") return fallbackType;
  return "appointment";
}

function isRememberContextEnabled(context) {
  return {
    school: AppState.settings.rememberSchool,
    werk: AppState.settings.rememberWork,
    sport: AppState.settings.rememberSport,
    "vrije tijd": AppState.settings.rememberFree,
  }[context] !== false;
}


