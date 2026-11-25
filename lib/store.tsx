import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import { VEvent } from './types';
import { supabase } from './supabase';

type NewEvent = VEvent & { startsAt: string };
interface Store {
  events: VEvent[]; rsvps: string[]; favorites: string[];
  fbConnected: boolean; waOptIn: boolean; notificationsEnabled: boolean;
  user: User | null; session: Session | null; profile: any; authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  toggleRsvp: (id: string) => Promise<void>; toggleFav: (id: string) => Promise<void>;
  addEvent: (e: NewEvent) => Promise<VEvent>;
  uploadImage: (uri: string, bucket: 'event-covers' | 'avatars') => Promise<string>;
  updateProfile: (values: Record<string, any>) => Promise<void>;
  setFbConnected: (v: boolean) => Promise<void>; setWaOptIn: (v: boolean) => Promise<void>;
  setNotificationsEnabled: (v: boolean) => Promise<void>;
}
const Ctx = createContext<Store | null>(null);
const frenchDate = (value: string) => new Date(value).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const toEvent = (row: any, organizer: any = null, participantCount = 0): VEvent => {
  const d = new Date(row.starts_at);
  return {
    id: row.id, title: row.title, category: row.category, image: row.image_url || '',
    dateLabel: frenchDate(row.starts_at), day: d.toLocaleDateString('fr-FR',{day:'2-digit',month:'short'}).toUpperCase(),
    time: d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),
    lieu: row.venue, ville: row.city, price: Number(row.price || 0),
    priceLabel: Number(row.price || 0) === 0 ? 'Gratuit' : `${Number(row.price).toLocaleString('fr-FR')} FCFA`,
    participants: participantCount, capacity: row.capacity, organizer: organizer?.display_name || 'Membre Bénin Vibe',
    organizerAvatar: organizer?.avatar_url || '', description: row.description, tags: row.tags || [],
    rating: 0, featured: false, isMine: false, visibility: row.visibility === 'private' ? 'prive' : 'public',
    ambiance: row.ambiance || [],
  };
};
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [session,setSession]=useState<Session|null>(null),[profile,setProfile]=useState<any>(null),[authLoading,setAuthLoading]=useState(true);
  const [events,setEvents]=useState<VEvent[]>([]),[rsvps,setRsvps]=useState<string[]>([]),[favorites,setFavorites]=useState<string[]>([]);
  const [fbConnected,setFbConnectedS]=useState(false),[waOptIn,setWaOptInS]=useState(true),[notificationsEnabled,setNotificationsEnabledS]=useState(true);
  const user=session?.user ?? null;

  const refresh = async () => {
    const {data:{session:current}}=await supabase.auth.getSession();
    setSession(current);
    const {data:rows,error}=await supabase.from('events').select('*').eq('status','published').order('starts_at',{ascending:true});
    if(error) throw error;
    const ids=(rows||[]).map((r:any)=>r.organizer_id);
    const {data:profiles}=ids.length ? await supabase.from('profiles').select('id,display_name,avatar_url').in('id',[...new Set(ids)]) : {data:[] as any[]};
    const {data:participants}=await supabase.from('event_participants').select('event_id').eq('status','going');
    const mapped=(rows||[]).map((r:any)=>toEvent(r,(profiles||[]).find((p:any)=>p.id===r.organizer_id),(participants||[]).filter((p:any)=>p.event_id===r.id).length));
    setEvents(mapped);
    if(current?.user){
      const uid=current.user.id;
      const [{data:mineRsvps,error:rErr},{data:mineFavs,error:fErr},{data:prof},{data:prefs}] = await Promise.all([
        supabase.from('event_participants').select('event_id').eq('user_id',uid).eq('status','going'),
        supabase.from('event_favorites').select('event_id').eq('user_id',uid),
        supabase.from('profiles').select('*').eq('id',uid).maybeSingle(),
        supabase.from('user_preferences').select('*').eq('user_id',uid).maybeSingle(),
      ]);
      if(rErr) throw rErr; if(fErr) throw fErr;
      setRsvps((mineRsvps||[]).map((x:any)=>x.event_id));setFavorites((mineFavs||[]).map((x:any)=>x.event_id));setProfile(prof||null);
      setFbConnectedS(!!prefs?.facebook_connected);setWaOptInS(prefs?.whatsapp_status_opt_in!==false);setNotificationsEnabledS(prefs?.notifications_enabled!==false);
    } else {setRsvps([]);setFavorites([]);setProfile(null);setFbConnectedS(false);setWaOptInS(true);setNotificationsEnabledS(true);}
  };
  useEffect(()=>{
    let alive=true;
    supabase.auth.getSession().then(({data:{session:initial}})=>{if(alive){setSession(initial);setAuthLoading(false);refresh().catch(e=>console.warn('Bénin Vibe refresh:',e.message));}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setAuthLoading(false);setTimeout(()=>{if(alive)refresh().catch(e=>console.warn('Bénin Vibe refresh:',e.message));},0);});
    return ()=>{alive=false;subscription.unsubscribe();};
  },[]);
  const signIn=async(email:string,password:string)=>{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;};
  const signUp=async(email:string,password:string,displayName:string)=>{
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:displayName.trim()}}});
    if(error)throw error;
    if(data.session) setSession(data.session);
    return !!data.session;
  };
  const signOut=async()=>{const {error}=await supabase.auth.signOut();if(error)throw error;};
  const addEvent=async(e:NewEvent)=>{
    if(!user) throw new Error('Connecte-toi pour publier un événement.');
    const payload={organizer_id:user.id,title:e.title,category:e.category,image_url:e.image,starts_at:e.startsAt,venue:e.lieu,city:e.ville,country:'Bénin',price:e.price,currency:'XOF',capacity:e.capacity,description:e.description,tags:e.tags,ambiance:e.ambiance,visibility:e.visibility==='prive'?'private':'public',status:'published'};
    const {data,error}=await supabase.from('events').insert(payload).select('*').single();
    if(error)throw error;
    const saved=toEvent(data,profile,1);saved.isMine=true;setEvents(prev=>[...prev,saved]);return saved;
  };
  const toggleRsvp=async(id:string)=>{
    if(!user)throw new Error('Connecte-toi pour participer.');
    if(rsvps.includes(id)){const {error}=await supabase.from('event_participants').delete().eq('event_id',id).eq('user_id',user.id);if(error)throw error;setRsvps(p=>p.filter(x=>x!==id));}
    else{const {error}=await supabase.from('event_participants').upsert({event_id:id,user_id:user.id,status:'going'},{onConflict:'event_id,user_id'});if(error)throw error;setRsvps(p=>[...p,id]);}
  };
  const toggleFav=async(id:string)=>{
    if(!user)throw new Error('Connecte-toi pour enregistrer un favori.');
    if(favorites.includes(id)){const {error}=await supabase.from('event_favorites').delete().eq('event_id',id).eq('user_id',user.id);if(error)throw error;setFavorites(p=>p.filter(x=>x!==id));}
    else{const {error}=await supabase.from('event_favorites').upsert({event_id:id,user_id:user.id},{onConflict:'event_id,user_id'});if(error)throw error;setFavorites(p=>[...p,id]);}
  };
  const uploadImage=async(uri:string,bucket:'event-covers'|'avatars')=>{
    if(!user)throw new Error('Connecte-toi pour envoyer une image.');
    const response=await fetch(uri);const blob=await response.blob();
    const ext=(uri.split('?')[0].split('.').pop()||'jpg').toLowerCase();
    const contentType=blob.type||'image/jpeg';const path=`${user.id}/${Date.now()}.${['png','webp'].includes(ext)?ext:'jpg'}`;
    const {error}=await supabase.storage.from(bucket).upload(path,blob,{contentType,upsert:false,cacheControl:'3600'});
    if(error)throw error;
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  };
  const updateProfile=async(values:Record<string,any>)=>{
    if(!user)throw new Error('Connecte-toi pour modifier ton profil.');
    const {data,error}=await supabase.from('profiles').update(values).eq('id',user.id).select('*').single();
    if(error)throw error;setProfile(data);
  };
  const savePref=async(values:Record<string,any>)=>{if(!user)return;const {error}=await supabase.from('user_preferences').upsert({user_id:user.id,...values},{onConflict:'user_id'});if(error)throw error;};
  const value=useMemo<Store>(()=>({
    events,rsvps,favorites,fbConnected,waOptIn,notificationsEnabled,user,session,profile,authLoading,
    signIn,signUp,signOut,refresh,toggleRsvp,toggleFav,addEvent,uploadImage,updateProfile,
    setFbConnected:async(v)=>{await savePref({facebook_connected:v});setFbConnectedS(v);},
    setWaOptIn:async(v)=>{await savePref({whatsapp_status_opt_in:v});setWaOptInS(v);},
    setNotificationsEnabled:async(v)=>{await savePref({notifications_enabled:v});setNotificationsEnabledS(v);},
  }),[events,rsvps,favorites,fbConnected,waOptIn,notificationsEnabled,user,session,profile,authLoading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useStore(){const s=useContext(Ctx);if(!s)throw new Error('StoreProvider manquant');return s;}
