import React from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StoreProvider, useStore } from './lib/store';
import { C, GRAD } from './lib/theme';
import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import CreateScreen from './screens/CreateScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import ProfileScreen from './screens/ProfileScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import AuthScreen from './screens/AuthScreen';
import OrganizerDashboardScreen from './screens/OrganizerDashboardScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import MessagesScreen from './screens/MessagesScreen';
import NotificationsScreen from './screens/NotificationsScreen';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function CreateTabButton({ onPress }: any) {
  return <Pressable onPress={onPress} style={styles.centerWrap}><LinearGradient colors={GRAD} style={styles.centerBtn}><Ionicons name="add" size={29} color="#fff" /></LinearGradient></Pressable>;
}
function Tabs() {
  return <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar, tabBarActiveTintColor: '#fff', tabBarInactiveTintColor: C.faint, tabBarLabelStyle: { fontSize: 10.5, fontWeight: '800', marginBottom: 2 } }}>
    <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={23} color={color} /> }} />
    <Tab.Screen name="Explorer" component={ExploreScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} /> }} />
    <Tab.Screen name="Creer" component={CreateScreen} options={{ tabBarLabel: 'Créer', tabBarButton: (p) => <CreateTabButton {...p} /> }} />
    <Tab.Screen name="Sorties" component={MyEventsScreen} options={{ tabBarLabel: 'Mes sorties', tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'ticket' : 'ticket-outline'} size={23} color={color} /> }} />
    <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} /> }} />
  </Tab.Navigator>;
}
const navTheme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.bg, card: C.bg, border: C.line, primary: C.pink } };
function AppContent() {
  const {authLoading}=useStore();
  if(authLoading)return <View style={{flex:1,backgroundColor:C.bg,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" color={C.pink}/></View>;
  return <NavigationContainer theme={navTheme}><StatusBar style="light" /><Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
    <Stack.Screen name="Tabs" component={Tabs} />
    <Stack.Screen name="Auth" component={AuthScreen} options={{ presentation: 'modal' }} />
    <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="OrganizerDashboard" component={OrganizerDashboardScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Messages" component={MessagesScreen} options={{ animation: 'slide_from_right' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
  </Stack.Navigator></NavigationContainer>;
}
export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font, ...FontAwesome.font });
  if (!fontsLoaded) return null;
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><StoreProvider><AppContent/></StoreProvider></SafeAreaProvider></GestureHandlerRootView>;
}
const styles = StyleSheet.create({
  tabBar: { position: 'absolute', left: 14, right: 14, bottom: 16, height: 68, borderRadius: 24, backgroundColor: 'rgba(22,22,38,0.97)', borderTopWidth: 1, borderWidth: 1, borderColor: C.line, paddingTop: 7, paddingBottom: 7, shadowColor: '#000', shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 16 },
  centerWrap: { flex: 1, alignItems: 'center' },
  centerBtn: { width: 54, height: 54, borderRadius: 27, marginTop: -22, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: C.bg, shadowColor: C.pink, shadowOpacity: 0.55, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 10 },
});
