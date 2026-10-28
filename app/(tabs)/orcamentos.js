import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ActionButton } from '../../src/components/ActionButton';
import { EmptyState } from '../../src/components/EmptyState';
import { FormModal } from '../../src/components/FormModal';
import { Input } from '../../src/components/input';
import { ProgressBar } from '../../src/components/ProgressBar';
import { createBudget, deleteBudget, getBudgetsWithTotals, updateBudget } from '../../src/database/budgets';
import { styles } from '../../src/styles/orcamentos.styles';
import { checkBudgetAlert } from '../../src/utils/budgetAlert';
import { parseAmount } from '../../src/utils/convertCurrency';
import { formatMoney, toInputText } from '../../src/utils/formatMoney';

export default function BudgetsScreen() {
  const db = useSQLiteContext();
  const [budgets, setBudgets] = useState([]);

  // Estado do modal de criar/editar. editingId = null significa "novo".
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [limitText, setLimitText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const loadBudgets = useCallback(async () => {
    setBudgets(await getBudgetsWithTotals(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  const limit = parseAmount(limitText);
  const nameError = submitted && !name.trim() ? 'Dê um nome ao orçamento' : '';
  const limitError = (submitted || limitText.trim() !== '') && !(limit > 0) ? 'Digite um limite maior que zero (ex.: 3.000,00)' : '';

  function openCreate() {
    setEditingId(null);
    setName('');
    setLimitText('');
    setSubmitted(false);
    setModalVisible(true);
  }

  function openEdit(budget) {
    setEditingId(budget.id);
    setName(budget.name);
    setLimitText(toInputText(budget.limit_brl));
    setSubmitted(false);
    setModalVisible(true);
  }

  async function handleSave() {
    setSubmitted(true);
    if (!name.trim() || !(limit > 0)) return;

    if (editingId === null) {
      await createBudget(db, { name: name.trim(), limitBrl: limit });
    } else {
      await updateBudget(db, editingId, { name: name.trim(), limitBrl: limit });
    }
    setModalVisible(false);
    await loadBudgets();

    // O limite mudou: a porcentagem gasta também pode ter mudado.
    if (editingId !== null) await checkBudgetAlert(db, editingId);
  }

  function confirmDelete(budget) {
    Alert.alert(
      'Excluir orçamento?',
      `"${budget.name}" e todos os gastos dele serão apagados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteBudget(db, budget.id);
            await loadBudgets();
          },
        },
      ]
    );
  }

  // Pressionar e segurar: menu com Editar e Excluir.
  function handleLongPress(budget) {
    Alert.alert(budget.name, 'O que você quer fazer?', [
      { text: 'Editar', onPress: () => openEdit(budget) },
      { text: 'Excluir', style: 'destructive', onPress: () => confirmDelete(budget) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function renderItem({ item }) {
    const ratio = item.spent / item.limit_brl;

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/orcamento/${item.id}`)}
        onLongPress={() => handleLongPress(item)}
      >
        <View style={styles.itemHeader}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.percent}>{Math.round(ratio * 100)}%</Text>
        </View>
        <Text style={styles.amounts}>
          {formatMoney(item.spent, 'BRL')} de {formatMoney(item.limit_brl, 'BRL')}
        </Text>
        <ProgressBar ratio={ratio} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={budgets}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          budgets.length > 0 ? (
            <>
              <ActionButton title="+ Novo orçamento" onPress={openCreate} />
              <Text style={styles.hint}>Toque para ver os gastos. Segure para editar ou excluir.</Text>
            </>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState icon="wallet-outline" message="Você ainda não tem orçamentos. Crie um para controlar os gastos de uma viagem ou das compras online.">
            <ActionButton title="Criar meu primeiro orçamento" icon="add" onPress={openCreate} />
          </EmptyState>
        }
      />

      <FormModal
        visible={modalVisible}
        title={editingId === null ? 'Novo orçamento' : 'Editar orçamento'}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      >
        <Input
          compact
          label="Nome:"
          value={name}
          onChangeText={setName}
          error={nameError}
          placeholder="Ex.: Viagem Buenos Aires"
          keyboardType="default"
          maxLength={40}
        />
        <Input
          label="Limite em R$:"
          value={limitText}
          onChangeText={setLimitText}
          error={limitError}
        />
      </FormModal>
    </View>
  );
}
