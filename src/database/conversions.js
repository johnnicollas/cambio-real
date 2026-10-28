// CRUD da tabela conversions (histórico de conversões).

export async function createConversion(db, { fromCurrency, toCurrency, amount, rate, iofPercent, result, note = null }) {
  const { lastInsertRowId } = await db.runAsync(
    `INSERT INTO conversions (from_currency, to_currency, amount, rate, iof_percent, result, note)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fromCurrency, toCurrency, amount, rate, iofPercent, result, note]
  );
  return lastInsertRowId;
}

export async function listConversions(db) {
  return db.getAllAsync('SELECT * FROM conversions ORDER BY created_at DESC, id DESC');
}

export async function updateConversionNote(db, id, note) {
  await db.runAsync('UPDATE conversions SET note = ? WHERE id = ?', [note, id]);
}

export async function deleteConversion(db, id) {
  await db.runAsync('DELETE FROM conversions WHERE id = ?', [id]);
}
