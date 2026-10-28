import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';

import { migrateDbIfNeeded } from '../src/database/migrations';
import { colors } from '../src/styles/colors';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="cambioreal.db" onInit={migrateDbIfNeeded}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.cardBackground },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="orcamento/[id]" options={{ title: 'Orçamento' }} />
      </Stack>
    </SQLiteProvider>
  );
}
