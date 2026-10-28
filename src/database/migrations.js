// Cria as tabelas e os valores padrão. Chamado pelo SQLiteProvider (onInit)
// antes de qualquer tela ser renderizada.

const DATABASE_VERSION = 1;

export const DEFAULT_SETTINGS = {
  default_from: 'USD',
  default_to: 'BRL',
  iof_percent: '3.5',
  include_iof: '1',
};

export async function insertDefaultSettings(db) {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.runAsync('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)', [key, value]);
  }
}

export async function migrateDbIfNeeded(db) {
  // Precisam rodar a cada abertura: foreign_keys vale só para a conexão atual.
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const row = await db.getFirstAsync('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;
  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_currency TEXT NOT NULL,
        to_currency TEXT NOT NULL,
        amount REAL NOT NULL,
        rate REAL NOT NULL,
        iof_percent REAL NOT NULL DEFAULT 0,
        result REAL NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        limit_brl REAL NOT NULL,
        alert_sent INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        budget_id INTEGER NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT NOT NULL,
        rate REAL NOT NULL,
        iof_percent REAL NOT NULL DEFAULT 0,
        total_brl REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS rates_cache (
        base TEXT PRIMARY KEY,
        rates_json TEXT NOT NULL,
        fetched_at TEXT NOT NULL
      );
    `);
    await insertDefaultSettings(db);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
