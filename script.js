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
    mouseRadius: 150,
    mouseForce: 0.15,
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
  gesture: {
    trailLength: 20,
    trailFadeSpeed: 0.05,
    cursorSize: 20,
    cursorGlow: 15,
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
    this.mouse = { x: -1000, y: -1000, isMoving: false };
    this.trail = [];

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

    // Update and draw particles with mouse interaction
    const { mouseRadius, mouseForce } = CONFIG.particles;

    this.particles.forEach(particle => {
      // Mouse repulsion effect
      const dx = particle.x - this.mouse.x;
      const dy = particle.y - this.mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouseRadius && distance > 0) {
        const force = (mouseRadius - distance) / mouseRadius * mouseForce;
        particle.vx += (dx / distance) * force;
        particle.vy += (dy / distance) * force;

        // Limit velocity
        const maxSpeed = 3;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
          particle.vx = (particle.vx / speed) * maxSpeed;
          particle.vy = (particle.vy / speed) * maxSpeed;
        }
      }

      // Gradually slow down
      particle.vx *= 0.99;
      particle.vy *= 0.99;

      // Maintain minimum speed
      const minSpeed = CONFIG.particles.speed * 0.5;
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (currentSpeed < minSpeed) {
        particle.vx += (Math.random() - 0.5) * 0.1;
        particle.vy += (Math.random() - 0.5) * 0.1;
      }

      particle.update(this.width, this.height);
      particle.draw(this.ctx);
    });

    this.drawConnections();
    this.drawGestureTrail();
    this.drawCursor();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawGestureTrail() {
    if (this.trail.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(this.trail[0].x, this.trail[0].y);

    for (let i = 1; i < this.trail.length; i++) {
      const point = this.trail[i];
      const prevPoint = this.trail[i - 1];
      const midX = (prevPoint.x + point.x) / 2;
      const midY = (prevPoint.y + point.y) / 2;
      this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    }

    // Create gradient for trail
    const gradient = this.ctx.createLinearGradient(
      this.trail[0].x, this.trail[0].y,
      this.trail[this.trail.length - 1].x, this.trail[this.trail.length - 1].y
    );
    gradient.addColorStop(0, 'rgba(0, 243, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 243, 255, 0.6)');

    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Fade out old trail points
    this.trail = this.trail.filter((_, i) => i > this.trail.length - CONFIG.gesture.trailLength);
  }

  drawCursor() {
    if (this.mouse.x < 0 || this.mouse.y < 0) return;

    const { cursorSize, cursorGlow } = CONFIG.gesture;

    // Outer glow
    const gradient = this.ctx.createRadialGradient(
      this.mouse.x, this.mouse.y, 0,
      this.mouse.x, this.mouse.y, cursorSize + cursorGlow
    );
    gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
    gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');

    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, cursorSize + cursorGlow, 0, Math.PI * 2);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Inner ring
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, cursorSize / 2, 0, Math.PI * 2);
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Center dot
    this.ctx.beginPath();
    this.ctx.arc(this.mouse.x, this.mouse.y, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.fill();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    // Mouse tracking for gesture effects
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.isMoving = true;

      // Add to trail
      this.trail.push({ x: e.clientX, y: e.clientY, time: Date.now() });

      // Limit trail length
      if (this.trail.length > CONFIG.gesture.trailLength) {
        this.trail.shift();
      }
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.isMoving = false;
      this.trail = [];
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
