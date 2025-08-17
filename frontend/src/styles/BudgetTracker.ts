// frontend/src/styles/budgetTracker.ts

export const budgetTrackerStyles = `
  .container { max-width: 1100px; margin: 0 auto; padding: 0 16px; }
  header, section { margin: 0 auto; }
  .row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
  .row > * { margin: 0; }
  .stack { display:flex; flex-direction:column; gap:12px; }
  .hint { color:#6b7280; font-size:.9rem; }
  .categories-list, .expenses-list { display:flex; flex-direction:column; gap:12px; }
  .dashboard-grid {
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap:16px;
  }
  .category-card {
    border:1px solid #e5e7eb; border-radius:12px; padding:12px; background:#fff;
    box-shadow:0 1px 2px rgba(0,0,0,.04);
  }
  .category-card h4 { margin:0 0 8px 0; }
  .progress-bar { height:8px; background:#e5e7eb; border-radius:999px; overflow:hidden; }
  .progress-fill { height:100%; }
  .category-stats { display:flex; justify-content:space-between; margin-top:8px; gap:10px; font-size:.95rem; }
  .category-item, .expense-item {
    border:1px solid #f1f5f9; border-radius:10px; background:#fff;
    padding:10px; display:flex; align-items:center; justify-content:space-between; gap:10px;
  }
  .category-view, .expense-edit, .category-edit { width:100%; }
  .category-edit, .expense-edit { display:flex; flex-direction:column; gap:8px; }
  .row-actions { display:flex; gap:8px; }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  .save-row { display:flex; justify-content:flex-end; }
  .goal-card { border:1px solid #e5e7eb; border-radius:12px; background:#fff; padding:12px; display:flex; flex-direction:column; gap:12px; }
  .chips { display:flex; flex-wrap:wrap; gap:8px; }
  .chip { display:inline-flex; align-items:center; gap:6px; background:#f1f5f9; color:#0f172a; border:1px solid #e2e8f0; border-radius:999px; padding:6px 10px; font-size:.9rem; }
  .chip button { border:none; background:transparent; cursor:pointer; }
`;
