/**
 * Anti-Gravity Explainer - Interactive Features
 * Canvas particle system, 3D card effects, and glitch animations
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
  particles: {
    count: 60,
    connectionDistance: 150,
    speed: 0.5,
    minSize: 1,
    maxSize: 3,
  },
  tilt: {
    maxRotation: 10,
    scale: 1.02,
    perspective: 1000,
  },
  glitch: {
    triggerChance: 0.05,
    checkInterval: 2000,
    revealSpeed: 30,
    characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&',
  },
};

// =============================================================================
// PARTICLE SYSTEM
// =============================================================================

class Particle {
  constructor(canvasWidth, canvasHeight) {
    this.reset(canvasWidth, canvasHeight);
  }

  reset(width, height) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * CONFIG.particles.speed;
    this.vy = (Math.random() - 0.5) * CONFIG.particles.speed;
    this.size = Math.random() * (CONFIG.particles.maxSize - CONFIG.particles.minSize) + CONFIG.particles.minSize;
  }

  update(width, height) {
    this.x += this.vx;
    this.y += this.vy;

    // Bounce off edges
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    // Keep within bounds
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));
  }

  draw(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class ParticleSystem {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;

    this.init();
    this.bindEvents();
  }

  init() {
    this.resize();
    this.createParticles();
    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < CONFIG.particles.count; i++) {
      this.particles.push(new Particle(this.width, this.height));
    }
  }

  drawConnections() {
    const { connectionDistance } = CONFIG.particles;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = (1 - distance / connectionDistance) * 0.1;
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.particles.forEach(particle => {
      particle.update(this.width, this.height);
      particle.draw(this.ctx);
    });

    this.drawConnections();
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// =============================================================================
// 3D TILT EFFECT
// =============================================================================

class TiltEffect {
  constructor(selector) {
    this.cards = document.querySelectorAll(selector);
    this.bindEvents();
  }

  bindEvents() {
    this.cards.forEach(card => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
    });
  }

  handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const { maxRotation, scale, perspective } = CONFIG.tilt;
    const rotateX = ((y - centerY) / centerY) * -maxRotation;
    const rotateY = ((x - centerX) / centerX) * maxRotation;

    card.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

    // Update glow position via CSS custom properties
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  handleMouseLeave(e) {
    const card = e.currentTarget;
    const { perspective } = CONFIG.tilt;
    card.style.transform = `perspective(${perspective}px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
  }
}

// =============================================================================
// GLITCH TEXT EFFECT
// =============================================================================

class GlitchText {
  constructor(selector) {
    this.element = document.querySelector(selector);
    if (!this.element) return;

    this.originalText = this.element.getAttribute('data-text') || this.element.textContent;
    this.isAnimating = false;
    this.intervalId = null;

    this.startRandomGlitches();
  }

  glitch() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const { revealSpeed, characters } = CONFIG.glitch;
    let iterations = 0;

    const interval = setInterval(() => {
      this.element.textContent = this.originalText
        .split('')
        .map((letter, index) => {
          if (index < iterations) {
            return this.originalText[index];
          }
          if (letter === ' ') return ' ';
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');

      if (iterations >= this.originalText.length) {
        clearInterval(interval);
        this.isAnimating = false;
      }

      iterations += 1 / 3;
    }, revealSpeed);
  }

  startRandomGlitches() {
    const { triggerChance, checkInterval } = CONFIG.glitch;

    this.intervalId = setInterval(() => {
      if (Math.random() < triggerChance) {
        this.glitch();
      }
    }, checkInterval);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all interactive features
  const particleSystem = new ParticleSystem('bg-canvas');
  const tiltEffect = new TiltEffect('.tilt-card');
  const glitchText = new GlitchText('.glitch-text');

  // Expose for debugging (optional, remove in production)
  window.__antiGravity = {
    particleSystem,
    tiltEffect,
    glitchText,
    config: CONFIG,
  };
});
