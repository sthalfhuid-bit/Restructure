function bindNavigationEvents() {
  DOM.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showPage(tab.dataset.page);
      closeMobileMenu();
    });
  });

  DOM.mobileMenuToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMobileMenu();
  });

  DOM.mobileMenuBackdrop?.addEventListener("click", closeMobileMenu);

  DOM.mobileExtraItems.forEach((item) => {
    item.addEventListener("click", () => {
      showPage(item.dataset.page);
      closeMobileMenu();
    });
  });

  DOM.settingsLayout?.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    if (!pageButton) return;
    showPage(pageButton.dataset.page);
  });

  window.addEventListener("scroll", closeMobileMenu, { passive: true });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
}

function toggleMobileMenu() {
  const isOpen = DOM.mobileExtraMenu?.hidden === false;
  if (isOpen) closeMobileMenu();
  else openMobileMenu();
}

function openMobileMenu() {
  if (!DOM.mobileExtraMenu || !DOM.mobileMenuBackdrop) return;
  DOM.mobileExtraMenu.hidden = false;
  DOM.mobileMenuBackdrop.hidden = false;
  DOM.mobileMenuToggle?.setAttribute("aria-expanded", "true");
}

function closeMobileMenu() {
  if (!DOM.mobileExtraMenu || DOM.mobileExtraMenu.hidden) return;
  DOM.mobileExtraMenu.hidden = true;
  DOM.mobileMenuBackdrop.hidden = true;
  DOM.mobileMenuToggle?.setAttribute("aria-expanded", "false");
}

function bindBrainDumpEvents() {
  DOM.overviewViewButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      const overviewView = button.dataset.overviewView || "list";
      saveAndSetSettings({ ...AppState.settings, overviewView });
    });
  });

  DOM.overviewGrid.addEventListener("click", (event) => {
    const addProposal = event.target.closest("[data-add-proposal]");
    const dismissProposal = event.target.closest("[data-dismiss-proposal]");
    const hideSmallStep = event.target.closest("[data-hide-small-step]");
    const deleteBrainButton = event.target.closest("[data-delete-brain-entry]");
    const deleteOverviewButton = event.target.closest("[data-delete-overview-item]");
    const editBrainButton = event.target.closest("[data-edit-brain-entry]");
    const button = event.target.closest("[data-small-task]");

    if (deleteOverviewButton) {
      askThenDelete(deleteOverviewButton, () => {
        deleteOverviewItem(deleteOverviewButton.dataset.deleteOverviewItem);
        refreshBrainFlow();
      });
      return;
    }

    if (deleteBrainButton) {
      askThenDelete(deleteBrainButton, () => {
        deleteBrainEntry(deleteBrainButton.dataset.deleteBrainEntry);
        refreshBrainFlow();
      });
      return;
    }

    if (editBrainButton) {
      openBrainEntryForEdit(editBrainButton.dataset.editBrainEntry);
      return;
    }

    if (addProposal) {
      const appointment = addAppointment({
        title: addProposal.dataset.title,
        date: addProposal.dataset.date,
        time: addProposal.dataset.time,
        type: addProposal.dataset.type,
        meta: addProposal.dataset.meta,
        category: addProposal.dataset.category,
        reminders: [],
      });
      if (!appointment) return;
      addProposal.closest(".appointment-proposal, .overview-flat-item")?.classList.add("is-added");
      addProposal.closest(".proposal-actions").innerHTML = `<span class="quiet-note">${t("addedAgenda")}</span>`;
      return;
    }

    if (dismissProposal) {
      dismissProposal.closest(".appointment-proposal, .overview-flat-item")?.remove();
      return;
    }

    if (hideSmallStep) {
      hideSmallStep.closest(".small-step")?.remove();
      return;
    }

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
      `<div class="small-step"><span>${t("smallFirstStep")}</span><p>${escapeHtml(step)}</p><button class="soft-button" type="button" data-hide-small-step>${t("backToOriginal")}</button></div>`
    );
  });

  DOM.dumpInput.addEventListener("input", updateCount);

  DOM.makeOverviewButton.addEventListener("click", () => {
    const text = DOM.dumpInput.value.trim();
    saveBrainDumpInput(text);
    refreshBrainFlow();
    showPage("overview");
  });
}

function refreshBrainFlow() {
  const combinedText = getCombinedBrainText();
  const data = combinedText ? analyzeBrainDump(combinedText) : sampleData;
  renderOverview(data);
  renderToday(data);
  renderPlanning(data, combinedText);
}

function bindAgendaEvents() {
  DOM.appointmentForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = DOM.appointmentInput.value.trim();
    if (!text) {
      DOM.appointmentFeedback.textContent = t("typeCalmAppointment");
      return;
    }

    const reminders = [
      DOM.remindTomorrow.checked ? "tomorrow" : null,
      DOM.remindHour.checked ? "hour" : null,
    ].filter(Boolean);
    const appointment = parsePersonalAppointment(text, reminders, DOM.appointmentCategory.value);

    if (appointment.error) {
      DOM.appointmentFeedback.textContent = appointment.error;
      return;
    }

    const savedAppointment = addAppointment(appointment);
    if (!savedAppointment) return;
    DOM.appointmentInput.value = "";
    DOM.appointmentCategory.value = "";
    DOM.appointmentFeedback.textContent = t("addedAs", {
      event: formatEventLine(savedAppointment),
      category: agendaCategoryLabel(savedAppointment.category) || typeLabel(savedAppointment.type),
    });
  });

  DOM.prevWeek.addEventListener("click", () => {
    moveAgendaPeriod(-1);
  });

  DOM.nextWeek.addEventListener("click", () => {
    moveAgendaPeriod(1);
  });

  DOM.todayShortcut?.addEventListener("click", () => {
    AppState.setCurrentWeekOffset(0);
    AppState.setSelectedDate(toISODate(new Date()));
    setSelectedDayEntryOpen(false);
    animateWeekChange();
  });

  const setSelectedDayEntryOpen = (isOpen) => {
    DOM.selectedDayPanel?.classList.toggle("adding", isOpen);
    document.body.classList.toggle("agenda-entry-open", Boolean(isOpen && isMobileAgenda()));
    [DOM.addDayToggle, DOM.desktopAddDayToggle].forEach((button) => {
      if (!button) return;
      button.textContent = t(isOpen ? "closeAdd" : "addCompact");
      button.setAttribute("aria-expanded", String(isOpen));
    });
    if (isOpen) DOM.quickEntryInput.focus();
  };

  const toggleSelectedDayEntry = () => {
    setSelectedDayEntryOpen(!DOM.selectedDayPanel?.classList.contains("adding"));
  };

  setSelectedDayEntryOpen(false);
  DOM.addDayToggle?.addEventListener("click", toggleSelectedDayEntry);
  DOM.desktopAddDayToggle?.addEventListener("click", toggleSelectedDayEntry);
  DOM.quickEntryForm?.addEventListener("click", (event) => {
    if (!event.target.closest("[data-close-quick-entry]")) return;
    setSelectedDayEntryOpen(false);
  });
  DOM.agendaViewButtons?.forEach((button) => {
    button.addEventListener("click", () => {
      if (!isDesktopAgenda()) return;
      agendaView = button.dataset.agendaView || "week";
      setSelectedDayEntryOpen(false);
      schedulePlanningRender();
    });
  });

  DOM.calendarPanel.addEventListener("wheel", (event) => {
    if (isMobileAgenda() && !event.target.closest("#planningGrid")) return;
    const now = Date.now();
    const isHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.25;
    const isIntentionalShift = event.shiftKey && Math.abs(event.deltaY) > 45;
    const isVerticalIntent = Math.abs(event.deltaY) > Math.abs(event.deltaX) * 1.25 && Math.abs(event.deltaY) > 45;
    const useVerticalScroll = AppState.settings.weekScroll === "Verticaal";
    if (useVerticalScroll ? !isVerticalIntent : !isHorizontalIntent && !isIntentionalShift) return;

    const intent = useVerticalScroll ? event.deltaY : isHorizontalIntent ? event.deltaX : event.deltaY;
    if (Math.abs(intent) < 45 || now - lastWeekScroll < 650) return;
    lastWeekScroll = now;
    event.preventDefault();
    moveAgendaPeriod(intent > 0 ? 1 : -1);
  }, { passive: false });

  DOM.planningGrid.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
    touchStartY = event.touches[0]?.clientY || 0;
    touchStartTime = Date.now();
  }, { passive: true });

  DOM.planningGrid.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const endY = event.changedTouches[0]?.clientY || touchStartY;
    const diff = touchStartX - endX;
    const verticalDiff = Math.abs(touchStartY - endY);
    const elapsed = Date.now() - touchStartTime;
    const threshold = isMobileAgenda() ? 150 : 48;
    if (verticalDiff > Math.abs(diff) * 0.55 || Math.abs(diff) < threshold || elapsed > 900) return;
    moveAgendaPeriod(diff > 0 ? 1 : -1);
  }, { passive: true });

  DOM.planningGrid.addEventListener("click", (event) => {
    const day = event.target.closest("[data-date]");
    if (!day) return;
    setSelectedDayEntryOpen(false);
    AppState.setSelectedDate(day.dataset.date);
  });

  DOM.calendarPanel?.addEventListener("click", (event) => {
    const appointmentButton = event.target.closest("[data-delete-appointment]");
    const dayItemButton = event.target.closest("[data-delete-day-item]");
    const deleteButton = appointmentButton || dayItemButton;
    if (deleteButton && !event.target.closest("#selectedDayItems")) {
      askThenDelete(deleteButton, () => {
        if (appointmentButton) deleteAppointment(appointmentButton.dataset.deleteAppointment);
        if (dayItemButton) deleteDayItem(dayItemButton.dataset.deleteDayItem);
      });
      return;
    }

    const addButton = event.target.closest("[data-mobile-add-date]");
    if (!addButton) return;
    AppState.setSelectedDate(addButton.dataset.mobileAddDate);
    setSelectedDayEntryOpen(true);
  });

  DOM.planningGrid.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const day = event.target.closest("[data-date]");
    if (!day) return;
    event.preventDefault();
    setSelectedDayEntryOpen(false);
    AppState.setSelectedDate(day.dataset.date);
  });

  DOM.selectedDayItems.addEventListener("click", (event) => {
    const appointmentButton = event.target.closest("[data-delete-appointment]");
    const dayItemButton = event.target.closest("[data-delete-day-item]");
    const button = appointmentButton || dayItemButton;
    if (!button) return;

    askThenDelete(button, () => {
      if (appointmentButton) {
        deleteAppointment(appointmentButton.dataset.deleteAppointment);
      }

      if (dayItemButton) {
        deleteDayItem(dayItemButton.dataset.deleteDayItem);
      }
    });
  });

  DOM.personalAppointmentList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-appointment]");
    if (!button) return;

    askThenDelete(button, () => {
      deleteAppointment(button.dataset.deleteAppointment);
    });
  });

  DOM.quickActionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      quickEntryType = button.dataset.quickType;
      DOM.quickActionButtons.forEach((item) => item.classList.toggle("active", item === button));
      DOM.quickEntryInput.placeholder = quickPlaceholder(quickEntryType);
      if (quickEntryType === "deadline") DOM.quickCategoryInput.value = "deadline";
      if (quickEntryType === "appointment" && DOM.quickCategoryInput.value === "deadline") DOM.quickCategoryInput.value = "";
      DOM.quickEntryInput.focus();
    });
  });

  DOM.quickEntryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = DOM.quickEntryInput.value.trim();
    if (!text) return;

    addDayItem({
      date: AppState.selectedDate,
      type: quickEntryType,
      time: DOM.quickTimeInput.value || parseTimeFromText(text),
      category: DOM.quickCategoryInput.value || categoryFromEvent({ title: text, type: quickEntryType }),
      reminder: DOM.quickReminderInput.value,
      text,
    });
    DOM.quickEntryInput.value = "";
    DOM.quickTimeInput.value = "";
    DOM.quickCategoryInput.value = "";
    DOM.quickReminderInput.value = "";
    setSelectedDayEntryOpen(false);
  });

  DOM.enableReminders?.addEventListener("click", async () => {
    if (typeof Notification === "undefined") {
      DOM.appointmentFeedback.textContent = t("notificationUnsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    DOM.appointmentFeedback.textContent =
      permission === "granted"
        ? t("remindersEnabledOpen")
        : t("remindersVisibleOnly");
  });

  bindDesktopAgendaEvents();
  bindMobileAgendaEvents();
}

function bindMobileAgendaEvents() {
  const shell = document.querySelector("#mobileAgenda");
  const modal = document.querySelector("#mobileAgendaModal");
  const form = document.querySelector("#mobileAgendaForm");
  if (!shell || !modal || !form) return;

  shell.addEventListener("click", (event) => {
    const dateButton = event.target.closest("[data-mobile-agenda-date]");
    const addButton = event.target.closest("[data-mobile-agenda-add-date], [data-mobile-agenda-add]");
    const todayButton = event.target.closest("[data-mobile-agenda-today]");
    const appointmentButton = event.target.closest("[data-delete-appointment]");
    const dayItemButton = event.target.closest("[data-delete-day-item]");

    if (appointmentButton || dayItemButton) {
      const button = appointmentButton || dayItemButton;
      askThenDelete(button, () => {
        if (appointmentButton) deleteAppointment(appointmentButton.dataset.deleteAppointment);
        if (dayItemButton) deleteDayItem(dayItemButton.dataset.deleteDayItem);
      });
      return;
    }

    if (todayButton) {
      AppState.setSelectedDate(toISODate(new Date()));
      return;
    }

    if (addButton) {
      openMobileAgendaModal(addButton.dataset.mobileAgendaAddDate || AppState.selectedDate);
      return;
    }

    if (dateButton) {
      AppState.setSelectedDate(dateButton.dataset.mobileAgendaDate);
    }
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-mobile-agenda-close]")) closeMobileAgendaModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveMobileAgendaItem();
  });
}

function openMobileAgendaModal(date = AppState.selectedDate) {
  const modal = document.querySelector("#mobileAgendaModal");
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("mobile-agenda-entry-open");
  document.querySelector("#mobileAgendaDateInput").value = date || toISODate(new Date());
  document.querySelector("#mobileAgendaTitleInput").focus();
}

function closeMobileAgendaModal() {
  const modal = document.querySelector("#mobileAgendaModal");
  const form = document.querySelector("#mobileAgendaForm");
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("mobile-agenda-entry-open");
  form?.reset();
}

function saveMobileAgendaItem() {
  const title = document.querySelector("#mobileAgendaTitleInput")?.value.trim();
  const date = document.querySelector("#mobileAgendaDateInput")?.value;
  const allDay = document.querySelector("#mobileAgendaAllDayInput")?.checked;
  const time = allDay ? "" : document.querySelector("#mobileAgendaStartInput")?.value;
  const category = document.querySelector("#mobileAgendaCategoryInput")?.value || "vrije tijd";
  const type = document.querySelector("#mobileAgendaTypeInput")?.value || "appointment";
  const reminder = document.querySelector("#mobileAgendaReminderInput")?.value || "";
  const note = document.querySelector("#mobileAgendaNoteInput")?.value.trim() || "";
  const location = document.querySelector("#mobileAgendaLocationInput")?.value.trim() || "";
  if (!title || !date) return;

  const text = [title, location ? `@ ${location}` : "", note].filter(Boolean).join(" - ");
  if (type === "appointment") {
    addAppointment({
      title: text,
      date,
      time,
      type: appointmentTypeFromCategory(category).eventType,
      category,
      reminders: reminder ? [reminder] : [],
      meta: agendaCategoryLabel(category) || typeLabel("appointment"),
    });
  } else {
    addDayItem({
      text,
      date,
      time,
      type,
      category: type === "deadline" ? "deadline" : category,
      reminder,
    });
  }

  closeMobileAgendaModal();
}

function bindDesktopAgendaEvents() {
  const shell = document.querySelector("#desktopAgenda");
  const modal = document.querySelector("#desktopAgendaModal");
  const form = document.querySelector("#desktopAgendaForm");
  if (!shell || !modal || !form) return;

  shell.addEventListener("click", (event) => {
    const dateButton = event.target.closest("[data-desktop-date]");
    const filterButton = event.target.closest("[data-desktop-agenda-filter]");
    const deleteAppointmentButton = event.target.closest("[data-delete-appointment]");
    const deleteDayItemButton = event.target.closest("[data-delete-day-item]");

    if (deleteAppointmentButton || deleteDayItemButton) {
      const button = deleteAppointmentButton || deleteDayItemButton;
      askThenDelete(button, () => {
        if (deleteAppointmentButton) deleteAppointment(deleteAppointmentButton.dataset.deleteAppointment);
        if (deleteDayItemButton) deleteDayItem(deleteDayItemButton.dataset.deleteDayItem);
      });
      return;
    }

    if (filterButton) {
      const key = filterButton.dataset.desktopAgendaFilter;
      const filters = getDesktopAgendaFilters();
      saveAndSetSettings({
        ...AppState.settings,
        desktopAgendaFilters: {
          ...filters,
          [key]: filters[key] === false,
        },
      });
      return;
    }

    if (dateButton) {
      AppState.setSelectedDate(dateButton.dataset.desktopDate);
      return;
    }
  });

  document.querySelector("[data-desktop-agenda-prev]")?.addEventListener("click", () => moveDesktopAgenda(-1));
  document.querySelector("[data-desktop-agenda-next]")?.addEventListener("click", () => moveDesktopAgenda(1));
  document.querySelector("[data-desktop-agenda-today]")?.addEventListener("click", () => {
    AppState.setSelectedDate(toISODate(new Date()));
  });
  document.querySelector("[data-desktop-agenda-add]")?.addEventListener("click", () => openDesktopAgendaModal());

  document.querySelectorAll("[data-desktop-agenda-view]").forEach((button) => {
    button.addEventListener("click", () => {
      desktopAgendaView = button.dataset.desktopAgendaView || "week";
      schedulePlanningRender();
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-desktop-agenda-close]")) closeDesktopAgendaModal();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveDesktopAgendaItem();
  });
}

function openDesktopAgendaModal(date = AppState.selectedDate) {
  const modal = document.querySelector("#desktopAgendaModal");
  if (!modal) return;
  modal.hidden = false;
  document.querySelector("#desktopAgendaDateInput").value = date || toISODate(new Date());
  document.querySelector("#desktopAgendaTitleInput").focus();
}

function closeDesktopAgendaModal() {
  const modal = document.querySelector("#desktopAgendaModal");
  const form = document.querySelector("#desktopAgendaForm");
  if (!modal) return;
  modal.hidden = true;
  form?.reset();
}

function saveDesktopAgendaItem() {
  const title = document.querySelector("#desktopAgendaTitleInput")?.value.trim();
  const date = document.querySelector("#desktopAgendaDateInput")?.value;
  const time = document.querySelector("#desktopAgendaAllDayInput")?.checked ? "" : document.querySelector("#desktopAgendaStartInput")?.value;
  const category = document.querySelector("#desktopAgendaCategoryInput")?.value || "vrije tijd";
  const type = document.querySelector("#desktopAgendaTypeInput")?.value || "appointment";
  const reminder = document.querySelector("#desktopAgendaReminderInput")?.value || "";
  const note = document.querySelector("#desktopAgendaNoteInput")?.value.trim() || "";
  if (!title || !date) return;

  if (type === "appointment") {
    addAppointment({
      title,
      date,
      time,
      type: appointmentTypeFromCategory(category).eventType,
      category,
      reminders: reminder ? [reminder] : [],
      meta: agendaCategoryLabel(category) || typeLabel("appointment"),
    });
  } else {
    addDayItem({
      text: note ? `${title} - ${note}` : title,
      date,
      time,
      type,
      category: type === "deadline" ? "deadline" : category,
      reminder,
    });
  }

  closeDesktopAgendaModal();
}

function moveDesktopAgenda(direction) {
  const selected = parseISODate(AppState.selectedDate);
  if (desktopAgendaView === "day") {
    AppState.setSelectedDate(toISODate(addDays(selected, direction)));
    return;
  }
  if (desktopAgendaView === "month" || desktopAgendaView === "list") {
    AppState.setSelectedDate(toISODate(addMonths(selected, direction)));
    return;
  }
  AppState.setSelectedDate(toISODate(addDays(selected, direction * 7)));
}

function isMobileAgenda() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function moveAgendaPeriod(direction) {
  if (agendaView === "month" && isDesktopAgenda()) {
    moveMonth(direction);
    return;
  }
  moveWeek(direction);
}

function bindRememberEvents() {
  DOM.rememberSituations.addEventListener("change", (event) => {
    const input = event.target.closest("[data-remember-auto]");
    if (!input) return;

    toggleRememberItemReminder(input.dataset.rememberAuto, input.checked);
  });

  DOM.rememberSituations.addEventListener("click", (event) => {
    const button = event.target.closest("[data-delete-remember]");
    if (!button) return;

    askThenDelete(button, () => {
      deleteRememberItem(button.dataset.deleteRemember);
    });
  });

  DOM.rememberItemForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = DOM.rememberItemInput.value.trim();
    const location = DOM.rememberLocationInput.value.trim();
    const contexts = [...DOM.rememberItemForm.querySelectorAll(".needed-for input:checked")]
      .map((input) => input.value)
      .filter((context) => ["school", "werk", "sport", "vrije tijd"].includes(context));
    const autoRemind = DOM.rememberAutoInput.checked;
    if (!addRememberItem({ name, location, contexts, autoRemind })) return;
    DOM.rememberItemInput.value = "";
    DOM.rememberLocationInput.value = "";
    DOM.rememberItemForm.querySelectorAll(".needed-for input").forEach((input) => {
      input.checked = false;
    });
    DOM.rememberAutoInput.checked = true;
  });

  DOM.memoryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const thing = DOM.memoryThingInput.value.trim();
    const place = DOM.memoryPlaceInput.value.trim();
    if (!addMemoryNote({ thing, place })) return;
    DOM.memoryThingInput.value = "";
    DOM.memoryPlaceInput.value = "";
  });

  DOM.memorySearchInput.addEventListener("input", () => {
    renderMemoryResults(DOM.memorySearchInput.value);
  });

  DOM.memoryResults.addEventListener("click", (event) => {
    const rememberButton = event.target.closest("[data-delete-remember]");
    const memoryButton = event.target.closest("[data-delete-memory]");
    const toggleButton = event.target.closest("[data-memory-toggle]");
    const button = rememberButton || memoryButton;

    if (toggleButton && !button) {
      AppState.setExpandedMemoryItem(AppState.expandedMemoryItem === toggleButton.dataset.memoryToggle ? "" : toggleButton.dataset.memoryToggle);
      return;
    }

    if (!button) return;

    askThenDelete(button, () => {
      if (rememberButton) {
        deleteRememberItem(rememberButton.dataset.deleteRemember);
        AppState.setExpandedMemoryItem("");
      }

      if (memoryButton) {
        deleteMemoryNote(memoryButton.dataset.deleteMemory);
        AppState.setExpandedMemoryItem("");
      }
    });
  });
}

function bindSettingsEvents() {
  bindSettings();
}

