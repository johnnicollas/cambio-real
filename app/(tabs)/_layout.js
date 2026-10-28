import { Tabs } from 'expo-router/js-tabs';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../src/styles/colors';

function tabIcon(name) {
  return ({ color, size }) => <Ionicons name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cardBackground },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.cardBackground, borderTopColor: colors.inputBackground },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Converter', tabBarIcon: tabIcon('swap-horizontal') }} />
      <Tabs.Screen name="cotacoes" options={{ title: 'Cotações', tabBarIcon: tabIcon('trending-up') }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico', tabBarIcon: tabIcon('time') }} />
      <Tabs.Screen name="orcamentos" options={{ title: 'Orçamentos', tabBarIcon: tabIcon('wallet') }} />
      <Tabs.Screen name="configuracoes" options={{ title: 'Configurações', tabBarIcon: tabIcon('settings') }} />
    </Tabs>
  );
}
