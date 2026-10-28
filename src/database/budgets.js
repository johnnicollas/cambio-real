// CRUD da tabela budgets (orçamentos). Os gastos ficam em expenses.js.

export async function createBudget(db, { name, limitBrl }) {
  const { lastInsertRowId } = await db.runAsync(
    'INSERT INTO budgets (name, limit_brl) VALUES (?, ?)',
    [name, limitBrl]
  );
  return lastInsertRowId;
}

// Cada orçamento com o total gasto (soma dos gastos; 0 se não houver nenhum).
export async function getBudgetsWithTotals(db) {
  return db.getAllAsync(`
    SELECT b.*, COALESCE(SUM(e.total_brl), 0) AS spent
    FROM budgets b
    LEFT JOIN expenses e ON e.budget_id = b.id
    GROUP BY b.id
    ORDER BY b.created_at DESC, b.id DESC
  `);
}

export async function getBudgetWithTotal(db, id) {
  return db.getFirstAsync(
    `SELECT b.*, COALESCE(SUM(e.total_brl), 0) AS spent
     FROM budgets b
     LEFT JOIN expenses e ON e.budget_id = b.id
     WHERE b.id = ?
     GROUP BY b.id`,
    [id]
  );
}

export async function updateBudget(db, id, { name, limitBrl }) {
  await db.runAsync('UPDATE budgets SET name = ?, limit_brl = ? WHERE id = ?', [name, limitBrl, id]);
}

export async function setBudgetAlertSent(db, id, sent) {
  await db.runAsync('UPDATE budgets SET alert_sent = ? WHERE id = ?', [sent ? 1 : 0, id]);
}

// Os gastos do orçamento são apagados em cascata (ON DELETE CASCADE).
export async function deleteBudget(db, id) {
  await db.runAsync('DELETE FROM budgets WHERE id = ?', [id]);
}
