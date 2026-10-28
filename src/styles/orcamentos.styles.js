import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  item: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  percent: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  amounts: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    marginBottom: 10,
  },
});
