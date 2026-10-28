import { getCachedRates, saveRates } from '../database/ratesCache';
import { formatShortDateTime } from '../utils/formatDate';

const BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
const TIMEOUT_MS = 8000;

// Busca as cotações na API. Lança um erro se a rede falhar, demorar mais
// de 8 s ou se a resposta não for 200.
export async function exchangeRateApi(fromCurrency) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}/${fromCurrency}`, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`A API respondeu com o status ${response.status}`);
    }
    const data = await response.json();
    if (!data?.rates) {
      throw new Error('Resposta da API sem cotações');
    }
    return data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Cotações com fallback: tenta a API e grava no cache; se falhar, usa o cache.
// Devolve { rates, fetchedAt, offline }. Sem API e sem cache, lança um erro
// com uma mensagem pronta para mostrar ao usuário.
export async function getRates(db, base) {
  try {
    const data = await exchangeRateApi(base);
    await saveRates(db, base, data.rates);
    return { rates: data.rates, fetchedAt: new Date(), offline: false };
  } catch (error) {
    const cached = await getCachedRates(db, base);
    if (cached) {
      return { ...cached, offline: true };
    }
    throw new Error('Não foi possível obter a cotação. Verifique sua conexão com a internet e tente novamente.');
  }
}

// Taxa de uma moeda para outra (ex.: 1 USD = 5,43 BRL).
export async function getRate(db, from, to) {
  const { rates, fetchedAt, offline } = await getRates(db, from);
  const rate = rates[to];
  if (!rate) {
    throw new Error(`Cotação de ${from} para ${to} indisponível.`);
  }
  return { rate, fetchedAt, offline };
}

// Texto do aviso exibido quando a cotação veio do cache.
export function offlineMessage(fetchedAt) {
  return `Cotação offline de ${formatShortDateTime(fetchedAt)}`;
}
