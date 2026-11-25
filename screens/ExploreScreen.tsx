import React, { useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStore } from '../lib/store';
import { CATEGORIES, VILLES } from '../lib/data';
import { C } from '../lib/theme';
import EventCard from '../components/EventCard';
import { CategoryId } from '../lib/types';
type Sort = 'pop' | 'gratuit' | 'places';
export default function ExploreScreen({ navigation, route }: any) {
 const { events } = useStore(); const [q,setQ]=useState(''); const [cat,setCat]=useState<CategoryId>('tout'); const [ville,setVille]=useState('Toutes'); const [sort,setSort]=useState<Sort>('pop'); const [gratuitOnly,setGratuitOnly]=useState(false); const inputRef=useRef<TextInput>(null);
 useEffect(()=>{if(route?.params?.focusSearch)setTimeout(()=>inputRef.current?.focus(),350);},[route?.params?.focusSearch]);
 useEffect(()=>{if(route?.params?.cat)setCat(route.params.cat);},[route?.params?.cat]);
 const list=useMemo(()=>{let r=events.filter(e=>(cat==='tout'||e.category===cat)&&(ville==='Toutes'||e.ville===ville)&&(!gratuitOnly||e.price===0)&&(q.trim()===''||(e.title+' '+e.lieu+' '+e.ville+' '+e.tags.join(' ')).toLowerCase().includes(q.toLowerCase())));
 if(sort==='pop')r=[...r].sort((a,b)=>b.participants-a.participants); if(sort==='gratuit')r=[...r].sort((a,b)=>a.price-b.price); if(sort==='places')r=[...r].sort((a,b)=>(a.capacity-a.participants)-(b.capacity-b.participants)); return r;},[events,q,cat,ville,sort,gratuitOnly]);
 return <SafeAreaView style={s.safe} edges={['top']}>
  <View style={{paddingHorizontal:18,paddingTop:8}}><Text style={s.h}>Explorer</Text><Text style={s.sub}>{events.length} sorties et événements près de toi</Text>
   <View style={s.search}><Ionicons name="search" size={19} color={C.faint}/><TextInput ref={inputRef} value={q} onChangeText={setQ} placeholder="Rechercher un événement, un lieu…" placeholderTextColor={C.faint} style={s.input} returnKeyType="search"/>{q?<Pressable onPress={()=>setQ('')}><Ionicons name="close-circle" size={20} color={C.faint}/></Pressable>:null}</View>
  </View>
  <FlatList horizontal showsHorizontalScrollIndicator={false} data={CATEGORIES} keyExtractor={c=>c.id} contentContainerStyle={{paddingHorizontal:18,paddingVertical:13,gap:9}}
   renderItem={({item})=>cat===item.id?<Pressable key={item.id} onPress={()=>setCat(item.id)}><LinearGradient colors={item.grad} style={s.chip}><Ionicons name={item.icon as any} size={15} color="#fff"/><Text style={s.chipT}>{item.label}</Text></LinearGradient></Pressable>:<Pressable key={item.id} onPress={()=>setCat(item.id)} style={[s.chip,s.chipOff]}><Ionicons name={item.icon as any} size={15} color={C.muted}/><Text style={[s.chipT,{color:C.muted}]}>{item.label}</Text></Pressable>}/>
  <View style={s.filterRow}><FlatList horizontal showsHorizontalScrollIndicator={false} data={VILLES} keyExtractor={v=>v} contentContainerStyle={{gap:8,paddingRight:8}} renderItem={({item})=><Pressable onPress={()=>setVille(item)} style={[s.vChip,ville===item&&s.vChipOn]}><Text style={[s.vChipT,ville===item&&{color:'#151527'}]}>{item}</Text></Pressable>}/></View>
  <View style={s.sortRow}><Pressable onPress={()=>setGratuitOnly(!gratuitOnly)} style={[s.sortChip,gratuitOnly&&s.sortOn]}><Ionicons name="ticket-outline" size={14} color={gratuitOnly?'#151527':C.muted}/><Text style={[s.sortT,gratuitOnly&&{color:'#151527'}]}>Gratuit</Text></Pressable>
   {([['pop','Populaire','flame'],['places','Presque plein','people'],['gratuit','Prix croissant','pricetag']] as [Sort,string,string][]).map(([k,label,ic])=><Pressable key={k} onPress={()=>setSort(k)} style={[s.sortChip,sort===k&&s.sortOn]}><Ionicons name={ic as any} size={14} color={sort===k?'#151527':C.muted}/><Text style={[s.sortT,sort===k&&{color:'#151527'}]}>{label}</Text></Pressable>)}
  </View>
  <Text style={s.results}>{list.length} résultat{list.length>1?'s':''}</Text>
  <FlatList data={list} keyExtractor={e=>e.id} contentContainerStyle={{paddingHorizontal:18,paddingBottom:110}} showsVerticalScrollIndicator={false} renderItem={({item})=><EventCard e={item} onPress={()=>navigation.navigate('EventDetail',{id:item.id})}/>}
   ListEmptyComponent={<View style={s.empty}><Ionicons name="search" size={42} color={C.faint}/><Text style={s.emptyH}>Aucune sortie ne correspond</Text><Text style={s.emptyT}>Essaie une autre ville ou crée toi-même l'événement que tu cherches.</Text><Pressable onPress={()=>{setQ('');setCat('tout');setVille('Toutes');setGratuitOnly(false);}} style={s.reset}><Text style={s.resetT}>Réinitialiser les filtres</Text></Pressable></View>}/>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg},h:{color:'#fff',fontSize:27,fontWeight:'900'},sub:{color:C.muted,fontSize:13.5,marginTop:4,fontWeight:'600'},
 search:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,paddingHorizontal:15,marginTop:15,height:52},input:{flex:1,color:'#fff',fontSize:14.5,fontWeight:'600'},
 chip:{flexDirection:'row',alignItems:'center',gap:6,borderRadius:99,paddingHorizontal:14,paddingVertical:9},chipOff:{backgroundColor:C.card,borderWidth:1,borderColor:C.line},chipT:{color:'#fff',fontWeight:'800',fontSize:13},
 filterRow:{paddingHorizontal:18,height:36},vChip:{borderRadius:99,paddingHorizontal:12,paddingVertical:7,backgroundColor:'transparent',borderWidth:1,borderColor:C.line},vChipOn:{backgroundColor:C.lime,borderColor:C.lime},vChipT:{color:C.muted,fontWeight:'700',fontSize:12.5},
 sortRow:{flexDirection:'row',flexWrap:'wrap',gap:8,paddingHorizontal:18,marginTop:11},sortChip:{flexDirection:'row',alignItems:'center',gap:5,borderRadius:99,paddingHorizontal:11,paddingVertical:7,backgroundColor:C.card,borderWidth:1,borderColor:C.line},sortOn:{backgroundColor:'#fff',borderColor:'#fff'},sortT:{color:C.muted,fontWeight:'800',fontSize:12},
 results:{color:C.faint,fontSize:12.5,fontWeight:'700',paddingHorizontal:18,marginTop:15,marginBottom:11},empty:{alignItems:'center',paddingVertical:48,paddingHorizontal:30,gap:8},emptyH:{color:'#fff',fontSize:17,fontWeight:'900',marginTop:6},emptyT:{color:C.muted,fontSize:13,textAlign:'center',lineHeight:19},reset:{backgroundColor:C.violet,borderRadius:99,paddingHorizontal:16,paddingVertical:10,marginTop:10},resetT:{color:'#fff',fontWeight:'900',fontSize:13}
});