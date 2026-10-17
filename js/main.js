"use strict";

const root = document.documentElement;
const navigation = document.querySelector(".navigation");
const menuButton = document.querySelector(".menu-toggle");
const themeButton = document.querySelector(".theme-toggle");
const themeIcon = themeButton.querySelector("img");
const languageButtons = document.querySelectorAll(".language-button");
const mobileScreen = window.matchMedia("(max-width: 767px)");
const systemDarkTheme = window.matchMedia("(prefers-color-scheme: dark)");

let currentLanguage = "ru";
let selectedTheme = readPreference("fakla-theme");

function readPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
  }
}

function translatePage() {
  const texts = translations[currentLanguage];

  document.querySelectorAll("[data-i18n]").forEach(function (element) {
    element.textContent = texts[element.dataset.i18n];
  });

  ["aria-label", "title", "content"].forEach(function (attribute) {
    const dataAttribute = "data-i18n-" + attribute;

    document.querySelectorAll("[" + dataAttribute + "]").forEach(function (element) {
      const key = element.getAttribute(dataAttribute);
      element.setAttribute(attribute, texts[key]);
    });
  });
}

function setLanguage(language, save = false) {
  currentLanguage = language === "en" ? "en" : "ru";
  root.lang = currentLanguage;
  translatePage();

  languageButtons.forEach(function (button) {
    const isCurrent = button.dataset.language === currentLanguage;
    button.classList.toggle("is-current", isCurrent);
    button.setAttribute("aria-pressed", String(isCurrent));
  });

  if (save) {
    savePreference("fakla-language", currentLanguage);
  }
}

function updateButtonLabel(button, key) {
  const label = translations[currentLanguage][key];
  button.dataset.i18nAriaLabel = key;
  button.dataset.i18nTitle = key;
  button.setAttribute("aria-label", label);
  button.title = label;
}

function setTheme(theme, save = false) {
  root.dataset.theme = theme;
  themeIcon.src = theme === "dark" ? "assets/sun.svg" : "assets/moon.svg";
  updateButtonLabel(themeButton, theme === "dark" ? "themeToLight" : "themeToDark");

  const background = getComputedStyle(root).getPropertyValue("--color-background").trim();
  document.querySelector('meta[name="theme-color"]').content = background;

  if (save) {
    selectedTheme = theme;
    savePreference("fakla-theme", theme);
  }
}

function setMenuOpen(isOpen) {
  navigation.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
  updateButtonLabel(menuButton, isOpen ? "menuClose" : "menuOpen");
}

function closeMenu() {
  setMenuOpen(false);
}

function updateMenuForScreen() {
  const buttonHadFocus = document.activeElement === menuButton;
  closeMenu();
  menuButton.hidden = !mobileScreen.matches;

  if (buttonHadFocus && !mobileScreen.matches) {
    navigation.querySelector("a").focus();
  }
}

function handleEscape(event) {
  if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menuButton.focus();
  }
}

function handleAnchorClick(event) {
  if (event.target.closest('a[href^="#"]')) {
    closeMenu();
  }
}

function handleSystemThemeChange(event) {
  if (selectedTheme === null) {
    setTheme(event.matches ? "dark" : "light");
  }
}

function setupEventListeners() {
  languageButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setLanguage(button.dataset.language, true);
    });
  });

  themeButton.addEventListener("click", function () {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  menuButton.addEventListener("click", function (event) {
    const isOpen = menuButton.getAttribute("aria-expanded") !== "true";
    setMenuOpen(isOpen);

    // Кнопка стоит после ссылок в HTML: при открытии с клавиатуры ведём фокус к ним.
    if (isOpen && event.detail === 0) {
      navigation.querySelector("a").focus();
    }
  });

  document.addEventListener("keydown", handleEscape);
  document.addEventListener("click", handleAnchorClick);
  mobileScreen.addEventListener("change", updateMenuForScreen);
  systemDarkTheme.addEventListener("change", handleSystemThemeChange);
}

function initializeSite() {
  if (selectedTheme !== "dark" && selectedTheme !== "light") {
    selectedTheme = null;
  }

  setLanguage(readPreference("fakla-language"));
  setTheme(selectedTheme || (systemDarkTheme.matches ? "dark" : "light"));
  setupEventListeners();
  root.classList.add("js-ready");
  updateMenuForScreen();

  languageButtons.forEach(function (button) {
    button.disabled = false;
  });
  themeButton.disabled = false;

  requestAnimationFrame(function () {
    root.classList.add("theme-ready");
  });
}

initializeSite();
