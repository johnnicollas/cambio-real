// CRUD da tabela expenses (gastos de um orçamento).

export async function createExpense(db, { budgetId, description, amount, currency, rate, iofPercent, totalBrl }) {
  const { lastInsertRowId } = await db.runAsync(
    `INSERT INTO expenses (budget_id, description, amount, currency, rate, iof_percent, total_brl)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [budgetId, description, amount, currency, rate, iofPercent, totalBrl]
  );
  return lastInsertRowId;
}

export async function listExpensesByBudget(db, budgetId) {
  return db.getAllAsync(
    'SELECT * FROM expenses WHERE budget_id = ? ORDER BY created_at DESC, id DESC',
    [budgetId]
  );
}

export async function updateExpense(db, id, { description, amount, currency, rate, iofPercent, totalBrl }) {
  await db.runAsync(
    `UPDATE expenses
     SET description = ?, amount = ?, currency = ?, rate = ?, iof_percent = ?, total_brl = ?
     WHERE id = ?`,
    [description, amount, currency, rate, iofPercent, totalBrl, id]
  );
}

export async function deleteExpense(db, id) {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}
