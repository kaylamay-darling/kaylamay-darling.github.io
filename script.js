/* ==== BANNER PARALLAX ==== */

let parallaxState = {
  banner: null,
  bannerImage: null,
  maxOffset: 0,
  ticking: false,
  imageReady: false,
};

// Initialize parallax engine on DOMContentLoaded to ensure elements are available
function initParallaxEngine() {
  parallaxState.banner = document.querySelector(".banner");
  parallaxState.bannerImage = document.querySelector(".banner img");

  if (!parallaxState.banner || !parallaxState.bannerImage) return;

  // Recalculate parallax parameters
  const runRecalc = () => {
    const img = parallaxState.bannerImage;
    const container = parallaxState.banner;

    if (img.naturalWidth === 0) return;

    parallaxState.imageReady = true;
    parallaxState.maxOffset =
      (img.naturalHeight / img.naturalWidth) * img.offsetWidth -
      container.offsetHeight;
    requestTick();
  };

  if (parallaxState.bannerImage.complete) {
    runRecalc();
  } else {
    parallaxState.bannerImage.addEventListener("load", runRecalc);
  }

  window.addEventListener("resize", runRecalc, { passive: true });
  window.addEventListener("scroll", requestTick, { passive: true });
}

// Request the next animation frame
function requestTick() {
  if (!parallaxState.ticking && parallaxState.imageReady) {
    requestAnimationFrame(updateParallaxPosition);
    parallaxState.ticking = true;
  }
}

// Update the parallax position based on scroll progress
function updateParallaxPosition() {
  const windowY = window.scrollY;
  const windowH = window.innerHeight;
  const docH = document.documentElement.scrollHeight;

  const maxScroll = docH - windowH;
  const progress = maxScroll > 0 ? windowY / maxScroll : 0;
  const parallax = progress * -parallaxState.maxOffset;

  parallaxState.bannerImage.style.objectPosition = `center ${parallax}px`;
  parallaxState.ticking = false;
}

/* ==== NAVIGATION DRAWER ==== */

// Initialize navigation drawer and related event listeners on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  initParallaxEngine();

  const navContainer = document.querySelector(".nav-container");
  const navToggle = document.querySelector(".nav__toggle");
  const navList = document.querySelector(".nav__list");

  if (navToggle && navContainer && navList) {
    const navLinks = navList.querySelectorAll(".nav__link");
    const firstFocusable = navLinks[0];
    const lastFocusable = navLinks[navLinks.length - 1];

    const toggleDrawer = () => {
      const isOpen = !navContainer.classList.contains("nav-container--open");

      // Toggle ARIA attributes and classes based on the new state
      if (isOpen) {
        navContainer.classList.add("nav-container--open");
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Close Menu");

        // Focus the first link in the drawer after it opens
        queueMicrotask(() => {
          if (firstFocusable) firstFocusable.focus();
        });
      } else {
        navContainer.classList.remove("nav-container--open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open Menu");
      }
    };

    navToggle.addEventListener("click", toggleDrawer);

    // Handle keyboard navigation and focus trapping within the drawer
    navContainer.addEventListener("keydown", (e) => {
      if (!navContainer.classList.contains("nav-container--open")) return;

      if (e.key === "Escape") {
        toggleDrawer();
        navToggle.focus();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (
            document.activeElement === firstFocusable ||
            document.activeElement === navToggle
          ) {
            if (lastFocusable) lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            navToggle.focus();
            e.preventDefault();
          }
        }
      }
    });
  }

  /* ==== ABOUT TABLE ACCORDION ==== */

  // Inititalize toggle accordion functionality for the about table on DOMContentLoaded
  const selfToggleRow = document.querySelector(".about__row--expandable");

  // Check if the toggle row exists and has the necessary ARIA attribute
  if (selfToggleRow) {
    const controlledAttr = selfToggleRow.getAttribute("aria-controls");
    if (!controlledAttr) return;

    const controlledIds = controlledAttr.split(" ");
    const subRows = controlledIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // Toggle accordion state and update ARIA attributes accordingly
    const toggleSelfAccordion = () => {
      const isCurrentlyExpanded =
        selfToggleRow.getAttribute("aria-expanded") === "true";
      const newExpandedState = !isCurrentlyExpanded;

      selfToggleRow.setAttribute("aria-expanded", newExpandedState.toString());

      // Update sub-rows visibility and ARIA attributes based on the new state
      subRows.forEach((subRow) => {
        if (newExpandedState) {
          subRow.classList.add("is-expanded");
          subRow.setAttribute("aria-hidden", "false");
          subRow.setAttribute("tabindex", "0");

          void subRow.offsetHeight;
        } else {
          subRow.classList.remove("is-expanded");
          subRow.setAttribute("aria-hidden", "true");
          subRow.removeAttribute("tabindex");
        }
      });
    };

    // Handle click and keyboard events on the toggle row, ensuring sub-row interactions don't trigger the toggle
    selfToggleRow.addEventListener("click", (e) => {
      if (e.target.closest(".about__row--sub")) return;
      toggleSelfAccordion();
    });

    selfToggleRow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        if (e.target.closest(".about__row--sub")) return;
        e.preventDefault();
        toggleSelfAccordion();
      }
    });
  }

  /* ==== GALLERY TRIGGER AND THUMBNAIL MODALITY ==== */

  // Cache gallery and modal elements
  const galleryTrigger = document.querySelector(".gallery__trigger");
  const galleryTrack = document.getElementById("gallery__feed-track");
  const modalPortal = document.getElementById("gallery-modal");
  const modalImage = modalPortal
    ? modalPortal.querySelector(".modal-portal__image")
    : null;
  const modalCaption = modalPortal
    ? modalPortal.querySelector(".modal-portal__caption")
    : null;
  const modalCloseBtn = modalPortal
    ? modalPortal.querySelector(".modal-portal__close-btn")
    : null;
  const modalBackdrop = modalPortal
    ? modalPortal.querySelector(".modal-portal__backdrop")
    : null;

  let activeTriggerButton = null;

  // Handle gallery trigger button click to toggle gallery visibility and manage ARIA attributes
  if (galleryTrigger && galleryTrack) {
    galleryTrigger.addEventListener("click", () => {
      const isExpanded =
        galleryTrigger.getAttribute("aria-expanded") === "true";
      const newExpandedState = !isExpanded;

      galleryTrigger.setAttribute("aria-expanded", newExpandedState.toString());
      galleryTrack.setAttribute("aria-hidden", isExpanded.toString());

      if (newExpandedState) {
        const firstZoomBtn = galleryTrack.querySelector(".gallery__zoom-btn");
        if (firstZoomBtn) {
          queueMicrotask(() => firstZoomBtn.focus());
        }
      }
    });

    galleryTrack.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        galleryTrigger.click();
        galleryTrigger.focus();
      }
    });
  }

  // Function to open the modal portal with the selected image and manage focus and ARIA attributes
  const openModalPortal = (src, alt) => {
    if (!modalPortal || !modalImage) return;

    // Inherit the alt and src from the thumbnail
    modalImage.src = src;
    modalImage.alt = alt;

    modalPortal.classList.add("modal--open");
    modalPortal.setAttribute("aria-hidden", "false");
    modalPortal.removeAttribute("tabindex");

    modalCaption.textContent = alt;

    document.body.style.overflow = "hidden";

    queueMicrotask(() => {
      if (modalCloseBtn) modalCloseBtn.focus();
    });
  };

  // Close the modal portal and restore focus to the triggering button, while managing ARIA attributes and scroll behavior
  const closeModalPortal = () => {
    if (!modalPortal || !modalPortal.classList.contains("modal--open")) return;

    modalPortal.classList.remove("modal--open");
    modalPortal.setAttribute("aria-hidden", "true");
    modalPortal.setAttribute("tabindex", "-1");

    document.body.style.overflow = "";

    if (activeTriggerButton) {
      activeTriggerButton.focus();
      activeTriggerButton = null;
    }
  };

  if (galleryTrack && modalPortal) {
    // Handle click events on the gallery track
    galleryTrack.addEventListener("click", (e) => {
      const zoomBtn = e.target.closest(".gallery__zoom-btn");
      if (!zoomBtn) return;

      const thumbnailImg = zoomBtn.querySelector("img");
      if (!thumbnailImg) return;

      activeTriggerButton = zoomBtn;
      openModalPortal(thumbnailImg.src, thumbnailImg.alt);
    });

    // Handle modal close button and backdrop clicks, as well as Escape key press to close the modal
    if (modalCloseBtn)
      modalCloseBtn.addEventListener("click", closeModalPortal);
    if (modalBackdrop)
      modalBackdrop.addEventListener("click", closeModalPortal);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalPortal.classList.contains("modal--open")) {
        closeModalPortal();
      }
    });
  }

  /* ==== FILTER DROPDOWN LOGIC ==== */

  const filterDropdown = document.querySelector(".filter-dropdown");
  const filterLabel = document.querySelector(".filter-dropdown__label"); // This is your <button>
  const filterButtons = document.querySelectorAll(".filter-btn");

  if (filterDropdown && filterLabel) {
    filterButtons.forEach((btn) => btn.setAttribute("tabindex", "-1"));

    const toggleFilterMenu = (open) => {
      filterDropdown.classList.toggle("is-open", open);
      filterLabel.setAttribute("aria-expanded", open);

      filterButtons.forEach((btn) => {
        btn.setAttribute("tabindex", open ? "0" : "-1");
      });
    };

    filterLabel.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !filterDropdown.classList.contains("is-open");
      toggleFilterMenu(willOpen);
    });

    filterLabel.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const willOpen = !filterDropdown.classList.contains("is-open");
        toggleFilterMenu(willOpen);
      }
    });

    filterDropdown.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && filterDropdown.classList.contains("is-open")) {
        e.preventDefault();
        toggleFilterMenu(false);
        filterLabel.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (!filterDropdown.contains(e.target)) {
        toggleFilterMenu(false);
      }
    });
  }
});