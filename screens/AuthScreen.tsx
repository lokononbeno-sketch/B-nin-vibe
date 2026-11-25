import React,{useState} from 'react';
import {View,Text,TextInput,Pressable,StyleSheet,Alert,KeyboardAvoidingView,Platform,ScrollView} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import {useStore} from '../lib/store';
import {C,GRAD} from '../lib/theme';

export default function AuthScreen({navigation}:any){
 const {signIn,signUp}=useStore();
 const [mode,setMode]=useState<'login'|'signup'>('signup');
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const submit=async()=>{
  if(!email.trim()||!password){Alert.alert('Informations manquantes','Renseigne ton adresse e-mail et ton mot de passe.');return;}
  if(password.length<8){Alert.alert('Mot de passe trop court','Utilise au moins 8 caractères.');return;}
  if(mode==='signup'&&name.trim().length<2){Alert.alert('Nom requis','Indique le nom qui sera affiché sur ton profil.');return;}
  setBusy(true);
  try{
   if(mode==='login'){await signIn(email,password);navigation.goBack();}
   else{const hasSession=await signUp(email,password,name);Alert.alert('Compte créé',hasSession?'Ton compte Bénin Vibe est prêt.':'Vérifie ta boîte e-mail pour confirmer ton adresse, puis connecte-toi.');if(hasSession)navigation.goBack();}
  }catch(e:any){Alert.alert('Impossible de continuer',e.message||'Une erreur est survenue.');}
  finally{setBusy(false);}
 };
 return <KeyboardAvoidingView style={s.safe} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
  <LinearGradient colors={GRAD} style={s.logo}><Ionicons name="sparkles" size={34} color="#fff"/></LinearGradient>
  <Text style={s.brand}>BÉNIN VIBE</Text><Text style={s.subtitle}>Les sorties, les rencontres et les événements près de toi.</Text>
  <View style={s.panel}>
   <Text style={s.title}>{mode==='signup'?'Créer mon compte':'Connexion'}</Text>
   <Text style={s.hint}>{mode==='signup'?'Rejoins la communauté Bénin Vibe.':'Retrouve tes événements et tes favoris.'}</Text>
   {mode==='signup'&&<><Text style={s.label}>Nom affiché</Text><TextInput value={name} onChangeText={setName} placeholder="Ton nom" placeholderTextColor={C.faint} style={s.input} autoCapitalize="words"/></>}
   <Text style={s.label}>Adresse e-mail</Text><TextInput value={email} onChangeText={setEmail} placeholder="exemple@email.com" placeholderTextColor={C.faint} style={s.input} autoCapitalize="none" keyboardType="email-address"/>
   <Text style={s.label}>Mot de passe</Text><TextInput value={password} onChangeText={setPassword} placeholder="8 caractères minimum" placeholderTextColor={C.faint} style={s.input} secureTextEntry autoCapitalize="none"/>
   <Pressable disabled={busy} onPress={submit}><LinearGradient colors={GRAD} style={[s.button,busy&&{opacity:.6}]}><Text style={s.buttonText}>{busy?'Patiente…':mode==='signup'?'Créer mon compte':'Me connecter'}</Text></LinearGradient></Pressable>
   <Pressable onPress={()=>setMode(mode==='signup'?'login':'signup')} style={s.switch}><Text style={s.switchText}>{mode==='signup'?'Déjà inscrit ? Se connecter':'Pas encore de compte ? S’inscrire'}</Text></Pressable>
  </View>
  <Text style={s.foot}>En continuant, tu acceptes de respecter les règles de la communauté Bénin Vibe.</Text>
 </ScrollView></KeyboardAvoidingView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},content:{flexGrow:1,justifyContent:'center',padding:24},logo:{width:76,height:76,borderRadius:24,alignItems:'center',justifyContent:'center',alignSelf:'center'},brand:{color:'#fff',fontSize:26,fontWeight:'900',textAlign:'center',marginTop:14,letterSpacing:1.8},subtitle:{color:C.muted,textAlign:'center',fontSize:13,marginTop:6,lineHeight:19},panel:{backgroundColor:C.card,borderWidth:1,borderColor:C.line,borderRadius:24,padding:20,marginTop:28},title:{color:'#fff',fontSize:22,fontWeight:'900'},hint:{color:C.muted,fontSize:12.5,marginTop:5,marginBottom:14},label:{color:'#fff',fontSize:13,fontWeight:'800',marginTop:13,marginBottom:7},input:{backgroundColor:'#11111F',borderWidth:1,borderColor:C.line,borderRadius:14,paddingHorizontal:14,paddingVertical:13,color:'#fff',fontSize:14},button:{borderRadius:15,alignItems:'center',paddingVertical:15,marginTop:22},buttonText:{color:'#fff',fontWeight:'900',fontSize:15},switch:{alignItems:'center',paddingTop:17},switchText:{color:C.cyan,fontWeight:'800',fontSize:13},foot:{color:C.faint,fontSize:11,textAlign:'center',marginTop:18,lineHeight:16}});
