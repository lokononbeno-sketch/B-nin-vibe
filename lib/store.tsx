import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VEvent } from './types';
import { EVENTS } from './data';
interface Store {
  events: VEvent[]; rsvps: string[]; favorites: string[]; fbConnected: boolean; waOptIn: boolean;
  toggleRsvp: (id: string) => void; toggleFav: (id: string) => void; addEvent: (e: VEvent) => void;
  setFbConnected: (v: boolean) => void; setWaOptIn: (v: boolean) => void;
}
const Ctx = createContext<Store | null>(null);
const K = { mine: 'vibeout_mine_v1', rsvp: 'vibeout_rsvp_v1', fav: 'vibeout_fav_v1', social: 'vibeout_social_v1' };
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mine, setMine] = useState<VEvent[]>([]), [rsvps, setRsvps] = useState<string[]>(['e3']), [favorites, setFavorites] = useState<string[]>(['e1', 'e12']);
  const [fbConnected, setFbConnectedS] = useState(false), [waOptIn, setWaOptInS] = useState(true);
  useEffect(() => { (async () => { try {
    const [m,r,f,s] = await Promise.all([AsyncStorage.getItem(K.mine),AsyncStorage.getItem(K.rsvp),AsyncStorage.getItem(K.fav),AsyncStorage.getItem(K.social)]);
    if(m) setMine(JSON.parse(m)); if(r) setRsvps(JSON.parse(r)); if(f) setFavorites(JSON.parse(f));
    if(s) { const o=JSON.parse(s); setFbConnectedS(!!o.fb); setWaOptInS(o.wa !== false); }
  } catch {} })(); }, []);
  const persist = (k: string, v: any) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});
  const value = useMemo<Store>(() => ({
    events: [...mine, ...EVENTS], rsvps, favorites, fbConnected, waOptIn,
    toggleRsvp: id => setRsvps(prev => { const n=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]; persist(K.rsvp,n); return n; }),
    toggleFav: id => setFavorites(prev => { const n=prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]; persist(K.fav,n); return n; }),
    addEvent: e => setMine(prev => { const n=[e,...prev]; persist(K.mine,n); return n; }),
    setFbConnected: v => { setFbConnectedS(v); AsyncStorage.getItem(K.social).then(raw=>{const o=raw?JSON.parse(raw):{};persist(K.social,{...o,fb:v});}); },
    setWaOptIn: v => { setWaOptInS(v); AsyncStorage.getItem(K.social).then(raw=>{const o=raw?JSON.parse(raw):{};persist(K.social,{...o,wa:v});}); },
  }), [mine,rsvps,favorites,fbConnected,waOptIn]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore() { const s=useContext(Ctx); if(!s) throw new Error('StoreProvider manquant'); return s; }