# Contributing to Affino

Thanks for your interest in contributing to **Affino** 🎉\
Affino is a collection of high-performance, headless UI primitives
focused on deterministic behavior, accessibility, and framework
independence.

This guide explains how to propose changes, report issues, and submit
pull requests.

------------------------------------------------------------------------

## Philosophy

Affino libraries follow a few core principles:

-   **Headless first** --- logic is separated from rendering
-   **Deterministic behavior** --- no hidden side effects or DOM
    coupling
-   **Performance over magic** --- explicit state, no implicit observers
-   **Small surface area** --- APIs are intentionally minimal
-   **Framework-agnostic cores** --- adapters live on top

When contributing, please align with these principles.

------------------------------------------------------------------------

## Repository Structure

    packages/
      menu-core
      menu-vue
      menu-react
      selection-core
      virtualization-core
    docs/

-   **core packages** contain framework-agnostic logic only
-   **adapters** bind cores to specific frameworks
-   **docs** contain usage guides and architecture notes

------------------------------------------------------------------------

## Ways to Contribute

You can help by:

-   Reporting bugs or edge cases
-   Improving documentation or examples
-   Proposing API improvements
-   Adding framework adapters
-   Improving tests or performance

------------------------------------------------------------------------

## Reporting Issues

Before opening an issue, please:

1.  Search existing issues to avoid duplicates
2.  Include a minimal reproduction if possible
3.  Specify the package (`menu-core`, `selection-core`, etc.)
4.  Describe expected vs actual behavior

------------------------------------------------------------------------

## Development Setup

Requirements:

-   Node.js 18+
-   pnpm

Install dependencies:

``` bash
pnpm install
```

Run local development:

``` bash
pnpm dev
```

Run tests:

``` bash
pnpm test
```

------------------------------------------------------------------------

## Pull Request Guidelines

-   Keep PRs focused and minimal
-   One logical change per PR
-   Add or update tests when relevant
-   Update docs if behavior or API changes
-   Avoid breaking changes unless discussed first

------------------------------------------------------------------------

## Commit Style

-   Use clear, descriptive commit messages
-   Prefer imperative tone: `fix`, `add`, `refactor`
-   Avoid unrelated formatting changes

------------------------------------------------------------------------

## Code Style

-   TypeScript strict mode is enforced
-   Prefer explicit types over inference for public APIs
-   Avoid framework-specific assumptions in core packages
-   No DOM access inside core logic

------------------------------------------------------------------------

## API Changes

If you want to change a public API:

1.  Open an issue first
2.  Explain the motivation and trade-offs
3.  Consider backward compatibility
4.  Be ready to iterate on feedback

------------------------------------------------------------------------

## Code of Conduct

By participating in this project, you agree to follow the\
[Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md).

------------------------------------------------------------------------

## Questions

If you're unsure about anything, open an issue or start a discussion.
Thoughtful questions are always welcome.

Thanks for helping make **Affino** better 🚀
