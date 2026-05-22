// On page load, check for "lucky=true" in the URL and apply the effect to a random project card

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("lucky") === "true") {
    const container = document.querySelector(".projects__wrapper");
    const cards = document.querySelectorAll(".project-card");

    if (cards.length > 0) {
      const randomIndex = Math.floor(Math.random() * cards.length);
      const luckyCard = cards[randomIndex];

      createLuckyBanner(luckyCard, container);

      // Activation classes
      luckyCard.classList.add("is-lucky");
      container.classList.add("lucky-active");

      // Initiate sparkle effect
      createSparkleEffect(luckyCard);

      window.setTimeout(() => {
        luckyCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    }
  }
});

// Create the banner and attach it to the lucky card
function createLuckyBanner(luckyCard, container) {
  const fateBanner = document.createElement("div");
  fateBanner.className = "fate-banner";
  fateBanner.innerHTML = `
    <div class="fate-banner__content">
      <img src="assets/dice-icon.webp" alt="" />
      <span>Fate has decided...</span>
    </div>
    <button class="fate-banner__close" aria-label="Remove lucky effect">×</button>
  `;

  // Close button
  fateBanner.querySelector('.fate-banner__close').addEventListener('click', () => {
    const canvas = luckyCard.querySelector('.sparkle-canvas');
    if (canvas) canvas.remove();
    fateBanner.remove();
    luckyCard.classList.remove("is-lucky");
    container.classList.remove("lucky-active");
  });

  luckyCard.prepend(fateBanner);
}

// Create the sparkle effect and animation
function createSparkleEffect(card) {
  // Configuration for particle behavior
  const config = {
    speedRange: [0.1, 0.8],
    sizeRange: [0.5, 4.5],
    spawnRate: 0.7,
    decayRate: 0.02,
    opacityRange: [0.3, 1.0]
  };

  // Create canvas and position it over the card
  const canvas = document.createElement("canvas");
  canvas.className = "sparkle-canvas";
  card.prepend(canvas);
  
  // Cache dimensions and context
  const ctx = canvas.getContext("2d");
  const rect = card.getBoundingClientRect();
  canvas.width = rect.width + 100;
  canvas.height = rect.height + 100;

  // In-memory particle system
  const particles = [];

  // Function to spawn a new particle with random properties
  function spawnParticle() {
    const side = Math.floor(Math.random() * 4); // Pick a random side 0-3
    const speed = Math.random() * (config.speedRange[1] - config.speedRange[0]) + config.speedRange[0]; // Random speed
    const size = Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0]; // Random size
    const startOpacity = Math.random() * (config.opacityRange[1] - config.opacityRange[0]) + config.opacityRange[0]; // Random starting opacity
    
    // Spawn from a random edge with outward velocity
    let x, y, vx, vy;
    if (side === 0) { x = Math.random() * canvas.width; y = 50; vx = (Math.random() - 0.5) * speed; vy = -speed; }
    else if (side === 1) { x = canvas.width - 50; y = Math.random() * canvas.height; vx = speed; vy = (Math.random() - 0.5) * speed; }
    else if (side === 2) { x = Math.random() * canvas.width; y = canvas.height - 50; vx = (Math.random() - 0.5) * speed; vy = speed; }
    else { x = 50; y = Math.random() * canvas.height; vx = -speed; vy = (Math.random() - 0.5) * speed; }

    return { x, y, vx, vy, size, life: 1.0, startOpacity };
  }

  // Animation loop to update and render particles
  function animate() {
    // Clear canvas each frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Spawn new particles based on spawn rate
    if (Math.random() < config.spawnRate) particles.push(spawnParticle());

    // For each particle, update position, reduce life, and draw it
    particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= config.decayRate;
      const currentOpacity = p.life * p.startOpacity;
      ctx.fillStyle = `rgba(185, 39, 214, ${currentOpacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0) particles.splice(index, 1);
    });
    
    // Check if element is still active before next frame
    if (card.classList.contains('is-lucky')) {
        requestAnimationFrame(animate);
    }
  }
  animate();
}