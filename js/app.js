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

  return "en";
}

let currentLanguage = resolveInitialLanguage();

function currentCopy() {
  return translations[currentLanguage] || translations.en;
}

function updateAfdLocalizedLinks(language) {
  const locale = language === "kz" ? "kz" : language;
  const base = `https://astanafindays.org/${locale}`;
  const routes = Object.freeze({
    home: `${base}`,
    about: `${base}#about`,
    programme: `${base}/programme`,
    speakers: `${base}/speakers`,
    partners: `${base}#partners`,
    exhibition: `${base}#exhibition`,
    news: `${base}#news`,
    travel: `${base}/travel`,
    register: `${base}/register`,
    faq: `${base}/faq`,
    terms: `${base}/terms`,
    privacy: `${base}/privacy`,
  });

  document.querySelectorAll("[data-afd-route]").forEach((link) => {
    const route = link.dataset.afdRoute || "home";
    if (Object.hasOwn(routes, route)) link.setAttribute("href", routes[route]);
  });
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

  document.querySelectorAll("[data-i18n-title]").forEach((node) => {
    const key = node.dataset.i18nTitle;
    if (key && Object.hasOwn(copy, key)) node.setAttribute("title", copy[key]);
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
  updateAfdLocalizedLinks(language);

  if (persist) storeLanguage(language);
  document.dispatchEvent(new CustomEvent("b2b:languagechange", { detail: { language } }));
}

function initLanguageSwitcher() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language || "en");
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

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener("click", () => setMenuState(false, { restoreFocus: false }));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) {
      event.preventDefault();
      setMenuState(false);
    }
  });
}

function initAfdHeaderState() {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  let frameRequested = false;

  const update = () => {
    const scrollTop = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0);
    const progress = Math.min(scrollTop / 150, 1);

    header.classList.toggle("is-scrolled", scrollTop > 42);
    header.style.setProperty("--brand-scale", (1 - progress * 0.045).toFixed(3));
    header.style.setProperty("--nav-scale", (1 - progress * 0.018).toFixed(3));
    frameRequested = false;
  };

  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate, { passive: true });
  window.addEventListener("pageshow", update);
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
  const venue = document.querySelector("#venue");
  const download = document.querySelector("#download");
  const footer = document.querySelector("footer");
  if (!sticky || !hero) return;

  const state = {
    heroVisible: true,
    venueVisible: false,
    downloadVisible: false,
    footerVisible: false,
  };

  const render = () => {
    sticky.classList.toggle(
      "is-visible",
      !state.heroVisible && !state.venueVisible && !state.downloadVisible && !state.footerVisible,
    );
  };

  if (!("IntersectionObserver" in window)) {
    const update = () => {
      const venueRect = venue?.getBoundingClientRect();
      const downloadRect = download?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      state.heroVisible = window.scrollY <= hero.clientHeight * 0.55;
      state.venueVisible = Boolean(
        venueRect && venueRect.top < window.innerHeight && venueRect.bottom > 0,
      );
      state.downloadVisible = Boolean(
        downloadRect && downloadRect.top < window.innerHeight && downloadRect.bottom > 0,
      );
      state.footerVisible = Boolean(
        footerRect && footerRect.top < window.innerHeight && footerRect.bottom > 0,
      );
      render();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return;
  }

  const heroObserver = new IntersectionObserver(
    ([entry]) => {
      state.heroVisible = entry.isIntersecting;
      render();
    },
    { threshold: 0.08, rootMargin: "-72px 0px 0px" },
  );
  heroObserver.observe(hero);

  if (venue) {
    const venueObserver = new IntersectionObserver(
      ([entry]) => {
        state.venueVisible = entry.isIntersecting;
        render();
      },
      { threshold: 0.04 },
    );
    venueObserver.observe(venue);
  }

  if (download) {
    const downloadObserver = new IntersectionObserver(
      ([entry]) => {
        state.downloadVisible = entry.isIntersecting;
        render();
      },
      { threshold: 0.08 },
    );
    downloadObserver.observe(download);
  }

  if (footer) {
    const footerObserver = new IntersectionObserver(
      ([entry]) => {
        state.footerVisible = entry.isIntersecting;
        render();
      },
      { threshold: 0.02 },
    );
    footerObserver.observe(footer);
  }
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

function initVenueTabs() {
  const locator = document.querySelector("[data-venue-locator]");
  if (!locator) return;

  const tabs = [...locator.querySelectorAll("[data-venue-tab]")];
  const panels = [...locator.querySelectorAll("[data-venue-panel]")];
  if (!tabs.length || !panels.length) return;

  const activate = (name, { focus = false } = {}) => {
    tabs.forEach((tab) => {
      const isActive = tab.dataset.venueTab === name;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle("is-active", isActive);
      if (isActive && focus) tab.focus();
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.venuePanel === name;
      panel.hidden = !isActive;
      panel.classList.toggle("is-active", isActive);
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.venueTab || "google"));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      activate(tabs[nextIndex].dataset.venueTab || "google", { focus: true });
    });
  });

  const initial = tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0];
  activate(initial.dataset.venueTab || "google");
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

function initPhotoCarousel() {
  const carousels = [...document.querySelectorAll("[data-photo-carousel]")];
  if (!carousels.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTO_DELAY = 5200;

  carousels.forEach((carousel) => {
    const slides = [...carousel.querySelectorAll("[data-carousel-slide]")];
    const dots = [...carousel.querySelectorAll("[data-carousel-dot]")];
    const previousButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const currentNode = carousel.querySelector("[data-carousel-current]");
    const statusNode = carousel.querySelector("[data-carousel-status]");
    if (slides.length < 2) return;

    let activeIndex = Math.max(
      0,
      slides.findIndex((slide) => slide.classList.contains("is-active")),
    );
    let timerId = null;
    let touchStartX = null;
    let pausedByInteraction = false;

    const formatCopy = (template, values) =>
      Object.entries(values).reduce(
        (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
        template,
      );

    const updateAccessibleCopy = () => {
      const copy = currentCopy();
      const current = activeIndex + 1;
      const total = slides.length;
      if (statusNode) {
        statusNode.textContent = formatCopy(copy.carouselStatus, { current, total });
      }
      dots.forEach((dot, index) => {
        dot.setAttribute(
          "aria-label",
          formatCopy(copy.carouselGoToLabel, { current: index + 1, total }),
        );
      });
    };

    const render = (nextIndex, { announce = true } = {}) => {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
        dot.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      if (currentNode) currentNode.textContent = String(activeIndex + 1).padStart(2, "0");
      if (announce) updateAccessibleCopy();
    };

    const stopAutoplay = () => {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion.matches || pausedByInteraction || document.hidden) return;
      timerId = window.setInterval(() => render(activeIndex + 1, { announce: false }), AUTO_DELAY);
    };

    const goTo = (index) => {
      render(index);
      startAutoplay();
    };

    previousButton?.addEventListener("click", () => goTo(activeIndex - 1));
    nextButton?.addEventListener("click", () => goTo(activeIndex + 1));

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goTo(index));
      dot.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const targetIndex = (index + direction + dots.length) % dots.length;
        dots[targetIndex]?.focus();
        goTo(targetIndex);
      });
    });

    carousel.addEventListener("pointerenter", () => {
      pausedByInteraction = true;
      stopAutoplay();
    });

    carousel.addEventListener("pointerleave", () => {
      pausedByInteraction = false;
      startAutoplay();
    });

    carousel.addEventListener("focusin", () => {
      pausedByInteraction = true;
      stopAutoplay();
    });

    carousel.addEventListener("focusout", (event) => {
      if (event.relatedTarget instanceof Node && carousel.contains(event.relatedTarget)) return;
      pausedByInteraction = false;
      startAutoplay();
    });

    carousel.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0]?.clientX ?? null;
      },
      { passive: true },
    );

    carousel.addEventListener(
      "touchend",
      (event) => {
        if (touchStartX === null) return;
        const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
        const delta = touchEndX - touchStartX;
        touchStartX = null;
        if (Math.abs(delta) < 42) return;
        goTo(activeIndex + (delta < 0 ? 1 : -1));
      },
      { passive: true },
    );

    document.addEventListener("visibilitychange", startAutoplay);
    document.addEventListener("b2b:languagechange", updateAccessibleCopy);

    if (typeof reducedMotion.addEventListener === "function") {
      reducedMotion.addEventListener("change", startAutoplay);
    } else if (typeof reducedMotion.addListener === "function") {
      reducedMotion.addListener(startAutoplay);
    }

    render(activeIndex, { announce: false });
    updateAccessibleCopy();
    startAutoplay();
  });
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
initAfdHeaderState();
initRevealAnimations();
initStickyCta();
initSmoothAnchors();
initVenueTabs();
initMapDialog();
initPhotoCarousel();
initGlassHighlights();
