// Portfolio Application Logic
document.addEventListener("DOMContentLoaded", () => {
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navLinks = document.querySelectorAll(".nav-link");
  const header = document.querySelector(".header");

  // Dynamic Scroll Squish: Intro section squishes from full-screen to compact size as you scroll down
  const introTrack = document.getElementById("intro-track");
  const introSection = document.getElementById("intro");
  const introContent = document.querySelector(".intro-content");
  const scrollHint = document.querySelector(".scroll-hint");

  // Vertical Dot Slider Navigation Elements
  const dotNav = document.getElementById("dot-nav");
  const dotTrack = document.getElementById("dot-track");
  const dotItems = document.querySelectorAll(".dot-item");

  let currentActiveSection = null;
  let activeDotSection = "intro";
  let dotFadeTimer = null;
  let isSlidingDots = false;
  let lockActiveSectionUntil = 0;

  let ticking = false;
  let isNavigatingViaLogo = false;
  let logoArrivalTimer = null;
  let onLogoScrollArrival = null;

  let stableViewportHeight = window.innerHeight;
  let lastWindowWidth = window.innerWidth;
  let cachedMetrics = null;

  function updateStableViewportCss() {
    document.documentElement.style.setProperty("--stable-vh", `${stableViewportHeight}px`);
  }
  updateStableViewportCss();

  function calculateSquishMetrics() {
    const headerHeight = header ? header.offsetHeight : 65;
    const fullHeight = Math.max(300, stableViewportHeight - headerHeight);
    // Compact size reflects natural content height
    const naturalContentHeight = introContent ? introContent.offsetHeight : 190;
    const compactHeight = Math.max(220, naturalContentHeight + 80);
    const squishDistance = Math.max(80, fullHeight - compactHeight);
    cachedMetrics = { headerHeight, fullHeight, compactHeight, squishDistance };
    if (introTrack) {
      introTrack.style.height = `${fullHeight}px`;
    }
    return cachedMetrics;
  }

  function getSquishMetrics() {
    if (!cachedMetrics) {
      return calculateSquishMetrics();
    }
    return cachedMetrics;
  }

  function triggerHeroFadeIn() {
    if (!introContent) return;
    introContent.classList.remove("fade-in");
    // Trigger DOM reflow so restarting the class replays the animation
    void introContent.offsetWidth;
    introContent.classList.add("fade-in");
  }

  // Trigger hero text & buttons fade-in on initial page load
  triggerHeroFadeIn();

  // Dot Selection Appearance Controller (750ms clean fade)
  function showDotSelection(sectionId, autoFade = true) {
    if (!sectionId) return;
    activeDotSection = sectionId;

    if (dotFadeTimer) {
      clearTimeout(dotFadeTimer);
      dotFadeTimer = null;
    }

    if (dotNav) {
      dotNav.classList.add("is-interacting");
    }

    dotItems.forEach((item) => {
      const isMatch = item.dataset.section === sectionId;
      if (isMatch) {
        item.classList.add("active");
        item.classList.add("show-label");
      } else {
        item.classList.remove("active");
        item.classList.remove("show-label");
      }
    });

    if (autoFade) {
      dotFadeTimer = setTimeout(() => {
        dotItems.forEach((item) => {
          item.classList.remove("show-label");
        });
        if (dotNav) {
          dotNav.classList.remove("is-interacting");
        }
        dotFadeTimer = null;
      }, 750);
    }
  }

  // Unified Active Section State Setter (prevents unnecessary re-triggers)
  function setActiveSection(id, forceUpdate = false) {
    if (!id) return;
    if (!forceUpdate && id === currentActiveSection) {
      return;
    }
    currentActiveSection = id;

    // 1. Update Header Navigation Links
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === `#${id}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // 2. Update Vertical Dot Slider (reveals label with auto-fade when navigating)
    if (!isSlidingDots) {
      showDotSelection(id, true);
    }
  }

  // Smooth Geometry-Based Section Detection
  function determineActiveSection() {
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const viewportHeight = stableViewportHeight;
    const docHeight = document.documentElement.scrollHeight;
    const headerHeight = header ? header.offsetHeight : 65;

    // 1. Top of page: always Intro
    if (scrollY <= 60) {
      return "intro";
    }

    // 2. Bottom of page reached: always the last section (Contact)
    if (viewportHeight + scrollY >= docHeight - 45) {
      return "contact";
    }

    // 3. Focal line: the natural line of visual focus (~35% down viewport, below sticky header)
    const focalLine = headerHeight + Math.min(280, (viewportHeight - headerHeight) * 0.35);

    let focalId = null;
    let minDistance = Infinity;
    let fallbackId = null;

    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i];
      const id = sec.getAttribute("id");
      if (!id) continue;

      let rect;
      if (id === "intro" && introTrack) {
        rect = introTrack.getBoundingClientRect();
      } else {
        rect = sec.getBoundingClientRect();
      }

      // Check if section contains focal line (with 1px subpixel tolerance)
      if (rect.top <= focalLine + 1 && rect.bottom >= focalLine - 1) {
        focalId = id;
        break;
      }

      // Calculate distance to focalLine for fallback
      let dist = 0;
      if (rect.top > focalLine) {
        dist = rect.top - focalLine;
      } else if (focalLine > rect.bottom) {
        dist = focalLine - rect.bottom;
      }
      if (dist < minDistance) {
        minDistance = dist;
        fallbackId = id;
      }
    }

    return focalId || fallbackId || "intro";
  }

  function updateActiveSectionOnScroll() {
    if (isNavigatingViaLogo || isSlidingDots) return;
    if (Date.now() < lockActiveSectionUntil) return;

    const activeId = determineActiveSection();
    setActiveSection(activeId, false);
  }

  function updateSquish() {
    if (!introTrack || !introSection) return;

    const { fullHeight, compactHeight, squishDistance } = getSquishMetrics();

    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (isNavigatingViaLogo) {
      // While returning to the top via the portfolio logo, keep intro section visible & expanded
      introSection.style.height = `${fullHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";
      if (scrollHint) {
        scrollHint.style.opacity = "1";
        scrollHint.style.visibility = "visible";
        scrollHint.style.pointerEvents = "auto";
      }
      return;
    }

    if (scrollY <= 0) {
      introSection.style.height = `${fullHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";
      if (scrollHint) {
        scrollHint.style.opacity = "1";
        scrollHint.style.visibility = "visible";
        scrollHint.style.pointerEvents = "auto";
      }
    } else if (scrollY >= squishDistance) {
      introSection.style.height = `${compactHeight}px`;

      // Starts to fade as the top collides with the header, fading completely before leaving sight
      const fadeDistance = Math.max(70, Math.min(120, compactHeight * 0.45));
      const exitProgress = Math.min(1, (scrollY - squishDistance) / fadeDistance);
      const introOpacity = Math.max(0, 1 - exitProgress);

      introSection.style.opacity = `${introOpacity.toFixed(3)}`;
      introSection.style.visibility = introOpacity <= 0 ? "hidden" : "visible";
      introSection.style.pointerEvents = introOpacity <= 0.05 ? "none" : "auto";

      if (scrollHint) {
        scrollHint.style.opacity = "0";
        scrollHint.style.visibility = "hidden";
        scrollHint.style.pointerEvents = "none";
      }
    } else {
      const progress = scrollY / squishDistance;
      const currentHeight = fullHeight - (fullHeight - compactHeight) * progress;
      introSection.style.height = `${currentHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";

      if (scrollHint) {
        const hintOpacity = Math.max(0, 1 - progress * 2.2);
        scrollHint.style.opacity = `${hintOpacity}`;
        scrollHint.style.visibility = hintOpacity <= 0 ? "hidden" : "visible";
        scrollHint.style.pointerEvents = hintOpacity < 0.1 ? "none" : "auto";
      }
    }
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateSquish();
        updateActiveSectionOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    const isDesktop = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    if (isDesktop || currentWidth !== lastWindowWidth) {
      // Desktop or genuine orientation/width change — always recalculate.
      lastWindowWidth = currentWidth;
      stableViewportHeight = window.innerHeight;
      updateStableViewportCss();
      calculateSquishMetrics();
      updateSquish();
      updateActiveSectionOnScroll();
    } else if (scrollY <= 10) {
      // Mobile same-width resize (address bar show/hide) while AT THE TOP.
      // Sync metrics to the new height and immediately snap to scrollY=0 to cancel
      // the browser's scroll-compensation nudge that would otherwise push content down.
      stableViewportHeight = window.innerHeight;
      updateStableViewportCss();
      calculateSquishMetrics();
      updateSquish();
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    // else: mobile address bar change while scrolled down — ignore to prevent squish shift.
  });

  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      lastWindowWidth = window.innerWidth;
      stableViewportHeight = window.innerHeight;
      updateStableViewportCss();
      calculateSquishMetrics();
      updateSquish();
      updateActiveSectionOnScroll();
    }, 150);
  });

  // Top Navigation link click handler
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const targetId = href.substring(1);
        lockActiveSectionUntil = Date.now() + 750;
        setActiveSection(targetId, true);
      }
    });
  });

  // Portfolio logo click -> direct smoothly to the top intro section and fade in hero text & buttons
  const logo = document.querySelector(".nav-logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();
      lockActiveSectionUntil = Date.now() + 800;
      setActiveSection("intro", true);

      const { fullHeight } = getSquishMetrics();
      introSection.style.height = `${fullHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";
      if (scrollHint) {
        scrollHint.style.opacity = "1";
        scrollHint.style.visibility = "visible";
        scrollHint.style.pointerEvents = "auto";
      }

      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (onLogoScrollArrival) {
        window.removeEventListener("scroll", onLogoScrollArrival);
      }
      if (logoArrivalTimer) {
        clearTimeout(logoArrivalTimer);
      }

      if (currentScroll <= 10) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        triggerHeroFadeIn();
      } else {
        isNavigatingViaLogo = true;
        window.scrollTo({ top: 0, behavior: "smooth" });

        onLogoScrollArrival = () => {
          const y = window.scrollY || window.pageYOffset || 0;
          if (y <= 10) {
            isNavigatingViaLogo = false;
            window.removeEventListener("scroll", onLogoScrollArrival);
            if (logoArrivalTimer) clearTimeout(logoArrivalTimer);
            // Sync stable height to current innerHeight (address bar may still be collapsed)
            stableViewportHeight = window.innerHeight;
            updateStableViewportCss();
            calculateSquishMetrics();
            updateSquish();
            triggerHeroFadeIn();
            setActiveSection("intro", true);
          }
        };

        window.addEventListener("scroll", onLogoScrollArrival, { passive: true });

        logoArrivalTimer = setTimeout(() => {
          isNavigatingViaLogo = false;
          if (onLogoScrollArrival) {
            window.removeEventListener("scroll", onLogoScrollArrival);
          }
          // Sync stable height to current innerHeight (address bar may still be collapsed)
          stableViewportHeight = window.innerHeight;
          updateStableViewportCss();
          calculateSquishMetrics();
          updateSquish();
          triggerHeroFadeIn();
          setActiveSection("intro", true);
        }, 650);
      }

      history.pushState(null, null, "#intro");
    });
  }

  // Back to top footer link -> same behavior as the nav logo
  const backToTopLink = document.getElementById("back-to-top-link");
  if (backToTopLink) {
    backToTopLink.addEventListener("click", (e) => {
      e.preventDefault();
      lockActiveSectionUntil = Date.now() + 800;
      setActiveSection("intro", true);

      const { fullHeight } = getSquishMetrics();
      introSection.style.height = `${fullHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";
      if (scrollHint) {
        scrollHint.style.opacity = "1";
        scrollHint.style.visibility = "visible";
        scrollHint.style.pointerEvents = "auto";
      }

      const currentScroll = window.scrollY || window.pageYOffset || 0;

      if (onLogoScrollArrival) {
        window.removeEventListener("scroll", onLogoScrollArrival);
      }
      if (logoArrivalTimer) {
        clearTimeout(logoArrivalTimer);
      }

      if (currentScroll <= 10) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        triggerHeroFadeIn();
      } else {
        isNavigatingViaLogo = true;
        window.scrollTo({ top: 0, behavior: "smooth" });

        onLogoScrollArrival = () => {
          const y = window.scrollY || window.pageYOffset || 0;
          if (y <= 10) {
            isNavigatingViaLogo = false;
            window.removeEventListener("scroll", onLogoScrollArrival);
            if (logoArrivalTimer) clearTimeout(logoArrivalTimer);
            // Sync stable height to current innerHeight (address bar may still be collapsed)
            stableViewportHeight = window.innerHeight;
            updateStableViewportCss();
            calculateSquishMetrics();
            updateSquish();
            triggerHeroFadeIn();
            setActiveSection("intro", true);
          }
        };

        window.addEventListener("scroll", onLogoScrollArrival, { passive: true });

        logoArrivalTimer = setTimeout(() => {
          isNavigatingViaLogo = false;
          if (onLogoScrollArrival) {
            window.removeEventListener("scroll", onLogoScrollArrival);
          }
          // Sync stable height to current innerHeight (address bar may still be collapsed)
          stableViewportHeight = window.innerHeight;
          updateStableViewportCss();
          calculateSquishMetrics();
          updateSquish();
          triggerHeroFadeIn();
          setActiveSection("intro", true);
        }, 650);
      }

      history.pushState(null, null, "#intro");
    });
  }

  function navigateToDotSection(sectionId, smooth = true) {
    if (!sectionId) return;

    lockActiveSectionUntil = Date.now() + (smooth ? 750 : 100);

    if (sectionId === "intro") {
      // Sync stable height to current innerHeight before calculating (address bar may be collapsed)
      stableViewportHeight = window.innerHeight;
      updateStableViewportCss();
      calculateSquishMetrics();
      const { fullHeight } = getSquishMetrics();
      introSection.style.height = `${fullHeight}px`;
      introSection.style.opacity = "1";
      introSection.style.visibility = "visible";
      introSection.style.pointerEvents = "auto";
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      triggerHeroFadeIn();
    } else {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
      }
    }

    try {
      history.pushState(null, null, `#${sectionId}`);
    } catch (e) { }

    setActiveSection(sectionId, true);
  }

  // Click on dots
  dotItems.forEach((item) => {
    const link = item.querySelector(".dot-link");
    if (link) {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        link.blur();
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
        const sectionId = item.dataset.section;
        navigateToDotSection(sectionId, true);
      });
    }
  });

  // Slider sliding / dragging scrub handler
  function getClosestDotSection(clientY) {
    let closestSection = null;
    let minDistance = Infinity;

    dotItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const distance = Math.abs(clientY - centerY);
      if (distance < minDistance) {
        minDistance = distance;
        closestSection = item.dataset.section;
      }
    });

    return closestSection;
  }

  if (dotTrack) {
    dotTrack.addEventListener("pointerdown", (e) => {
      // Disallow interactions originating on the label text
      if (e.target && e.target.closest && e.target.closest(".dot-label")) return;

      isSlidingDots = true;
      try {
        dotTrack.setPointerCapture(e.pointerId);
      } catch (err) { }

      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      const sectionId = getClosestDotSection(e.clientY);
      if (sectionId) {
        navigateToDotSection(sectionId, false);
        showDotSelection(sectionId, false);
      }
    });

    dotTrack.addEventListener("pointermove", (e) => {
      if (!isSlidingDots) return;
      const sectionId = getClosestDotSection(e.clientY);
      if (sectionId && sectionId !== activeDotSection) {
        navigateToDotSection(sectionId, false);
        showDotSelection(sectionId, false);
      }
    });

    const stopSliding = (e) => {
      if (!isSlidingDots) return;
      isSlidingDots = false;
      try {
        dotTrack.releasePointerCapture(e.pointerId);
      } catch (err) { }

      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }

      lockActiveSectionUntil = Date.now() + 150;
      setActiveSection(activeDotSection, true);
    };

    dotTrack.addEventListener("pointerup", stopSliding);
    dotTrack.addEventListener("pointercancel", stopSliding);
  }

  // Initial calculation on page load
  calculateSquishMetrics();
  updateSquish();
  updateActiveSectionOnScroll();

  // Dark / Light Mode Theme Toggle (Defaults to dark mode)
  const themeToggle = document.getElementById("theme-toggle");

  function getActiveTheme() {
    return document.documentElement.getAttribute("data-theme") || localStorage.getItem("theme") || "dark";
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (err) {
      // localStorage may fail in restricted sandboxes
    }
    if (themeToggle) {
      const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("title", label);
    }
  }

  setTheme(getActiveTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = getActiveTheme();
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  // Copy Email to Clipboard with instant feedback
  const copyBtn = document.getElementById("copy-email-btn");
  const emailElement = document.getElementById("email-address");

  if (copyBtn && emailElement) {
    copyBtn.addEventListener("click", async () => {
      const email = emailElement.textContent.trim();
      const copyText = copyBtn.querySelector(".copy-text");

      try {
        await navigator.clipboard.writeText(email);
        copyBtn.classList.add("copied");
        if (copyText) copyText.textContent = "Copied!";

        setTimeout(() => {
          copyBtn.classList.remove("copied");
          if (copyText) copyText.textContent = "Copy Email";
        }, 2000);
      } catch (err) {
        // Fallback for clipboard API restrictions
        const tempInput = document.createElement("input");
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        copyBtn.classList.add("copied");
        if (copyText) copyText.textContent = "Copied!";

        setTimeout(() => {
          copyBtn.classList.remove("copied");
          if (copyText) copyText.textContent = "Copy Email";
        }, 2000);
      }
    });
  }
});
