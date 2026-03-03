# DataGrid Commercial Go-Live Checklist

Updated: `2026-03-03`

This checklist is the release gate for publishing:

- `@affino/datagrid`
- `@affino/datagrid-pro`

## 1. Versioning and changelog

- [ ] `packages/datagrid/package.json` and `packages/datagrid-pro/package.json` versions are aligned.
- [ ] Dist-tag is selected by policy:
  - [ ] `latest` for stable versions only.
  - [ ] `next` for prerelease versions only.
  - [ ] `enterprise-hotfix` only from `enterprise-hotfix/*` tags.
- [ ] Release notes/changelog include:
  - [ ] user-facing API changes.
  - [ ] license/runtime behavior changes.
  - [ ] migration notes for docs/examples.

## 2. Commercial quality gates

- [ ] `pnpm run quality:commercial:datagrid`
- [ ] `pnpm run release:commercial:channel:check`
- [ ] `pnpm run release:commercial:pack:gate`

Artifacts required:

- [ ] `artifacts/quality/datagrid-commercial-boundaries-report.json`
- [ ] `artifacts/quality/datagrid-commercial-release-channel-report.json`
- [ ] `artifacts/quality/datagrid-commercial-release-readiness-report.json`
- [ ] `artifacts/quality/datagrid-commercial-tarball-boundaries-report.json`
- [ ] `artifacts/release/*.tgz`

## 3. License matrix verification

- [ ] Active signed token: raw pro behavior for `createDataGridApi(...)` and `createDataGridRuntime(...)`.
- [ ] Grace signed token: same pro behavior (no degradation).
- [ ] Expired token: deterministic validation error and no silent pro fallback.
- [ ] Invalid signature: deterministic validation error and no runtime mutation side effects.

## 4. Provenance and publish safety

- [ ] npm publish uses provenance (`publishConfig.provenance=true`).
- [ ] npm token configured in CI secrets.
- [ ] No manual local publish from dirty worktree.
- [ ] Publish happens only via workflow for selected channel.

## 5. Tarball smoke install

Run in clean temp directory:

1. `npm init -y`
2. `npm install ./affino-datagrid-<version>.tgz ./affino-datagrid-pro-<version>.tgz`
3. Verify imports:
   - `import { createDataGridRuntime } from "@affino/datagrid"`
   - `import { enableProFeatures } from "@affino/datagrid-pro"`
4. Type-check sample usage with signed token.

- [ ] Community install smoke test passed.
- [ ] Pro activation smoke test passed.

## 6. Docs and communication

- [ ] `packages/datagrid/README.md` updated for signed license token format.
- [ ] `packages/datagrid-pro/README.md` updated for error codes and activation flow.
- [ ] `docs/datagrid-commercial-packaging-plan.md` updated for channel policy and phase status.
- [ ] Public docs reference correct install paths and channel semantics.
