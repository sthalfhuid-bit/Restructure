function bindHelpEvents() {
  if (!DOM.helpQuestionForm || !DOM.helpQuestionInput || !DOM.helpAnswer) return;

  DOM.helpQuestionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = DOM.helpQuestionInput.value.trim();
    DOM.helpAnswer.innerHTML = `<p>${escapeHtml(getHelpAnswer(question))}</p>`;
  });
}

function getHelpAnswer(question) {
  const normalized = normalize(question || "");

  if (!normalized) {
    return getLanguageCode() === "en"
      ? "Type a short question, for example where to save appointments or things."
      : "Typ gerust een korte vraag, bijvoorbeeld waar je afspraken of spullen bewaart.";
  }

  if (hasAny(normalized, ["begin", "start", "waar moet ik", "hoe gebruik", "how", "use"])) {
    return getLanguageCode() === "en"
      ? "Start with Brain Dump. Write down what needs attention and then tap Create overview."
      : "Begin bij Brain Dump. Schrijf alles op wat aandacht vraagt en klik daarna op Maak overzicht.";
  }

  if (hasAny(normalized, ["brain dump", "overzicht", "overview", "verschil", "difference"])) {
    return getLanguageCode() === "en"
      ? "Brain Dump is for getting things out of your head. Overview turns that into calm groups."
      : "Brain Dump is om alles snel uit je hoofd te zetten. Overzicht maakt daar rustige groepjes van.";
  }

  if (hasAny(normalized, ["planner", "vandaag", "today", "focus", "belangrijk", "important"])) {
    return getLanguageCode() === "en"
      ? "AI Planner mainly shows what is relevant today: focus points, appointments and calm suggestions."
      : "AI Planner laat vooral zien wat vandaag relevant is: focuspunten, afspraken en rustige suggesties.";
  }

  if (hasAny(normalized, ["agenda", "afspraak", "afspraken", "appointment", "planning", "toevoegen", "add"])) {
    return getLanguageCode() === "en"
      ? "You can add appointments in Agenda, or let Brain Dump recognize them."
      : "Afspraken kun je toevoegen in Agenda of laten herkennen vanuit Brain Dump.";
  }

  if (hasAny(normalized, ["spullen", "mijn spullen", "things", "forget", "vergeten", "waar ligt", "locatie", "location", "sleutels", "keys", "oplader", "charger"])) {
    return getLanguageCode() === "en"
      ? "Use My Things for things you want to remember, like keys, charger, cards or documents."
      : "Gebruik Mijn spullen voor dingen die je wilt onthouden, zoals sleutels, oplader, pasjes of documenten.";
  }

  if (hasAny(normalized, ["verwijder", "verwijderen", "delete", "remove", "weg", "privacy", "controle", "control"])) {
    return getLanguageCode() === "en"
      ? "You stay in control. Saved items can be deleted by you; Restructure does not remove things by itself."
      : "Jij houdt controle. Opgeslagen items kun je zelf verwijderen; Restructure verwijdert niets zomaar.";
  }

  if (hasAny(normalized, ["instelling", "instellingen", "settings", "thema", "theme", "kleur", "color", "meldingen", "notifications"])) {
    return getLanguageCode() === "en"
      ? "In Settings you adjust theme, notifications, AI help, agenda and calm mode."
      : "In Instellingen pas je thema, meldingen, AI-hulp, agenda en rustmodus aan.";
  }

  return getLanguageCode() === "en"
    ? "In short: Brain Dump collects, Overview organizes, AI Planner helps today, Agenda plans and My Things remembers."
    : "Kort gezegd: Brain Dump verzamelt, Overzicht ordent, AI Planner helpt vandaag, Agenda plant en Mijn spullen onthoudt.";
}
