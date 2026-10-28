import { currencies } from '../constants/currencies';

// Formatação manual no padrão brasileiro (1.234,56), usada se o Intl falhar.
export function formatNumber(value, decimals = 2) {
  const [integer, fraction] = Math.abs(value).toFixed(decimals).split('.');
  const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = value < 0 ? '-' : '';
  return fraction ? `${sign}${withThousands},${fraction}` : `${sign}${withThousands}`;
}

// Ex.: formatMoney(545.2, 'BRL') -> "R$ 545,20"
export function formatMoney(value, code) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code }).format(value);
  } catch {
    const symbol = currencies.find(currency => currency.code === code)?.symbol ?? code;
    return `${symbol} ${formatNumber(value)}`;
  }
}

// Ex.: formatRate(5.43219) -> "5,4322"
export function formatRate(rate) {
  return formatNumber(rate, 4);
}

// Número sem zeros sobrando. Ex.: formatDecimal(3.5) -> "3,5"; formatDecimal(6) -> "6"
export function formatDecimal(value) {
  return formatNumber(value, 2).replace(/,?0+$/, '');
}

// Ex.: formatPercent(3.5) -> "3,5%"
export function formatPercent(value) {
  return `${formatDecimal(value)}%`;
}
