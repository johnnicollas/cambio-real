import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

// Chip de moeda. `variant` define a cor quando ele está selecionado:
// "primary" (azul) ou "secondary" (verde).
export function Button({ variant = "primary", onPress, currency, isSelected }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        isSelected && (variant === 'secondary' ? styles.buttonSecondary : styles.buttonPrimary),
      ]}
    >
      <Text style={styles.buttonText}>
        {currency.code}
      </Text>
    </TouchableOpacity>
  );
}
