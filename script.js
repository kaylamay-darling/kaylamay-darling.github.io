const banner = document.querySelector(".banner");
const bannerImage = document.querySelector(".banner img")

let maxOffset = 0;

function updateMaxOffset() {
    maxOffset = (bannerImage.naturalHeight / bannerImage.naturalWidth) * bannerImage.offsetWidth - banner.offsetHeight;
}

// Update parallax position based on scroll progress
function updateParallax() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const parallax = progress * -maxOffset;

    bannerImage.style.objectPosition = `center ${parallax}px`;
}

// Initialize on load, update on resize and scroll
window.addEventListener("load", () => {
    updateMaxOffset();
    updateParallax();
});

window.addEventListener("resize", () => {
    updateMaxOffset();
    updateParallax();
});

window.addEventListener("scroll", updateParallax);

// Initialize navigation drawer interaction on DOM load
document.addEventListener("DOMContentLoaded", () => {
    const navContainer = document.querySelector(".nav-container");
    const navToggle = document.querySelector(".nav__toggle");
    const navList = document.querySelector(".nav__list");

    // Fallback check for non-compliant environments
    if (!navToggle || !navContainer || !navList) return;

    // Cache focusable elements for keyboard navigation
    const navLinks = navList.querySelectorAll(".nav__link");
    const firstFocusable = navLinks[0];
    const lastFocusable = navLinks[navLinks.length - 1];

    function toggleDrawer() {
        const isOpen = !navContainer.classList.contains("nav-container--open");
        
        // Toggle drawer HTML state integration with ARIA attributes
        if (isOpen) {
            navContainer.classList.add("nav-container--open");
            navToggle.setAttribute("aria-expanded", "true");
            navToggle.setAttribute("aria-label", "Close");
            
            // Focus the first link in drawer
            setTimeout(() => {
                if (firstFocusable) firstFocusable.focus();
            }, 50); 
        } else {
            // Closer drawer and reset ARIA attributes
            navContainer.classList.remove("nav-container--open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Menu");
        }
    }

    // Toggle drawer on click
    navToggle.addEventListener("click", () => toggleDrawer());

    // Keyboard escape and tab focus management
    navContainer.addEventListener("keydown", (e) => {
        const isDrawerOpen = navContainer.classList.contains("nav-container--open");
        if (!isDrawerOpen) return;

        if (e.key === "Escape") {
            navContainer.classList.remove("nav-container--open");
            navToggle.setAttribute("aria-expanded", "false");
            navToggle.setAttribute("aria-label", "Menu");
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
});