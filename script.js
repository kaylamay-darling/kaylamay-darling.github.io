/**
 * Atrium Landing Page Core Engine
 * Architecture: Optimized Parallax, Nav Drawer, and Grid Accordion
 */

// Global state tracking to isolate Layout Reads from Style Writes
let parallaxState = {
    banner: null,
    bannerImage: null,
    maxOffset: 0,
    ticking: false,
    imageReady: false
};

function initParallaxEngine() {
    parallaxState.banner = document.querySelector(".banner");
    parallaxState.bannerImage = document.querySelector(".banner img");

    if (!parallaxState.banner || !parallaxState.bannerImage) return;

    const runRecalc = () => {
        const img = parallaxState.bannerImage;
        const container = parallaxState.banner;
        
        // Prevent division-by-zero errors if the image hasn't loaded dimensions
        if (img.naturalWidth === 0) return;
        
        parallaxState.imageReady = true;
        parallaxState.maxOffset = (img.naturalHeight / img.naturalWidth) * img.offsetWidth - container.offsetHeight;
        requestTick();
    };

    // Safely recalculate layout metrics only after assets have explicitly loaded
    if (parallaxState.bannerImage.complete) {
        runRecalc();
    } else {
        parallaxState.bannerImage.addEventListener("load", runRecalc);
    }

    window.addEventListener("resize", runRecalc, { passive: true });
    window.addEventListener("scroll", requestTick, { passive: true });
}

function requestTick() {
    if (!parallaxState.ticking && parallaxState.imageReady) {
        requestAnimationFrame(updateParallaxPosition);
        parallaxState.ticking = true;
    }
}

function updateParallaxPosition() {
    // Read operations (Cached or highly optimized window properties)
    const windowY = window.scrollY;
    const windowH = window.innerHeight;
    const docH = document.documentElement.scrollHeight; // Faster lookup target than document.body
    
    const maxScroll = docH - windowH;
    const progress = maxScroll > 0 ? windowY / maxScroll : 0;
    const parallax = progress * -parallaxState.maxOffset;

    // Write operations (Batched neatly to prevent browser layout thrashing)
    parallaxState.bannerImage.style.objectPosition = `center ${parallax}px`;
    parallaxState.ticking = false;
}

// Initialize structural UI interactions securely on DOM load
document.addEventListener("DOMContentLoaded", () => {
    // Run the high-efficiency background animation engine
    initParallaxEngine();

    /* ==== SECTION 1: GLOBAL NAVIGATION DRAWER ==== */
    const navContainer = document.querySelector(".nav-container");
    const navToggle = document.querySelector(".nav__toggle");
    const navList = document.querySelector(".nav__list");

    if (navToggle && navContainer && navList) {
        const navLinks = navList.querySelectorAll(".nav__link");
        const firstFocusable = navLinks[0];
        const lastFocusable = navLinks[navLinks.length - 1];

        const toggleDrawer = () => {
            const isOpen = !navContainer.classList.contains("nav-container--open");
            
            if (isOpen) {
                navContainer.classList.add("nav-container--open");
                navToggle.setAttribute("aria-expanded", "true");
                navToggle.setAttribute("aria-label", "Close Menu");
                
                // Accessible focus shifting with modern microtask routing
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

        navContainer.addEventListener("keydown", (e) => {
            if (!navContainer.classList.contains("nav-container--open")) return;

            if (e.key === "Escape") {
                toggleDrawer();
                navToggle.focus();
                return;
            }

            if (e.key === "Tab") {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable || document.activeElement === navToggle) {
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

    /* ==== SECTION 2: METADATA ACCORDION ENGINE ==== */
    const selfToggleRow = document.querySelector(".about__row--expandable");
    
    if (selfToggleRow) {
        const controlledAttr = selfToggleRow.getAttribute("aria-controls");
        if (!controlledAttr) return;

        const controlledIds = controlledAttr.split(" ");
        const subRows = controlledIds.map(id => document.getElementById(id)).filter(Boolean);

        const toggleSelfAccordion = () => {
            const isCurrentlyExpanded = selfToggleRow.getAttribute("aria-expanded") === "true";
            const newExpandedState = !isCurrentlyExpanded;

            selfToggleRow.setAttribute("aria-expanded", newExpandedState.toString());

            subRows.forEach(subRow => {
                // Toggle classes to feed your index-styles.css transition rules
                if (newExpandedState) {
                    subRow.classList.add("is-expanded");
                    subRow.setAttribute("aria-hidden", "false");
                    subRow.setAttribute("tabindex", "0");
                    
                    // Hardware accelerated layout synchronization trigger
                    void subRow.offsetHeight; 
                } else {
                    subRow.classList.remove("is-expanded");
                    subRow.setAttribute("aria-hidden", "true");
                    subRow.removeAttribute("tabindex");
                }
            });
        };

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
});