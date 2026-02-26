# Contributing to Affino

Thanks for contributing to Affino.

## Core principles

- Headless-first architecture.
- Deterministic behavior over implicit magic.
- Clear package boundaries (`core` vs adapters).
- Test and docs updates for behavior/API changes.

## Development setup

Requirements:

- Node.js `20.x` (recommended)
- `pnpm`

Install:

```bash
pnpm install
```

Useful commands:

```bash
pnpm run check
pnpm run build
pnpm run test:e2e
pnpm run quality:max
```

Local app/docs runs:

```bash
pnpm --filter demo-vue dev
pnpm --filter demo-laravel dev
pnpm --dir docs-site dev
```

## Pull request requirements

- Use the PR template in `/.github/PULL_REQUEST_TEMPLATE.md`.
- Keep PR scope focused (one logical change).
- Add/update tests for behavior changes.
- Update docs/readme for public API or integration contract changes.
- Add release notes context for releasable package changes (or explain why not needed).

## Ownership and review

- Ownership is defined in `/.github/CODEOWNERS`.
- Review and process rules:
  - `docs/process/review-policy.md`
  - `docs/process/definition-of-done.md`
  - `docs/process/branch-strategy.md`
  - `docs/process/branch-protection-policy.md`
  - `docs/process/release-process.md`

## Reporting

- Bugs/features: use issue templates in `/.github/ISSUE_TEMPLATE/`.
- Security issues: follow `SECURITY.md` and report privately.

## Code of conduct

By participating, you agree to `CODE_OF_CONDUCT.md`.
