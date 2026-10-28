import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { styles } from './styles';

const TYPES = {
  info: { icon: 'checkmark-circle', color: colors.success },
  offline: { icon: 'cloud-offline', color: colors.warning },
  error: { icon: 'alert-circle', color: colors.danger },
};

// Aviso curto de uma linha: sucesso, cotação offline ou erro.
export function Notice({ type = 'info', message }) {
  if (!message) return null;
  const { icon, color } = TYPES[type];

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.text, { color }]}>{message}</Text>
    </View>
  );
}
