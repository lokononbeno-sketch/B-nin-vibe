import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useStore } from '../lib/store';
import { CATEGORIES, AVATARS } from '../lib/data';
import { C, GRAD } from '../lib/theme';
import EventCard from '../components/EventCard';
import { CategoryId } from '../lib/types';

export default function HomeScreen({ navigation }: any) {
  const { events, profile, refresh } = useStore();
  const [cat, setCat] = useState<CategoryId>('tout');
  const [refreshing, setRefreshing] = useState(false);
  const featured = useMemo(() => events.filter(e => e.featured), [events]);
  const list = useMemo(() => cat === 'tout' ? events : events.filter(e => e.category === cat), [events, cat]);
  const trending = useMemo(() => [...events].sort((a, b) => b.participants - a.participants).slice(0, 5), [events]);
  const open = (id: string) => navigation.navigate('EventDetail', { id });

  const Header = (
    <View>
      <View style={s.top}>
        <View style={s.row}>
          <Image source={{ uri: AVATARS[0] }} style={s.avatar} />
          <View>
            <Text style={s.hello}>Salut, {profile?.display_name || 'Bienvenue'}</Text>
            <Pressable style={s.row} onPress={() => navigation.navigate('Explorer')}>
              <Ionicons name="location" size={13} color={C.pink} /><Text style={s.loc}>{profile?.city || 'Bénin'} et alentours</Text><Ionicons name="chevron-down" size={13} color={C.muted} />
            </Pressable>
          </View>
        </View>
        <Pressable style={s.bell} onPress={() => navigation.navigate('Sorties')}>
          <Ionicons name="notifications-outline" size={21} color="#fff" /><View style={s.dot} />
        </Pressable>
      </View>
      <Text style={s.big}>Ce soir, on sort{"\n"}<Text style={s.bigGrad}>où ?</Text></Text>
      <Pressable onPress={() => navigation.navigate('Explorer', { focusSearch: true })} style={s.search}>
        <Ionicons name="search" size={19} color={C.faint} /><Text style={s.searchPh}>Concert, gala, pique-nique, miss…</Text>
        <View style={s.filterBtn}><Ionicons name="options" size={16} color="#fff" /></View>
      </Pressable>
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={CATEGORIES} keyExtractor={c => c.id}
        contentContainerStyle={{ paddingVertical: 16, gap: 14 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setCat(item.id)} style={{ alignItems: 'center', width: 72 }}>
            <LinearGradient colors={cat === item.id ? item.grad : ['#262640', '#262640']} style={s.catCircle}>
              <Ionicons name={item.icon as any} size={24} color="#fff" />
            </LinearGradient>
            <Text style={[s.catLabel, cat === item.id && { color: '#fff' }]} numberOfLines={1}>{({ tout: 'Tout', concert: 'Concerts', anniversaire: 'Anniv.', piquenique: 'Pique-nique', gala: 'Galas', miss: 'Miss', shield: 'Shield', sortie: 'Sorties' } as any)[item.id]}</Text>
          </Pressable>
        )} />
      <Pressable onPress={() => navigation.navigate('Creer')}>
        <LinearGradient colors={GRAD} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.promo}>
          <View style={{ flex: 1 }}><Text style={s.promoH}>Organise ta propre sortie</Text>
            <Text style={s.promoT}>Anniversaire, shield, gala… Publie en 1 minute, partage sur WhatsApp et Facebook.</Text>
            <View style={s.promoBtn}><Text style={s.promoBtnT}>Créer un événement</Text><Ionicons name="arrow-forward" size={14} color="#7C3AED" /></View>
          </View>
          <View style={s.promoIcon}><Ionicons name="sparkles" size={40} color="rgba(255,255,255,0.95)" /></View>
        </LinearGradient>
      </Pressable>
      <View style={s.sec}><Text style={s.secH}>À la une ce week-end</Text><Pressable onPress={() => navigation.navigate('Explorer')}><Text style={s.seeAll}>Tout voir</Text></Pressable></View>
      <FlatList horizontal showsHorizontalScrollIndicator={false} data={featured} keyExtractor={e => e.id}
        contentContainerStyle={{ paddingBottom: 4 }} renderItem={({ item }) => <EventCard e={item} wide onPress={() => open(item.id)} />} />
      <View style={s.sec}><Text style={s.secH}>Tendances chez les jeunes</Text><View style={s.hot}><Ionicons name="flame" size={12} color="#fff" /><Text style={s.hotT}>HOT</Text></View></View>
      {trending.map((e, i) => (
        <Pressable key={e.id} onPress={() => open(e.id)} style={s.trendRow}>
          <Text style={[s.rank, i === 0 && { color: C.pink }]}>{i + 1}</Text><Image source={{ uri: e.image }} style={s.trendImg} contentFit="cover" />
          <View style={{ flex: 1 }}><Text style={s.trendTitle} numberOfLines={1}>{e.title}</Text><Text style={s.trendMeta}>{e.ville} • {e.participants.toLocaleString('fr-FR')} participants</Text></View>
          <Ionicons name="trending-up" size={18} color={C.lime} />
        </Pressable>
      ))}
      <View style={s.sec}><Text style={s.secH}>{cat === 'tout' ? 'Toutes les sorties à venir' : CATEGORIES.find(c => c.id === cat)?.label}</Text><Text style={s.count}>{list.length} événements</Text></View>
    </View>
  );
  return <SafeAreaView style={s.safe} edges={['top']}><FlatList data={list} keyExtractor={e => e.id} ListHeaderComponent={Header}
    contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 110 }} showsVerticalScrollIndicator={false}
    refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.pink} onRefresh={async () => { setRefreshing(true); try { await refresh(); } finally { setRefreshing(false); } }} />}
    renderItem={({ item }) => <EventCard e={item} onPress={() => open(item.id)} />}
    ListEmptyComponent={<View style={s.empty}><Ionicons name="calendar-outline" size={44} color={C.faint} /><Text style={s.emptyT}>Aucun événement dans cette catégorie pour l'instant.</Text></View>} /></SafeAreaView>;
}
const s = StyleSheet.create({
 safe:{flex:1,backgroundColor:C.bg},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:8},row:{flexDirection:'row',alignItems:'center',gap:5},
 avatar:{width:46,height:46,borderRadius:23,marginRight:6,borderWidth:2,borderColor:C.pink},hello:{color:'#fff',fontSize:16,fontWeight:'800'},loc:{color:C.muted,fontSize:12.5,fontWeight:'600'},
 bell:{width:44,height:44,borderRadius:22,backgroundColor:C.card,borderWidth:1,borderColor:C.line,alignItems:'center',justifyContent:'center'},dot:{position:'absolute',top:10,right:11,width:9,height:9,borderRadius:5,backgroundColor:C.pink,borderWidth:2,borderColor:C.card},
 big:{color:'#fff',fontSize:30,fontWeight:'900',lineHeight:34,marginTop:20},bigGrad:{color:C.pink},search:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,paddingLeft:16,paddingRight:6,paddingVertical:6,marginTop:16},
 searchPh:{color:C.faint,fontSize:14,flex:1,fontWeight:'600'},filterBtn:{width:38,height:38,borderRadius:13,backgroundColor:C.violet,alignItems:'center',justifyContent:'center'},catCircle:{width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center'},catLabel:{color:C.muted,fontSize:11,fontWeight:'700',marginTop:7},
 promo:{borderRadius:24,padding:18,flexDirection:'row',alignItems:'center',marginTop:2},promoH:{color:'#fff',fontSize:18,fontWeight:'900'},promoT:{color:'rgba(255,255,255,0.9)',fontSize:12.5,lineHeight:17,marginTop:5},
 promoBtn:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'#fff',alignSelf:'flex-start',borderRadius:99,paddingHorizontal:13,paddingVertical:8,marginTop:12},promoBtnT:{color:'#7C3AED',fontWeight:'900',fontSize:12.5},promoIcon:{width:66,height:66,borderRadius:33,backgroundColor:'rgba(255,255,255,0.18)',alignItems:'center',justifyContent:'center',marginLeft:10},
 sec:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:24,marginBottom:13},secH:{color:'#fff',fontSize:18,fontWeight:'900'},seeAll:{color:C.pink,fontWeight:'800',fontSize:13},count:{color:C.faint,fontSize:12,fontWeight:'700'},
 hot:{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#E11D48',borderRadius:99,paddingHorizontal:9,paddingVertical:4},hotT:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1},
 trendRow:{flexDirection:'row',alignItems:'center',gap:11,backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:18,padding:10,marginBottom:9},rank:{color:C.faint,fontSize:20,fontWeight:'900',width:22,textAlign:'center'},
 trendImg:{width:52,height:52,borderRadius:14},trendTitle:{color:'#fff',fontWeight:'800',fontSize:13.5},trendMeta:{color:C.muted,fontSize:11.5,marginTop:3,fontWeight:'600'},empty:{alignItems:'center',paddingVertical:36,gap:10},emptyT:{color:C.muted,fontSize:13.5,textAlign:'center'}
});