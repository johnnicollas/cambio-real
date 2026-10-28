import { View } from 'react-native';

import { colors } from '../../styles/colors';
import { styles } from './styles';

// Verde até 80%, amarelo de 80% a 100%, vermelho acima disso.
export function progressColor(ratio) {
  if (ratio > 1) return colors.danger;
  if (ratio >= 0.8) return colors.warning;
  return colors.success;
}

// ratio = gasto / limite (ex.: 0.5 = 50%).
export function ProgressBar({ ratio }) {
  const width = `${Math.min(Math.max(ratio, 0), 1) * 100}%`;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width, backgroundColor: progressColor(ratio) }]} />
    </View>
  );
}
