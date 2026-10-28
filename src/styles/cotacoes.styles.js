import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  loading: {
    marginTop: 32,
  },
  updated: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  code: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  name: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
