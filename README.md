
# Inventory (Next.js + TanStack Table + MUI)

Multi-layer inventory table inspired by MUI X Inventory demo (columns like Product / SKU / Status / Stock / Price / Cost / Profit / Rating / Sales), implemented with TanStack Table v8 and Material UI on Next.js App Router.

## Run locally

```bash
pnpm i   # or npm install
pnpm dev # or npm run dev
```

Then open http://localhost:3000

## Stack
- Next.js 14 (App Router)
- TanStack Table v8 (expanding rows / tree data)
- Material UI v5

## Notes
- 3 levels: **Status groups** → **Product rows** → **Service lines**
- Expansion is handled by TanStack `getSubRows` + `getExpandedRowModel()`.
# table
