import { Text, View } from "react-native";
import { styles } from "./styles";
import { formatMoney, formatPercent, formatRate } from "../../utils/formatMoney";

// Mostra o resultado da conversão: valor sem IOF, IOF e total.
// `result` vem do Converter: { fromCurrency, toCurrency, rate, iofPercent, base, iof, total }
export function ResultCard({ result }) {
    if (!result) return null;

    const { fromCurrency, toCurrency, rate, iofPercent, base, iof, total } = result;

    return (
        <View style={styles.container}>
            {iofPercent > 0 ? (
                <>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Valor sem IOF</Text>
                        <Text style={styles.rowValue}>{formatMoney(base, toCurrency)}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>IOF ({formatPercent(iofPercent)})</Text>
                        <Text style={styles.rowValue}>{formatMoney(iof, toCurrency)}</Text>
                    </View>
                    <View style={styles.divider} />
                </>
            ) : null}

            <Text style={styles.label}>Total</Text>
            <Text style={styles.amount}>
                {formatMoney(total, toCurrency)}
            </Text>
            <Text style={styles.rate}>
                1 {fromCurrency} = {formatRate(rate)} {toCurrency}
            </Text>
        </View>
    );
}
