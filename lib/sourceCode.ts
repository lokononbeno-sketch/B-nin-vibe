// Fichier genere pour conserver l'ecran "Code source" fonctionnel.
// Le code source complet du projet reste dans les fichiers du depot.
export interface CodeFile { path: string; role: string; lang: string; code: string }
export const CODE_FILES: CodeFile[] = [
 { path: 'App.tsx', role: 'Navigation et point d entree', lang: 'TypeScript', code: "Consulte le fichier App.tsx dans le depot GitHub." },
 { path: 'lib/data.ts', role: 'Categories et evenements exemples', lang: 'TypeScript', code: "Consulte le fichier lib/data.ts dans le depot GitHub." },
 { path: 'screens/HomeScreen.tsx', role: 'Accueil', lang: 'TypeScript', code: "Consulte screens/HomeScreen.tsx dans le depot GitHub." },
 { path: 'screens/ExploreScreen.tsx', role: 'Exploration', lang: 'TypeScript', code: "Consulte screens/ExploreScreen.tsx dans le depot GitHub." },
 { path: 'screens/CreateScreen.tsx', role: 'Creation evenement', lang: 'TypeScript', code: "Consulte screens/CreateScreen.tsx dans le depot GitHub." },
 { path: 'screens/EventDetailScreen.tsx', role: 'Detail evenement', lang: 'TypeScript', code: "Consulte screens/EventDetailScreen.tsx dans le depot GitHub." },
 { path: 'screens/MyEventsScreen.tsx', role: 'Mes sorties', lang: 'TypeScript', code: "Consulte screens/MyEventsScreen.tsx dans le depot GitHub." },
 { path: 'screens/ProfileScreen.tsx', role: 'Profil', lang: 'TypeScript', code: "Consulte screens/ProfileScreen.tsx dans le depot GitHub." }
];