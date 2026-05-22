const languageScriptElement =
  document.currentScript || document.querySelector('script[src*="lang/script.js"]');
const languageBaseUrl = languageScriptElement
  ? new URL(".", languageScriptElement.src)
  : new URL("../lang/", window.location.href);

const languageFiles = {
  pt: "pt-br/pt-br.json",
  es: "es/es.json",
};

const defaultTexts = new Map();

function cacheDefaultTexts() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (key && !defaultTexts.has(key)) {
      defaultTexts.set(key, el.textContent);
    }
  });
}

function applyTranslations(translations) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (!key) {
      return;
    }

    if (translations[key] !== undefined) {
      el.textContent = translations[key];
      return;
    }

    if (defaultTexts.has(key)) {
      el.textContent = defaultTexts.get(key);
    }
  });
}

async function setLanguage(lang) {
  cacheDefaultTexts();

  if (lang === "en") {
    applyTranslations({});
    localStorage.setItem("lang", lang);
    return;
  }

  const filePath = languageFiles[lang];
  if (!filePath) {
    return;
  }

  try {
    const fileUrl = new URL(filePath, languageBaseUrl);
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(`Could not load translations: ${fileUrl}`);
    }

    const translations = await res.json();
    applyTranslations(translations);
    localStorage.setItem("lang", lang);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cacheDefaultTexts();
  const savedLanguage = localStorage.getItem("lang");
  if (savedLanguage) {
    setLanguage(savedLanguage);
  }
});
