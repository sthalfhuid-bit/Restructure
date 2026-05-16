let brainEntryBeingEdited = "";

function analyzeBrainDump(text) {
  const thoughts = splitThoughts(text);
  const bucketKeys = [...new Set([...Object.keys(defaults), ...overviewSections.map((section) => section.key)])];
  const buckets = Object.fromEntries(bucketKeys.map((key) => [key, []]));
  const priorityCandidates = [];

  thoughts.forEach((thought) => {
    const categories = detectCategories(thought);
    const score = getPriorityScore(thought, categories);
    const event = createPlanningEvent(thought);
    const looseAppointment = isLooseAppointmentThought(thought);
    const targetCategories = refineOverviewCategories(thought, categories, looseAppointment, event);

    if (event?.date && ["appointment", "sport", "school", "deadline"].includes(event.type)) {
      addUnique(buckets.appointments, thought, score + 2, event);
    }

    if (!event?.date && looseAppointment) {
      addUnique(buckets.appointments, thought, score + 1);
    }

    targetCategories.forEach((category) => {
      if (buckets[category]) addUnique(buckets[category], formatThoughtForCategory(thought, category), score);
    });

    if (score >= 3 || categories.includes("worries") || categories.includes("tasks")) {
      priorityCandidates.push({ text: thought, score });
    }

    if (categories.includes("ideas") || categories.includes("goals") || categories.includes("projects")) {
      addUnique(buckets.later, formatThoughtForCategory(thought, "later"), score);
    }
  });

  buckets.priorities = uniqueRanked(priorityCandidates).slice(0, 5);
  buckets.todayImportant = uniqueRanked(priorityCandidates).slice(0, 4);

  if (!buckets.later.length) {
    buckets.later = uniqueRanked([
      ...buckets.ideas,
      ...buckets.goals,
      ...buckets.projects,
      ...buckets.routines,
    ]).slice(0, 5);
  }

  Object.keys(defaults).forEach((key) => {
    if (!buckets[key].length) buckets[key] = defaults[key].map((text) => ({ text, score: 0 }));
  });

  const cleaned = Object.fromEntries(
    Object.entries(buckets).map(([key, items]) => [
      key,
      items
        .sort((a, b) => b.score - a.score || a.text.length - b.text.length)
        .map((item) => item.event ? { ...item.event, text: item.text } : item.text),
    ])
  );

  return {
    ...cleaned,
    allThoughts: thoughts.map(softenItem),
    summary: buildSummary(text, cleaned),
  };
}

function saveBrainDumpInput(text) {
  const clean = String(text || "").trim();
  if (!clean) return AppState.brainEntries;

  const key = normalizeForDuplicate(clean);
  const exists = AppState.brainEntries.some((entry) => entry.id !== brainEntryBeingEdited && normalizeForDuplicate(entry.text) === key);
  if (brainEntryBeingEdited) {
    const updated = AppState.brainEntries.map((entry) =>
      entry.id === brainEntryBeingEdited ? { ...entry, text: clean, updatedAt: new Date().toISOString() } : entry
    );
    brainEntryBeingEdited = "";
    return saveAndSetBrainEntries(exists ? updated.filter((entry) => normalizeForDuplicate(entry.text) !== key || entry.updatedAt) : updated);
  }

  if (exists) return AppState.brainEntries;

  return saveAndSetBrainEntries([
    { id: createId(), text: clean, createdAt: new Date().toISOString() },
    ...AppState.brainEntries,
  ]);
}

function deleteBrainEntry(id) {
  if (!id) return;
  if (brainEntryBeingEdited === id) brainEntryBeingEdited = "";
  saveAndSetBrainEntries(AppState.brainEntries.filter((entry) => entry.id !== id));
}

function deleteOverviewItem(text) {
  const target = normalizeForDuplicate(text);
  if (!target) return;

  const nextEntries = AppState.brainEntries
    .map((entry) => {
      const remaining = splitThoughts(entry.text).filter((thought) => normalizeForDuplicate(thought) !== target);
      return { ...entry, text: remaining.join("\n"), updatedAt: new Date().toISOString() };
    })
    .filter((entry) => entry.text.trim());

  saveAndSetBrainEntries(nextEntries);
  saveAndSetRememberItems(AppState.rememberItems.filter((item) => normalizeForDuplicate(item.name) !== target));
  saveAndSetMemoryNotes(AppState.memoryNotes.filter((note) => normalizeForDuplicate(note.thing) !== target));
}

function openBrainEntryForEdit(id) {
  const entry = AppState.brainEntries.find((item) => item.id === id);
  if (!entry || !DOM.dumpInput) return;
  brainEntryBeingEdited = id;
  DOM.dumpInput.value = entry.text;
  updateCount();
  showPage("dump");
  DOM.dumpInput.focus();
}

function getCombinedBrainText() {
  return AppState.brainEntries
    .slice()
    .reverse()
    .map((entry) => entry.text)
    .join("\n");
}

function getCurrentBrainData() {
  const text = getCombinedBrainText();
  return text ? analyzeBrainDump(text) : sampleData;
}

function splitThoughts(text) {
  return text
    .replace(/\s+/g, " ")
    .split(/[\n.!?;•]+|(?:\s+-\s+)|(?:,\s+)|(?:\s+en\s+(?=(?:ik\s+)?(?:moet|wil|nog|kapper|boodschappen|school|sport|sportschool|tandarts|dokter|bel|bellen|regel|koop|maak|doe|project|training|website|trading|boksen)))/i)
    .map((item) => item.trim())
    .map((item) => item.replace(/^(ik\s+)?(moet|wil|denk dat|ben bang dat)\s+/i, (match) => match.trim() + " "))
    .filter((item) => item.length > 2);
}

function formatThoughtForCategory(thought, category) {
  if (["tasks", "health", "school", "work", "projects", "goals", "routines", "ideas"].includes(category)) {
    return cleanTaskText(thought);
  }

  return softenItem(thought);
}

function detectCategories(thought) {
  const normalized = normalize(thought);
  return Object.entries(categoryRules)
    .filter(([, words]) => words.some((word) => normalized.includes(normalize(word))))
    .map(([category]) => category);
}

function refineOverviewCategories(thought, categories, looseAppointment, event) {
  const normalized = normalize(thought);
  const groups = [];

  if (hasAny(normalized, domainRules.school.map(normalize))) groups.push("school");
  if (hasAny(normalized, domainRules.werk.map(normalize))) groups.push("work");
  if (categories.includes("health")) groups.push("health");
  if (categories.includes("ideas")) groups.push("ideas");
  if (categories.includes("worries")) groups.push("worries");
  if (categories.includes("routines")) groups.push("routines");
  if (categories.includes("social") && !looseAppointment) groups.push("social");
  if (categories.includes("projects") && !groups.includes("school") && !groups.includes("work")) groups.push("projects");
  if (categories.includes("goals")) groups.push("goals");

  if (event?.type === "school" && !groups.includes("school")) groups.push("school");
  if (event?.type === "sport" && !groups.includes("health")) groups.push("health");

  if (looseAppointment) {
    return groups.filter((category) => category !== "social");
  }

  if (!groups.length && hasConcreteAction(thought)) {
    groups.push("tasks");
  }

  return groups.length ? groups : ["tasks"];
}

function hasConcreteAction(thought) {
  return hasAny(normalize(thought), [
    "mail",
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
    "voorbereiden",
    "uitzoeken",
    "inleveren",
  ]);
}

function isLooseAppointmentThought(thought) {
  const normalized = normalize(thought);
  return hasAny(normalized, [
    "afspraak",
    "kapper",
    "tandarts",
    "dokter",
    "bellen",
    "bel ",
    "meeting",
  ]);
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
  const count = splitThoughts(text).length;
  if (!count) return calmFallback;
  return `${count} ${count === 1 ? "item" : "items"} netjes geordend.`;
}

function renderOverview(data) {
  DOM.summaryText.textContent = data.summary;
  const overviewData = withRememberItems(data);
  const filledSections = overviewSections.filter((section) => overviewData[section.key]?.length);
  const sectionsToRender = filledSections.length ? filledSections : [];
  const emptyOverview = `
    <article class="section-card saved-input-card">
      <div class="card-title">
        <span class="section-icon mint">✦</span>
        <h3>Nog niets geordend</h3>
      </div>
      <p class="empty-state">Schrijf iets in Brain Dump. Daarna komt het hier rustig in groepjes te staan.</p>
    </article>
  `;

  DOM.overviewGrid.innerHTML = (sectionsToRender.length ? sectionsToRender
    .map(
      (section) => `
        <article class="section-card">
          <div class="card-title">
            <span class="section-icon ${section.dot}">${section.icon}</span>
            <h3>${section.title}</h3>
          </div>
          ${
            overviewData[section.key].length
              ? `<ul class="quiet-list overview-list">${overviewData[section.key].map((item) => renderOverviewItem(item, section.key)).join("")}</ul>`
              : `<p class="empty-state">${getOverviewEmptyState(section.key)}</p>`
          }
        </article>
      `
    )
    .join("") : emptyOverview) + renderSavedBrainEntries();
}

function withRememberItems(data) {
  const stuff = [
    ...(data.stuff || []),
    ...(AppState.rememberItems || []).map((item) => item.name),
    ...(AppState.memoryNotes || []).map((note) => note.thing),
  ];

  return {
    ...data,
    stuff: [...new Set(stuff.map(softenItem))],
  };
}

function renderSavedBrainEntries() {
  const entries = AppState.brainEntries || [];

  return `
    <article class="section-card saved-input-card">
      <div class="card-title">
        <span class="section-icon mint">⌁</span>
        <div>
          <h3>Bewaarde invoer</h3>
          <p class="quiet-note">Originele brain dumps blijven hier terug te vinden.</p>
        </div>
      </div>
      ${
        entries.length
          ? `<ul class="saved-input-list">${entries.map(renderSavedBrainEntry).join("")}</ul>`
          : `<p class="empty-state">Nog geen opgeslagen invoer. Schrijf iets op en maak daarna overzicht.</p>`
      }
    </article>
  `;
}

function renderSavedBrainEntry(entry) {
  return `
    <li class="saved-input-item">
      <p>${escapeHtml(entry.text)}</p>
      <div class="saved-input-actions">
        <button class="soft-button" type="button" data-edit-brain-entry="${escapeHtml(entry.id)}">Bewerk</button>
        <button class="delete-item" type="button" data-delete-brain-entry="${escapeHtml(entry.id)}" aria-label="Brain dump verwijderen">⌫</button>
      </div>
    </li>
  `;
}

function getOverviewEmptyState(key) {
  return {
    school: "Nog niets voor school.",
    work: "Nog niets voor werk.",
    health: "Nog niets rond sport of gezondheid.",
    stuff: "Nog geen spullen opgeslagen.",
    appointments: "Nog geen afspraken gevonden.",
    tasks: "Nog geen losse taken.",
    projects: "Nog geen projecten.",
    goals: "Nog geen doelen.",
    ideas: "Nog geen ideeën.",
    worries: "Nog geen zorgen benoemd.",
    routines: "Nog geen routines gevonden.",
    social: "Nog geen sociale afspraken.",
  }[key] || "Gebruik Restructure een tijdje om inzichten te krijgen.";
}

function renderOverviewItem(item, key) {
  const text = typeof item === "string" ? item : item.text;
  const isTask = key === "tasks";

  if (key === "appointments" && typeof item !== "string") return renderAppointmentProposal(item);

  if (!isTask) {
    return `
      <li class="overview-item">
        <span>${escapeHtml(text)}</span>
        ${renderOverviewDeleteButton(text)}
      </li>
    `;
  }

  return `
    <li class="task-item overview-item">
      <span>${escapeHtml(text)}</span>
      ${renderOverviewDeleteButton(text)}
    </li>
  `;
}

function renderOverviewDeleteButton(text) {
  return `<button class="delete-item overview-delete" type="button" data-delete-overview-item="${escapeHtml(text)}" aria-label="${escapeHtml(text)} verwijderen">⌫</button>`;
}

function renderAppointmentProposal(event) {
  return `
    <li class="appointment-proposal">
      <span>${escapeHtml(event.text)}</span>
      <small>${escapeHtml(formatEventLine(event))} · ${escapeHtml(rememberLabels[event.category] || event.meta || typeLabel(event.type))}</small>
      <div class="proposal-actions">
        <button class="soft-button" type="button" data-add-proposal="${escapeHtml(event.text)}" data-title="${escapeHtml(event.title)}" data-date="${escapeHtml(event.date)}" data-time="${escapeHtml(event.time || "")}" data-category="${escapeHtml(event.category || "")}" data-type="${escapeHtml(event.type)}" data-meta="${escapeHtml(event.meta || "")}">Toevoegen</button>
        <button class="soft-button" type="button" data-dismiss-proposal>Niet toevoegen</button>
        ${renderOverviewDeleteButton(event.text)}
      </div>
    </li>
  `;
}

function renderToday(data) {
  const tasks = data.tasks || [];
  const projects = data.projects || [];
  const goals = data.goals || [];
  const ideas = data.ideas || [];
  const worries = data.worries || [];
  const realPriorities = data.priorities || [];
  const fallbackFocus = [...tasks, ...projects, ...goals];
  const focus = (realPriorities.length ? realPriorities : fallbackFocus).slice(0, 3);
  const actions = tasks.slice(0, 5).map((task) => makeSmallStep(task));
  const ignore = [...ideas, ...worries]
    .filter((item) => !realPriorities.includes(item))
    .slice(0, 5);

  DOM.focusList.innerHTML = listMarkup(focus.length ? focus : ["Nog geen focuspunten. Gebruik Brain Dump om je dag te laten ordenen."]);
  DOM.actionList.innerHTML = listMarkup(actions.length ? actions : ["Kleine acties verschijnen hier zodra je iets hebt opgeschreven."]);
  DOM.ignoreList.innerHTML = listMarkup(ignore.length ? ignore : ["Niets geparkeerd. Dat mag rustig leeg blijven."]);
}



