// Converte o texto digitado em número. Aceita "10,50", "10.50", "1.234,56"
// e "1,234.56". Devolve NaN quando o valor é vazio ou inválido.
export function parseAmount(text) {
  if (text === null || text === undefined) return NaN;
  let value = String(text).trim().replace(/\s/g, '');
  if (value === '') return NaN;

  const lastComma = value.lastIndexOf(',');
  const lastDot = value.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    // Os dois aparecem: o último é o separador decimal, o outro é de milhar.
    const thousands = lastComma > lastDot ? '.' : ',';
    value = value.split(thousands).join('');
  } else if ((value.match(/\./g) || []).length > 1) {
    // "1.234.567": vários pontos só podem ser separadores de milhar.
    value = value.split('.').join('');
  }
  value = value.replace(',', '.');

  if (!/^(\d+\.?\d*|\.\d+)$/.test(value)) return NaN;
  return Number(value);
}

function roundCents(value) {
  return Math.round(value * 100) / 100;
}

// Valor convertido já com o IOF (se houver), arredondado em centavos.
export function convertCurrency(amount, rate, iofPercent = 0) {
  return roundCents(amount * rate * (1 + iofPercent / 100));
}

// Detalhamento para exibir na tela: valor sem IOF, valor do IOF e total.
export function convertWithBreakdown(amount, rate, iofPercent = 0) {
  const base = roundCents(amount * rate);
  const total = convertCurrency(amount, rate, iofPercent);
  return { base, iof: roundCents(total - base), total };
}
