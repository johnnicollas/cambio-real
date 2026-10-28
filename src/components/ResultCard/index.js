import { Text, View } from "react-native";
import { styles } from "./styles";
import { formatMoney, formatRate } from "../../utils/formatMoney";

export function ResultCard({ 
    exchangeRate,
    result,
    fromCurrency,
    toCurrency,
    currencies, 
}) {
    if (!result || !exchangeRate) return null;

    
    const toSymbol = (currencies || []).find(currency => currency.code === toCurrency)?.symbol || "";

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Resultado:</Text>
            <Text style={styles.amount}>
                {formatMoney(result, toCurrency)}
            </Text>
            <Text style={styles.rate}>
                taxa de cambio 1 {fromCurrency} = {formatRate(exchangeRate)} {toCurrency}
            </Text>
        </View>
    );
}