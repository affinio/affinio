---
title: Range move (drag‑move)
---

# Range move (drag‑move)

Range‑move transfers a block of cells to a new location.

## 1) Minimal contract

- Explicit drag‑move start (separate handle or modifier).
- Smooth target range updates.
- Escape cancel and safe rollback.

## 2) Basic sequence

```ts
orchestration.move.begin({ rowIndex: 1, colKey: "owner" })
orchestration.move.update({ rowIndex: 5, colKey: "owner" })
orchestration.move.commit()
```

## 3) UI recommendations

- Show a placeholder at the drop target.
- Do not mix drag‑move and fill‑handle.
- Consider virtualization on drag over.

