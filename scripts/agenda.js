function renderPlanning(data, text = "") {
  AppState.setPlanningData(data);
  AppState.setPlanningText(text);
  const events = buildPlanningEvents(text, data);
  renderTodayAgenda(events);
  renderWeekOverview(events);
  renderAgenda(events);
  renderDesktopAgenda(events);
  renderHolidayList(events);
  renderPersonalAppointments(events);
  renderRemember(events);
  checkReminderMoments(events);
}

function renderDesktopAgenda(events) {
  const shell = document.querySelector("#desktopAgenda");
  const board = document.querySelector("#desktopAgendaBoard");
  if (!shell || !board || !isDesktopAgenda()) return;

  const selected = parseISODate(AppState.selectedDate);
  const datedEvents = events.filter((event) => event.date).sort(compareEvents);
  const visibleEvents = datedEvents
    .filter(isDesktopVisibleAgendaEvent)
    .filter(eventMatchesDesktopAgendaFilters);
  document.querySelector("#desktopAgendaTitle").textContent = desktopAgendaTitle(selected);
  document.querySelector("#desktopAgendaContext").textContent = `${t("today")} • ${getDayContextText()}`;
  document.querySelectorAll("[data-desktop-agenda-view]").forEach((button) => {
    const active = button.dataset.desktopAgendaView === desktopAgendaView;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  board.className = `desktop-agenda-board ${desktopAgendaView}-view`;
  board.innerHTML = {
    day: renderDesktopDayView(selected, visibleEvents),
    week: renderDesktopWeekView(selected, visibleEvents),
    month: renderDesktopMonthView(selected, visibleEvents),
    list: renderDesktopListView(selected, visibleEvents),
  }[desktopAgendaView] || renderDesktopWeekView(selected, visibleEvents);
  syncDesktopAgendaFilters();
  renderDesktopMiniMonth(selected, visibleEvents);
  renderDesktopAgendaDetails(selected, visibleEvents);
}

function desktopAgendaTitle(selected) {
  if (desktopAgendaView === "day") return selected.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  if (desktopAgendaView === "week") {
    const start = startOfWeek(selected);
    const end = addDays(start, 6);
    return `${formatShortDate(start)} - ${formatShortDate(end)}`;
  }
  if (desktopAgendaView === "list") return selected.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" });
  return selected.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" });
}

function renderDesktopDayView(selected, events) {
  const iso = toISODate(selected);
  const dayEvents = events.filter((event) => event.date === iso);
  return `
    <div class="desktop-time-grid day-time-grid">
      ${renderAllDayRow(dayEvents)}
      ${desktopHours().map((hour) => renderDesktopHourRow(hour, dayEvents)).join("")}
    </div>
  `;
}

function renderDesktopWeekView(selected, events) {
  const start = startOfWeek(selected);
  const days = Array.from({ length: 7 }, (_, index) => addDays(start, index));
  return `
    <div class="desktop-week-grid">
      <div class="week-corner"></div>
      ${days.map((day) => `<button class="week-day-head ${toISODate(day) === AppState.selectedDate ? "selected" : ""}" type="button" data-desktop-date="${toISODate(day)}"><span>${day.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "")}</span><strong>${day.getDate()}</strong></button>`).join("")}
      <div class="week-time-label">${t("allDay")}</div>
      ${days.map((day) => renderWeekAllDayCell(day, events)).join("")}
      ${desktopHours().map((hour) => `
        <div class="week-time-label">${String(hour).padStart(2, "0")}:00</div>
        ${days.map((day) => renderWeekHourCell(day, hour, events)).join("")}
      `).join("")}
    </div>
  `;
}

function renderDesktopMonthView(selected, events) {
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthEnd = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const days = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);
  const weekLabels = Array.from({ length: 7 }, (_, index) => addDays(gridStart, index));

  return `
    <div class="desktop-month-grid">
      ${weekLabels.map((day) => `<span class="month-week-label">${day.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "")}</span>`).join("")}
      ${days.map((day) => renderDesktopMonthCell(day, events, monthStart.getMonth())).join("")}
    </div>
  `;
}

function renderDesktopListView(selected, events) {
  const start = startOfDay(new Date(selected.getFullYear(), selected.getMonth(), 1));
  const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const visible = events.filter((event) => isBetween(parseISODate(event.date), start, end));
  const grouped = groupEventsByDate(visible);
  if (!visible.length) return `<div class="desktop-agenda-empty">${t("noAppointments")}</div>`;

  return `
    <div class="desktop-list-view">
      ${Object.entries(grouped).map(([date, dayEvents]) => `
        <section class="desktop-list-day">
          <h4>${parseISODate(date).toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" })}</h4>
          ${dayEvents.map(renderDesktopAgendaEvent).join("")}
        </section>
      `).join("")}
    </div>
  `;
}

function renderAllDayRow(events) {
  const allDay = events.filter((event) => !event.time || ["holiday", "vacation"].includes(event.type));
  return `
    <div class="all-day-row">
      <span>${t("allDay")}</span>
      <div>${allDay.length ? allDay.map(renderDesktopAgendaEvent).join("") : `<small>${t("noSelectedDay")}</small>`}</div>
    </div>
  `;
}

function renderDesktopHourRow(hour, events) {
  const hourEvents = events.filter((event) => event.time && Number(event.time.split(":")[0]) === hour);
  return `
    <div class="desktop-hour-row">
      <span>${String(hour).padStart(2, "0")}:00</span>
      <div>${hourEvents.map(renderDesktopAgendaEvent).join("")}</div>
    </div>
  `;
}

function renderWeekAllDayCell(day, events) {
  const iso = toISODate(day);
  const dayEvents = events.filter((event) => event.date === iso && (!event.time || ["holiday", "vacation"].includes(event.type)));
  return `<div class="week-cell all-day-cell" data-desktop-date="${iso}">${dayEvents.slice(0, 2).map(renderDesktopAgendaEvent).join("")}</div>`;
}

function renderWeekHourCell(day, hour, events) {
  const iso = toISODate(day);
  const hourEvents = events.filter((event) => event.date === iso && event.time && Number(event.time.split(":")[0]) === hour);
  return `<div class="week-cell" data-desktop-date="${iso}">${hourEvents.map(renderDesktopAgendaEvent).join("")}</div>`;
}

function renderDesktopMonthCell(day, events, visibleMonth) {
  const iso = toISODate(day);
  const dayEvents = events.filter((event) => event.date === iso).sort(compareEvents);
  const visible = dayEvents.slice(0, 3);
  const more = dayEvents.length - visible.length;
  return `
    <article class="desktop-month-cell ${day.getMonth() !== visibleMonth ? "outside" : ""} ${iso === AppState.selectedDate ? "selected" : ""}">
      <button class="desktop-month-date" type="button" data-desktop-date="${iso}">${day.getDate()}</button>
      <div>
        ${visible.map(renderDesktopMonthEvent).join("")}
        ${more > 0 ? `<button class="desktop-month-more" type="button" data-desktop-date="${iso}">${escapeHtml(t("moreItems", { count: more }))}</button>` : ""}
      </div>
    </article>
  `;
}

function renderDesktopMonthEvent(event) {
  const canDelete = event.id && ["personal", "day"].includes(event.source);
  const deleteButton = canDelete ? renderAgendaDeleteButton(event) : "";
  const label = event.time ? `${formatTime(event.time)} ${event.title}` : event.title;
  return `
    <span class="desktop-month-event ${event.type} ${event.category || ""}">
      <button type="button" data-desktop-date="${escapeHtml(event.date)}">${escapeHtml(label)}</button>
      ${deleteButton}
    </span>
  `;
}

function renderDesktopAgendaEvent(event) {
  const canDelete = event.id && ["personal", "day"].includes(event.source);
  const deleteButton = canDelete ? renderAgendaDeleteButton(event) : "";
  return `
    <article class="desktop-event ${event.type} ${event.category || ""}">
      ${deleteButton}
      <strong>${escapeHtml(event.title)}</strong>
      <span>${escapeHtml(event.time ? formatTime(event.time) : t("allDay"))} · ${escapeHtml(getEventMeta(event))}</span>
    </article>
  `;
}

function renderDesktopMiniMonth(selected, events) {
  const container = document.querySelector("#desktopMiniMonth");
  if (!container) return;
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthEnd = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const days = [];
  const eventDates = new Set(events.map((event) => event.date));
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);
  container.innerHTML = `
    <h4>${monthStart.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" })}</h4>
    <div class="mini-month-grid">
      ${days.map((day) => {
        const iso = toISODate(day);
        return `<button type="button" class="${day.getMonth() !== monthStart.getMonth() ? "outside" : ""} ${iso === AppState.selectedDate ? "selected" : ""} ${eventDates.has(iso) ? "has-event" : ""}" data-desktop-date="${iso}">${day.getDate()}</button>`;
      }).join("")}
    </div>
  `;
}

function renderDesktopAgendaDetails(selected, events) {
  const container = document.querySelector("#desktopAgendaDetails");
  if (!container) return;
  const iso = toISODate(selected);
  const dayEvents = events.filter((event) => event.date === iso).sort(compareEvents);
  container.innerHTML = `
    <h4>${selected.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" })}</h4>
    ${dayEvents.length ? dayEvents.map(renderDesktopAgendaEvent).join("") : `<p class="quiet-note">${t("noSelectedDay")}</p>`}
  `;
}

function getDesktopAgendaFilters() {
  return {
    school: true,
    werk: true,
    sport: true,
    "vrije tijd": true,
    ...(AppState.settings.desktopAgendaFilters || {}),
  };
}

function eventMatchesDesktopAgendaFilters(event) {
  if (["holiday", "vacation"].includes(event.type)) return true;
  const filters = getDesktopAgendaFilters();
  const category = event.category || categoryFromEvent(event);
  if (Object.prototype.hasOwnProperty.call(filters, category)) {
    return filters[category] !== false;
  }
  return true;
}

function isDesktopVisibleAgendaEvent(event) {
  return Boolean(event.id && ["personal", "day"].includes(event.source)) || ["holiday", "vacation"].includes(event.type);
}

function syncDesktopAgendaFilters() {
  const filters = getDesktopAgendaFilters();
  document.querySelectorAll("[data-desktop-agenda-filter]").forEach((button) => {
    const key = button.dataset.desktopAgendaFilter;
    const active = filters[key] !== false;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function desktopHours() {
  return Array.from({ length: 15 }, (_, index) => index + 8);
}

function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    groups[event.date] = groups[event.date] || [];
    groups[event.date].push(event);
    return groups;
  }, {});
}

function addAppointment(data) {
  const title = softenItem(String(data.title || "").trim());
  if (!title || !data.date) return null;
  const category = data.category || categoryFromEvent(data);
  const type = eventTypeForCategory(data.type || appointmentTypeFromCategory(category).eventType, category);

  const appointment = {
    id: data.id || createId(),
    title,
    date: data.date,
    time: data.time || "",
    type,
    meta: data.meta || agendaCategoryLabel(category) || typeLabel(type),
    category,
    reminders: data.reminders || [],
    source: "personal",
    createdAt: data.createdAt || new Date().toISOString(),
  };

  saveAndSetAppointments(uniquePlanningEvents([appointment, ...AppState.appointments]));
  return appointment;
}

function deleteAppointment(id) {
  if (!id) return;
  saveAndSetAppointments(AppState.appointments.filter((appointment) => appointment.id !== id));
}

function addDayItem(data) {
  const text = cleanQuickEntryText(String(data.text || "").trim(), data.type || "task");
  if (!text || !data.date) return null;
  const category = data.category || categoryFromEvent({ title: text, type: data.type || "task" });

  const dayItem = {
    id: data.id || createId(),
    date: data.date,
    type: data.type || "task",
    time: data.time || "",
    category,
    reminder: data.reminder || "",
    text,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  saveAndSetDayItems([dayItem, ...AppState.dayItems]);
  return dayItem;
}

function deleteDayItem(id) {
  if (!id) return;
  saveAndSetDayItems(AppState.dayItems.filter((item) => item.id !== id));
}

function buildPlanningEvents(text, data) {
  const thoughts = text ? splitThoughts(text) : [];
  const userEvents = thoughts
    .map((thought) => createPlanningEvent(thought))
    .filter(Boolean);
  const personalEvents = AppState.appointments.map((appointment) => ({ ...appointment, source: "personal" }));
  const selectedDayEvents = AppState.dayItems.map((item) => ({
    id: item.id,
    title: item.text,
    type: eventTypeForCategory(item.type, item.category),
    date: item.date,
    time: item.time || "",
    meta: dayItemMetaLabel(item),
    category: item.category || categoryFromEvent(item),
    source: "day",
    reminders: item.reminder ? [item.reminder] : [],
    note: item.type === "note" ? item.text : "",
  }));
  const fallbackRoutines = data.routines
    .filter((item) => !item.startsWith("Geen"))
    .map((item) => ({ title: item, type: "routine", date: null, meta: "Wekelijkse routine", source: "user" }));
  const calendarEvents = [
    ...(AppState.settings.showHolidays ? dutchHolidays : []),
    ...(AppState.settings.showVacations ? schoolVacations : []),
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
  const isSport = hasAny(normalized, ["sport", "training", "fitness", "hardlopen", "wandelen", "yoga", "zwemmen", "boksen", "voetbal"]);
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
    title: date && ["appointment", "sport", "school"].includes(type) ? cleanAppointmentTitle(thought) : softenItem(thought),
    type,
    date,
    time,
    meta: type === "personal" ? personalType.label : date ? typeLabel(type) : "Wekelijks terugkerend",
    category: personalType.category || categoryFromEvent({ title: thought, type, meta: personalType.label }),
    source: "user",
  };
}

function renderWeekOverview(events) {
  if (!DOM.weekInsight) return;
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

  if (!weekEvents.length) {
    DOM.weekInsight.textContent = t("noWeekItems");
    updateWeekStats({ deadlines: 0, appointments: 0, sports: 0, school: 0 });
    DOM.weekDeadlines.innerHTML = "";
    DOM.weekAppointments.innerHTML = listMarkup([t("noWeekAppointments")]);
    DOM.weekWarnings.innerHTML = "";
    return;
  }

  if (weekEvents.length >= 8) warnings.push(t("warningFullWeek"));
  if (deadlines.length >= 3) warnings.push(t("warningDeadlines"));
  if (busiestDay.count >= 4) warnings.push(t("warningBusiestDay", { date: formatShortDate(busiestDay.date) }));
  if (!warnings.length) warnings.push(t("warningSpace"));

  DOM.weekInsight.textContent =
    weekEvents.length >= 8
      ? t("weekBusy")
      : weekEvents.length >= 4
        ? t("weekSomeItems")
        : t("weekQuiet");

  updateWeekStats({
    deadlines: allDeadlines.length,
    appointments: allAppointments.length,
    sports: allSports.length,
    school: allSchool.length,
  });
  DOM.weekDeadlines.innerHTML = deadlines.length ? listMarkup(deadlines.map(formatEventLine)) : "";
  DOM.weekAppointments.innerHTML = appointments.length ? listMarkup(appointments.map(formatEventLine)) : "";
  DOM.weekWarnings.innerHTML = listMarkup(warnings);
}

function updateWeekStats(counts) {
  const items = [
    [DOM.deadlineCount, counts.deadlines],
    [DOM.appointmentCount, counts.appointments],
    [DOM.sportCount, counts.sports],
    [DOM.schoolCount, counts.school],
  ];
  const hasStats = items.some(([, count]) => count > 0);
  items.forEach(([element, count]) => {
    if (!element) return;
    element.textContent = count;
    element.closest(".agenda-stat")?.classList.toggle("is-empty", count === 0);
  });
  DOM.deadlineCount?.closest(".agenda-stats")?.classList.toggle("is-empty", !hasStats);
}

function renderTodayAgenda(events) {
  const today = toISODate(new Date());
  const todayEvents = events
    .filter((event) => event.date === today && ["personal", "appointment", "sport", "school", "deadline"].includes(event.type))
    .sort(compareEvents)
    .slice(0, 4);

  DOM.todayAgendaList.innerHTML = todayEvents.length
    ? todayEvents.map(renderAgendaFocusItem).join("")
    : `<p class="quiet-note">${t("noUrgentToday")}</p>`;
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
  if (isMobileAgenda()) {
    renderMobileAgenda(events, today);
    return;
  }

  clearMobileAgendaFlow();
  const isMonthView = agendaView === "month" && isDesktopAgenda();
  if (isMonthView) {
    renderMonthAgenda(events, today);
    return;
  }

  const weekStart = startOfDay(getVisibleWeekStart());
  const weekEnd = addDays(weekStart, 6);
  const datedEvents = events.filter((event) => event.date && isBetween(parseISODate(event.date), weekStart, weekEnd));
  const agendaDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  DOM.calendarTitle.textContent = weekStart.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" });
  setAgendaViewMode("week");
  renderTodayContext(today);
  DOM.planningGrid.innerHTML = agendaDays.map((date) => renderDayCard(date, datedEvents)).join("");
  renderWeekdayLabels(agendaDays);
  renderSelectedDay(events);
}

function renderMobileAgenda(events, today) {
  const shell = document.querySelector("#mobileAgenda");
  if (shell) {
    renderNewMobileAgenda(events, today);
    return;
  }

  const selected = parseISODate(AppState.selectedDate);
  const weekStart = startOfDay(getVisibleWeekStart());
  const weekEnd = addDays(weekStart, 6);
  const datedEvents = events.filter((event) => event.date && isBetween(parseISODate(event.date), weekStart, weekEnd));
  const agendaDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  DOM.calendarTitle.textContent = selected.toLocaleDateString(currentLocale(), { day: "numeric", month: "long" });
  setAgendaViewMode("week");
  renderTodayContext(today);
  DOM.planningGrid.innerHTML = agendaDays.map((date) => renderMobileWeekDay(date, datedEvents)).join("");
  renderWeekdayLabels(agendaDays);
  renderSelectedDay(events);
  renderMobileAgendaFlow(events, agendaDays);
  requestAnimationFrame(scrollSelectedMobileDayIntoView);
}

function renderNewMobileAgenda(events, today) {
  const selected = parseISODate(AppState.selectedDate);
  const title = document.querySelector("#mobileAgendaTitle");
  const weekstrip = document.querySelector("#mobileAgendaWeekstrip");
  const month = document.querySelector("#mobileAgendaMonth");
  const monthToggle = document.querySelector("[data-mobile-agenda-month-toggle]");
  const list = document.querySelector("#mobileAgendaList");
  if (!title || !weekstrip || !list) return;

  const mobileEvents = events.filter((event) => event.date).filter(isMobileVisibleAgendaEvent);
  const selectedWeekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 21 }, (_, index) => addDays(selectedWeekStart, index - 7));
  const timelineStart = addDays(startOfDay(today), -14);
  const timelineEnd = addDays(startOfDay(today), 120);
  const start = selected < timelineStart ? addDays(selected, -7) : timelineStart;
  const end = selected > timelineEnd ? addDays(selected, 45) : timelineEnd;
  const listDays = [];
  for (let day = start; day <= end; day = addDays(day, 1)) listDays.push(day);
  const eventDates = new Set(mobileEvents.map((event) => event.date));

  title.textContent = selected.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  weekstrip.innerHTML = weekDays.map((day) => renderMobileAgendaStripDay(day, eventDates)).join("");
  if (month) {
    month.hidden = !mobileAgendaMonthExpanded;
    month.innerHTML = renderMobileAgendaMonth(selected, mobileEvents, eventDates);
  }
  if (monthToggle) {
    monthToggle.classList.toggle("expanded", mobileAgendaMonthExpanded);
    monthToggle.setAttribute("aria-expanded", String(mobileAgendaMonthExpanded));
  }
  list.innerHTML = listDays.map((day) => renderMobileAgendaListDay(day, mobileEvents, today)).join("");
  setupMobileAgendaScrollSync();
  requestAnimationFrame(() => {
    weekstrip.querySelector(".selected")?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
}

function renderMobileAgendaStripDay(day, eventDates) {
  const iso = toISODate(day);
  return `
    <button class="mobile-agenda-strip-day ${iso === AppState.selectedDate ? "selected" : ""}" type="button" data-mobile-agenda-date="${iso}">
      <span>${day.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "").slice(0, 1)}</span>
      <strong>${day.getDate()}</strong>
      <i aria-hidden="true">${eventDates.has(iso) ? "•" : ""}</i>
    </button>
  `;
}

function renderMobileAgendaListDay(day, events, today) {
  const iso = toISODate(day);
  const dayEvents = events.filter((event) => event.date === iso).sort(compareEvents);
  const label = mobileAgendaDayLabel(day, today);

  return `
    <section class="mobile-agenda-list-day ${iso === AppState.selectedDate ? "selected" : ""} ${iso === toISODate(today) ? "today" : ""}" data-mobile-list-day="${iso}">
      <header>
        <button type="button" data-mobile-agenda-date="${iso}">${escapeHtml(label)}</button>
        <button type="button" data-mobile-agenda-add-date="${iso}" aria-label="${t("addCompact")}">+</button>
      </header>
      <div class="mobile-agenda-list-items">
        ${dayEvents.length ? dayEvents.map(renderMobileAgendaListEvent).join("") : `<p data-mobile-agenda-add-date="${iso}">${t("noSelectedDay")}</p>`}
      </div>
    </section>
  `;
}

function mobileAgendaDayLabel(day, today) {
  const iso = toISODate(day);
  const base = day.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  if (iso === toISODate(today)) return `${t("today")} - ${base}`;
  if (iso === toISODate(addDays(today, 1))) return `${getLanguageCode() === "en" ? "Tomorrow" : "Morgen"} - ${base}`;
  return base;
}

function renderMobileAgendaListEvent(event) {
  const time = event.time ? formatTime(event.time) : t("allDay");
  return `
    <article class="mobile-agenda-list-event ${event.type} ${event.category || ""}">
      <span>${escapeHtml(time)}</span>
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <small>${escapeHtml(getEventMeta(event))}</small>
      </div>
      ${renderAgendaDeleteButton(event)}
    </article>
  `;
}

function isMobileVisibleAgendaEvent(event) {
  return Boolean(event.id && ["personal", "day"].includes(event.source)) || ["holiday", "vacation"].includes(event.type);
}

function renderMobileAgendaMonth(selected, events, eventDates) {
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthEnd = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const days = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);

  return `
    <div class="mobile-agenda-month-title">${monthStart.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" })}</div>
    <div class="mobile-agenda-month-weekdays">
      ${Array.from({ length: 7 }, (_, index) => addDays(gridStart, index))
        .map((day) => `<span>${day.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "").slice(0, 1)}</span>`)
        .join("")}
    </div>
    <div class="mobile-agenda-month-grid">
      ${days.map((day) => {
        const iso = toISODate(day);
        const outside = day.getMonth() !== monthStart.getMonth();
        return `
          <button class="${outside ? "outside" : ""} ${iso === AppState.selectedDate ? "selected" : ""} ${eventDates.has(iso) ? "has-event" : ""}" type="button" data-mobile-agenda-date="${iso}">
            <span>${day.getDate()}</span>
            <i aria-hidden="true">${eventDates.has(iso) ? "•" : ""}</i>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function setupMobileAgendaScrollSync() {
  if (!isMobileAgenda()) return;
  if (mobileAgendaScrollObserver) mobileAgendaScrollObserver.disconnect();
  const days = document.querySelectorAll("#mobileAgendaList [data-mobile-list-day]");
  if (!days.length || typeof IntersectionObserver === "undefined") return;
  mobileAgendaScrollObserver = new IntersectionObserver((entries) => {
    const active = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => Math.abs(a.boundingClientRect.top - 145) - Math.abs(b.boundingClientRect.top - 145))[0];
    const date = active?.target?.dataset.mobileListDay;
    if (!date || date === AppState.selectedDate) return;
    mobileAgendaScrollSyncPending = true;
    AppState.setSelectedDate(date);
    setTimeout(() => {
      mobileAgendaScrollSyncPending = false;
    }, 120);
  }, { rootMargin: "-132px 0px -64% 0px", threshold: 0.01 });
  days.forEach((day) => mobileAgendaScrollObserver.observe(day));
}

function scrollMobileAgendaToDate(date, behavior = "smooth") {
  const target = document.querySelector(`#mobileAgendaList [data-mobile-list-day="${date}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior, block: "start" });
}

function renderMonthAgenda(events, today) {
  const selected = parseISODate(AppState.selectedDate);
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const monthEnd = new Date(selected.getFullYear(), selected.getMonth() + 1, 0);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = addDays(startOfWeek(monthEnd), 6);
  const agendaDays = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    agendaDays.push(day);
  }
  const datedEvents = events.filter((event) => event.date && isBetween(parseISODate(event.date), gridStart, gridEnd));

  DOM.calendarTitle.textContent = monthStart.toLocaleDateString(currentLocale(), { month: "long", year: "numeric" });
  setAgendaViewMode("month");
  renderTodayContext(today);
  DOM.planningGrid.innerHTML = agendaDays.map((date) => renderMonthDayCard(date, datedEvents, monthStart.getMonth())).join("");
  renderWeekdayLabels(agendaDays.slice(0, 7));
  renderSelectedDay(events);
}

function ensureMobileAgendaFlow() {
  let flow = document.querySelector("#mobileAgendaFlow");
  if (flow) return flow;
  flow = document.createElement("div");
  flow.id = "mobileAgendaFlow";
  flow.className = "mobile-agenda-flow";
  DOM.selectedDayPanel?.insertAdjacentElement("afterend", flow);
  return flow;
}

function clearMobileAgendaFlow() {
  const flow = document.querySelector("#mobileAgendaFlow");
  if (flow) flow.innerHTML = "";
}

function renderMobileWeekDay(date, events) {
  const iso = toISODate(date);
  const dayEvents = events.filter((event) => event.date === iso);
  const isSelected = iso === AppState.selectedDate;
  const hasEvents = dayEvents.length > 0;

  return `
    <button class="day-card mobile-week-day ${isSelected ? "selected" : ""} ${hasEvents ? "has-events" : "rest-day"}" data-date="${iso}" type="button">
      <span class="mobile-day-label">${date.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "").slice(0, 1)}</span>
      <strong>${date.getDate()}</strong>
      <span class="mobile-event-count" aria-hidden="true">${hasEvents ? "•" : ""}</span>
    </button>
  `;
}

function renderMobileAgendaFlow(events, agendaDays) {
  const flow = ensureMobileAgendaFlow();
  flow.innerHTML = agendaDays.map((date) => renderMobileAgendaDay(date, events)).join("");
}

function renderMobileAgendaDay(date, events) {
  const iso = toISODate(date);
  const dayEvents = events
    .filter((event) => event.date === iso)
    .sort(compareEvents);
  const title = date.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  const isSelected = iso === AppState.selectedDate;

  return `
    <section class="mobile-agenda-day ${isSelected ? "selected" : ""}" data-mobile-day="${iso}">
      <header>
        <button type="button" data-date="${iso}">${escapeHtml(title)}</button>
        <button class="mobile-day-add" type="button" data-mobile-add-date="${iso}" aria-label="${t("addCompact")}">+</button>
      </header>
      <div class="mobile-agenda-day-items">
        ${dayEvents.length ? dayEvents.map(renderMobileAgendaItem).join("") : `<p>${t("noSelectedDay")}</p>`}
      </div>
    </section>
  `;
}

function renderMobileAgendaItem(event) {
  const timeLabel = event.time ? formatTime(event.time) : t("allDay");
  return `
    <div class="mobile-agenda-item ${event.type}">
      <span>${escapeHtml(timeLabel)}</span>
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <small>${escapeHtml(getEventMeta(event))}</small>
      </div>
      ${renderAgendaDeleteButton(event)}
    </div>
  `;
}

function scrollSelectedMobileDayIntoView() {
  if (!isMobileAgenda()) return;
  DOM.planningGrid?.querySelector(".mobile-week-day.selected")?.scrollIntoView({
    behavior: "smooth",
    inline: "center",
    block: "nearest",
  });
}

function setAgendaViewMode(view) {
  DOM.calendarPanel?.classList.toggle("month-mode", view === "month");
  DOM.planningGrid?.classList.toggle("month-view", view === "month");
  DOM.planningGrid?.classList.toggle("week-view", view !== "month");
  DOM.agendaViewButtons?.forEach((button) => {
    const isActive = button.dataset.agendaView === view;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderTodayContext(today) {
  const isSelectedToday = AppState.selectedDate === toISODate(today);
  const contextDate = getDayContextText();
  if (DOM.calendarContext) DOM.calendarContext.textContent = `${t("today")} • ${contextDate}`;
  DOM.todayShortcut?.classList.toggle("active", !isSelectedToday);
  DOM.todayShortcut?.setAttribute("aria-pressed", String(isSelectedToday));
  DOM.todayShortcut?.classList.toggle("is-shortcut", !isSelectedToday);
}

function renderWeekdayLabels(agendaDays) {
  if (!DOM.weekdayRow) return;
  DOM.weekdayRow.innerHTML = agendaDays
    .map((date) => `<span>${date.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "")}</span>`)
    .join("");
}

function getVisibleWeekStart() {
  return addDays(startOfWeek(new Date()), AppState.currentWeekOffset * 7);
}

function isDesktopAgenda() {
  return window.matchMedia("(min-width: 769px)").matches;
}

function renderHolidayList(events) {
  if (!DOM.holidayList) return;
  const today = startOfDay(new Date());
  const upcoming = events
    .filter((event) => ["holiday", "vacation"].includes(event.type))
    .filter((event) => event.date && parseISODate(event.date) >= today)
    .slice(0, 4);

  DOM.holidayList.innerHTML = upcoming.length
    ? upcoming.map((event) => `<li>${escapeHtml(event.title)}${event.date ? ` - ${escapeHtml(formatShortDate(parseISODate(event.date)))}` : ""}</li>`).join("")
    : `<li>${t("noHolidays")}</li>`;
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
    <article class="day-card ${isQuiet ? "rest-day" : ""} ${iso === AppState.selectedDate ? "selected" : ""}" data-date="${iso}" tabindex="0">
      <div class="day-heading">
        <span class="mobile-day-label">${date.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "").slice(0, 1)}</span>
        <h3>${date.getDate()}</h3>
        <span class="mobile-event-count">${dayEvents.length ? dayEvents.length : ""}</span>
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

function renderMonthDayCard(date, events, visibleMonth) {
  const iso = toISODate(date);
  const dayEvents = events
    .filter((event) => event.date === iso)
    .sort(compareEvents);
  const visibleEvents = dayEvents.slice(0, 3);
  const moreCount = Math.max(dayEvents.length - visibleEvents.length, 0);
  const isQuiet = !dayEvents.length;
  const isOutsideMonth = date.getMonth() !== visibleMonth;

  return `
    <article class="day-card month-day-card ${isQuiet ? "rest-day" : ""} ${isOutsideMonth ? "outside-month" : ""} ${iso === AppState.selectedDate ? "selected" : ""}" data-date="${iso}" tabindex="0">
      <div class="day-heading">
        <h3>${date.getDate()}</h3>
        <span>${date.toLocaleDateString(currentLocale(), { weekday: "short" }).replace(".", "")}</span>
      </div>
      <div class="event-list">
        ${visibleEvents.map(renderEventCard).join("")}
        ${moreCount ? `<small class="more-events">${escapeHtml(t("moreItems", { count: moreCount }))}</small>` : ""}
      </div>
    </article>
  `;
}

function renderSelectedDay(events) {
  const date = parseISODate(AppState.selectedDate);
  const items = events
    .filter((event) => event.date === AppState.selectedDate && ["personal", "appointment", "sport", "school", "deadline", "task", "reminder", "note"].includes(event.type))
    .sort(compareEvents);

  DOM.selectedDayTitle.textContent = date.toLocaleDateString(currentLocale(), { weekday: "long", day: "numeric", month: "long" });
  DOM.selectedDayCount.textContent = t(items.length === 1 ? "selectedItem" : "selectedItems", { count: items.length });
  const rememberItems = getSelectedDayRememberItems(items);
  DOM.selectedDayItems.innerHTML = items.length
    ? `${items.map(renderDayDetailItem).join("")}${renderSelectedDayRememberItems(rememberItems)}`
    : `${`<p class="quiet-note">${t("noSelectedDay")}</p>`}${renderSelectedDayRememberItems(rememberItems)}`;
}

function renderDayDetailItem(event) {
  const suffix = t("timeSuffix");
  const timeLabel = event.time ? `${escapeHtml(formatTime(event.time))}${suffix ? ` ${suffix}` : ""}` : t("allDay");
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

function getSelectedDayRememberItems(dayEvents) {
  if (!AppState.settings.rememberAuto) return [];
  const contexts = [...new Set(dayEvents
    .map((event) => detectRememberSituation(event))
    .filter((context) => context && isRememberContextEnabled(context)))];
  if (!contexts.length) return [];

  const seen = new Set();
  return AppState.rememberItems
    .filter((item) => item.autoRemind !== false)
    .filter((item) => item.contexts?.some((context) => contexts.includes(context)))
    .filter((item) => {
      const key = normalizeForDuplicate(item.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function renderSelectedDayRememberItems(items) {
  if (!items.length) return "";
  return `
    <div class="day-remember-hint">
      <strong>${t("dontForget")}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item.name)}</li>`).join("")}
      </ul>
    </div>
  `;
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
    deadline: t("deadline").toLowerCase(),
    appointment: t("appointment").toLowerCase(),
    personal: t("freeTime").toLowerCase(),
    sport: t("sport").toLowerCase(),
    school: t("school").toLowerCase(),
    task: getLanguageCode() === "en" ? "task" : "taak",
    reminder: t("addReminder").replace("+ ", "").toLowerCase(),
    note: getLanguageCode() === "en" ? "note" : "notitie",
    routine: getLanguageCode() === "en" ? "routine" : "routine",
    holiday: getLanguageCode() === "en" ? "holiday" : "feestdag",
    vacation: getLanguageCode() === "en" ? "school break" : "schoolvakantie",
  }[type];
}

function formatEventLine(event) {
  const time = event.time ? ` om ${formatTime(event.time)}` : "";
  return `${formatShortDate(parseISODate(event.date))}${time}: ${event.title}`;
}

function formatTime(time) {
  if (AppState.settings.time24 !== false) return time;
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatShortDate(date) {
  return date.toLocaleDateString(currentLocale(), { day: "numeric", month: "short" });
}

function currentLocale() {
  return getLanguageCode() === "en" ? "en-US" : "nl-NL";
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date) {
  const diff = AppState.settings?.weekStart === "Zondag" ? date.getDay() : (date.getDay() + 6) % 7;
  return addDays(startOfDay(date), -diff);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  const day = next.getDate();
  next.setDate(1);
  next.setMonth(next.getMonth() + months);
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));
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
      error: t("missingDate"),
    };
  }

  return {
    id: createId(),
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
    deadline: { eventType: "deadline", label: "deadline", category: "deadline" },
    afspraak: { eventType: "appointment", label: t("appointment").toLowerCase(), category: "vrije tijd" },
    school: { eventType: "school", label: t("school").toLowerCase(), category: "school" },
    werk: { eventType: "appointment", label: t("work").toLowerCase(), category: "werk" },
    sport: { eventType: "sport", label: t("sport").toLowerCase(), category: "sport" },
    "vrije tijd": { eventType: "appointment", label: t("appointment").toLowerCase(), category: "vrije tijd" },
  }[category] || { eventType: "appointment", label: "vrije tijd", category: "vrije tijd" };
}

function agendaCategoryLabel(category) {
  return {
    deadline: "deadline",
    school: t("school").toLowerCase(),
    sport: t("sport").toLowerCase(),
    werk: t("appointment").toLowerCase(),
    "vrije tijd": t("appointment").toLowerCase(),
    afspraak: t("appointment").toLowerCase(),
  }[category] || "";
}

function dayItemMetaLabel(item) {
  const type = typeLabel(item.type);
  const category = agendaCategoryLabel(item.category);
  if (!category || category === type) return type;
  return `${type} · ${category}`;
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
  if (!DOM.personalAppointmentList) return;
  const upcoming = events
    .filter((event) => event.source === "personal")
    .filter((event) => event.date && parseISODate(event.date) >= startOfDay(new Date()))
    .slice(0, 5);

  DOM.personalAppointmentList.closest(".important-panel")?.classList.toggle("has-items", Boolean(upcoming.length));
  DOM.personalAppointmentList.innerHTML = upcoming.length
    ? upcoming
        .map(
          (event) =>
            `<li class="appointment-list-item">
              ${renderAgendaDeleteButton(event)}
              <strong>${escapeHtml(event.title)}</strong><br>${escapeHtml(formatEventLine(event))}<br><span class="event-reminder">${escapeHtml(formatReminderLabels(event.reminders))}</span>
            </li>`
        )
        .join("")
    : `<li>${t("noAppointments")}</li>`;
}

function animateWeekChange() {
  DOM.planningGrid.classList.remove("is-shifting");
  void DOM.planningGrid.offsetWidth;
  DOM.planningGrid.classList.add("is-shifting");
}

function moveWeek(direction) {
  AppState.setCurrentWeekOffset(AppState.currentWeekOffset + direction);
  AppState.setSelectedDate(toISODate(getVisibleWeekStart()));
  animateWeekChange();
}

function moveMonth(direction) {
  AppState.setSelectedDate(toISODate(addMonths(parseISODate(AppState.selectedDate), direction)));
  animateWeekChange();
}

function quickPlaceholder(type) {
  return {
    appointment: "Bijvoorbeeld: kapper om 14:00",
    task: getLanguageCode() === "en" ? "For example: prepare bag" : "Bijvoorbeeld: tas klaarzetten",
    reminder: getLanguageCode() === "en" ? "For example: bring water bottle" : "Bijvoorbeeld: waterfles meenemen",
    note: getLanguageCode() === "en" ? "For example: take it easy" : "Bijvoorbeeld: rustig aan doen",
    deadline: getLanguageCode() === "en" ? "For example: hand in report at 17:00" : "Bijvoorbeeld: verslag inleveren om 17:00",
  }[type];
}

function cleanQuickEntryText(text, type) {
  const clean = ["appointment", "deadline"].includes(type) ? cleanAppointmentTitle(text) : softenItem(text);
  return clean.replace(/(?:\bom\s+)?\d{1,2}(?:(?::|\.)\d{2}|\s*uur)\b/gi, "").replace(/\s+/g, " ").trim();
}


