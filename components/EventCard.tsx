import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VEvent } from '../lib/types';
import { catLabel, catColor, AVATARS } from '../lib/data';
import { useStore } from '../lib/store';
import { C } from '../lib/theme';
export function spotsLeft(e: VEvent) { return Math.max(0, e.capacity - e.participants); }
export default function EventCard({ e, onPress, wide }: { e: VEvent; onPress: () => void; wide?: boolean }) {
 const { favorites, toggleFav, rsvps } = useStore(); const fav=favorites.includes(e.id), going=rsvps.includes(e.id)||e.isMine, left=spotsLeft(e), pct=Math.min(100,Math.round(e.participants/e.capacity*100));
 return <Pressable onPress={onPress} style={({pressed})=>[s.card,wide&&s.wide,pressed&&{opacity:.92,transform:[{scale:.99}]}]}>
  <View style={s.imgWrap}><Image source={{uri:e.image}} style={s.img} contentFit="cover" transition={250}/><LinearGradient colors={['transparent','rgba(11,11,20,0.88)']} style={s.fade}/>
   <View style={[s.catBadge,{backgroundColor:catColor(e.category)}]}><Text style={s.catTxt}>{catLabel(e.category)}</Text></View>
   <Pressable hitSlop={10} onPress={()=>toggleFav(e.id)} style={s.heart}><Ionicons name={fav?'heart':'heart-outline'} size={19} color={fav?'#F43F5E':'#fff'}/></Pressable>
   <View style={s.dateBadge}><Text style={s.dateTxt}>{e.day}</Text></View>
   {going&&<View style={s.goingBadge}><Ionicons name="checkmark-circle" size={13} color="#0B0B14"/><Text style={s.goingTxt}>{e.isMine?'Mon événement':"J'y vais"}</Text></View>}
   <View style={s.priceBadge}><Text style={s.priceTxt}>{e.priceLabel}</Text></View>
  </View>
  <View style={s.body}><Text style={s.title} numberOfLines={2}>{e.title}</Text>
   <View style={s.row}><Ionicons name="calendar-outline" size={14} color={C.pink}/><Text style={s.meta}>{e.dateLabel} • {e.time}</Text></View>
   <View style={s.row}><Ionicons name="location-outline" size={14} color={C.cyan}/><Text style={s.meta} numberOfLines={1}>{e.lieu} • {e.ville}</Text></View>
   <View style={s.foot}><View style={s.row}><View style={s.avatars}>{AVATARS.slice(0,3).map((a,i)=><Image key={i} source={{uri:a}} style={[s.av,{marginLeft:i?-9:0}]}/>)}</View><Text style={s.partTxt}>+{e.participants.toLocaleString('fr-FR')}</Text></View>
    <View style={s.row}><Ionicons name="star" size={13} color={C.gold}/><Text style={s.rate}>{e.rating.toFixed(1)}</Text><Text style={[s.left,left<60&&{color:'#FB7185'}]}>{left<60?`Plus que ${left} places`:`${pct}% rempli`}</Text></View>
   </View><View style={s.barBg}><LinearGradient colors={['#7C3AED','#EC4899']} style={[s.bar,{width:`${pct}%`}]}/></View>
  </View>
 </Pressable>;
}
const s=StyleSheet.create({
 card:{backgroundColor:C.card,borderRadius:24,overflow:'hidden',borderWidth:1,borderColor:C.line,marginBottom:16},wide:{width:298,marginBottom:0,marginRight:14},imgWrap:{height:176,position:'relative'},img:{width:'100%',height:'100%'},fade:{position:'absolute',left:0,right:0,bottom:0,height:90},
 catBadge:{position:'absolute',top:12,left:12,borderRadius:99,paddingHorizontal:10,paddingVertical:5},catTxt:{color:'#fff',fontSize:11,fontWeight:'800',letterSpacing:.3},heart:{position:'absolute',top:10,right:10,width:36,height:36,borderRadius:18,backgroundColor:'rgba(11,11,20,0.55)',alignItems:'center',justifyContent:'center'},
 dateBadge:{position:'absolute',left:12,bottom:10,backgroundColor:'rgba(255,255,255,0.95)',borderRadius:10,paddingHorizontal:8,paddingVertical:4},dateTxt:{color:'#151527',fontSize:11,fontWeight:'900',letterSpacing:.4},priceBadge:{position:'absolute',right:12,bottom:10,backgroundColor:C.lime,borderRadius:10,paddingHorizontal:9,paddingVertical:4},priceTxt:{color:'#151527',fontSize:12,fontWeight:'900'},
 goingBadge:{position:'absolute',right:12,bottom:42,flexDirection:'row',alignItems:'center',gap:4,backgroundColor:C.lime,borderRadius:99,paddingHorizontal:8,paddingVertical:3},goingTxt:{color:'#0B0B14',fontSize:10,fontWeight:'900'},
 body:{padding:14,paddingTop:12},title:{color:'#fff',fontSize:16.5,fontWeight:'800',lineHeight:21,marginBottom:7},row:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:4},meta:{color:C.muted,fontSize:12.5,fontWeight:'600',flex:1},
 foot:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:8},avatars:{flexDirection:'row'},av:{width:24,height:24,borderRadius:12,borderWidth:2,borderColor:C.card},partTxt:{color:'#fff',fontSize:12,fontWeight:'800'},rate:{color:'#fff',fontSize:12,fontWeight:'800'},left:{color:C.faint,fontSize:11,fontWeight:'700',marginLeft:6},barBg:{height:5,borderRadius:3,backgroundColor:'rgba(255,255,255,0.1)',marginTop:10,overflow:'hidden'},bar:{height:'100%',borderRadius:3}
});