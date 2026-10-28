// Configurações do app, guardadas como pares chave/valor (texto).

import { insertDefaultSettings } from './migrations';

// Devolve as configurações já convertidas para os tipos usados nas telas.
export async function getSettings(db) {
  const rows = await db.getAllAsync('SELECT key, value FROM settings');
  const map = Object.fromEntries(rows.map(row => [row.key, row.value]));
  return {
    defaultFrom: map.default_from ?? 'USD',
    defaultTo: map.default_to ?? 'BRL',
    iofPercent: Number(map.iof_percent ?? 3.5),
    includeIof: map.include_iof === '1',
  };
}

export async function setSetting(db, key, value) {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, String(value)]
  );
}

// Apaga tudo e restaura as configurações padrão.
export async function resetAllData(db) {
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM expenses;
      DELETE FROM budgets;
      DELETE FROM conversions;
      DELETE FROM rates_cache;
      DELETE FROM settings;
    `);
    await insertDefaultSettings(db);
  });
}
