# Universal Project Setup Prompt

Use this prompt template whenever you want to rapidly prototype an idea and get it ready for visual sharing with others.

---

## The Prompt

```
Set up this project for production-ready deployment:

1. **Documentation**
   - Create/update CLAUDE.md with project overview, structure, and development guidelines
   - Ensure README.md has clear setup instructions

2. **CI/CD Pipeline**
   - Set up GitHub Actions workflow for automated testing and deployment
   - Configure Vercel deployment (preview for PRs, production for main)
   - Add appropriate secrets documentation

3. **Testing**
   - Add E2E tests using Playwright covering:
     - Core functionality and user flows
     - Responsive design breakpoints
     - Accessibility basics (ARIA, headings, keyboard navigation)
     - Visual regression snapshots (optional)
   - Configure test commands in package.json

4. **Code Quality**
   - Add linting (ESLint/StyleLint/HTMLValidate as appropriate)
   - Refactor for:
     - Accessibility (ARIA labels, semantic HTML, focus states)
     - Performance (lazy loading, code splitting if applicable)
     - Maintainability (clear structure, comments where needed)

5. **Deployment Ready**
   - Create vercel.json with security headers and caching
   - Update .gitignore for all artifacts
   - Ensure zero-config deployment works

After setup, provide:
- Summary of all changes made
- List of secrets needed (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- Quick start guide for running locally
```

---

## Variations by Project Type

### Static Sites (HTML/CSS/JS)
```
[Use base prompt above - no build step needed]
Add: Test with `npx serve .` locally
```

### React/Next.js
```
[Use base prompt + add:]
- Configure next.config.js for Vercel
- Add Jest/React Testing Library for component tests
- Set up Storybook if component-heavy
```

### Node.js API
```
[Use base prompt + add:]
- Add API integration tests with Supertest
- Configure health check endpoint
- Set up environment variable validation
- Add rate limiting and security middleware
```

### Python/FastAPI
```
[Use base prompt + add:]
- Use pytest for testing
- Add Ruff for linting
- Configure pyproject.toml
- Set up Docker if needed for Vercel
```

---

## Required GitHub Secrets

After running the setup, add these secrets to your repository:

| Secret | How to Get It |
|--------|---------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Run `vercel` CLI locally, check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Same as above, or Vercel Dashboard → Project Settings |

---

## Quick Verification Checklist

After the AI completes setup, verify:

- [ ] `npm install` runs without errors
- [ ] `npm test` passes (or shows expected snapshot updates)
- [ ] `npm run lint` passes (or shows only minor warnings)
- [ ] Site works at `http://localhost:3000` (or served port)
- [ ] All files committed and pushed
- [ ] GitHub Actions workflow triggers on push
- [ ] Vercel preview deploys on PR (after secrets are set)

---

## Example Usage

### Quick Prototype
```
I have a simple landing page idea. Set up this project for production-ready deployment so I can share it with others quickly.
```

### Full Application
```
This is a React dashboard app. Set up this project for production-ready deployment with:
- Component tests for the main dashboard
- E2E tests for the auth flow
- Storybook for the design system components
```

### API Service
```
This is a FastAPI backend. Set up this project for production-ready deployment with:
- Integration tests for all endpoints
- Health check and metrics endpoints
- Docker configuration for Vercel deployment
```

---

## Benefits of This Setup

1. **Instant Shareability** - One click to get a live URL
2. **Quality Assurance** - Tests catch regressions before deploy
3. **Professional Appearance** - Proper documentation and structure
4. **Collaboration Ready** - CI/CD enables safe contributions
5. **Iterate Quickly** - Preview deployments for every change
