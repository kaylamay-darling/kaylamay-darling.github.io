const banner = document.querySelector(".banner");
const bannerImage = document.querySelector(".banner img")

let maxOffset = 0;

function updateMaxOffset() {
    maxOffset = (bannerImage.naturalHeight / bannerImage.naturalWidth) * bannerImage.offsetWidth - banner.offsetHeight;
}

function updateParallax() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const parallax = progress * -maxOffset;

    bannerImage.style.objectPosition = `center ${parallax}px`;
}

window.addEventListener("load", () => {
    updateMaxOffset();
    updateParallax();
});

window.addEventListener("resize", () => {
    updateMaxOffset();
    updateParallax();
});

window.addEventListener("scroll", updateParallax);