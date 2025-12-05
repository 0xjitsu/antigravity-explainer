// ═══════════════════════════════════════════════════════════════════════════
// ANTI-GRAVITY CONSOLE — Core Experience Engine
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = {
    particles: {
        count: 80,
        connectionDistance: 150,
        baseSpeed: 0.3,
        mouseInfluence: 200,
        handInfluence: 350,
        attractionForce: 0.08,
        repulsionForce: 0.15
    },
    hand: {
        smoothing: 0.15,
        gestureThreshold: 0.05,
        palmOpenThreshold: 0.08
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
const state = {
    width: 0,
    height: 0,
    mouseX: 0,
    mouseY: 0,
    particles: [],
    handTrackingActive: false,
    handsDetected: false,
    hands: [],
    smoothedHands: [],
    lastGesture: null,
    gestureTriggered: false,
    ripples: [],
    forceFields: [],
    presenceHintShown: false,
    scrollProgress: 0
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS SETUP
// ─────────────────────────────────────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width;
    canvas.height = state.height;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * state.width;
        this.y = Math.random() * state.height;
        this.baseVx = (Math.random() - 0.5) * CONFIG.particles.baseSpeed;
        this.baseVy = (Math.random() - 0.5) * CONFIG.particles.baseSpeed;
        this.vx = this.baseVx;
        this.vy = this.baseVy;
        this.size = Math.random() * 2 + 1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.originalOpacity = this.opacity;
        this.hue = 180 + Math.random() * 40; // Cyan range
        this.influenced = false;
    }

    applyForce(fx, fy, intensity = 1) {
        this.vx += fx * intensity;
        this.vy += fy * intensity;
        this.influenced = true;
    }

    update() {
        // Apply friction to return to base velocity
        this.vx += (this.baseVx - this.vx) * 0.02;
        this.vy += (this.baseVy - this.vy) * 0.02;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around edges (smoother than bouncing)
        if (this.x < -10) this.x = state.width + 10;
        if (this.x > state.width + 10) this.x = -10;
        if (this.y < -10) this.y = state.height + 10;
        if (this.y > state.height + 10) this.y = -10;

        // Fade influence indicator
        if (this.influenced) {
            this.opacity = Math.min(1, this.opacity + 0.1);
        } else {
            this.opacity += (this.originalOpacity - this.opacity) * 0.05;
        }
        this.influenced = false;
    }

    draw() {
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );

        if (this.influenced) {
            gradient.addColorStop(0, `hsla(${this.hue}, 100%, 70%, ${this.opacity})`);
            gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
        } else {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    state.particles = [];
    for (let i = 0; i < CONFIG.particles.count; i++) {
        state.particles.push(new Particle());
    }
}

function drawConnections() {
    for (let i = 0; i < state.particles.length; i++) {
        for (let j = i + 1; j < state.particles.length; j++) {
            const dx = state.particles[i].x - state.particles[j].x;
            const dy = state.particles[i].y - state.particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.particles.connectionDistance) {
                const alpha = (1 - distance / CONFIG.particles.connectionDistance) * 0.15;

                // Color connections cyan when hands are active
                if (state.handsDetected && (state.particles[i].influenced || state.particles[j].influenced)) {
                    ctx.strokeStyle = `rgba(0, 243, 255, ${alpha * 2})`;
                } else {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                }

                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(state.particles[i].x, state.particles[i].y);
                ctx.lineTo(state.particles[j].x, state.particles[j].y);
                ctx.stroke();
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// RIPPLE EFFECTS
// ─────────────────────────────────────────────────────────────────────────────
class Ripple {
    constructor(x, y, color = '0, 243, 255') {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 300;
        this.opacity = 0.6;
        this.color = color;
        this.speed = 8;
    }

    update() {
        this.radius += this.speed;
        this.opacity = 0.6 * (1 - this.radius / this.maxRadius);
        return this.radius < this.maxRadius;
    }

    draw() {
        ctx.strokeStyle = `rgba(${this.color}, ${this.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// FORCE FIELD EFFECTS
// ─────────────────────────────────────────────────────────────────────────────
class ForceField {
    constructor(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.life = 1;
    }

    update() {
        this.life -= 0.02;
        return this.life > 0;
    }

    draw() {
        const gradient = ctx.createLinearGradient(this.x1, this.y1, this.x2, this.y2);
        gradient.addColorStop(0, `rgba(0, 243, 255, ${this.life * 0.5})`);
        gradient.addColorStop(0.5, `rgba(255, 255, 255, ${this.life * 0.3})`);
        gradient.addColorStop(1, `rgba(0, 243, 255, ${this.life * 0.5})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        // Draw energy nodes at endpoints
        [{ x: this.x1, y: this.y1 }, { x: this.x2, y: this.y2 }].forEach(point => {
            ctx.fillStyle = `rgba(0, 243, 255, ${this.life * 0.8})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8 * this.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HAND TRACKING SYSTEM
// ─────────────────────────────────────────────────────────────────────────────
let handTracker = null;
let videoElement = null;

async function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function initHandTracking() {
    if (state.handTrackingActive) return;

    try {
        // Load MediaPipe scripts
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1675466862/camera_utils.js');

        // Create hidden video element
        videoElement = document.createElement('video');
        videoElement.setAttribute('playsinline', '');
        videoElement.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;';
        document.body.appendChild(videoElement);

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });

        videoElement.srcObject = stream;
        await videoElement.play();

        // Initialize MediaPipe Hands
        handTracker = new window.Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`
        });

        handTracker.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });

        handTracker.onResults(onHandResults);

        // Start camera processing
        const camera = new window.Camera(videoElement, {
            onFrame: async () => {
                if (handTracker) {
                    await handTracker.send({ image: videoElement });
                }
            },
            width: 640,
            height: 480
        });

        await camera.start();
        state.handTrackingActive = true;
        updatePresenceIndicator('active');

    } catch (error) {
        console.log('Hand tracking unavailable:', error.message);
        updatePresenceIndicator('unavailable');
    }
}

function onHandResults(results) {
    state.handsDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

    if (state.handsDetected) {
        state.hands = results.multiHandLandmarks.map((landmarks, index) => {
            const handedness = results.multiHandedness[index].label;
            return processHandLandmarks(landmarks, handedness);
        });

        // Smooth hand positions
        smoothHandPositions();

        // Detect gestures
        detectGestures();
    } else {
        state.hands = [];
        state.smoothedHands = [];
    }
}

function processHandLandmarks(landmarks, handedness) {
    // Key landmarks: wrist(0), thumb_tip(4), index_tip(8), middle_tip(12), ring_tip(16), pinky_tip(20)
    // Palm center approximation: average of wrist and middle finger base

    const palmCenter = {
        x: (landmarks[0].x + landmarks[9].x) / 2,
        y: (landmarks[0].y + landmarks[9].y) / 2,
        z: (landmarks[0].z + landmarks[9].z) / 2
    };

    // Convert to screen coordinates (mirrored for natural feel)
    const screenX = (1 - palmCenter.x) * state.width;
    const screenY = palmCenter.y * state.height;

    // Calculate finger spread (palm open vs closed)
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerBases = [2, 5, 9, 13, 17];

    let totalSpread = 0;
    fingerTips.forEach((tip, i) => {
        const base = fingerBases[i];
        const dx = landmarks[tip].x - landmarks[base].x;
        const dy = landmarks[tip].y - landmarks[base].y;
        totalSpread += Math.sqrt(dx * dx + dy * dy);
    });

    const palmOpen = totalSpread > CONFIG.hand.palmOpenThreshold * 5;

    // Detect pinch (thumb tip close to index tip)
    const pinchDistance = Math.sqrt(
        Math.pow(landmarks[4].x - landmarks[8].x, 2) +
        Math.pow(landmarks[4].y - landmarks[8].y, 2)
    );
    const isPinching = pinchDistance < 0.05;

    // Detect pointing (index extended, others curled)
    const indexExtended = landmarks[8].y < landmarks[6].y;
    const middleCurled = landmarks[12].y > landmarks[10].y;
    const isPointing = indexExtended && middleCurled;

    return {
        x: screenX,
        y: screenY,
        z: palmCenter.z,
        palmOpen,
        isPinching,
        isPointing,
        handedness,
        landmarks,
        fingerTips: fingerTips.map(i => ({
            x: (1 - landmarks[i].x) * state.width,
            y: landmarks[i].y * state.height
        }))
    };
}

function smoothHandPositions() {
    if (state.smoothedHands.length !== state.hands.length) {
        state.smoothedHands = state.hands.map(h => ({ ...h }));
        return;
    }

    state.hands.forEach((hand, i) => {
        const smoothed = state.smoothedHands[i];
        const k = CONFIG.hand.smoothing;

        smoothed.x += (hand.x - smoothed.x) * k;
        smoothed.y += (hand.y - smoothed.y) * k;
        smoothed.palmOpen = hand.palmOpen;
        smoothed.isPinching = hand.isPinching;
        smoothed.isPointing = hand.isPointing;
        smoothed.fingerTips = hand.fingerTips;
    });
}

function detectGestures() {
    // Two hands create force field
    if (state.smoothedHands.length === 2) {
        const h1 = state.smoothedHands[0];
        const h2 = state.smoothedHands[1];

        if (h1.palmOpen && h2.palmOpen) {
            state.forceFields.push(new ForceField(h1.x, h1.y, h2.x, h2.y));
        }
    }

    // Single hand gestures
    state.smoothedHands.forEach(hand => {
        // Wave detection (rapid x movement) - trigger ripple
        if (hand.palmOpen && !state.gestureTriggered) {
            // Could add velocity tracking here for wave detection
        }
    });
}

function applyHandInfluence() {
    if (!state.handsDetected || state.smoothedHands.length === 0) return;

    state.smoothedHands.forEach(hand => {
        state.particles.forEach(particle => {
            const dx = particle.x - hand.x;
            const dy = particle.y - hand.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < CONFIG.particles.handInfluence && distance > 0) {
                const force = (CONFIG.particles.handInfluence - distance) / CONFIG.particles.handInfluence;
                const angle = Math.atan2(dy, dx);

                if (hand.palmOpen) {
                    // Open palm: attract particles
                    particle.applyForce(
                        -Math.cos(angle) * CONFIG.particles.attractionForce * force,
                        -Math.sin(angle) * CONFIG.particles.attractionForce * force,
                        1
                    );
                } else {
                    // Closed palm: repel particles (force push)
                    particle.applyForce(
                        Math.cos(angle) * CONFIG.particles.repulsionForce * force,
                        Math.sin(angle) * CONFIG.particles.repulsionForce * force,
                        1
                    );

                    // Trigger ripple on fist
                    if (Math.random() < 0.02) {
                        state.ripples.push(new Ripple(hand.x, hand.y));
                    }
                }
            }
        });

        // Pointing creates laser effect
        if (hand.isPointing) {
            const indexTip = hand.fingerTips[1]; // Index finger
            state.particles.forEach(particle => {
                const dx = particle.x - indexTip.x;
                const dy = particle.y - indexTip.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    particle.applyForce(
                        (Math.random() - 0.5) * 0.5,
                        (Math.random() - 0.5) * 0.5,
                        2
                    );
                    particle.hue = 0; // Red for laser
                }
            });
        }
    });
}

function drawHandIndicators() {
    if (!state.handsDetected) return;

    state.smoothedHands.forEach(hand => {
        // Draw palm glow
        const gradient = ctx.createRadialGradient(
            hand.x, hand.y, 0,
            hand.x, hand.y, 80
        );

        if (hand.palmOpen) {
            gradient.addColorStop(0, 'rgba(0, 243, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 100, 100, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 100, 100, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(hand.x, hand.y, 80, 0, Math.PI * 2);
        ctx.fill();

        // Draw fingertip dots when pointing
        if (hand.isPointing) {
            const indexTip = hand.fingerTips[1];
            ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.beginPath();
            ctx.arc(indexTip.x, indexTip.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESENCE INDICATOR UI
// ─────────────────────────────────────────────────────────────────────────────
function createPresenceIndicator() {
    const nav = document.querySelector('.glass-nav');
    if (!nav) return;

    const presenceBtn = document.createElement('button');
    presenceBtn.className = 'presence-toggle';
    presenceBtn.setAttribute('type', 'button');
    presenceBtn.setAttribute('aria-label', 'Enable hand tracking for interactive experience');
    presenceBtn.innerHTML = `
        <span class="presence-icon" aria-hidden="true">◉</span>
        <span class="presence-text">PRESENCE</span>
    `;

    presenceBtn.addEventListener('click', async () => {
        if (!state.handTrackingActive) {
            presenceBtn.classList.add('loading');
            await initHandTracking();
            presenceBtn.classList.remove('loading');
        }
    });

    // Insert before status indicator
    const statusIndicator = nav.querySelector('.status-indicator');
    if (statusIndicator) {
        nav.insertBefore(presenceBtn, statusIndicator);
    } else {
        nav.appendChild(presenceBtn);
    }

    // Show hint after delay
    setTimeout(() => {
        if (!state.handTrackingActive && !state.presenceHintShown) {
            presenceBtn.classList.add('hint');
            state.presenceHintShown = true;

            setTimeout(() => {
                presenceBtn.classList.remove('hint');
            }, 3000);
        }
    }, 15000);
}

function updatePresenceIndicator(status) {
    const presenceBtn = document.querySelector('.presence-toggle');
    if (!presenceBtn) return;

    presenceBtn.classList.remove('loading', 'active', 'unavailable');
    const textSpan = presenceBtn.querySelector('.presence-text');

    switch (status) {
        case 'active':
            presenceBtn.classList.add('active');
            if (textSpan) textSpan.textContent = 'CONNECTED';
            presenceBtn.setAttribute('aria-label', 'Hand tracking active');
            break;
        case 'unavailable':
            presenceBtn.classList.add('unavailable');
            if (textSpan) textSpan.textContent = 'UNAVAILABLE';
            presenceBtn.setAttribute('aria-label', 'Hand tracking unavailable');
            break;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL-DRIVEN ANIMATIONS
// ─────────────────────────────────────────────────────────────────────────────
function initScrollAnimations() {
    const sections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    sections.forEach(section => {
        section.classList.add('animate-on-scroll');
        observer.observe(section);
    });

    // Scroll progress for particles
    window.addEventListener('scroll', () => {
        state.scrollProgress = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D TILT EFFECT FOR CARDS
// ─────────────────────────────────────────────────────────────────────────────
function initCardTilt() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', handleCardMouseMove);
        card.addEventListener('mouseleave', handleCardMouseLeave);
        card.addEventListener('mouseenter', handleCardMouseEnter);
    });
}

function handleCardMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
}

function handleCardMouseEnter(e) {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.1s ease';
}

function handleCardMouseLeave(e) {
    const card = e.currentTarget;
    card.style.transition = 'transform 0.5s ease';
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
}

// Hand-driven card tilt
function updateCardTiltFromHands() {
    if (!state.handsDetected || state.smoothedHands.length === 0) return;

    const cards = document.querySelectorAll('.tilt-card');
    const hand = state.smoothedHands[0];

    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const dx = hand.x - cardCenterX;
        const dy = hand.y - cardCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 400) {
            const intensity = 1 - (distance / 400);
            const rotateY = (dx / 400) * 15 * intensity;
            const rotateX = -(dy / 400) * 15 * intensity;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${1 + intensity * 0.05}, ${1 + intensity * 0.05}, 1)`;
            card.style.setProperty('--mouse-x', `${rect.width / 2 + dx * 0.2}px`);
            card.style.setProperty('--mouse-y', `${rect.height / 2 + dy * 0.2}px`);
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// GLITCH TEXT EFFECT
// ─────────────────────────────────────────────────────────────────────────────
function initGlitchEffect() {
    const glitchText = document.querySelector('.glitch-text');
    if (!glitchText) return;

    const originalText = glitchText.getAttribute('data-text') || glitchText.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>[]{}';

    function randomGlitch() {
        if (Math.random() > 0.92) {
            let iterations = 0;
            const interval = setInterval(() => {
                glitchText.textContent = originalText
                    .split('')
                    .map((letter, index) => {
                        if (letter === ' ') return ' ';
                        if (index < iterations) return originalText[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                if (iterations >= originalText.length) {
                    clearInterval(interval);
                }

                iterations += 1 / 2;
            }, 25);
        }
    }

    setInterval(randomGlitch, 2500);
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUSE TRACKING
// ─────────────────────────────────────────────────────────────────────────────
function initMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        state.mouseX = e.clientX;
        state.mouseY = e.clientY;
    }, { passive: true });

    // Click to create ripple
    document.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
            state.ripples.push(new Ripple(e.clientX, e.clientY, '255, 255, 255'));
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MOUSE INFLUENCE ON PARTICLES
// ─────────────────────────────────────────────────────────────────────────────
function applyMouseInfluence() {
    if (state.handsDetected) return; // Let hands take over when active

    state.particles.forEach(particle => {
        const dx = particle.x - state.mouseX;
        const dy = particle.y - state.mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONFIG.particles.mouseInfluence && distance > 0) {
            const force = (CONFIG.particles.mouseInfluence - distance) / CONFIG.particles.mouseInfluence;
            const angle = Math.atan2(dy, dx);

            // Subtle repulsion from mouse
            particle.applyForce(
                Math.cos(angle) * 0.03 * force,
                Math.sin(angle) * 0.03 * force,
                0.5
            );
        }
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ANIMATION LOOP
// ─────────────────────────────────────────────────────────────────────────────
function animate() {
    ctx.clearRect(0, 0, state.width, state.height);

    // Apply influences to particles
    applyMouseInfluence();
    applyHandInfluence();

    // Update and draw particles
    state.particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Draw connections
    drawConnections();

    // Draw hand indicators
    drawHandIndicators();

    // Update card tilt from hands
    if (state.handsDetected) {
        updateCardTiltFromHands();
    }

    // Update and draw ripples
    state.ripples = state.ripples.filter(ripple => {
        ripple.draw();
        return ripple.update();
    });

    // Update and draw force fields
    state.forceFields = state.forceFields.filter(field => {
        field.draw();
        return field.update();
    });

    requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
function init() {
    resizeCanvas();
    initParticles();
    initCardTilt();
    initGlitchEffect();
    initMouseTracking();
    initScrollAnimations();
    createPresenceIndicator();
    animate();

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
