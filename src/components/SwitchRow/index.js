import { Switch, Text, View } from 'react-native';

import { colors } from '../../styles/colors';
import { styles } from './styles';

// Linha com um texto e um Switch (ex.: "Incluir IOF (3,5%)").
export function SwitchRow({ label, value, onValueChange }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.inputBackground, true: colors.primary }}
        thumbColor={colors.text}
      />
    </View>
  );
}
