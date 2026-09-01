/* ================================================================
   Mohamed Tamaa Portfolio
   All interactions use native JavaScript with no external libraries.
   ================================================================ */

(() => {
  "use strict";

  /* ---------- Small helpers ---------- */
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const precisePointer = window.matchMedia("(pointer: fine)");

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* The portfolio still works when storage is unavailable. */
      }
    }
  };

  /* ---------- Loading screen ---------- */
  const loader = document.getElementById("loader");
  let loaderHidden = false;

  function hideLoader() {
    if (!loader || loaderHidden) return;
    loaderHidden = true;
    loader.classList.add("is_hidden");
    window.setTimeout(() => loader.remove(), 550);
  }

  window.addEventListener("load", () => window.setTimeout(hideLoader, 350), { once: true });
  window.setTimeout(hideLoader, 1800);

  /* ---------- Colour theme ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = storage.get("mohamedPortfolioTheme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  root.dataset.theme = savedTheme || preferredTheme;

  function updateThemeLabel() {
    if (!themeToggle) return;
    const isLight = root.dataset.theme === "light";
    const language = root.lang === "ar" ? "ar" : "en";
    themeToggle.setAttribute(
      "aria-label",
      language === "ar"
        ? isLight ? "استخدام الألوان الداكنة" : "استخدام الألوان الفاتحة"
        : isLight ? "Use dark colours" : "Use light colours"
    );
  }

  themeToggle?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    storage.set("mohamedPortfolioTheme", root.dataset.theme);
    updateThemeLabel();
  });

  /* ---------- Bilingual content ---------- */
  const languageToggle = document.getElementById("languageToggle");
  const languageLabel = document.getElementById("languageLabel");
  const translatableText = [...document.querySelectorAll("[data-en][data-ar]")];
  const placeholderFields = [...document.querySelectorAll("[data-placeholder-en][data-placeholder-ar]")];
  const ariaFields = [...document.querySelectorAll("[data-aria-en][data-aria-ar]")];
  const altImages = [...document.querySelectorAll("[data-alt-en][data-alt-ar]")];

  const pageMeta = {
    en: {
      title: "Mohamed Tamaa | WordPress Developer and SEO Specialist",
      description: "Portfolio of Mohamed Tamaa, a WordPress developer and SEO specialist creating bilingual, fast and conversion focused websites for clients across Egypt, Saudi Arabia and the UAE.",
      ogDescription: "Bilingual WordPress development, UI and UX, technical SEO, AEO, GEO and performance optimisation.",
      locale: "en_GB"
    },
    ar: {
      title: "محمد طماعة | مطور ووردبريس ومتخصص SEO",
      description: "معرض أعمال محمد طماعة، مطور ووردبريس ومتخصص SEO يصمم مواقع سريعة وثنائية اللغة ومهيأة للتحويل للعملاء في مصر والسعودية والإمارات.",
      ogDescription: "تطوير ووردبريس ثنائي اللغة وتجربة مستخدم وSEO تقني وAEO وGEO وتحسين الأداء.",
      locale: "ar_EG"
    }
  };

  let activeLanguage = storage.get("mohamedPortfolioLanguage") === "ar" ? "ar" : "en";
  let stopTyping = () => {};

  function setMeta(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute("content", value);
  }

  function applyLanguage(language, savePreference = true) {
    activeLanguage = language === "ar" ? "ar" : "en";
    const isArabic = activeLanguage === "ar";
    const key = isArabic ? "ar" : "en";

    root.lang = key;
    root.dir = isArabic ? "rtl" : "ltr";

    translatableText.forEach((element) => {
      element.textContent = element.dataset[key];
    });

    placeholderFields.forEach((field) => {
      field.setAttribute("placeholder", field.dataset[`placeholder${key === "ar" ? "Ar" : "En"}`]);
    });

    ariaFields.forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`aria${key === "ar" ? "Ar" : "En"}`]);
    });

    altImages.forEach((image) => {
      image.setAttribute("alt", image.dataset[`alt${key === "ar" ? "Ar" : "En"}`]);
    });

    document.title = pageMeta[key].title;
    setMeta('meta[name="description"]', pageMeta[key].description);
    setMeta('meta[property="og:title"]', pageMeta[key].title);
    setMeta('meta[property="og:description"]', pageMeta[key].ogDescription);
    setMeta('meta[property="og:locale"]', pageMeta[key].locale);

    if (languageLabel) languageLabel.textContent = isArabic ? "EN" : "العربية";
    if (languageToggle) {
      languageToggle.setAttribute("aria-pressed", String(isArabic));
      languageToggle.setAttribute("aria-label", isArabic ? "Switch to English" : "التبديل إلى العربية");
      const icon = languageToggle.querySelector(".language_icon");
      if (icon) icon.textContent = isArabic ? "EN" : "ع";
    }

    updateThemeLabel();
    stopTyping();
    stopTyping = startRoleTyping(activeLanguage);

    if (savePreference) storage.set("mohamedPortfolioLanguage", activeLanguage);
  }

  languageToggle?.addEventListener("click", () => {
    applyLanguage(activeLanguage === "en" ? "ar" : "en");
  });

  /* ---------- Animated role text ---------- */
  const typedRole = document.getElementById("typedRole");
  const rolePhrases = {
    en: [
      "WordPress development",
      "bilingual digital experiences",
      "technical SEO",
      "AEO and GEO visibility",
      "Core Web Vitals"
    ],
    ar: [
      "تطوير ووردبريس",
      "التجارب الرقمية ثنائية اللغة",
      "تحسين SEO التقني",
      "الظهور عبر AEO وGEO",
      "تحسين Core Web Vitals"
    ]
  };

  function startRoleTyping(language) {
    if (!typedRole) return () => {};

    if (reducedMotion.matches) {
      typedRole.textContent = rolePhrases[language][0];
      return () => {};
    }

    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let timer = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;

      const phrase = Array.from(rolePhrases[language][phraseIndex]);
      characterIndex += deleting ? -1 : 1;
      typedRole.textContent = phrase.slice(0, Math.max(characterIndex, 0)).join("");

      let delay = deleting ? 36 : 72;

      if (!deleting && characterIndex >= phrase.length) {
        deleting = true;
        delay = 1450;
      } else if (deleting && characterIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % rolePhrases[language].length;
        delay = 330;
      }

      timer = window.setTimeout(tick, delay);
    };

    typedRole.textContent = "";
    tick();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }

  /* Apply the saved language once all language helpers are ready. */
  applyLanguage(activeLanguage, false);

  /* ---------- Mobile navigation ---------- */
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  function setMenu(open) {
    if (!menuToggle || !mainNav) return;
    mainNav.classList.toggle("is_open", open);
    menuToggle.classList.toggle("is_open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu_open", open);
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(!mainNav?.classList.contains("is_open"));
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) setMenu(false);
  }, { passive: true });

  /* ---------- Scroll reveal and counters ---------- */
  const revealElements = [...document.querySelectorAll(".reveal")];
  const counters = [...document.querySelectorAll(".counter")];

  function animateCounter(counter) {
    if (counter.dataset.counted === "true") return;
    counter.dataset.counted = "true";

    const target = Number(counter.dataset.target) || 0;
    if (reducedMotion.matches) {
      counter.textContent = String(target);
      return;
    }

    const startTime = performance.now();
    const duration = 1100;

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is_visible");
        entry.target.querySelectorAll?.(".counter").forEach(animateCounter);
        if (entry.target.classList.contains("counter")) animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is_visible"));
    counters.forEach(animateCounter);
  }

  /* Hero counters are nested inside one reveal block. */
  const heroMeta = document.querySelector(".hero_meta");
  if (heroMeta && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      counters.forEach(animateCounter);
      observer.disconnect();
    }, { threshold: 0.45 });
    counterObserver.observe(heroMeta);
  }

  /* ---------- Header state, progress and back to top ---------- */
  const siteHeader = document.getElementById("siteHeader");
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");
  let scrollFrame = 0;

  function updateScrollUI() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0;

    siteHeader?.classList.toggle("is_scrolled", scrollTop > 18);
    backToTop?.classList.toggle("is_visible", scrollTop > 700);
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;
    scrollFrame = 0;
  }

  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(updateScrollUI);
  }, { passive: true });

  updateScrollUI();
  backToTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" }));

  /* ---------- Active section in navigation ---------- */
  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".main_nav a[href^='#']")];

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is_active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -58%", threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- FAQ accordion ---------- */
  const accordionItems = [...document.querySelectorAll(".accordion_item")];

  accordionItems.forEach((item) => {
    const trigger = item.querySelector(".accordion_trigger");
    trigger?.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is_open");

      accordionItems.forEach((otherItem) => {
        otherItem.classList.remove("is_open");
        otherItem.querySelector(".accordion_trigger")?.setAttribute("aria-expanded", "false");
      });

      item.classList.toggle("is_open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  /* ---------- Static contact form ---------- */
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("contactName")?.value.trim() || "";
    const email = document.getElementById("contactEmail")?.value.trim() || "";
    const serviceField = document.getElementById("contactService");
    const service = serviceField?.value || "Website project";
    const message = document.getElementById("contactMessage")?.value.trim() || "";

    if (!name || !email || !message) {
      if (formStatus) {
        formStatus.textContent = activeLanguage === "ar"
          ? "يرجى استكمال البيانات المطلوبة."
          : "Please complete the required details.";
      }
      return;
    }

    const subject = `Portfolio enquiry: ${service}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Service: ${service}`,
      "",
      message
    ].join("\n");

    if (formStatus) {
      formStatus.textContent = activeLanguage === "ar"
        ? "تم تجهيز الرسالة. سيفتح تطبيق البريد الآن."
        : "Your message is ready. Opening your email app now.";
    }

    window.location.href = `mailto:mtamaaa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  /* ---------- Pointer glow ---------- */
  const pointerGlow = document.getElementById("pointerGlow");
  if (pointerGlow && precisePointer.matches && !reducedMotion.matches) {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerGlow.classList.add("is_visible");

      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerGlow.style.transform = `translate3d(${pointerX - 210}px, ${pointerY - 210}px, 0)`;
        pointerFrame = 0;
      });
    }, { passive: true });

    document.addEventListener("mouseleave", () => pointerGlow.classList.remove("is_visible"));
  }

  /* ---------- Subtle project card tilt ---------- */
  if (precisePointer.matches && !reducedMotion.matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(1200px) rotateX(${y * -2.2}deg) rotateY(${x * 2.2}deg) translateY(-2px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });

    /* Magnetic movement is deliberately small to keep controls precise. */
    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        button.style.transform = `translate(${x * 0.06}px, ${y * 0.08}px)`;
      });

      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  /* ---------- Automatic footer year ---------- */
  const currentYear = document.getElementById("currentYear");
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
})();
