import { StatusBar } from 'expo-status-bar';
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  View,
  Platform,
  TouchableOpacity,
  ActivityIndicator, 
} from 'react-native';
import { useState } from 'react';


import { currencies } from '../../src/constants/currencies'; 
import { Button } from '../../src/components/Button';
import { styles } from '../../src/styles/converter.styles';
import { Input } from '../../src/components/input';
import { ResultCard } from '../../src/components/ResultCard';
import { exchangeRateApi } from '../../src/services/api';
import { convertCurrency } from '../../src/utils/convertCurrency';

export default function ConverterScreen() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('BRL');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);

  const currencyList = Array.isArray(currencies) ? currencies : [];

  async function fetchExchangeRate() {
    if (!amount) return;

    try {
      setLoading(true);
      const data = await exchangeRateApi(fromCurrency);
      const rate = data.rates[toCurrency];
      
      setExchangeRate(rate);

      const convertedAmount = convertCurrency(amount, rate);
      setResult(convertedAmount);
    } catch (error) {
      console.error("Erro ao buscar taxa de câmbio:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult('');
    setExchangeRate(null);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={styles.title}>
              Conversor de Moedas
            </Text>

            <Text style={styles.subTitle}>
              Converta valores entre diferentes moedas
            </Text>
          </View>

          <View style={styles.card}>

            <Text style={styles.label}>
              De:
            </Text>

            <View style={styles.currencyGrid}>
              {currencyList.map(currency => (
                <Button
                  variant="primary"
                  key={currency.code}
                  currency={currency}
                  onPress={() => {
                    setFromCurrency(currency.code);
                    setResult('');
                    setExchangeRate(null);
                  }}
                  isSelected={fromCurrency === currency.code}
                />
              ))}
            </View>

            <Input
              label="Valor :"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                setResult('');
                setExchangeRate(null);
              }}
            />

            <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
              <Text style={styles.swapButtonText}>
                ↑↓
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>
              Para:
            </Text>

            <View style={styles.currencyGrid}>
              {currencyList.map(currency => (
                <Button
                  variant="secondary"
                  key={currency.code}
                  currency={currency}
                  onPress={() => {
                    setToCurrency(currency.code);
                    setResult('');
                    setExchangeRate(null);
                  }}
                  isSelected={toCurrency === currency.code}
                />
              ))}
            </View>

          </View>

          <TouchableOpacity
            style={[styles.convertButton, (!amount || loading) && styles.convertButtonDisabled]}
            onPress={fetchExchangeRate}
            disabled={!amount || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.swapButtonText}>
                Converter
              </Text>
            )}
          </TouchableOpacity>

          <ResultCard 
            exchangeRate={exchangeRate}
            result={result}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            currencies={currencyList}
          />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}