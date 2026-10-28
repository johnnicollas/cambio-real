import { View, Text, TextInput } from 'react-native';
import { styles } from './styles';

// Campo de texto do app. Por padrão é numérico (valores em dinheiro);
// `compact` deixa a fonte menor para campos de texto comum.
export function Input({
    value,
    onChangeText,
    label,
    error,
    placeholder = '0,00',
    keyboardType = 'decimal-pad',
    compact = false,
    ...rest
}) {
    return (
        <View style={styles.container}>
            {label ? (
                <Text style={styles.label}>
                    {label}
                </Text>
            ) : null}

            <TextInput
                style={[styles.input, compact && styles.inputCompact, error && styles.inputError]}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                {...rest}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}
