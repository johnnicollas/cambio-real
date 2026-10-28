import { StyleSheet } from "react-native";
import { colors} from '../../styles/colors';


export const styles =  StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        color: colors.textSecondary,
        marginBottom: 8,
        fontSize: 14,
    },
    input:{
        backgroundColor: colors.inputBackground,
        color: colors.text,
        fontSize: 24,
        fontWeight: 'bold',
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    inputCompact: {
        fontSize: 16,
        fontWeight: '400',
        padding: 12,
    },
    inputError: {
        borderColor: colors.danger,
    },
    error: {
        color: colors.danger,
        fontSize: 13,
        marginTop: 6,
    },

})
