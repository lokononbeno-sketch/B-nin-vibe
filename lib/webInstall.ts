import { Linking, Platform } from 'react-native';

// Installation de l'application web (PWA) sur le téléphone, sans Play Store.
// - ajoute le manifest (public/manifest.json) et enregistre le service worker (public/sw.js)
// - le bouton "Installer Bénin Vibe" (Profil) lance l'installation au lieu d'ouvrir la page de build Expo.
if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof document !== 'undefined') {
  const head = document.head;
  if (head && !document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = '/B-nin-vibe/manifest.json';
    head.appendChild(link);
    const theme = document.createElement('meta');
    theme.name = 'theme-color';
    theme.content = '#0B0B14';
    head.appendChild(theme);
  }
  if ('serviceWorker' in navigator) {
    const register = () => navigator.serviceWorker.register('/B-nin-vibe/sw.js', { scope: '/B-nin-vibe/' }).catch(() => {});
    if (document.readyState === 'complete') register(); else window.addEventListener('load', register);
  }
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
      window.alert("Pour installer Bénin Vibe sur ton téléphone :\n\n1. Touche les 3 points ⋮ en haut à droite de Chrome.\n2. Touche « Installer l'application ».\n3. Touche « Installer ».\n\n(Si tu vois seulement « Ajouter à l'écran d'accueil », recharge la page une fois puis réessaie.)");
      return;
    }
    return original(url);
  };
}
