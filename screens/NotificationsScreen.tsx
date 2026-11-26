import React,{useCallback,useEffect,useState} from 'react';
import {View,Text,Pressable,ScrollView,StyleSheet,Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStore} from '../lib/store';
import {supabase} from '../lib/supabase';
import {C} from '../lib/theme';
export default function NotificationsScreen({navigation}:any){
 const {user}=useStore();const [items,setItems]=useState<any[]>([]);
 const load=useCallback(async()=>{if(!user)return;const {data,error}=await supabase.from('notifications').select('*').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(100);if(error){Alert.alert('Notifications',error.message);return;}setItems(data||[]);},[user]);
 useEffect(()=>{load();if(!user)return;const ch=supabase.channel('notifications-'+user.id).on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'recipient_id=eq.'+user.id},()=>load()).subscribe();return()=>{supabase.removeChannel(ch);};},[load,user]);
 const open=async(n:any)=>{if(!n.read_at)await supabase.from('notifications').update({read_at:new Date().toISOString()}).eq('id',n.id);if(n.type==='message'&&n.data?.sender_id){const {data}=await supabase.from('profiles').select('id,display_name,username').eq('id',n.data.sender_id).maybeSingle();if(data)navigation.navigate('Messages',{recipient:data});}};
 return <SafeAreaView style={s.safe} edges={['top']}><View style={s.header}><Pressable onPress={()=>navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#fff"/></Pressable><Text style={s.title}>Notifications</Text><View style={{width:24}}/></View><ScrollView contentContainerStyle={{padding:16}}>{items.length===0?<Text style={s.muted}>Tu n'as pas encore de notification.</Text>:items.map(n=><Pressable key={n.id} onPress={()=>open(n)} style={[s.item,!n.read_at&&s.unread]}><Ionicons name={n.type==='message'?'chatbubble-ellipses':'notifications'} size={21} color={C.pink}/><View style={{flex:1}}><Text style={s.itemTitle}>{n.title}</Text><Text style={s.muted}>{n.body}</Text><Text style={s.date}>{new Date(n.created_at).toLocaleString('fr-FR')}</Text></View></Pressable>)}</ScrollView></SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},header:{height:58,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:C.line},title:{color:'#fff',fontSize:21,fontWeight:'900'},item:{flexDirection:'row',gap:12,padding:14,borderRadius:15,backgroundColor:C.card,marginBottom:10,borderWidth:1,borderColor:C.line},unread:{borderColor:C.pink},itemTitle:{color:'#fff',fontSize:14,fontWeight:'900'},muted:{color:C.muted,fontSize:12,lineHeight:18,marginTop:4},date:{color:C.faint,fontSize:10,marginTop:7}});
