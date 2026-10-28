import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

export function Button({ variant = "primary", onPress, currency, isSelected }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[
        styles.button, 
       
        isSelected 
          ? styles.buttonSecondary 
          : styles.buttonPrimary
      ]}
    >
      <Text style={styles.buttonText}>
        {currency.code}
      </Text>
    </TouchableOpacity>
  );
}