// Guarda a última cotação recebida da API para uso offline.

export async function saveRates(db, base, rates) {
  await db.runAsync(
    'INSERT OR REPLACE INTO rates_cache (base, rates_json, fetched_at) VALUES (?, ?, ?)',
    [base, JSON.stringify(rates), new Date().toISOString()]
  );
}

// Devolve { rates, fetchedAt } ou null se ainda não houver cache para a moeda.
export async function getCachedRates(db, base) {
  const row = await db.getFirstAsync('SELECT * FROM rates_cache WHERE base = ?', [base]);
  if (!row) return null;
  return { rates: JSON.parse(row.rates_json), fetchedAt: new Date(row.fetched_at) };
}
