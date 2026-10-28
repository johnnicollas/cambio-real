// Notificações LOCAIS (disparadas pelo próprio app). Push remoto não
// funciona no Expo Go, por isso não é usado.
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CHANNEL_ID = 'alertas';

// Mostra a notificação mesmo com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Pede a permissão na primeira vez. Devolve true se puder notificar.
export async function ensurePermission() {
  try {
    if (Platform.OS === 'android') {
      // No Android 13+ o canal precisa existir antes do pedido de permissão.
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Alertas',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    let { granted, canAskAgain } = await Notifications.getPermissionsAsync();
    if (!granted && canAskAgain) {
      ({ granted } = await Notifications.requestPermissionsAsync());
    }

    if (!granted) {
      Alert.alert(
        'Notificações desativadas',
        'O app continua funcionando, mas não vai avisar quando um orçamento passar de 80%. Você pode ativar as notificações nas configurações do celular.'
      );
    }
    return granted;
  } catch {
    return false;
  }
}

// Dispara uma notificação imediata. Devolve true se ela foi enviada.
export async function sendLocalNotification(title, body) {
  const allowed = await ensurePermission();
  if (!allowed) return false;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
  });
  return true;
}
