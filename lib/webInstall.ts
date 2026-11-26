import { Linking, Platform } from 'react-native';

// Sur le web, le bouton "Installer Bénin Vibe" (Profil) ouvrait la page de build Expo (EAS).
// Ici on le remplace par l'installation de l'application web (PWA) : on utilise l'invite de Chrome
// si elle est disponible, sinon on affiche les étapes à suivre.
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  let deferred: any = null;
  window.addEventListener('beforeinstallprompt', (e: any) => { e.preventDefault(); deferred = e; });
  window.addEventListener('appinstalled', () => { deferred = null; });
  const original = Linking.openURL.bind(Linking);
  (Linking as any).openURL = async (url: string) => {
    if (typeof url === 'string' && url.startsWith('https://expo.dev/accounts/benolilokonon')) {
      if (deferred) {
        deferred.prompt();
        try { await deferred.userChoice; } catch {}
        deferred = null;
        return;
      }
      window.alert("Pour installer Bénin Vibe sur ton téléphone :\n\n1. Touche les 3 points ⋮ en haut à droite de Chrome.\n2. Touche « Ajouter à l'écran d'accueil » (ou « Installer l'application »).\n3. Touche « Installer » ou « Ajouter ».");
      return;
    }
    return original(url);
  };
}
