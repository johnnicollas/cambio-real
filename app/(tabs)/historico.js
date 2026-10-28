import { Text, View } from 'react-native';

import { colors } from '../../src/styles/colors';

export default function Screen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <Text style={{ color: colors.textSecondary }}>Histórico (em construção)</Text>
    </View>
  );
}
