function bindSettings() {
  if (!DOM.settingsLayout) return;

  syncSettingsControls();

  DOM.settingsLayout.querySelectorAll("[data-setting]").forEach((control) => {
    const key = control.dataset.setting;
    if (!(key in AppState.settings)) return;

    control.addEventListener("change", () => {
      saveAndSetSettings({
        ...AppState.settings,
        [key]: control.type === "checkbox" ? control.checked : control.value,
      });
      if (key === "weekStart") AppState.setSelectedDate(toISODate(getVisibleWeekStart()));
    });
  });

  DOM.exportDataButton?.addEventListener("click", exportData);
}

function syncSettingsControls() {
  if (!DOM.settingsLayout) return;

  DOM.settingsLayout.querySelectorAll("[data-setting]").forEach((control) => {
    const key = control.dataset.setting;
    if (!(key in AppState.settings)) return;

    if (control.type === "checkbox") {
      control.checked = Boolean(AppState.settings[key]);
    } else {
      control.value = AppState.settings[key];
    }
  });
}

function applySettings() {
  const palette = accentPalettes[AppState.settings.accent] || accentPalettes.Teal;
  document.documentElement.style.setProperty("--mint", palette.mint);
  document.documentElement.style.setProperty("--accent-rgb", palette.glow);

  document.body.classList.toggle("theme-light", AppState.settings.theme === "Licht");
  document.body.classList.toggle("animations-off", AppState.settings.animations === "Uit");
  document.body.classList.toggle("animations-subtle", AppState.settings.animations === "Subtiel");
  document.body.classList.toggle("compact-mode", Boolean(AppState.settings.compact));
  document.body.classList.toggle("calm-mode", Boolean(AppState.settings.calmMode));
}

function exportData() {
  const payload = {
    app: "Restructure",
    exportedAt: new Date().toISOString(),
    settings: AppState.settings,
    appointments: AppState.appointments,
    dayItems: AppState.dayItems,
    rememberItems: AppState.rememberItems,
    memoryNotes: AppState.memoryNotes,
    brainEntries: AppState.brainEntries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `restructure-backup-${toISODate(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

