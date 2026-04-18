import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Image,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import getData from "../../services/services";
import { useSettings } from "../../context/SettingsContext";

const NAV_HEIGHT = 90;
const isWeb = Platform.OS === "web";

const API_KEY = "698b5155dbadb1.67947020";
const API_URL = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&topics=economy_macro,finance&limit=15&apikey=${API_KEY}`;

const getSentimentStyle = (score, C, t) => {
  if (score > 0.15) return { color: "#22C55E", label: t("newFeatures.bullish"), icon: "trending-up" };
  if (score < -0.15) return { color: "#EF4444", label: t("newFeatures.bearish"), icon: "trending-down" };
  return { color: C.textMuted, label: t("newFeatures.neutral"), icon: "minus" };
};

const MarketThermometer = ({ score, C, t }) => {
   // score va de -0.5 a 0.5 típicamente en AlphaVantage
   const percent = Math.min(Math.max(((score + 0.5) * 100), 0), 100); 
   const labelStyle = getSentimentStyle(score, C, t);

   return (
       <View style={[stylesLocal.thermoCard, {backgroundColor: C.cardBg, borderColor: C.border}]}>
           <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
               <Text style={{color: C.textMain, fontWeight: "800", fontSize: 16}}>{t("newFeatures.marketSentiment")}</Text>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                   <Feather name={labelStyle.icon} size={16} color={labelStyle.color} />
                   <Text style={{color: labelStyle.color, fontWeight: "bold", textTransform: "uppercase", fontSize: 12}}>{labelStyle.label}</Text>
               </View>
           </View>

           <View style={{width: '100%', height: 8, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", flexDirection: "row"}}>
               <View style={{flex: 1, backgroundColor: "#EF4444"}} />
               <View style={{flex: 1, backgroundColor: "#F59E0B"}} />
               <View style={{flex: 1, backgroundColor: "#22C55E"}} />
               <View style={{
                   position: 'absolute', left: `${percent}%`, width: 4, height: 12, backgroundColor: "#FFF", borderRadius: 2, top: -2, transform: [{translateX: -2}],
                   shadowColor: "#FFF", shadowOpacity: 1, shadowRadius: 5
               }} />
           </View>
       </View>
   );
};

export default function MenuNoticias() {
  const { t } = useTranslation();
  const { C } = useSettings();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
        const data = await getData(API_URL, null);
        if (data && data.feed) {
            setNews(data.feed);
        }
    } catch(e) {
        console.log("Error fetching news", e);
    }
    setLoading(false);
  };

  const avgSentiment = useMemo(() => {
      if(news.length === 0) return 0;
      return news.reduce((acc, n) => acc + parseFloat(n.overall_sentiment_score || 0), 0) / news.length;
  }, [news]);

  const mainNews = news[0];
  const gridNews = news.slice(1);

  return (
    <View style={[stylesLocal.flex1, { backgroundColor: C.bg }]}>
      <SafeAreaView style={[stylesLocal.flex1, isWeb && stylesLocal.safeWeb]}>
        
        <View style={stylesLocal.header}>
            <Text style={[stylesLocal.headerTitle, { color: C.textMain }]}>{t("news.headerTitle")}</Text>
            <TouchableOpacity onPress={fetchNews} style={[stylesLocal.iconBtn, {backgroundColor: C.cardBg, borderColor: C.border}]}>
              <MaterialIcons name="refresh" size={22} color={C.primary} />
            </TouchableOpacity>
        </View>

        {loading ? (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
               <ActivityIndicator size="large" color={C.primary} />
            </View>
        ) : (
            <ScrollView contentContainerStyle={stylesLocal.scrollContent} showsVerticalScrollIndicator={false}>
                {news.length > 0 && <MarketThermometer score={avgSentiment} C={C} t={t} />}

                {mainNews && (
                    <TouchableOpacity activeOpacity={0.9} style={[stylesLocal.heroCard, {borderColor: C.border}]} onPress={() => Linking.openURL(mainNews.url)}>
                        <Image source={{ uri: mainNews.banner_image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247' }} style={stylesLocal.heroImg} />
                        <LinearGradient colors={["transparent", "rgba(0,0,0,0.95)"]} style={stylesLocal.heroGradient} />
                        <View style={stylesLocal.heroContent}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10}}>
                               <View style={[stylesLocal.tagBadge, {backgroundColor: C.primary}]}>
                                   <Text style={stylesLocal.tagText}>{t("newFeatures.breaking")}</Text>
                               </View>
                               <Text style={{color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "bold", textTransform: 'uppercase'}}>{mainNews.source}</Text>
                            </View>
                            <Text style={stylesLocal.heroTitle} numberOfLines={3}>{mainNews.title}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                <Text style={[stylesLocal.sectionTitle, {color: C.textMain}]}>{t("newFeatures.latestStories")}</Text>

                <View style={stylesLocal.gridContainer}>
                    {gridNews.map((item, idx) => {
                        const sentiment = getSentimentStyle(item.overall_sentiment_score, C, t);
                        return (
                            <TouchableOpacity 
                                key={idx} 
                                style={[stylesLocal.gridCard, { backgroundColor: C.cardBg, borderColor: C.border }]} 
                                onPress={() => Linking.openURL(item.url)}
                            >
                                <Image source={{uri: item.banner_image || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247'}} style={stylesLocal.gridImg} />
                                <View style={stylesLocal.gridContent}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6}}>
                                        <Text style={[stylesLocal.gridSource, {color: C.primary}]}>{item.source}</Text>
                                        <Feather name={sentiment.icon} size={14} color={sentiment.color} />
                                    </View>
                                    <Text style={[stylesLocal.gridTitle, {color: C.textMain}]} numberOfLines={3}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        )}

      </SafeAreaView>

      <View style={[stylesLocal.navWrap, isWeb ? stylesLocal.navWrapWeb : stylesLocal.navWrapNative, {backgroundColor: C.cardBg}]}>
         <Nav />
      </View>
    </View>
  );
}

const stylesLocal = StyleSheet.create({
  flex1: { flex: 1 },
  safeWeb: { height: "100vh", overflow: "hidden" },
  header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 24, paddingTop: Platform.OS === "android" ? 20 : 10, paddingBottom: 15
  },
  headerTitle: { fontSize: 26, fontWeight: "900" },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  
  thermoCard: {
      borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 20
  },

  heroCard: {
      width: '100%', height: 280, borderRadius: 24, borderWidth: 1, overflow: 'hidden', marginBottom: 25
  },
  heroImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, right: 20 },
  heroTitle: { color: "#FFF", fontSize: 20, fontWeight: "900", lineHeight: 28 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { color: "#FFF", fontSize: 10, fontWeight: "900" },

  sectionTitle: { fontSize: 18, fontWeight: "800", marginBottom: 15 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
      width: '48%', borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 15
  },
  gridImg: { width: '100%', height: 110, resizeMode: 'cover' },
  gridContent: { padding: 12 },
  gridSource: { fontSize: 10, fontWeight: "800", textTransform: 'uppercase' },
  gridTitle: { fontSize: 13, fontWeight: "700", lineHeight: 18 },

  navWrap: { left: 0, right: 0, bottom: 0, height: NAV_HEIGHT, zIndex: 9999 },
  navWrapWeb: { position: "fixed" },
  navWrapNative: { position: "absolute" },
});