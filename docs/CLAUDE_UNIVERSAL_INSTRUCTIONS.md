# Universal Claude Instructions for Automated Deployment

Copy this to your global Claude settings or to each repo's CLAUDE.md.

---

## Automated Deployment Workflow

When I ask you to "deploy", "commit and deploy", or "make changes and deploy":

1. **Make the requested changes**
2. **Run linting/tests locally** if possible to catch errors early
3. **Commit to a `claude/*` branch** with a descriptive message
4. **Push to origin** - this creates a PR automatically
5. **CI runs automatically** - lint, tests, auto-merge
6. **Report the Vercel preview URL** from the PR

### Commands Pattern
```
git checkout -b claude/<feature>-<session-id>
git add -A
git commit -m "descriptive message"
git push -u origin claude/<feature>-<session-id>
```

---

## GitHub Actions Workflow Template

Add this to `.github/workflows/ci.yml` in any repo:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    name: Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
        continue-on-error: true

  test:
    name: Test
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test

  auto-merge:
    name: Auto Merge
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request' && startsWith(github.head_ref, 'claude/')
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Merge PR
        uses: peter-evans/enable-pull-request-automerge@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          pull-request-number: ${{ github.event.pull_request.number }}
          merge-method: squash
```

---

## One-Time GitHub Repo Setup

For each repo, enable auto-merge:

1. Go to **Settings → General**
2. Scroll to **Pull Requests**
3. Check **"Allow auto-merge"**
4. (Optional) Check **"Automatically delete head branches"**

---

## Vercel Setup

1. Connect GitHub repo to Vercel (vercel.com/new)
2. No additional config needed for static sites
3. Vercel auto-deploys on every push to main

---

## CLAUDE.md Template for New Repos

```markdown
# Project Name

## Automated Deployment

This repo uses automated CI/CD:
- Push to `claude/*` branch → PR created
- Tests pass → Auto-merge to main
- Vercel deploys automatically

## Development

\`\`\`bash
npm install
npm run dev
npm test
\`\`\`

## Tech Stack

- [List your technologies]

## Project Structure

\`\`\`
/
├── src/
├── tests/
├── .github/workflows/ci.yml
└── package.json
\`\`\`
```

---

## Quick Reference

| Action | Command |
|--------|---------|
| Deploy changes | "Deploy these changes" |
| Check status | "What's the deployment status?" |
| View live site | Check Vercel dashboard or `https://<project>.vercel.app` |

---

## Troubleshooting

**CI failing?**
- Check GitHub Actions tab for error logs
- Run tests locally first: `npm test`

**Auto-merge not working?**
- Verify "Allow auto-merge" is enabled in repo settings
- Check branch name starts with `claude/`

**Vercel not deploying?**
- Verify GitHub integration is connected
- Check Vercel dashboard for deployment logs
