import { Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { colors } from '../../src/styles/colors';

export default function BudgetDetail() {
  const { id } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: `Orçamento ${id}` }} />
      <Text style={{ color: colors.textSecondary }}>Detalhe do orçamento {id} (em construção)</Text>
    </View>
  );
}
