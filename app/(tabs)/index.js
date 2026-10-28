import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

import { ActionButton } from '../../src/components/ActionButton';
import { CurrencySelector } from '../../src/components/CurrencySelector';
import { Input } from '../../src/components/input';
import { Notice } from '../../src/components/Notice';
import { ResultCard } from '../../src/components/ResultCard';
import { SwitchRow } from '../../src/components/SwitchRow';
import { createConversion } from '../../src/database/conversions';
import { getSettings } from '../../src/database/settings';
import { getRate, offlineMessage } from '../../src/services/api';
import { styles } from '../../src/styles/converter.styles';
import { convertWithBreakdown, parseAmount } from '../../src/utils/convertCurrency';
import { formatPercent } from '../../src/utils/formatMoney';

export default function ConverterScreen() {
  const db = useSQLiteContext();
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [iofPercent, setIofPercent] = useState(3.5);
  const [includeIof, setIncludeIof] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Guarda as últimas configurações lidas, para só trocar as moedas da
  // tela quando o usuário mudar o padrão em Configurações.
  const lastSettings = useRef(null);

  useFocusEffect(
    useCallback(() => {
      getSettings(db).then(settings => {
        const previous = lastSettings.current;
        if (!previous || previous.defaultFrom !== settings.defaultFrom || previous.defaultTo !== settings.defaultTo) {
          setFromCurrency(settings.defaultFrom);
          setToCurrency(settings.defaultTo);
          clearResult();
        }
        if (!previous || previous.includeIof !== settings.includeIof) {
          setIncludeIof(settings.includeIof);
        }
        if (!previous || previous.iofPercent !== settings.iofPercent) {
          setIofPercent(settings.iofPercent);
          clearResult();
        }
        lastSettings.current = settings;
      });
    }, [db])
  );

  const value = parseAmount(amount);
  const isValid = value > 0;
  const amountError = amount.trim() !== '' && !isValid ? 'Digite um valor maior que zero (ex.: 10,50)' : '';

  function clearResult() {
    setResult(null);
    setError('');
    setSaved(false);
  }

  async function handleConvert() {
    if (!isValid) return;

    try {
      setLoading(true);
      setError('');
      const { rate, fetchedAt, offline } = await getRate(db, fromCurrency, toCurrency);
      const appliedIof = includeIof ? iofPercent : 0;

      setResult({
        amount: value,
        fromCurrency,
        toCurrency,
        rate,
        iofPercent: appliedIof,
        ...convertWithBreakdown(value, rate, appliedIof),
        notice: offline ? offlineMessage(fetchedAt) : '',
      });
      setSaved(false);
    } catch (err) {
      setResult(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    await createConversion(db, {
      fromCurrency: result.fromCurrency,
      toCurrency: result.toCurrency,
      amount: result.amount,
      rate: result.rate,
      iofPercent: result.iofPercent,
      result: result.total,
    });
    setSaved(true);
  }

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    clearResult();
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={styles.subTitle}>
              Descubra quanto uma compra custa de verdade em reais
            </Text>
          </View>

          <View style={styles.card}>
            <CurrencySelector
              label="De:"
              value={fromCurrency}
              onChange={code => {
                setFromCurrency(code);
                clearResult();
              }}
            />

            <Input
              label="Valor:"
              value={amount}
              error={amountError}
              onChangeText={(text) => {
                setAmount(text);
                clearResult();
              }}
            />

            <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
              <Ionicons name="swap-vertical" size={22} color="white" />
              <Text style={styles.swapButtonText}>Inverter moedas</Text>
            </TouchableOpacity>

            <CurrencySelector
              label="Para:"
              variant="secondary"
              value={toCurrency}
              onChange={code => {
                setToCurrency(code);
                clearResult();
              }}
            />

            <SwitchRow
              label={`Incluir IOF (${formatPercent(iofPercent)})`}
              value={includeIof}
              onValueChange={(on) => {
                setIncludeIof(on);
                clearResult();
              }}
            />
          </View>

          <ActionButton
            title="Converter"
            onPress={handleConvert}
            disabled={!isValid}
            loading={loading}
          />

          <Notice type="error" message={error} />
          <Notice type="offline" message={result?.notice} />

          <ResultCard result={result} />

          {result ? (
            saved ? (
              <Notice type="info" message="Salvo no histórico" />
            ) : (
              <ActionButton title="Salvar no histórico" icon="bookmark" variant="secondary" onPress={handleSave} />
            )
          ) : null}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
