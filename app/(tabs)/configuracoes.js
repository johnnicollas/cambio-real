import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Constants from 'expo-constants';

import { ActionButton } from '../../src/components/ActionButton';
import { CurrencySelector } from '../../src/components/CurrencySelector';
import { Input } from '../../src/components/input';
import { Notice } from '../../src/components/Notice';
import { SwitchRow } from '../../src/components/SwitchRow';
import { getSettings, resetAllData, setSetting } from '../../src/database/settings';
import { styles } from '../../src/styles/configuracoes.styles';
import { parseAmount } from '../../src/utils/convertCurrency';
import { formatDecimal } from '../../src/utils/formatMoney';
import { sendLocalNotification } from '../../src/utils/notifications';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState(null);
  const [iofText, setIofText] = useState('');
  const [iofSaved, setIofSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    const loaded = await getSettings(db);
    setSettings(loaded);
    setIofText(formatDecimal(loaded.iofPercent));
    setIofSaved(false);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  // Grava no banco (como texto) e atualiza a tela com o valor já tipado.
  async function updateSetting(key, value, field) {
    await setSetting(db, key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
    setSettings(current => ({ ...current, [field]: value }));
  }

  const iofValue = parseAmount(iofText);
  const iofError = Number.isNaN(iofValue) || iofValue > 100 ? 'Digite um percentual entre 0 e 100 (ex.: 3,5)' : '';

  async function handleSaveIof() {
    if (iofError) return;
    await updateSetting('iof_percent', iofValue, 'iofPercent');
    setIofSaved(true);
  }

  async function handleTestNotification() {
    const sent = await sendLocalNotification('Câmbio Real', 'As notificações estão funcionando!');
    if (sent) Alert.alert('Notificação enviada', 'Confira a barra de notificações.');
  }

  function handleReset() {
    Alert.alert('Apagar todos os dados?', 'Conversões, orçamentos e gastos serão apagados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () =>
          Alert.alert('Tem certeza?', 'Essa ação não pode ser desfeita.', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sim, apagar tudo',
              style: 'destructive',
              onPress: async () => {
                await resetAllData(db);
                await loadSettings();
                Alert.alert('Pronto', 'Todos os dados foram apagados e as configurações padrão foram restauradas.');
              },
            },
          ]),
      },
    ]);
  }

  if (!settings) return <View style={styles.container} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Moedas padrão</Text>
      <View style={styles.card}>
        <CurrencySelector
          label="Moeda de origem:"
          value={settings.defaultFrom}
          onChange={code => updateSetting('default_from', code, 'defaultFrom')}
        />
        <CurrencySelector
          label="Moeda de destino:"
          variant="secondary"
          value={settings.defaultTo}
          onChange={code => updateSetting('default_to', code, 'defaultTo')}
        />
      </View>

      <Text style={styles.sectionTitle}>IOF</Text>
      <View style={styles.card}>
        <Input
          label="Percentual de IOF (%):"
          value={iofText}
          error={iofError}
          placeholder="3,5"
          onChangeText={text => {
            setIofText(text);
            setIofSaved(false);
          }}
        />
        {iofSaved ? (
          <Notice type="info" message="Percentual salvo" />
        ) : (
          <ActionButton title="Salvar percentual" onPress={handleSaveIof} disabled={!!iofError} />
        )}
        <SwitchRow
          label="Incluir IOF por padrão"
          value={settings.includeIof}
          onValueChange={on => updateSetting('include_iof', on, 'includeIof')}
        />
      </View>

      <Text style={styles.sectionTitle}>Ações</Text>
      <View style={styles.card}>
        <ActionButton title="Testar notificação" icon="notifications" variant="outline" onPress={handleTestNotification} />
        <ActionButton title="Apagar todos os dados" icon="trash" variant="danger" onPress={handleReset} />
      </View>

      <Text style={styles.sectionTitle}>Sobre</Text>
      <View style={styles.card}>
        <Text style={styles.aboutTitle}>Câmbio Real</Text>
        <Text style={styles.aboutText}>Versão {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Text style={styles.aboutText}>Cotações: exchangerate-api.com</Text>
        <Text style={styles.warning}>Confirme a alíquota de IOF vigente na Receita Federal.</Text>
      </View>
    </ScrollView>
  );
}
