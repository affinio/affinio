---
title: Fill handle and range move
---

# Fill handle and range move

Fill handle is used for autofill, and range‑move is used for moving ranges.

## 1) Minimal UI contract

- Separate handle element with explicit `mousedown`.
- Explicit drag cycle: begin → update → commit.
- Escape cancels.

## 2) Example sequence

```ts
orchestration.fill.begin({ rowIndex: 0, colKey: "service" })
orchestration.fill.update({ rowIndex: 5, colKey: "service" })
orchestration.fill.commit()
```

## 3) Recommendations

- Do not combine drag‑move and fill on the same handle.
- Use visual hints for the range.
- Consider virtualization on drag over.

Next: [/datagrid/viewport-a11y](/datagrid/viewport-a11y)
