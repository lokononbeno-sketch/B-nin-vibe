import { Alert, Platform } from 'react-native';

// Sur le web, Alert.alert de React Native ne fait RIEN : les messages (erreurs de connexion,
// "compte créé", etc.) n'apparaissaient jamais. Ce patch les affiche avec les boîtes du navigateur.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  (Alert as any).alert = (title?: string, message?: string, buttons?: any[]) => {
    const text = [title, message].filter(Boolean).join('\n\n');
    if (buttons && buttons.length > 1) {
      const ok = window.confirm(text);
      const target = ok ? buttons.find((b) => b.style !== 'cancel') : buttons.find((b) => b.style === 'cancel');
      target?.onPress?.();
    } else {
      window.alert(text);
      buttons?.[0]?.onPress?.();
    }
  };
}
