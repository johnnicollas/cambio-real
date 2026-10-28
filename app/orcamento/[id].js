import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

import { ActionButton } from '../../src/components/ActionButton';
import { CurrencySelector } from '../../src/components/CurrencySelector';
import { EmptyState } from '../../src/components/EmptyState';
import { FormModal } from '../../src/components/FormModal';
import { Input } from '../../src/components/input';
import { Notice } from '../../src/components/Notice';
import { ProgressBar } from '../../src/components/ProgressBar';
import { SwitchRow } from '../../src/components/SwitchRow';
import { getBudgetWithTotal } from '../../src/database/budgets';
import { createExpense, deleteExpense, listExpensesByBudget, updateExpense } from '../../src/database/expenses';
import { getSettings } from '../../src/database/settings';
import { getRate, offlineMessage } from '../../src/services/api';
import { colors } from '../../src/styles/colors';
import { styles } from '../../src/styles/orcamento.styles';
import { checkBudgetAlert } from '../../src/utils/budgetAlert';
import { convertCurrency, parseAmount } from '../../src/utils/convertCurrency';
import { formatMoney, formatNumber, formatPercent, toInputText } from '../../src/utils/formatMoney';
import { formatDateTime } from '../../src/utils/formatDate';

export default function BudgetDetailScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams();
  const budgetId = Number(id);

  const [budget, setBudget] = useState(undefined); // undefined = carregando, null = não existe
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState({ iofPercent: 3.5, includeIof: true });
  const [notice, setNotice] = useState('');

  // Formulário de gasto (modal). editing = null significa "novo gasto".
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [description, setDescription] = useState('');
  const [amountText, setAmountText] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [includeIof, setIncludeIof] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = useCallback(async () => {
    const [loadedBudget, loadedExpenses, loadedSettings] = await Promise.all([
      getBudgetWithTotal(db, budgetId),
      listExpensesByBudget(db, budgetId),
      getSettings(db),
    ]);
    setBudget(loadedBudget);
    setExpenses(loadedExpenses);
    setSettings(loadedSettings);
  }, [db, budgetId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const amount = parseAmount(amountText);
  const descriptionError = submitted && !description.trim() ? 'Descreva o gasto' : '';
  const amountError = (submitted || amountText.trim() !== '') && !(amount > 0) ? 'Digite um valor maior que zero (ex.: 49,90)' : '';

  function openCreate() {
    setEditing(null);
    setDescription('');
    setAmountText('');
    setCurrency(settings.defaultFrom ?? 'USD');
    setIncludeIof(settings.includeIof);
    openModal();
  }

  function openEdit(expense) {
    setEditing(expense);
    setDescription(expense.description);
    setAmountText(toInputText(expense.amount));
    setCurrency(expense.currency);
    setIncludeIof(expense.iof_percent > 0);
    openModal();
  }

  function openModal() {
    setSubmitted(false);
    setFormError('');
    setModalVisible(true);
  }

  async function handleSave() {
    setSubmitted(true);
    if (!description.trim() || !(amount > 0)) return;

    try {
      setSaving(true);
      setFormError('');

      // Editando sem trocar a moeda: mantém a cotação do dia do gasto.
      // Caso contrário, busca a cotação atual (com fallback do cache).
      let rate = 1;
      let offlineNote = '';
      if (editing && editing.currency === currency) {
        rate = editing.rate;
      } else if (currency !== 'BRL') {
        const result = await getRate(db, currency, 'BRL');
        rate = result.rate;
        if (result.offline) offlineNote = `Gasto calculado com a ${offlineMessage(result.fetchedAt).toLowerCase()}`;
      }

      // Mantém o IOF original do gasto ao editar; senão usa o configurado.
      const iofPercent = includeIof ? (editing?.iof_percent || settings.iofPercent) : 0;
      const data = {
        budgetId,
        description: description.trim(),
        amount,
        currency,
        rate,
        iofPercent,
        totalBrl: convertCurrency(amount, rate, iofPercent),
      };

      if (editing) {
        await updateExpense(db, editing.id, data);
      } else {
        await createExpense(db, data);
      }

      setModalVisible(false);
      setNotice(offlineNote);
      await loadData();
      await checkBudgetAlert(db, budgetId);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(expense) {
    Alert.alert('Excluir gasto?', `"${expense.description}" será removido do orçamento.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(db, expense.id);
          await loadData();
          await checkBudgetAlert(db, budgetId);
        },
      },
    ]);
  }

  if (budget === undefined) return <View style={styles.container} />;

  if (budget === null) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Orçamento' }} />
        <EmptyState icon="alert-circle-outline" message="Orçamento não encontrado. Ele pode ter sido excluído." />
      </View>
    );
  }

  const ratio = budget.spent / budget.limit_brl;
  const remaining = budget.limit_brl - budget.spent;

  const summary = (
    <View>
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Limite</Text>
          <Text style={styles.summaryValue}>{formatMoney(budget.limit_brl, 'BRL')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total gasto</Text>
          <Text style={styles.summaryValue}>{formatMoney(budget.spent, 'BRL')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{remaining >= 0 ? 'Resta' : 'Excedido em'}</Text>
          <Text style={[styles.summaryValue, remaining < 0 && styles.over]}>
            {formatMoney(Math.abs(remaining), 'BRL')}
          </Text>
        </View>
        <ProgressBar ratio={ratio} />
        <Text style={styles.percent}>{Math.round(ratio * 100)}% do limite</Text>
      </View>

      <Notice type="offline" message={notice} />
      <ActionButton title="+ Adicionar gasto" onPress={openCreate} />
      {expenses.length > 0 ? <Text style={styles.sectionTitle}>Gastos (toque para editar)</Text> : null}
    </View>
  );

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={styles.item} onPress={() => openEdit(item)}>
        <View style={styles.itemBody}>
          <Text style={styles.itemTitle}>{item.description}</Text>
          <Text style={styles.itemMeta}>
            {formatNumber(item.amount)} {item.currency}
            {item.iof_percent > 0 ? ` + IOF ${formatPercent(item.iof_percent)}` : ''} · {formatDateTime(item.created_at)}
          </Text>
        </View>
        <Text style={styles.itemTotal}>{formatMoney(item.total_brl, 'BRL')}</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: budget.name }} />

      <FlatList
        data={expenses}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={summary}
        ListEmptyComponent={
          <EmptyState icon="receipt-outline" message="Nenhum gasto ainda. Toque em Adicionar gasto para registrar o primeiro." />
        }
      />

      <FormModal
        visible={modalVisible}
        title={editing ? 'Editar gasto' : 'Novo gasto'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        saving={saving}
      >
        <Input
          compact
          label="Descrição:"
          value={description}
          onChangeText={setDescription}
          error={descriptionError}
          placeholder="Ex.: Jantar"
          keyboardType="default"
          maxLength={60}
        />
        <Input label="Valor:" value={amountText} onChangeText={setAmountText} error={amountError} />
        <CurrencySelector label="Moeda:" value={currency} onChange={setCurrency} />
        <SwitchRow
          label={`Incluir IOF (${formatPercent(editing?.iof_percent || settings.iofPercent)})`}
          value={includeIof}
          onValueChange={setIncludeIof}
        />
        <Notice type="error" message={formError} />
      </FormModal>
    </View>
  );
}
