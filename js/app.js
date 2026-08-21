const translations = window.B2B_TRANSLATIONS;

const STORE_LINKS = Object.freeze({
  ios: "https://apps.apple.com/us/app/astana-finance-days-2026/id6784144524",
  android: "https://play.google.com/store/apps/details?id=ru.afd",
});

const LANGUAGE_STORAGE_KEY = "afd-b2b-language";
const supportedLanguages = new Set(Object.keys(translations));
const root = document.documentElement;
root.classList.add("has-js");

function detectDevice() {
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isiPadOS = platform === "MacIntel" && maxTouchPoints > 1;

  if (/android/i.test(userAgent)) return "android";
  if (/iPad|iPhone|iPod/i.test(userAgent) || isiPadOS) return "ios";
  return "desktop";
}

const device = detectDevice();

function getStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // The page still works when browser storage is blocked.
  }
}

function resolveInitialLanguage() {
  const queryLanguage = new URLSearchParams(window.location.search).get("lang");
  if (queryLanguage && supportedLanguages.has(queryLanguage)) return queryLanguage;

  const stored = getStoredLanguage();
  if (stored && supportedLanguages.has(stored)) return stored;

  const browserLanguage = (navigator.language || "ru").toLowerCase();
  if (browserLanguage.startsWith("kk") || browserLanguage.startsWith("kz")) return "kz";
  if (browserLanguage.startsWith("en")) return "en";
  return "ru";
}

let currentLanguage = resolveInitialLanguage();

function currentCopy() {
  return translations[currentLanguage] || translations.ru;
}

function updatePrimaryStoreLinks() {
  const copy = currentCopy();
  let href = "#download";
  let label = copy.primaryCtaFallback;
  let stickyLabel = copy.stickyCta;

  if (device === "ios") {
    href = STORE_LINKS.ios;
    label = copy.primaryCtaIos;
    stickyLabel = copy.stickyCtaIos;
  } else if (device === "android") {
    href = STORE_LINKS.android;
    label = copy.primaryCtaAndroid;
    stickyLabel = copy.stickyCtaAndroid;
  }

  document.querySelectorAll("[data-primary-store]").forEach((link) => {
    link.setAttribute("href", href);

    if (device === "desktop") {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    } else {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    }
  });

  document.querySelectorAll("[data-primary-store-label]").forEach((node) => {
    const isSticky = Boolean(node.closest("[data-sticky-cta]"));
    node.textContent = isSticky ? stickyLabel : label;
  });
}

function setLanguage(language, { persist = true } = {}) {
  if (!supportedLanguages.has(language)) return;

  currentLanguage = language;
  const copy = currentCopy();

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.dataset.i18n;
    if (key && Object.hasOwn(copy, key)) node.textContent = copy[key];
  });

  document.querySelectorAll("[data-i18n-content]").forEach((node) => {
    const key = node.dataset.i18nContent;
    if (key && Object.hasOwn(copy, key)) node.setAttribute("content", copy[key]);
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
    const key = node.dataset.i18nAlt;
    if (key && Object.hasOwn(copy, key)) node.setAttribute("alt", copy[key]);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    if (key && Object.hasOwn(copy, key)) node.setAttribute("aria-label", copy[key]);
  });

  document.querySelectorAll("[data-language]").forEach((button) => {
    const isActive = button.dataset.language === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  root.lang = language === "kz" ? "kk" : language;
  root.dataset.language = language;
  document.title = copy.metaTitle;
  updatePrimaryStoreLinks();

  if (persist) storeLanguage(language);
}

function initLanguageSwitcher() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language || "ru");
    });
  });

  setLanguage(currentLanguage, { persist: false });
}

function initSiteMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-site-menu]");
  const backdrop = document.querySelector("[data-menu-backdrop]");
  const closeButton = menu?.querySelector("[data-menu-close]");
  if (!toggle || !menu || !backdrop) return;

  let lastFocused = null;

  const isOpen = () => document.body.classList.contains("is-menu-open");

  const setMenuState = (open, { restoreFocus = true } = {}) => {
    if (open) {
      lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : toggle;
    }

    document.body.classList.toggle("is-menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    backdrop.setAttribute("aria-hidden", String(!open));
    menu.inert = !open;

    if (open) {
      requestAnimationFrame(() => closeButton?.focus());
    } else if (restoreFocus) {
      lastFocused?.focus();
    }
  };

  setMenuState(false, { restoreFocus: false });

  toggle.addEventListener("click", () => setMenuState(!isOpen()));
  closeButton?.addEventListener("click", () => setMenuState(false));
  backdrop.addEventListener("click", () => setMenuState(false));

  menu.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => setMenuState(false, { restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      setMenuState(false);
    }
  });
}

function initRevealAnimations() {
  const elements = [...document.querySelectorAll("[data-reveal]")];
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8%" },
  );

  elements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 70}ms`);
    observer.observe(element);
  });
}

function initStickyCta() {
  const sticky = document.querySelector("[data-sticky-cta]");
  const hero = document.querySelector("#hero");
  if (!sticky || !hero) return;

  if (!("IntersectionObserver" in window)) {
    const update = () => sticky.classList.toggle("is-visible", window.scrollY > hero.clientHeight * 0.55);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => sticky.classList.toggle("is-visible", !entry.isIntersecting),
    { threshold: 0.08, rootMargin: "-72px 0px 0px" },
  );
  observer.observe(hero);
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initMapDialog() {
  const mapDialog = document.querySelector("[data-map-dialog]");
  if (!mapDialog) return;

  const openButtons = [...document.querySelectorAll("[data-map-open]")];
  const closeButton = mapDialog.querySelector("[data-map-close]");
  let lastTrigger = null;

  const restorePageAfterClose = () => {
    document.body.classList.remove("is-map-open");
    lastTrigger?.focus();
  };

  const closeMap = () => {
    if (mapDialog.open && typeof mapDialog.close === "function") {
      mapDialog.close();
    } else {
      mapDialog.removeAttribute("open");
    }
    restorePageAfterClose();
  };

  const openMap = (trigger) => {
    lastTrigger = trigger;
    if (typeof mapDialog.showModal === "function") {
      mapDialog.showModal();
    } else {
      mapDialog.setAttribute("open", "");
    }
    document.body.classList.add("is-map-open");
  };

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openMap(button));
  });

  closeButton?.addEventListener("click", closeMap);

  mapDialog.addEventListener("click", (event) => {
    if (event.target === mapDialog) closeMap();
  });

  mapDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMap();
  });

  mapDialog.addEventListener("close", restorePageAfterClose);
}

function initGlassHighlights() {
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const glassElements = [...document.querySelectorAll(".liquid-glass")];

  const deactivateGlass = (element) => {
    if (!element) return;
    element.classList.remove("is-glass-active");
    element.style.removeProperty("--glass-x");
    element.style.removeProperty("--glass-y");
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      const hoveredGlass = event.target instanceof Element ? event.target.closest(".liquid-glass") : null;
      glassElements.forEach((element) => {
        if (element !== hoveredGlass && element.classList.contains("is-glass-active")) {
          deactivateGlass(element);
        }
      });
    },
    { capture: true, passive: true },
  );

  glassElements.forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.classList.add("is-glass-active");
      element.style.setProperty("--glass-x", `${x.toFixed(2)}%`);
      element.style.setProperty("--glass-y", `${y.toFixed(2)}%`);
    });

    element.addEventListener("pointerleave", () => {
      deactivateGlass(element);
    });
  });

  window.addEventListener("blur", () => glassElements.forEach(deactivateGlass));
}

initLanguageSwitcher();
initSiteMenu();
initRevealAnimations();
initStickyCta();
initSmoothAnchors();
initMapDialog();
initGlassHighlights();
