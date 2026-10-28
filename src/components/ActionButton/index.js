import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

// Botão de ação (Converter, Salvar, Excluir...).
// variant: "primary" (azul), "secondary" (verde), "danger" (vermelho) ou "outline".
export function ActionButton({ title, onPress, variant = 'primary', icon, disabled = false, loading = false, style }) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={20} color="white" style={styles.icon} /> : null}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
