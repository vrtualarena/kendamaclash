function formatDateRo(dateISO, time) {
  if (!dateISO) {
    return "Data urmează să fie anunțată";
  }

  const date = new Date(`${dateISO}T00:00:00`);
  const formatted = new Intl.DateTimeFormat("ro-RO", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(date);

  return time ? `${formatted}, ora ${time}` : formatted;
}

function safeText(value, fallback = "-") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
}

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (!toggle || !navLinks) return;

  const closeMenu = () => {
    navLinks.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "☰";
  };

  toggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (evt) => {
    const target = evt.target;
    if (!(target instanceof Element)) return;
    if (!navLinks.contains(target) && !toggle.contains(target)) {
      closeMenu();
    }
  });
}

function getPartnerBadge(partner) {
  if (partner.icon && partner.icon.trim()) return partner.icon.trim();
  return (partner.name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0])
    .join("")
    .toUpperCase();
}

function parseEventDateTime(event) {
  if (!event?.date) return null;
  const time = event.time && event.time.trim() ? event.time.trim() : "00:00";
  const candidate = new Date(`${event.date}T${time}:00`);
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function findNextEvent(events) {
  const now = new Date();
  return events
    .map((event) => ({ event, startsAt: parseEventDateTime(event) }))
    .filter((item) => item.startsAt && item.startsAt.getTime() > now.getTime())
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0] || null;
}

function formatRemaining(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function setupCountdown(events) {
  const title = document.getElementById("countdown-title");
  const dateLine = document.getElementById("countdown-date");
  const value = document.getElementById("countdown-value");
  const daysEl = document.getElementById("count-days");
  const hoursEl = document.getElementById("count-hours");
  const minutesEl = document.getElementById("count-minutes");
  const secondsEl = document.getElementById("count-seconds");
  const timeline = events
    .map((event) => ({ event, startsAt: parseEventDateTime(event) }))
    .filter((item) => item.startsAt)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  let active = null;

  const setEmptyState = () => {
    title.textContent = "Următorul show va fi anunțat curând";
    dateLine.textContent = "";
    value.style.display = "block";
    value.textContent = "Următoarea dată va fi anunțată curând";
    daysEl.textContent = "--";
    hoursEl.textContent = "--";
    minutesEl.textContent = "--";
    secondsEl.textContent = "--";
  };

  const setActiveNextEvent = () => {
    const nowMs = Date.now();
    active = timeline.find((item) => item.startsAt.getTime() > nowMs) || null;
    if (!active) {
      setEmptyState();
      return false;
    }

    title.textContent = `START IN ${active.event.city.toUpperCase()}`;
    dateLine.textContent = `(${formatDateRo(active.event.date, active.event.time).toUpperCase()})`;
    value.style.display = "none";
    return true;
  };

  if (!setActiveNextEvent()) {
    return;
  }

  const tick = () => {
    const remaining = active.startsAt.getTime() - Date.now();
    if (remaining <= 0) {
      const hasNext = setActiveNextEvent();
      if (!hasNext) {
        return false;
      }
      return true;
    }
    value.style.display = "none";
    const parts = formatRemaining(remaining);
    daysEl.textContent = String(parts.days).padStart(2, "0");
    hoursEl.textContent = String(parts.hours).padStart(2, "0");
    minutesEl.textContent = String(parts.minutes).padStart(2, "0");
    secondsEl.textContent = String(parts.seconds).padStart(2, "0");
    return true;
  };

  tick();
  const timer = setInterval(() => {
    if (!tick()) clearInterval(timer);
  }, 1000);
}

function renderConfig(data) {
  document.title = safeText(data.site.title, "Kendama Clash România");
  document.getElementById("hero-tagline").textContent = safeText(data.hero.tagline);
  document.getElementById("hero-title").textContent = safeText(data.hero.title);
  document.getElementById("hero-subtitle").textContent = safeText(data.hero.subtitle);
  document.getElementById("confirmed-cities").textContent = safeText(data.hero.meta.confirmedCities);
  document.getElementById("prize-highlight").textContent = safeText(data.hero.meta.prizeHighlight);
  document.getElementById("tickets-status").textContent = safeText(data.hero.meta.ticketsStatus);

  const poster = document.getElementById("hero-poster");
  poster.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.6)), url('${data.hero.poster}')`;

  const ctaWrap = document.getElementById("hero-cta");
  data.hero.actions.forEach((action) => {
    const link = document.createElement("a");
    link.className = `btn ${action.primary ? "btn-primary" : "btn-secondary"}`;
    link.href = action.url;
    if (!String(action.url || "").startsWith("#")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
    link.textContent = action.label;
    ctaWrap.appendChild(link);
  });

  setupCountdown(data.events || []);

  const organizers = document.getElementById("organizers-list");
  (data.organizers || []).forEach((partner) => {
    const card = createEl("article", "partner-card");
    const head = createEl("div", "partner-head");
    if (partner.logo) {
      const logo = document.createElement("img");
      logo.className = "partner-logo";
      logo.src = partner.logo;
      logo.alt = `Logo ${partner.name}`;
      logo.width = 32;
      logo.height = 32;
      head.appendChild(logo);
    } else {
      head.appendChild(createEl("span", "partner-icon", getPartnerBadge(partner)));
    }
    head.appendChild(createEl("h3", null, partner.name));
    card.appendChild(head);
    card.appendChild(createEl("p", "partner-role", partner.role));

    if (partner.url) {
      const link = createEl("a", "btn btn-secondary partner-link", "Profil oficial");
      link.href = partner.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      card.appendChild(link);
    }
    organizers.appendChild(card);
  });

  const partners = document.getElementById("partners-list");
  if (!data.partners || data.partners.length === 0) {
    partners.appendChild(createEl("p", "empty-state", "Partenerii vor fi anunțați în curând."));
  } else {
    data.partners.forEach((partner) => {
      const card = createEl("article", "partner-card");
      const head = createEl("div", "partner-head");
      if (partner.logo) {
        const logo = document.createElement("img");
        logo.className = "partner-logo";
        logo.src = partner.logo;
        logo.alt = `Logo ${partner.name}`;
        logo.width = 32;
        logo.height = 32;
        head.appendChild(logo);
      } else {
        head.appendChild(createEl("span", "partner-icon", getPartnerBadge(partner)));
      }
      head.appendChild(createEl("h3", null, partner.name));
      card.appendChild(head);
      card.appendChild(createEl("p", "partner-role", safeText(partner.role, "Partener oficial")));
      if (partner.url) {
        const link = createEl("a", "btn btn-secondary partner-link", "Site partener");
        link.href = partner.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }
      partners.appendChild(card);
    });
  }

  const sponsors = document.getElementById("sponsors-list");
  if (!data.sponsors || data.sponsors.length === 0) {
    sponsors.appendChild(createEl("p", "empty-state", "Sponsorii vor fi anunțați în curând."));
  } else {
    data.sponsors.forEach((sponsor) => {
      const card = createEl("article", "partner-card");
      const head = createEl("div", "partner-head");
      if (sponsor.logo) {
        const logo = document.createElement("img");
        logo.className = "partner-logo";
        logo.src = sponsor.logo;
        logo.alt = `Logo ${sponsor.name}`;
        logo.width = 32;
        logo.height = 32;
        head.appendChild(logo);
      } else {
        head.appendChild(createEl("span", "partner-icon", getPartnerBadge(sponsor)));
      }
      head.appendChild(createEl("h3", null, sponsor.name));
      card.appendChild(head);
      card.appendChild(createEl("p", "partner-role", safeText(sponsor.role, "Sponsor oficial")));

      if (sponsor.url) {
        const link = createEl("a", "btn btn-secondary partner-link", "Site sponsor");
        link.href = sponsor.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.appendChild(link);
      }
      sponsors.appendChild(card);
    });
  }

  const eventsWrap = document.getElementById("events-list");
  data.events.forEach((event) => {
    const card = createEl("article", "event-card");
    const eventUrl = (event.iabiletUrl || "").trim();

    if (eventUrl) {
      card.classList.add("event-card-clickable");
      card.tabIndex = 0;
      card.setAttribute("role", "link");
      card.setAttribute("aria-label", `Deschide bilete ${event.city}`);
      card.addEventListener("click", () => {
        window.open(eventUrl, "_blank", "noopener,noreferrer");
      });
      card.addEventListener("keydown", (evt) => {
        if (evt.key === "Enter" || evt.key === " ") {
          evt.preventDefault();
          window.open(eventUrl, "_blank", "noopener,noreferrer");
        }
      });
    }

    if (event.image) {
      const img = document.createElement("img");
      img.className = "event-banner";
      img.src = event.image;
      img.alt = `Poster ${event.city}`;
      card.appendChild(img);
    }

    const body = createEl("div", "event-body");
    body.appendChild(createEl("div", "event-date", formatDateRo(event.date, event.time)));
    body.appendChild(createEl("h3", "event-location", `${event.city} - ${event.venue}`));

    const info = createEl("div", "event-info");
    info.appendChild(createEl("div", null, `Locație: ${safeText(event.address, "TBA")}`));
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      info.appendChild(createEl("div", null, `Preț bilet: ${safeText(event.entryPrice, "TBA")}`));
      info.appendChild(createEl("div", null, `Preț VIP: ${safeText(event.vipPrice, "TBA")}`));
    }
    info.appendChild(createEl("div", null, `Locuri: ${safeText(event.seats, "Limitate")}`));
    body.appendChild(info);

    const badges = createEl("div", "badges");
    event.categories.forEach((category) => {
      badges.appendChild(createEl("span", "badge", category));
    });
    body.appendChild(badges);

    const prizeTitle = createEl("h4", null, "Premii pe categorii");
    body.appendChild(prizeTitle);
    const prizeList = createEl("ul", "prize-list");
    event.prizes.forEach((prizeItem) => {
      prizeList.appendChild(createEl("li", null, `${prizeItem.category}: ${prizeItem.prize}`));
    });
    body.appendChild(prizeList);

    if (event.ticketCategories && event.ticketCategories.length > 0) {
      body.appendChild(createEl("h4", null, "Categorii și bilete"));
      const ticketList = createEl("ul", "prize-list");
      event.ticketCategories.forEach((item) => {
        ticketList.appendChild(createEl("li", null, `${item.category}: bilet ${item.price}`));
      });
      body.appendChild(ticketList);
    }

    if (event.importantNotes && event.importantNotes.length > 0) {
      body.appendChild(createEl("h4", null, "Mențiuni importante"));
      const notesList = createEl("ul", "prize-list");
      event.importantNotes.forEach((item) => {
        notesList.appendChild(createEl("li", null, item));
      });
      body.appendChild(notesList);
    }

    const notes = createEl("p", null, safeText(event.notes, ""));
    if (notes.textContent) {
      body.appendChild(notes);
    }

    if (eventUrl) {
      const buyBtn = createEl("a", "btn btn-primary event-cta", "Înscrie-te acum");
      buyBtn.href = eventUrl;
      buyBtn.target = "_blank";
      buyBtn.rel = "noopener noreferrer";
      body.appendChild(buyBtn);
    }

    card.appendChild(body);
    eventsWrap.appendChild(card);
  });

  const gallery = document.getElementById("promo-gallery");
  const atmosphereGallery = document.getElementById("atmosphere-gallery");
  const atmosphereDots = document.getElementById("atmosphere-dots");
  const atmospherePrev = document.getElementById("atmosphere-prev");
  const atmosphereNext = document.getElementById("atmosphere-next");
  const atmosphereCarousel = document.getElementById("atmosphere-carousel");
  const lightbox = document.getElementById("poster-lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");

  const closeLightbox = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
  };

  const openLightbox = (src, alt) => {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
  };

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (evt) => {
    if (evt.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") closeLightbox();
  });

  data.gallery.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Promo Kendama Clash ${index + 1}`;
    img.addEventListener("click", () => openLightbox(src, img.alt));
    gallery.appendChild(img);
  });

  const atmosphereItems = data.atmosphereGallery || [];
  if (!atmosphereItems.length) {
    atmosphereCarousel.style.display = "none";
    atmosphereDots.innerHTML = '<p class="carousel-empty">Pozele de atmosferă urmează să fie adăugate.</p>';
  } else {
    let activeIndex = 0;
    let autoTimer = null;
    let touchStartX = 0;

    const renderCarousel = () => {
      atmosphereGallery.style.transform = `translateX(-${activeIndex * 100}%)`;
      [...atmosphereDots.children].forEach((dot, i) => {
        dot.classList.toggle("active", i === activeIndex);
      });
    };

    const goTo = (index) => {
      const total = atmosphereItems.length;
      activeIndex = (index + total) % total;
      renderCarousel();
    };

    const restartAuto = () => {
      if (autoTimer) clearInterval(autoTimer);
      if (atmosphereItems.length > 1) {
        autoTimer = setInterval(() => goTo(activeIndex + 1), 4200);
      }
    };

    atmosphereItems.forEach((src, index) => {
      const slide = document.createElement("div");
      slide.className = "carousel-slide";

      const img = document.createElement("img");
      img.className = "carousel-slide-image";
      img.src = src;
      img.alt = `Atmosfera Kendama Clash ${index + 1}`;
      img.addEventListener("click", () => openLightbox(src, img.alt));
      slide.appendChild(img);
      atmosphereGallery.appendChild(slide);

      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Slide ${index + 1}`);
      dot.addEventListener("click", () => {
        goTo(index);
        restartAuto();
      });
      atmosphereDots.appendChild(dot);
    });

    atmospherePrev.addEventListener("click", () => {
      goTo(activeIndex - 1);
      restartAuto();
    });

    atmosphereNext.addEventListener("click", () => {
      goTo(activeIndex + 1);
      restartAuto();
    });

    atmosphereGallery.addEventListener("touchstart", (evt) => {
      touchStartX = evt.changedTouches[0].clientX;
    });

    atmosphereGallery.addEventListener("touchend", (evt) => {
      const touchEndX = evt.changedTouches[0].clientX;
      const delta = touchEndX - touchStartX;
      if (Math.abs(delta) > 40) {
        goTo(delta > 0 ? activeIndex - 1 : activeIndex + 1);
        restartAuto();
      }
    });

    atmosphereCarousel.addEventListener("mouseenter", () => {
      if (autoTimer) clearInterval(autoTimer);
    });
    atmosphereCarousel.addEventListener("mouseleave", restartAuto);

    renderCarousel();
    restartAuto();
  }

  const followCopy = document.getElementById("follow-copy");
  followCopy.textContent = safeText(data.follow.copy);

  const socials = document.getElementById("social-links");
  const contact = data.contact || {};
  const contactCopy = document.getElementById("contact-copy");
  contactCopy.textContent = safeText(contact.copy, "Ne poți contacta prin următoarele mijloace:");

  const fbLink = createEl("a", "btn btn-secondary contact-link", safeText(contact.facebookLabel, "Facebook"));
  fbLink.href = safeText(contact.facebookUrl, "https://www.facebook.com/vrtualarena");
  fbLink.target = "_blank";
  fbLink.rel = "noopener noreferrer";
  const fbIcon = createEl("span", "contact-icon", "FB");
  fbLink.prepend(fbIcon);
  socials.appendChild(fbLink);

  const phoneLink = createEl(
    "a",
    "btn btn-secondary contact-link",
    safeText(contact.phoneLabel, "Apelează-ne")
  );
  phoneLink.href = `tel:${safeText(contact.phoneTel, "+40750437164")}`;
  const phoneIcon = createEl("span", "contact-icon", "TEL");
  phoneLink.prepend(phoneIcon);
  socials.appendChild(phoneLink);

  document.getElementById("footer-tagline").textContent = safeText(data.footer.tagline, "");
  document.getElementById("footer-copy").textContent = safeText(data.footer.copy);
}

async function init() {
  try {
    setupMobileMenu();
    const response = await fetch("config.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Nu pot citi config.json (${response.status})`);
    }

    const data = await response.json();
    renderConfig(data);
  } catch (error) {
    const title = document.getElementById("hero-title");
    title.textContent = "Eroare la încărcarea configurației";

    const subtitle = document.getElementById("hero-subtitle");
    subtitle.textContent = error.message;
  }
}

init();
