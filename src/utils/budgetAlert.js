import { getBudgetWithTotal, setBudgetAlertSent } from '../database/budgets';
import { formatMoney } from './formatMoney';
import { sendLocalNotification } from './notifications';

export const ALERT_RATIO = 0.8;

// Chamado depois de cada mudança nos gastos (ou no limite) de um orçamento.
// - Chegou a 80% e ainda não avisou: envia a notificação e marca alert_sent = 1.
// - Voltou para baixo de 80%: zera alert_sent, para poder avisar de novo.
export async function checkBudgetAlert(db, budgetId) {
  const budget = await getBudgetWithTotal(db, budgetId);
  if (!budget) return;

  const ratio = budget.spent / budget.limit_brl;

  if (ratio >= ALERT_RATIO && !budget.alert_sent) {
    // Marca antes de enviar: mesmo sem permissão, o aviso não se repete.
    await setBudgetAlertSent(db, budgetId, true);
    await sendLocalNotification(
      `Orçamento "${budget.name}" em ${Math.round(ratio * 100)}%`,
      `Você já gastou ${formatMoney(budget.spent, 'BRL')} de ${formatMoney(budget.limit_brl, 'BRL')}.`
    );
  } else if (ratio < ALERT_RATIO && budget.alert_sent) {
    await setBudgetAlertSent(db, budgetId, false);
  }
}
