import { Linking, Share, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { VEvent } from './types';
import { catLabel } from './data';
export const eventLink = (e: VEvent) => `https://vibeout.app/e/${e.id}`;
export const shareText = (e: VEvent) => `${e.title}\n${e.dateLabel} • ${e.time}\n${e.lieu}, ${e.ville}\n${e.priceLabel} • ${catLabel(e.category)}\n\nJe serai de la partie, et toi ? Rejoins-nous sur VibeOut :`;
export const whatsAppText = (e: VEvent) => `*${e.title}*\n\nDate : ${e.dateLabel} - ${e.time}\nLieu : ${e.lieu}, ${e.ville}\nTarif : ${e.priceLabel}\nDeja ${e.participants} participants inscrits\n\n${e.description.slice(0,140)}...\n\nReserve ta place ici : ${eventLink(e)}`;
async function open(url: string, fallback?: string) { try { const ok=await Linking.canOpenURL(url); if(ok){await Linking.openURL(url);return true;} if(fallback){await Linking.openURL(fallback);return true;} return false; } catch { if(fallback){try{await Linking.openURL(fallback);return true;}catch{return false;}} return false; } }
export async function shareToFacebook(e: VEvent) { const u=encodeURIComponent(eventLink(e)), quote=encodeURIComponent(shareText(e)); const done=await open(`https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${quote}`); if(!done) await shareGeneric(e); }
export async function shareToWhatsApp(e: VEvent) { const t=encodeURIComponent(whatsAppText(e)); const done=await open(`whatsapp://send?text=${t}`,`https://wa.me/?text=${t}`); if(!done) await shareGeneric(e); }
export async function shareToWhatsAppStatus(e: VEvent) { try { await Share.share(Platform.OS==='ios'?{message:whatsAppText(e),url:eventLink(e),title:e.title}:{message:`${whatsAppText(e)}\n${eventLink(e)}`,title:e.title},{dialogTitle:'Partager en Statut WhatsApp'}); } catch {} }
export async function shareToFacebookStory(e: VEvent) { try { await Share.share({message:`${shareText(e)}\n${eventLink(e)}`,title:e.title},{dialogTitle:'Partager en Story Facebook'}); } catch {} }
export async function shareGeneric(e: VEvent) { try { await Share.share({message:`${shareText(e)}\n${eventLink(e)}`,title:e.title,url:eventLink(e)},{dialogTitle:'Partager cet événement'}); } catch {} }
export async function copyEventLink(e: VEvent, onDone?: () => void) { try { await Clipboard.setStringAsync(`${shareText(e)}\n${eventLink(e)}`); onDone?.(); } catch { Alert.alert("Lien de l'événement",eventLink(e)); } }