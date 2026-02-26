## Summary

- What changed?
- Why was it needed?

## Scope

- [ ] Core package changes
- [ ] Adapter package changes
- [ ] Docs/process-only changes
- [ ] CI/release workflow changes

## Validation

- [ ] `pnpm run check`
- [ ] `pnpm run build`
- [ ] `pnpm run test:e2e` (if user-facing behavior changed)
- [ ] Perf assertions (if runtime/adapter hot paths changed)

## Release

- [ ] Release notes impact documented (or marked as not applicable)
- [ ] Updated package/docs changelog notes if behavior/API changed

## Risk Assessment

- Risk level: `low` / `medium` / `high`
- Rollback plan:

## Checklist

- [ ] No unrelated changes in this PR
- [ ] Public API changes are documented
- [ ] Tests added/updated for behavior changes
- [ ] Backward compatibility considered
