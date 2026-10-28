// Dados de exemplo para a apresentação (botão visível só em __DEV__).
// Usa cotações fixas para funcionar mesmo sem internet.

import { createBudget } from './budgets';
import { createConversion } from './conversions';
import { createExpense } from './expenses';
import { convertCurrency } from '../utils/convertCurrency';

const RATES_TO_BRL = { USD: 5.4, EUR: 5.85, GBP: 6.9, BRL: 1 };
const IOF = 3.5;

const CONVERSIONS = [
  { from: 'USD', amount: 100, iof: IOF, note: 'Tênis no free shop' },
  { from: 'EUR', amount: 49.9, iof: IOF, note: 'Assinatura anual' },
  { from: 'USD', amount: 10.5, iof: 0, note: null },
  { from: 'GBP', amount: 250, iof: IOF, note: 'Ingresso do show' },
  { from: 'USD', amount: 1200, iof: IOF, note: 'Notebook' },
];

const BUDGETS = [
  {
    name: 'Viagem Buenos Aires',
    limitBrl: 3000,
    expenses: [
      { description: 'Hotel (3 noites)', amount: 180, currency: 'USD' },
      { description: 'Passeio de barco', amount: 45, currency: 'USD' },
      { description: 'Jantar com show de tango', amount: 60, currency: 'USD' },
    ],
  },
  {
    // ~75% do limite: um gasto pequeno a mais dispara o alerta de 80%.
    name: 'Compras online',
    limitBrl: 800,
    expenses: [
      { description: 'Fone de ouvido', amount: 75, currency: 'USD' },
      { description: 'Livro importado', amount: 30, currency: 'EUR' },
    ],
  },
];

export async function loadSampleData(db) {
  await db.withTransactionAsync(async () => {
    for (const item of CONVERSIONS) {
      const rate = RATES_TO_BRL[item.from];
      await createConversion(db, {
        fromCurrency: item.from,
        toCurrency: 'BRL',
        amount: item.amount,
        rate,
        iofPercent: item.iof,
        result: convertCurrency(item.amount, rate, item.iof),
        note: item.note,
      });
    }

    for (const budget of BUDGETS) {
      const budgetId = await createBudget(db, { name: budget.name, limitBrl: budget.limitBrl });
      for (const expense of budget.expenses) {
        const rate = RATES_TO_BRL[expense.currency];
        await createExpense(db, {
          budgetId,
          ...expense,
          rate,
          iofPercent: IOF,
          totalBrl: convertCurrency(expense.amount, rate, IOF),
        });
      }
    }
  });
}
