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
      addProposal.closest(".appointment-proposal")?.classList.add("is-added");
      addProposal.closest(".proposal-actions").innerHTML = `<span class="quiet-note">${t("addedAgenda")}</span>`;
      return;
    }

    if (dismissProposal) {
      dismissProposal.closest(".appointment-proposal")?.remove();
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
  DOM.appointmentForm.addEventListener("submit", (event) => {
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
    moveWeek(-1);
  });

  DOM.nextWeek.addEventListener("click", () => {
    moveWeek(1);
  });

  DOM.todayShortcut?.addEventListener("click", () => {
    AppState.setCurrentWeekOffset(0);
    AppState.setSelectedDate(toISODate(new Date()));
    DOM.selectedDayPanel?.classList.remove("adding");
    animateWeekChange();
  });

  DOM.addDayToggle?.addEventListener("click", () => {
    DOM.selectedDayPanel?.classList.toggle("adding");
    if (DOM.selectedDayPanel?.classList.contains("adding")) DOM.quickEntryInput.focus();
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
    moveWeek(intent > 0 ? 1 : -1);
  }, { passive: false });

  DOM.planningGrid.addEventListener("touchstart", (event) => {
    touchStartX = event.touches[0]?.clientX || 0;
  }, { passive: true });

  DOM.planningGrid.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0]?.clientX || touchStartX;
    const diff = touchStartX - endX;
    if (Math.abs(diff) < 48) return;
    moveWeek(diff > 0 ? 1 : -1);
  }, { passive: true });

  DOM.planningGrid.addEventListener("click", (event) => {
    const day = event.target.closest("[data-date]");
    if (!day) return;
    DOM.selectedDayPanel?.classList.remove("adding");
    AppState.setSelectedDate(day.dataset.date);
  });

  DOM.planningGrid.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const day = event.target.closest("[data-date]");
    if (!day) return;
    event.preventDefault();
    DOM.selectedDayPanel?.classList.remove("adding");
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

  DOM.personalAppointmentList.addEventListener("click", (event) => {
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
    if (isMobileAgenda()) DOM.selectedDayPanel?.classList.remove("adding");
  });

  DOM.enableReminders.addEventListener("click", async () => {
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
}

function isMobileAgenda() {
  return window.matchMedia("(max-width: 768px)").matches;
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

