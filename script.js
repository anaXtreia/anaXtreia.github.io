const localeCache = {};
const localeButtons = document.querySelectorAll("[data-language]");

function readSavedLanguage() {
  try {
    const savedLanguage = localStorage.getItem("portfolio-language");
    return savedLanguage === "pt" ? "pt" : "en";
  } catch {
    return "en";
  }
}

async function loadLocale(language) {
  if (!localeCache[language]) {
    const response = await fetch(`locales/${language}.json`);
    if (!response.ok) throw new Error(`Could not load ${language} translations.`);
    localeCache[language] = await response.json();
  }
  return localeCache[language];
}

function getTranslation(dictionary, key) {
  return key.split(".").reduce((value, part) => value?.[part], dictionary);
}

function applyLocale(dictionary, language) {
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const translation = getTranslation(dictionary, element.dataset.i18n);
    if (typeof translation === "string") element.textContent = translation;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((entry) => {
      const [attribute, key] = entry.trim().split(":");
      const translation = getTranslation(dictionary, key);
      if (typeof translation === "string") element.setAttribute(attribute, translation);
    });
  });

  localeButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });

  document.querySelectorAll(".typewriter-line").forEach((line) => {
    line.style.setProperty("--type-steps", Array.from(line.textContent.trim()).length);
    line.style.animation = "none";
    void line.offsetWidth;
    line.style.animation = "";
  });
}

async function setLanguage(language) {
  try {
    const dictionary = await loadLocale(language);
    applyLocale(dictionary, language);
    try {
      localStorage.setItem("portfolio-language", language);
    } catch {
      // The language still changes for this visit when storage is unavailable.
    }
  } catch (error) {
    console.error(error);
  }
}

localeButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

setLanguage(readSavedLanguage());
