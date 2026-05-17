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
    const targetCategory = refineOverviewCategory(thought, categories, looseAppointment, event);
    const itemText = formatThoughtForCategory(thought, targetCategory);

    if (event?.date && ["appointment", "sport", "school", "deadline"].includes(event.type)) {
      addUnique(buckets.appointments, itemText, score + 2, event);
      return;
    }

    if (!event?.date && looseAppointment) {
      addUnique(buckets.appointments, itemText, score + 1);
      return;
    }

    if (buckets[targetCategory]) addUnique(buckets[targetCategory], itemText, score);

    if (score >= 3 || categories.includes("worries") || categories.includes("tasks")) {
      priorityCandidates.push({ text: itemText, score });
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
      const remaining = splitThoughts(entry.text).filter((thought) => {
        const cleaned = cleanOverviewItem(thought);
        return normalizeForDuplicate(thought) !== target && normalizeForDuplicate(cleaned) !== target;
      });
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
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .split(/[\n.!?;•]+|(?:\s+-\s+)|(?:,\s+)|(?:\s+\/\s+)|(?:\s+en\s+(?=(?:ik\s+)?(?:moet|wil|nog|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|morgen|vandaag|kapper|boodschappen|school|sport|sportschool|tandarts|dokter|bel|bellen|regel|koop|maak|doe|project|training|website|trading|boksen|oplader|deadline|afspraak|werk)))/i)
    .map((item) => item.trim())
    .flatMap(splitLongThought)
    .map((item) => item.replace(/^(ik\s+)?(moet|wil|denk dat|ben bang dat)\s+/i, ""))
    .map(cleanOverviewItem)
    .filter((item) => item.length > 2);
}

function splitLongThought(text) {
  const clean = String(text || "").trim();
  return clean
    .split(/\s+(?:en|ook|daarnaast|plus)\s+(?=(?:ik\s+)?(?:moet|wil|kan|nog|maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|morgen|vandaag|deadline|afspraak|kapper|tandarts|dokter|school|werk|sport|training|voetbal|boksen|boodschappen|haal|halen|koop|kopen|oplader|sleutels|laptop|idee|misschien|project|bel|bellen|regel|maak|doe|schrijf|betaal|plan|check)\b)/i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanOverviewItem(text) {
  const cleaned = cleanTaskText(String(text || ""))
    .replace(/^(?:ik\s+)?(?:moet|wil|kan|ga|moet nog|wil nog|denk dat|ben bang dat)\s+/i, "")
    .replace(/^(?:nog|even|ook|en|daarnaast|plus)\s+/i, "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/[.;,\s]+$/g, "")
    .trim();

  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : cleaned;
}

function formatThoughtForCategory(thought, category) {
  if (["tasks", "health", "school", "work", "projects", "goals", "routines", "ideas", "groceries", "stuff", "other"].includes(category)) {
    return cleanOverviewItem(thought);
  }

  return cleanOverviewItem(thought);
}

function detectCategories(thought) {
  const normalized = normalize(thought);
  return Object.entries(categoryRules)
    .filter(([, words]) => words.some((word) => normalized.includes(normalize(word))))
    .map(([category]) => category);
}

function refineOverviewCategory(thought, categories, looseAppointment, event) {
  const normalized = normalize(thought);

  if (event?.date || looseAppointment) return "appointments";
  if (categories.includes("groceries")) return "groceries";
  if (categories.includes("stuff")) return "stuff";
  if (event?.type === "school" || hasAny(normalized, domainRules.school.map(normalize))) return "school";
  if (hasAny(normalized, domainRules.werk.map(normalize))) return "work";
  if (event?.type === "sport" || categories.includes("health")) return "health";
  if (categories.includes("ideas") || categories.includes("projects") || categories.includes("goals")) return "ideas";
  if (categories.includes("tasks") || hasConcreteAction(thought)) return "tasks";
  return "other";
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
  if (!count) return t("overviewEmpty");
  return count === 1 ? t("orderedOne") : t("orderedCount", { count });
}

function renderOverview(data) {
  DOM.summaryText.textContent = data.summary === calmFallback ? t("overviewEmpty") : data.summary;
  const overviewData = withRememberItems(data);
  const view = AppState.settings?.overviewView || "list";
  syncOverviewViewToggle(view);

  if (view === "categories") {
    renderOverviewCategoryView(overviewData);
    return;
  }

  renderOverviewListView(overviewData);
}

function syncOverviewViewToggle(view) {
  DOM.overviewViewButtons?.forEach((button) => {
    const isActive = button.dataset.overviewView === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  DOM.overviewGrid?.classList.toggle("overview-list-mode", view === "list");
  DOM.overviewGrid?.classList.toggle("overview-category-mode", view === "categories");
}

function renderOverviewCategoryView(overviewData) {
  const filledSections = overviewSections.filter((section) => overviewData[section.key]?.length);
  const sectionsToRender = filledSections.length ? filledSections : [];
  const emptyOverview = `
    <article class="section-card saved-input-card">
      <div class="card-title">
        <span class="section-icon mint">✦</span>
        <h3>${t("nothingOrdered")}</h3>
      </div>
      <p class="empty-state">${t("nothingToOrder")}</p>
    </article>
  `;

  DOM.overviewGrid.innerHTML = (sectionsToRender.length ? sectionsToRender
    .map(
      (section) => `
        <article class="section-card">
          <div class="card-title">
            <span class="section-icon ${section.dot}">${section.icon}</span>
            <h3>${getOverviewSectionTitle(section.key)}</h3>
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

function renderOverviewListView(overviewData) {
  const items = getOverviewListItems(overviewData);
  const emptyOverview = `
    <article class="overview-list-panel">
      <p class="empty-state">${t("nothingToOrder")}</p>
    </article>
  `;

  DOM.overviewGrid.innerHTML = items.length
    ? `
      <article class="overview-list-panel" aria-label="${t("overviewListView")}">
        <ul class="overview-flat-list">
          ${items.map(renderOverviewListItem).join("")}
        </ul>
      </article>
      ${renderSavedBrainEntries()}
    `
    : `${emptyOverview}${renderSavedBrainEntries()}`;
}

function getOverviewListItems(overviewData) {
  const seen = new Set();
  return overviewSections.flatMap((section) => {
    const sectionItems = overviewData[section.key] || [];
    return sectionItems
      .slice()
      .sort((a, b) => {
        if (section.key !== "appointments") return 0;
        const dateA = typeof a === "string" ? "" : a.date || "";
        const dateB = typeof b === "string" ? "" : b.date || "";
        return `${dateA} ${typeof a === "string" ? "" : a.time || ""}`.localeCompare(`${dateB} ${typeof b === "string" ? "" : b.time || ""}`);
      })
      .map((item) => ({ item, key: section.key, label: getOverviewSectionTitle(section.key) }));
  }).filter(({ item, key }) => {
    const text = typeof item === "string" ? item : item.text;
    const uniqueKey = normalizeForDuplicate(text);
    if (seen.has(uniqueKey)) return false;
    seen.add(uniqueKey);
    return true;
  });
}

function renderOverviewListItem({ item, key, label }) {
  const text = typeof item === "string" ? item : item.text;
  const meta = key === "appointments" && typeof item !== "string"
    ? `${label} · ${formatEventLine(item)}`
    : label;

  return `
    <li class="overview-flat-item ${key}">
      <span class="overview-bullet" aria-hidden="true"></span>
      <div class="overview-flat-content">
        <strong>${escapeHtml(text)}</strong>
        <small>${escapeHtml(meta)}</small>
        ${key === "appointments" && typeof item !== "string" ? renderOverviewProposalActions(item) : ""}
      </div>
      ${renderOverviewDeleteButton(text)}
    </li>
  `;
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
          <h3>${t("savedInput")}</h3>
          <p class="quiet-note">${t("savedInputNote")}</p>
        </div>
      </div>
      ${
        entries.length
          ? `<ul class="saved-input-list">${entries.map(renderSavedBrainEntry).join("")}</ul>`
          : `<p class="empty-state">${t("noStoredInput")}</p>`
      }
    </article>
  `;
}

function renderSavedBrainEntry(entry) {
  const thoughts = splitThoughts(entry.text);
  const preview = thoughts.slice(0, 3).join(" · ");
  const remaining = thoughts.length > 3 ? ` · +${thoughts.length - 3}` : "";

  return `
    <li class="saved-input-item">
      <p>${escapeHtml(preview || entry.text)}${escapeHtml(remaining)}</p>
      <div class="saved-input-actions">
        <button class="soft-button" type="button" data-edit-brain-entry="${escapeHtml(entry.id)}">${t("edit")}</button>
        <button class="delete-item" type="button" data-delete-brain-entry="${escapeHtml(entry.id)}" aria-label="${t("deleteBrain")}">⌫</button>
      </div>
    </li>
  `;
}

function getOverviewEmptyState(key) {
  return {
    school: t("emptySchool"),
    work: t("emptyWork"),
    health: t("emptyHealth"),
    groceries: t("emptyGroceries"),
    stuff: t("emptyStuff"),
    appointments: t("emptyAppointments"),
    tasks: t("emptyTasks"),
    projects: t("emptyProjects"),
    goals: t("emptyGoals"),
    ideas: t("emptyIdeas"),
    worries: t("emptyWorries"),
    routines: t("emptyRoutines"),
    social: t("emptySocial"),
    other: t("emptyOther"),
  }[key] || t("overviewEmpty");
}

function getOverviewSectionTitle(key) {
  return {
    school: t("sectionSchool"),
    work: t("sectionWork"),
    health: t("sectionHealth"),
    groceries: t("sectionGroceries"),
    stuff: t("sectionStuff"),
    appointments: t("sectionAppointments"),
    tasks: t("sectionTasks"),
    ideas: t("sectionIdeas"),
    projects: t("sectionProjects"),
    goals: t("sectionGoals"),
    worries: t("sectionWorries"),
    routines: t("sectionRoutines"),
    social: t("sectionSocial"),
    other: t("sectionOther"),
  }[key] || key;
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
      ${renderOverviewProposalActions(event)}
    </li>
  `;
}

function renderOverviewProposalActions(event) {
  return `
    <div class="proposal-actions">
      <button class="soft-button" type="button" data-add-proposal="${escapeHtml(event.text)}" data-title="${escapeHtml(event.title)}" data-date="${escapeHtml(event.date)}" data-time="${escapeHtml(event.time || "")}" data-category="${escapeHtml(event.category || "")}" data-type="${escapeHtml(event.type)}" data-meta="${escapeHtml(event.meta || "")}">${t("proposalAdd")}</button>
      <button class="soft-button" type="button" data-dismiss-proposal>${t("proposalDismiss")}</button>
    </div>
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

  if (DOM.todayContext) DOM.todayContext.textContent = getDayContextText({ includeGreeting: true });
  DOM.focusList.innerHTML = listMarkup(focus.length ? focus : [t("noFocus")]);
  DOM.actionList.innerHTML = listMarkup(actions.length ? actions : [t("noSmallActions")]);
  DOM.ignoreList.innerHTML = listMarkup(ignore.length ? ignore : [t("nothingParked")]);
}



