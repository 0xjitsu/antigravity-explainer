# CLAUDE.md - Anti-Gravity Explainer

## Project Overview

This is an interactive educational website explaining the "Anti-Gravity" agentic coding workflow concepts. Built with vanilla HTML, CSS, and JavaScript - no build step required.

## Tech Stack

- **HTML5** - Semantic structure with accessibility considerations
- **CSS3** - Modern features (Grid, Flexbox, CSS Variables, Backdrop-filter, 3D Transforms)
- **JavaScript** - Vanilla ES6+ (Canvas API, Classes, Event Handling)
- **Fonts** - Google Fonts (Outfit, Space Mono)
- **Design** - Glassmorphism with cyberpunk/neon aesthetic

## Project Structure

```
/
├── index.html        # Main HTML entry point
├── style.css         # All styles with CSS variables
├── script.js         # Canvas animations + interactivity
├── package.json      # Dev dependencies (testing, linting)
├── playwright.config.js  # E2E test configuration
├── tests/            # Playwright E2E tests
│   └── e2e/
│       └── site.spec.js
└── .github/
    └── workflows/
        └── ci.yml    # CI/CD for testing + Vercel deployment
```

## Development

### Quick Start

```bash
# Install dev dependencies
npm install

# Run local server (for testing)
npx serve .

# Run E2E tests
npm test

# Run tests in UI mode
npm run test:ui
```

### No Build Required

This is a static site - just open `index.html` in a browser or serve the directory.

## Key Components

### Canvas Particle System (`script.js:1-91`)
- 60 animated particles with connection lines
- Physics-based movement with edge bouncing
- Configurable: `PARTICLE_COUNT`, `CONNECTION_DISTANCE`

### 3D Card Tilt Effect (`script.js:94-126`)
- Mouse-tracking 3D rotation (max ±10°)
- Dynamic glow that follows cursor
- Uses CSS `perspective` and `transform-style: preserve-3d`

### Glitch Text Animation (`script.js:128-156`)
- Random character substitution effect
- 5% trigger chance every 2 seconds
- Smooth reveal animation

## Design System

CSS Variables defined in `:root` (style.css:1-12):
- `--bg-color`: #050505 (near-black background)
- `--accent-color`: #00f3ff (cyan neon)
- `--glass-bg`: rgba(255, 255, 255, 0.03)
- `--font-main`: 'Outfit' (headings, body)
- `--font-mono`: 'Space Mono' (code, labels)

## Testing

E2E tests verify:
- Page loads correctly with all sections
- Canvas animation initializes
- Card hover interactions work
- Responsive layout functions
- All visual elements render

Run tests: `npm test`

## Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. No build configuration needed (static site)
3. Deploys automatically on push to main

### Manual

Upload `index.html`, `style.css`, `script.js` to any static host.

## CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Lint** - Validates HTML/CSS
2. **E2E Tests** - Runs Playwright tests
3. **Auto-Merge** - Automatically merges `claude/*` branches when tests pass
4. **Deploy** - Vercel deploys automatically on merge to main

### Automated Deployment Workflow

When Claude makes changes:
1. Claude commits to `claude/*` branch and pushes
2. PR is created automatically
3. CI runs (lint + tests)
4. If tests pass → auto-merge to main
5. Vercel deploys to production

**No manual intervention required.**

### Prerequisites for Auto-Merge
- Enable "Allow auto-merge" in GitHub repo settings (Settings → General → Pull Requests)

## Code Guidelines

- Keep vanilla JS - no frameworks needed for this scope
- Use CSS variables for theming consistency
- Maintain glassmorphism design language
- Test interactive elements with Playwright
- Ensure mobile responsiveness (768px breakpoint)

## Common Tasks

### Add New Section
1. Add semantic HTML in `index.html`
2. Style with `.glass-panel` or `.glass-card` classes
3. Add responsive rules if needed

### Modify Theme Colors
Edit CSS variables in `:root` block (style.css:1-12)

### Adjust Animation Speed
- Particle speed: `script.js:17-18` (vx, vy multipliers)
- Glitch interval: `script.js:156` (2000ms default)
- CSS transitions: Various `transition` properties
