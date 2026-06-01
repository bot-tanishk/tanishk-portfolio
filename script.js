(() => {
  "use strict";

  document.body.classList.add("loading");

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  if (hasGSAP && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  const loader = $(".preloader");
  const loaderMessage = $(".preloader__message");
  const loaderPercent = $(".preloader__percent");
  const loaderFrame = $(".preloader__frame");
  const loaderBar = $(".preloader__bar");
  const loaderMessages = [
    "INITIALIZING STORY...",
    "LOADING VISUALS...",
    "SYNCING AUDIO...",
    "COLORING FRAMES...",
    "RENDER COMPLETE."
  ];

  const completeLoader = () => {
    if (!loader || loader.dataset.complete) return;
    loader.dataset.complete = "true";
    document.body.classList.remove("loading");

    if (hasGSAP && !prefersReducedMotion) {
      gsap.timeline()
        .to(loaderBar, { scaleX: 1, duration: 0.22, ease: "power2.out" })
        .to(loaderMessage, { y: -12, opacity: 0, duration: 0.3 }, "+=0.18")
        .to(loader, { yPercent: -100, duration: 1.05, ease: "power4.inOut" })
        .set(loader, { display: "none" })
        .from(".site-header", { y: -24, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
        .from(".hero__title span", {
          yPercent: 110,
          rotateX: -80,
          opacity: 0,
          stagger: 0.055,
          duration: 0.9,
          ease: "power4.out"
        }, "-=0.55")
        .from(".hero__intro, .hero__lower, .hero__corner, .scroll-cue", {
          y: 16,
          opacity: 0,
          stagger: 0.07,
          duration: 0.65,
          ease: "power3.out"
        }, "-=0.42");
    } else {
      loader.style.display = "none";
    }
  };

  if (loader) {
    let progress = 0;
    let messageIndex = 0;
    const loaderTimer = window.setInterval(() => {
      progress = Math.min(100, progress + Math.ceil(Math.random() * 12));
      const nextIndex = Math.min(loaderMessages.length - 1, Math.floor(progress / 24));

      if (nextIndex !== messageIndex) {
        messageIndex = nextIndex;
        if (hasGSAP && !prefersReducedMotion) {
          gsap.to(loaderMessage, {
            opacity: 0,
            y: -6,
            duration: 0.14,
            onComplete: () => {
              loaderMessage.textContent = loaderMessages[messageIndex];
              gsap.fromTo(loaderMessage, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.18 });
            }
          });
        } else {
          loaderMessage.textContent = loaderMessages[messageIndex];
        }
      }

      loaderPercent.textContent = `${String(progress).padStart(2, "0")}%`;
      loaderFrame.textContent = String(Math.round(progress * 2.47)).padStart(4, "0");
      loaderBar.style.transform = `scaleX(${progress / 100})`;

      if (progress >= 100) {
        window.clearInterval(loaderTimer);
        window.setTimeout(completeLoader, 250);
      }
    }, 155);

    window.addEventListener("load", () => {
      window.setTimeout(() => {
        progress = Math.max(progress, 94);
      }, 350);
    });

    window.setTimeout(completeLoader, 4200);
  }

  let lenis;
  if (typeof window.Lenis !== "undefined" && !prefersReducedMotion) {
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.15
    });

    lenis.on("scroll", () => {
      if (window.ScrollTrigger) ScrollTrigger.update();
    });

    if (hasGSAP) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      $(".site-nav")?.classList.remove("is-open");
      $(".menu-toggle")?.setAttribute("aria-expanded", "false");
      if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1.15 });
      else target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  });

  const header = $(".site-header");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 40);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuToggle = $(".menu-toggle");
  const siteNav = $(".site-nav");
  menuToggle?.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav?.classList.toggle("is-open", !expanded);
  });

  const cursor = $(".cursor");
  const cursorDot = $(".cursor-dot");
  if (cursor && cursorDot && window.matchMedia("(pointer: fine)").matches) {
    let pointerX = -100;
    let pointerY = -100;
    let cursorX = -100;
    let cursorY = -100;

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursorDot.style.transform = `translate(${pointerX - 2}px, ${pointerY - 2}px)`;
    });

    const moveCursor = () => {
      cursorX += (pointerX - cursorX) * 0.16;
      cursorY += (pointerY - cursorY) * 0.16;
      cursor.style.transform = `translate(${cursorX - cursor.offsetWidth / 2}px, ${cursorY - cursor.offsetHeight / 2}px)`;
      requestAnimationFrame(moveCursor);
    };
    moveCursor();

    $$(".interactive-media").forEach((item) => {
      item.addEventListener("pointerenter", () => {
        cursor.classList.add("is-media");
        $("span", cursor).textContent = item.dataset.cursor || "VIEW";
      });
      item.addEventListener("pointerleave", () => cursor.classList.remove("is-media"));
    });
  }

  $$(".magnetic").forEach((item) => {
    item.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion) return;
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
    });
    item.addEventListener("pointerleave", () => {
      item.style.transform = "translate(0, 0)";
    });
  });

  $$(".tilt-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (prefersReducedMotion || window.innerWidth < 760) return;
      const rect = card.getBoundingClientRect();
      const rx = ((event.clientY - rect.top) / rect.height - 0.5) * -4.5;
      const ry = ((event.clientX - rect.left) / rect.width - 0.5) * 5;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    });
  });

  const pauseVideo = (container, video) => {
    window.setTimeout(() => {
      if (container.matches(":hover")) return;
      video.pause();
      container.classList.remove("is-playing");
    }, 90);
  };

  $$(".interactive-media").forEach((container) => {
    const video = $(".hover-video", container);
    if (!video) return;

    container.addEventListener("pointerenter", () => {
      if (window.innerWidth < 760) return;
      const playAttempt = video.play();
      if (playAttempt?.catch) playAttempt.catch(() => {});
      container.classList.add("is-playing");
    });

    container.addEventListener("pointerleave", () => pauseVideo(container, video));
  });

  const featuredReel = $(".featured-reel");
  const featuredVideo = $(".featured-reel video");
  $(".play-button")?.addEventListener("click", () => {
    if (!featuredVideo || !featuredReel) return;
    if (featuredVideo.paused) {
      featuredVideo.play().catch(() => {});
      featuredReel.classList.add("is-playing");
    } else {
      featuredVideo.pause();
      featuredReel.classList.remove("is-playing");
    }
  });

  const compareStage = $("#compare-stage");
  const compareRange = $(".compare-range");
  const updateCompare = (value) => compareStage?.style.setProperty("--compare", `${value}%`);
  compareRange?.addEventListener("input", (event) => updateCompare(event.target.value));
  updateCompare(compareRange?.value || 50);

  const counters = $$("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.played) return;
      entry.target.dataset.played = "true";
      const target = Number(entry.target.dataset.count);
      const suffix = entry.target.dataset.suffix || "";
      const start = performance.now();
      const duration = prefersReducedMotion ? 10 : 1700;

      const tick = (now) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 4);
        entry.target.textContent = `${Math.floor(target * eased).toLocaleString()}${suffix}`;
        if (elapsed < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((counter) => counterObserver.observe(counter));

  const sceneNames = $$("[data-scene]");
  const sideScene = $(".side-index__active");
  const sideNumber = $(".side-index span:first-child");
  const sceneObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || !sideScene) return;
      sideScene.textContent = entry.target.dataset.scene;
      sideNumber.textContent = String(sceneNames.indexOf(entry.target) + 1).padStart(2, "0");
    });
  }, { rootMargin: "-42% 0px -42% 0px" });
  sceneNames.forEach((scene) => sceneObserver.observe(scene));

  if (hasGSAP && typeof window.ScrollTrigger !== "undefined" && !prefersReducedMotion) {
    $$(".reveal-up").forEach((element) => {
      gsap.from(element, {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: element, start: "top 90%", once: true }
      });
    });

    $$(".split-reveal").forEach((element) => {
      gsap.from(element, {
        y: 52,
        clipPath: "inset(0 0 100% 0)",
        opacity: 0,
        duration: 1.15,
        ease: "power4.out",
        scrollTrigger: { trigger: element, start: "top 87%", once: true }
      });
    });

    $$(".project-card").forEach((card, index) => {
      gsap.from(card, {
        y: 75,
        opacity: 0,
        duration: 0.95,
        delay: index % 2 ? 0.1 : 0,
        ease: "power3.out",
        scrollTrigger: { trigger: card, start: "top 91%", once: true }
      });
    });

    gsap.to(".hero__media", {
      yPercent: 15,
      scale: 1.16,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });

    gsap.to(".hero__content", {
      yPercent: 18,
      opacity: 0.12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 18%", scrub: true }
    });

    gsap.to(".about__visual img", {
      yPercent: -8,
      ease: "none",
      scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
    });

    gsap.to(".timeline__line i", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { trigger: ".timeline", start: "top 78%", end: "bottom 52%", scrub: true }
    });

    $$(".timeline__step").forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 78%",
        onEnter: () => step.classList.add("is-active"),
        onEnterBack: () => step.classList.add("is-active")
      });
    });
  } else {
    $$(".timeline__step").forEach((step) => step.classList.add("is-active"));
  }

  const form = $(".contact-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(`Editing project inquiry from ${data.get("name")}`);
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\nProject:\n${data.get("message")}`
    );
    const button = $(".form-submit", form);
    button.innerHTML = "OPENING MAIL CLIENT <span>↗</span>";
    window.location.href = `mailto:tanishk.editor@gmail.com?subject=${subject}&body=${body}`;
    window.setTimeout(() => {
      button.innerHTML = "SEND THE BRIEF <span>↗</span>";
    }, 1600);
  });

  const toast = $(".easter-toast");
  const showToast = (title = "DIRECTOR’S GRADE", message = "ACTIVATED") => {
    if (!toast) return;
    $("span", toast).textContent = title;
    $("strong", toast).textContent = message;
    if (hasGSAP) {
      gsap.killTweensOf(toast);
      gsap.timeline()
        .to(toast, { opacity: 1, y: 0, duration: 0.35 })
        .to(toast, { opacity: 0, y: 12, duration: 0.35 }, "+=2");
    }
  };

  const toggleGrade = () => {
    document.body.classList.toggle("directors-grade");
    showToast(
      "DIRECTOR’S GRADE",
      document.body.classList.contains("directors-grade") ? "ACTIVATED" : "DEACTIVATED"
    );
  };

  document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea")) return;
    if (event.key.toLowerCase() === "g") toggleGrade();
    if (event.key.toLowerCase() === "r") {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
      showToast("REWINDING TAPE", "BACK TO FRAME 0001");
    }
  });

  let brandClicks = 0;
  $(".brand")?.addEventListener("click", () => {
    brandClicks += 1;
    if (brandClicks === 4) {
      toggleGrade();
      brandClicks = 0;
    }
  });

  const initAtmosphere = () => {
    const canvas = $("#atmosphere");
    if (!canvas || typeof window.THREE === "undefined" || prefersReducedMotion) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 7;

    const count = window.innerWidth < 760 ? 340 : 760;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 13;
      positions[i + 1] = (Math.random() - 0.5) * 9;
      positions[i + 2] = (Math.random() - 0.5) * 6;
    }
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd99a5b,
      size: 0.018,
      transparent: true,
      opacity: 0.34,
      depthWrite: false
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let mouseX = 0;
    let mouseY = 0;
    window.addEventListener("pointermove", (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 0.8;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 0.8;
    }, { passive: true });

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    const render = () => {
      const elapsed = clock.getElapsedTime();
      particles.rotation.y = elapsed * 0.024 + mouseX * 0.1;
      particles.rotation.x += (mouseY * 0.06 - particles.rotation.x) * 0.025;
      particles.position.y = Math.sin(elapsed * 0.24) * 0.12;
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();
  };

  initAtmosphere();
})();
