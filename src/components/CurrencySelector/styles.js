import { StyleSheet } from 'react-native';
import { colors } from '../../styles/colors';

export const styles = StyleSheet.create({
  label: {
    color: colors.textSecondary,
    marginBottom: 8,
    fontSize: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
