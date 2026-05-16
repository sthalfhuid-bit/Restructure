function showPage(pageId) {
  DOM.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.page === pageId));
  DOM.pages.forEach((page) => page.classList.toggle("active", page.id === pageId));
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
  const conjunction = getLanguageCode() === "en" ? "and" : "en";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ${conjunction} ${items.at(-1)}`;
}

function addUnique(bucket, text, score, event = null) {
  const key = normalizeForDuplicate(text);
  const existing = bucket.find((item) => normalizeForDuplicate(item.text) === key);

  if (existing) {
    existing.score = Math.max(existing.score, score);
    if (event) existing.event = event;
    return;
  }

  bucket.push({ text: softenItem(text), score, event });
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

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatReminderLabels(reminders = []) {
  if (!reminders.length) return getLanguageCode() === "en" ? "no reminder" : "geen herinnering";
  const labels = reminders.map(reminderLabel);
  return `${getLanguageCode() === "en" ? "Reminder" : "Herinnering"}: ${joinDutch(labels)}`;
}

function reminderLabel(reminder) {
  return {
    "": t("noReminder").toLowerCase(),
    "at-time": t("atTime").toLowerCase(),
    "10-min": t("tenBefore").toLowerCase(),
    "30-min": t("thirtyBefore").toLowerCase(),
    "1-hour": t("hourBefore").toLowerCase(),
    "1-day": t("dayBefore").toLowerCase(),
    tomorrow: getLanguageCode() === "en" ? "tomorrow" : "morgen herinneren",
    hour: t("hourBefore").toLowerCase(),
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
  if (!AppState.settings.notifications) return;
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

  if (DOM.appointmentFeedback) {
    DOM.appointmentFeedback.textContent =
      getLanguageCode() === "en"
        ? `Calm reminder: ${due[0].event.title} is planned for ${formatEventLine(due[0].event)}.`
        : `Rustige herinnering: ${due[0].event.title} staat gepland op ${formatEventLine(due[0].event)}.`;
  }
  maybeNotify(due[0].event);
}

function maybeNotify(event) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(getLanguageCode() === "en" ? "Restructure reminder" : "Restructure herinnering", {
    body: getLanguageCode() === "en" ? `${event.title} is planned for ${formatEventLine(event)}.` : `${event.title} staat gepland op ${formatEventLine(event)}.`,
  });
}

function getDayContextText({ includeGreeting = false } = {}) {
  const now = new Date();
  const locale = getLanguageCode() === "en" ? "en-US" : "nl-NL";
  const weekday = capitalizeFirst(now.toLocaleDateString(locale, { weekday: "long" }));
  const date = now.toLocaleDateString(locale, { day: "numeric", month: "long" });
  const dayText = `${weekday} • ${date}`;
  return includeGreeting ? `${getTimeGreeting(now)} • ${dayText}` : dayText;
}

function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (getLanguageCode() === "en") {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }
  if (hour < 12) return "Goedemorgen";
  if (hour < 18) return "Goedemiddag";
  return "Goedenavond";
}

function capitalizeFirst(text) {
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
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
    .replace(/^(ik\s+)?(moet|wil|ga|kan|zal)\s+/i, "")
    .replace(/^(nog|vandaag|morgen|eerst)\s+/i, "")
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
  const words = DOM.dumpInput.value.trim().split(/\s+/).filter(Boolean).length;
  DOM.wordCount.textContent = `${words} ${words === 1 ? "woord" : "woorden"}`;
}

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

  const item = button.closest(".remember-situation, .memory-result, .day-detail-item, .appointment-list-item, .saved-input-item, .overview-item, .appointment-proposal");
  item?.classList.add("is-removing");
  window.setTimeout(onConfirm, 180);
}

