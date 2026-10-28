import { Text, View } from 'react-native';

import { currencies } from '../../constants/currencies';
import { Button } from '../Button';
import { styles } from './styles';

// Grade com os chips das 8 moedas. Usado no Converter, Cotações,
// Configurações e no formulário de gastos.
export function CurrencySelector({ label, value, onChange, variant = 'primary' }) {
  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.grid}>
        {currencies.map(currency => (
          <Button
            key={currency.code}
            variant={variant}
            currency={currency}
            isSelected={value === currency.code}
            onPress={() => onChange(currency.code)}
          />
        ))}
      </View>
    </View>
  );
}
