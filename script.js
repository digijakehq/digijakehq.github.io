// ================================
// DOM ELEMENTS
// ================================
const mainSection = document.querySelector(".main-section");
const nav = document.querySelector("nav");
const navLinks = document.querySelectorAll("nav a[href^='#']");
const sections = document.querySelectorAll(".hero");

// ================================
// ACTIVE NAV LINK
// ================================
function setActiveLink(id) {
  navLinks.forEach(link =>
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
  );
}

// ================================
// SMOOTH SCROLL
// ================================
function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const offset = nav.offsetHeight + 20;
  mainSection.scrollTo({
    top: target.offsetTop - offset,
    behavior: "smooth"
  });

  setActiveLink(targetId);
}

navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    scrollToSection(link.getAttribute("href").substring(1));
  });
});

// ================================
// SCROLL SPY
// ================================
mainSection.addEventListener("scroll", () => {
  const pos = mainSection.scrollTop + nav.offsetHeight + 40;
  sections.forEach(section => {
    if (pos >= section.offsetTop && pos < section.offsetTop + section.offsetHeight) {
      setActiveLink(section.id);
    }
  });
});

// ================================
// EMAIL OBFUSCATION
// ================================
const emailUser = "contact.digijake";
const emailDomain = "gmail.com";
const email = `${emailUser}@${emailDomain}`;

const copyBtn = document.getElementById("copyEmailBtn");
const emailText = document.getElementById("emailText");

if (emailText) emailText.textContent = "***************";

if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(email).then(() => {
      copyBtn.classList.add("copied");
      emailText.textContent = email;

      setTimeout(() => {
        copyBtn.classList.remove("copied");
        emailText.textContent = "***************";
      }, 1200);
    });
  });
}

// ================================
// CURSOR TRAIL (DESKTOP)
// ================================
if (window.matchMedia("(pointer: fine)").matches) {
  let lastTime = 0;
  document.addEventListener("mousemove", e => {
    if (Date.now() - lastTime < 24) return;
    lastTime = Date.now();

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  });
}

// ================================
// LIGHTBOX + ZOOM SYSTEM
// ================================
const lightbox = document.getElementById("lightbox");
const content = document.querySelector(".lightbox-content");
const items = document.querySelectorAll(".masonry-item");

if (lightbox && items.length) {

  let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;

  /* 🔒 LOCK SCROLL — iOS SAFARI FIX */
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  mainSection.style.overflow = "hidden";

  lightbox.classList.add("active");
  renderMedia();
}

function closeLightbox() {
  const video = content.querySelector("video");
  if (video) video.pause();

  /* 🔓 RESTORE SCROLL */
  document.body.style.position = "";
  document.body.style.width = "";
  mainSection.style.overflow = "";

  lightbox.classList.remove("active");
  content.innerHTML = "";
}

lightbox.addEventListener("touchend", e => {
  if (e.target === lightbox) closeLightbox();
});

  function renderMedia() {
    content.innerHTML = "";

    const item = items[currentIndex];
    const img = item.querySelector("img");
    const video = item.querySelector("video");

    let media;

    if (video) {
      media = document.createElement("video");
      media.src = video.src;
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
      content.appendChild(media);
      return;
    }

    if (!img) return;

    media = document.createElement("img");
    media.src = img.src;
    content.appendChild(media);

    // ---- Zoom State ----
    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;
    let lastTap = 0;
    let pinchStartDist = 0;
    const minScale = 1;
    const maxScale = 4;

    const indicator = document.createElement("div");
    indicator.className = "zoom-indicator";
    content.appendChild(indicator);

    function updateTransform() {
      media.style.transform =
        `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`;
      indicator.textContent = `${Math.round(scale * 100)}%`;
      indicator.classList.add("show");
      clearTimeout(indicator.hideTimer);
      indicator.hideTimer = setTimeout(
        () => indicator.classList.remove("show"),
        900
      );
    }

    media.addEventListener("dblclick", e => {
      e.preventDefault();
      scale = scale === 1 ? 2 : 1;
      translateX = translateY = 0;
      updateTransform();
    });

    media.addEventListener("touchend", () => {
      const now = Date.now();
      if (now - lastTap < 300) {
        scale = scale === 1 ? 2 : 1;
        translateX = translateY = 0;
        updateTransform();
      }
      lastTap = now;
    });

    media.addEventListener("mousedown", e => {
      if (scale === 1) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    window.addEventListener("mousemove", e => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener("mouseup", () => isDragging = false);

    media.addEventListener("touchstart", e => {
      if (e.touches.length === 1 && scale > 1) {
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
      }

      if (e.touches.length === 2) {
        pinchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    media.addEventListener("touchmove", e => {
      if (e.touches.length === 1 && scale > 1) {
        translateX = e.touches[0].clientX - startX;
        translateY = e.touches[0].clientY - startY;
        updateTransform();
      }

      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        scale = Math.min(maxScale, Math.max(minScale, scale * (dist / pinchStartDist)));
        pinchStartDist = dist;
        updateTransform();
      }
    });
  }

  function next() {
    currentIndex = (currentIndex + 1) % items.length;
    renderMedia();
  }

  function prev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    renderMedia();
  }

  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  document.querySelector(".lightbox-next")?.addEventListener("click", next);
  document.querySelector(".lightbox-prev")?.addEventListener("click", prev);

  lightbox.addEventListener("click", e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape" && lightbox.classList.contains("active")) {
    closeLightbox();
    } 
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  });

  items.forEach((item, i) => {
    item.addEventListener("click", () => openLightbox(i));
    item.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  let swipeStartX = 0;
  lightbox.addEventListener("touchstart", e => {
    swipeStartX = e.touches[0].clientX;
  });

  lightbox.addEventListener("touchend", e => {
    const diff = e.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(diff) > 70) diff < 0 ? next() : prev();
  });
}
