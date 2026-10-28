import { useCallback, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '../../src/components/EmptyState';
import { FormModal } from '../../src/components/FormModal';
import { Input } from '../../src/components/input';
import { deleteConversion, listConversions, updateConversionNote } from '../../src/database/conversions';
import { colors } from '../../src/styles/colors';
import { styles } from '../../src/styles/historico.styles';
import { formatMoney, formatNumber, formatPercent } from '../../src/utils/formatMoney';
import { formatDateTime } from '../../src/utils/formatDate';

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const [conversions, setConversions] = useState([]);
  const [editing, setEditing] = useState(null); // conversão cuja observação está sendo editada
  const [note, setNote] = useState('');

  const loadConversions = useCallback(async () => {
    setConversions(await listConversions(db));
  }, [db]);

  // Recarrega sempre que a aba é aberta (ex.: depois de salvar no Converter).
  useFocusEffect(
    useCallback(() => {
      loadConversions();
    }, [loadConversions])
  );

  function openEditor(conversion) {
    setEditing(conversion);
    setNote(conversion.note ?? '');
  }

  async function handleSaveNote() {
    await updateConversionNote(db, editing.id, note.trim() || null);
    setEditing(null);
    await loadConversions();
  }

  function handleDelete(conversion) {
    Alert.alert('Excluir conversão?', 'Ela será removida do histórico.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          await deleteConversion(db, conversion.id);
          await loadConversions();
        },
      },
    ]);
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity style={styles.item} onPress={() => openEditor(item)}>
        <View style={styles.itemBody}>
          <Text style={styles.title}>
            {formatNumber(item.amount)} {item.from_currency} → {formatMoney(item.result, item.to_currency)}
          </Text>
          <Text style={styles.meta}>
            {formatDateTime(item.created_at)} · {item.iof_percent > 0 ? `com IOF (${formatPercent(item.iof_percent)})` : 'sem IOF'}
          </Text>
          {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversions}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          conversions.length > 0 ? <Text style={styles.hint}>Toque em uma conversão para editar a observação.</Text> : null
        }
        ListEmptyComponent={
          <EmptyState icon="time-outline" message="Nenhuma conversão salva ainda. Converta algo e toque em Salvar." />
        }
      />

      <FormModal
        visible={editing !== null}
        title="Observação"
        onClose={() => setEditing(null)}
        onSave={handleSaveNote}
      >
        <Input
          compact
          value={note}
          onChangeText={setNote}
          placeholder="Ex.: tênis na loja do aeroporto"
          keyboardType="default"
          maxLength={120}
          autoFocus
        />
      </FormModal>
    </View>
  );
}
