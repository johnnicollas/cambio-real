import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, View } from 'react-native';

import { ActionButton } from '../ActionButton';
import { styles } from './styles';

// Modal com título, campos (children) e os botões Cancelar / Salvar.
export function FormModal({ visible, title, onClose, onSave, saveDisabled = false, saving = false, children }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{title}</Text>
            {children}
            <View style={styles.actions}>
              <ActionButton title="Cancelar" variant="outline" onPress={onClose} style={styles.action} />
              <ActionButton
                title="Salvar"
                onPress={onSave}
                disabled={saveDisabled}
                loading={saving}
                style={styles.action}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
