import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { CurrencySelector } from '../../src/components/CurrencySelector';
import { EmptyState } from '../../src/components/EmptyState';
import { ActionButton } from '../../src/components/ActionButton';
import { Notice } from '../../src/components/Notice';
import { currencies } from '../../src/constants/currencies';
import { getRates, offlineMessage } from '../../src/services/api';
import { colors } from '../../src/styles/colors';
import { styles } from '../../src/styles/cotacoes.styles';
import { formatRate } from '../../src/utils/formatMoney';
import { formatTime } from '../../src/utils/formatDate';

export default function RatesScreen() {
  const db = useSQLiteContext();
  const [base, setBase] = useState('BRL');
  const [data, setData] = useState(null); // { rates, fetchedAt, offline }
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadRates = useCallback(async () => {
    try {
      setError('');
      setData(await getRates(db, base));
    } catch (err) {
      setData(null);
      setError(err.message);
    }
  }, [db, base]);

  // Primeiro carregamento e sempre que a moeda base mudar.
  useEffect(() => {
    setLoading(true);
    loadRates().finally(() => setLoading(false));
  }, [loadRates]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  }

  function renderItem({ item }) {
    // A API devolve quantas unidades de cada moeda valem 1 da base;
    // invertendo, temos quanto 1 unidade da moeda vale na base.
    const rate = data.rates[item.code];
    const isBase = item.code === base;

    return (
      <View style={styles.row}>
        <View>
          <Text style={styles.code}>{item.code}</Text>
          <Text style={styles.name}>{item.name}{isBase ? ' (moeda base)' : ''}</Text>
        </View>
        <Text style={styles.value}>
          {rate ? `${formatRate(1 / rate)} ${base}` : '—'}
        </Text>
      </View>
    );
  }

  const header = (
    <View>
      <CurrencySelector label="Moeda base:" value={base} onChange={setBase} />
      {data ? (
        data.offline ? (
          <Notice type="offline" message={offlineMessage(data.fetchedAt)} />
        ) : (
          <Text style={styles.updated}>Atualizado às {formatTime(data.fetchedAt)}</Text>
        )
      ) : null}
      <Text style={styles.hint}>Quanto vale 1 unidade de cada moeda em {base}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <View style={styles.content}>{header}</View>
          <ActivityIndicator size="large" color={colors.primary} style={styles.loading} />
        </>
      ) : (
        <FlatList
          data={data ? currencies : []}
          keyExtractor={item => item.code}
          renderItem={renderItem}
          contentContainerStyle={styles.content}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <EmptyState icon="cloud-offline" message={error}>
              <ActionButton title="Tentar de novo" icon="refresh" onPress={handleRefresh} />
            </EmptyState>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.text}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}
