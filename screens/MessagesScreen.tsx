import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {View,Text,TextInput,Pressable,ScrollView,StyleSheet,Alert,KeyboardAvoidingView,Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStore} from '../lib/store';
import {supabase} from '../lib/supabase';
import {C} from '../lib/theme';

export default function MessagesScreen({navigation}:any){
 const {user}=useStore();
 const [rows,setRows]=useState<any[]>([]);
 const [profiles,setProfiles]=useState<any[]>([]);
 const [selected,setSelected]=useState<any>(null);
 const [search,setSearch]=useState('');
 const [draft,setDraft]=useState('');
 const [compose,setCompose]=useState(false);
 const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{
  if(!user)return;
  const {data,error}=await supabase.from('direct_messages').select('*').or('sender_id.eq.'+user.id+',recipient_id.eq.'+user.id).order('created_at',{ascending:true}).limit(500);
  if(error){Alert.alert('Messagerie',error.message);return;}
  setRows(data||[]);
  const ids=[...new Set((data||[]).map((m:any)=>m.sender_id===user.id?m.recipient_id:m.sender_id))];
  if(ids.length){const p=await supabase.from('profiles').select('id,display_name,username,avatar_url,city').in('id',ids);setProfiles(p.data||[]);}
  setLoading(false);
 },[user]);
 useEffect(()=>{load();if(!user)return;const ch=supabase.channel('direct-messages-'+user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'direct_messages'},()=>load()).subscribe();return()=>{supabase.removeChannel(ch);};},[load,user]);
 const conversations=useMemo(()=>{const map=new Map<string,any>();for(const m of rows){const id=m.sender_id===user?.id?m.recipient_id:m.sender_id;const old=map.get(id);if(!old||new Date(m.created_at)>new Date(old.created_at))map.set(id,{...m,otherId:id});}return [...map.values()].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime());},[rows,user]);
 const thread=selected?rows.filter(m=>(m.sender_id===user?.id&&m.recipient_id===selected.id)||(m.sender_id===selected.id&&m.recipient_id===user?.id)): [];
 useEffect(()=>{if(selected&&user){supabase.from('direct_messages').update({read_at:new Date().toISOString()}).eq('sender_id',selected.id).eq('recipient_id',user.id).is('read_at',null).then(()=>{});}},[selected,rows,user]);
 const start=(p:any)=>{setSelected(p);setCompose(false);setSearch('');};
 const send=async()=>{const body=draft.trim();if(!body||!selected||!user)return;const {error}=await supabase.from('direct_messages').insert({sender_id:user.id,recipient_id:selected.id,body});if(error){Alert.alert('Envoi impossible',error.message);return;}setDraft('');await load();};
 const people=profiles.filter(p=>{const q=search.toLowerCase();return !q||(p.display_name||'').toLowerCase().includes(q)||(p.username||'').toLowerCase().includes(q);});
 if(!user)return <SafeAreaView style={s.safe}><Text style={s.title}>Messagerie</Text><Text style={s.muted}>Connecte-toi pour échanger avec les membres.</Text></SafeAreaView>;
 return <SafeAreaView style={s.safe} edges={['top']}>
 <View style={s.header}><Pressable onPress={()=>selected?(setSelected(null)):navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff"/></Pressable><Text style={s.title}>{selected?(selected.display_name||'Conversation'):'Messagerie'}</Text>{selected?<View style={{width:24}}/>:<Pressable onPress={()=>{setSelected(null);setCompose(!compose);}}><Ionicons name="create-outline" size={24} color={C.pink}/></Pressable>}</View>
 {selected?<KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={{padding:16,gap:10}}>{thread.map(m=><View key={m.id} style={[s.bubble,m.sender_id===user.id?s.mine:s.theirs]}><Text style={s.msg}>{m.body}</Text><Text style={s.time}>{new Date(m.created_at).toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'})}</Text></View>)}</ScrollView><View style={s.composer}><TextInput value={draft} onChangeText={setDraft} placeholder="Écrire un message…" placeholderTextColor={C.faint} style={s.input} multiline/><Pressable onPress={send} style={s.send}><Ionicons name="send" size={19} color="#fff"/></Pressable></View></KeyboardAvoidingView>:<ScrollView contentContainerStyle={{padding:16,paddingBottom:35}}>
 {compose&&<View style={s.panel}><Text style={s.section}>Nouvelle conversation</Text><TextInput value={search} onChangeText={setSearch} placeholder="Rechercher un membre…" placeholderTextColor={C.faint} style={s.input}/>{people.map(p=><Pressable key={p.id} onPress={()=>start(p)} style={s.person}><View style={s.avatar}><Text style={s.avatarText}>{(p.display_name||'M').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={s.name}>{p.display_name||'Membre Bénin Vibe'}</Text><Text style={s.muted}>{p.username?'@'+p.username:p.city||'Bénin'}</Text></View><Ionicons name="chevron-forward" color={C.faint}/></Pressable>)}</View>}
 {!compose&&<>{conversations.length===0?<Text style={s.muted}>{loading?'Chargement…':'Aucune conversation pour le moment. Utilise le bouton en haut pour écrire à un membre.'}</Text>:conversations.map(c=>{const p=profiles.find(x=>x.id===c.otherId);const unread=rows.filter(m=>m.sender_id===c.otherId&&m.recipient_id===user.id&&!m.read_at).length;return <Pressable key={c.otherId} onPress={()=>start(p||{id:c.otherId,display_name:'Membre'})} style={s.person}><View style={s.avatar}><Text style={s.avatarText}>{(p?.display_name||'M').slice(0,1).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={s.name}>{p?.display_name||'Membre Bénin Vibe'}</Text><Text style={s.muted} numberOfLines={1}>{c.body}</Text></View>{unread>0&&<View style={s.unread}><Text style={s.unreadText}>{unread}</Text></View>}</Pressable>;})}</>}
 </ScrollView>}
 </SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},header:{height:58,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:C.line},title:{color:'#fff',fontSize:21,fontWeight:'900'},muted:{color:C.muted,fontSize:13,lineHeight:19,marginTop:7},section:{color:C.faint,fontSize:11,fontWeight:'900',letterSpacing:1,marginBottom:10},panel:{backgroundColor:C.card,borderRadius:18,padding:14,marginBottom:15},person:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:1,borderColor:C.line},avatar:{width:44,height:44,borderRadius:22,backgroundColor:'#34264C',alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900',fontSize:17},name:{color:'#fff',fontWeight:'800',fontSize:14},bubble:{maxWidth:'84%',padding:12,borderRadius:16},mine:{alignSelf:'flex-end',backgroundColor:'#5838A5',borderBottomRightRadius:4},theirs:{alignSelf:'flex-start',backgroundColor:C.card,borderBottomLeftRadius:4},msg:{color:'#fff',fontSize:14,lineHeight:20},time:{color:'#D4C8E9',fontSize:10,marginTop:5,textAlign:'right'},composer:{flexDirection:'row',alignItems:'flex-end',gap:9,padding:12,borderTopWidth:1,borderColor:C.line},input:{flex:1,minHeight:44,maxHeight:110,backgroundColor:C.card,color:'#fff',borderRadius:14,paddingHorizontal:13,paddingVertical:10,borderWidth:1,borderColor:C.line},send:{width:44,height:44,borderRadius:22,backgroundColor:C.violet,alignItems:'center',justifyContent:'center'},unread:{backgroundColor:C.pink,borderRadius:12,minWidth:23,height:23,alignItems:'center',justifyContent:'center'},unreadText:{color:'#fff',fontSize:11,fontWeight:'900'}});
