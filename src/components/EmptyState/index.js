import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../styles/colors';
import { styles } from './styles';

// Mensagem para listas vazias, com um botão opcional (children).
export function EmptyState({ icon, message, children }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.message}>{message}</Text>
      {children}
    </View>
  );
}
