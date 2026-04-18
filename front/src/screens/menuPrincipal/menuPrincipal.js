import React, { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  Linking
} from "react-native";
import { Search, ArrowRight, X, Star, Globe, TrendingUp, Activity, Newspaper } from "lucide-react-native";
import Svg, { Polyline, Polygon, Defs, LinearGradient, Stop } from "react-native-svg";

import Nav from "../../components/Nav";
import common from "../../styles/common";
import Context from '../../context/Context';
import { useSettings } from "../../context/SettingsContext";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const BASE_URL = "http://192.168.1.138:8080"; 
const isWeb = Platform.OS === 'web';
const NAV_HEIGHT = 90;

const CURRENCY_SYMBOLS = {
  EUR: "€", USD: "$", GBP: "£", JPY: "¥", CHF: "CHF", CNY: "¥", AUD: "$", CAD: "$", NZD: "$",
  MXN: "$", BRL: "R$", ARS: "$", CLP: "$", COP: "$", INR: "₹", KRW: "₩", SGD: "$", HKD: "$",
  THB: "฿", SEK: "kr", NOK: "kr", DKK: "kr", PLN: "zł", TRY: "₺", RUB: "₽", ZAR: "R",
  AED: "د.إ", SAR: "﷼",
};

export default function MenuPrincipal({ navigation }) {
  const { t } = useTranslation();
  const { user } = useContext(Context);
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [search, setSearch] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [activeFilter, setActiveFilter] = useState("all");
  const [userCurrency, setUserCurrency] = useState("USD");

  const [globalData, setGlobalData] = useState(null);
  const [fearAndGreed, setFearAndGreed] = useState(null);
  const [news, setNews] = useState([]);

  const isFetching = useRef(false);

  const fetchUserSettings = async () => {
    if (!user?.userId) return null;
    try {
      const response = await fetch(`${BASE_URL}/API/Settings/${user.userId}`);
      if (response.ok) {
        const settings = await response.json();
        const cur = settings?.currency ? settings.currency.toUpperCase() : "EUR";
        setUserCurrency(cur);
        return cur;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const fetchFavorites = useCallback(async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${BASE_URL}/API/SeeFavorites/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setFavoritesIds(Array.isArray(data) ? data.map((f) => f.crypto) : []);
      }
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [fngRes, globalRes, newsRes] = await Promise.all([
        fetch("https://api.alternative.me/fng/"),
        fetch("https://api.coingecko.com/api/v3/global"),
        fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN")
      ]);
      if (fngRes.ok) {
        const fngData = await fngRes.json();
        setFearAndGreed(fngData?.data?.[0]);
      }
      if (globalRes.ok) {
        const globData = await globalRes.json();
        setGlobalData(globData?.data);
      }
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData?.Data?.slice(0, 5) || []);
      }
    } catch (e) {
      console.log("Error loading dashboard data", e);
    }
  };

  const fetchMarketData = async (currentLimit, currency) => {
    if (isFetching.current) return;
    isFetching.current = true;
    if (cryptos.length === 0) setLoading(true);

    const vsCurrency = (currency || "EUR").toUpperCase();
    const geckoUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vsCurrency.toLowerCase()}&order=market_cap_desc&per_page=${currentLimit}&page=1&sparkline=true`;

    try {
      const response = await fetch(geckoUrl, {
        headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        const formatted = data.map((coin) => ({
          id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image,
          current_price: coin.current_price, price_change_percentage_24h: coin.price_change_percentage_24h,
          sparkline: coin.sparkline_in_7d?.price || []
        }));
        setCryptos(formatted);
      } 
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      const refresh = async () => {
        const cur = (await fetchUserSettings()) || userCurrency;
        await Promise.all([
          fetchMarketData(limit, cur),
          fetchFavorites(),
          fetchDashboardData()
        ]);
      };
      refresh();
    }, [limit, userCurrency, fetchFavorites])
  );

  const handleLoadMore = () => {
    if (!loading) {
      const nextLimit = limit + 10;
      setLimit(nextLimit);
      fetchMarketData(nextLimit, userCurrency);
    }
  };

  const toggleFavorite = async (crypto) => {
    if (!user?.userId) return;
    const isFav = favoritesIds.includes(crypto.id);
    if (!isFav) {
      try {
        const res = await fetch(`${BASE_URL}/API/NewFavorite`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: user.userId, crypto: crypto.id }),
        });
        if (res.ok) setFavoritesIds((prev) => [...prev, crypto.id]);
      } catch (error) {
        Alert.alert(t("common.error"), t("home.alerts.couldNotSaveFavorite"));
      }
    } else {
      try {
        const res = await fetch(`${BASE_URL}/API/RemoveFavorite?clientId=${user.userId}&crypto=${crypto.id}`, { method: "DELETE" });
        if (res.ok) setFavoritesIds((prev) => prev.filter((id) => id !== crypto.id));
      } catch (error) {
        Alert.alert(t("common.error"), t("home.alerts.couldNotRemoveFavorite"));
      }
    }
  };

  const filteredCryptos = useMemo(() => {
    let result = Array.isArray(cryptos) ? [...cryptos] : [];
    if (search && search.trim()) {
      const s = search.toLowerCase();
      result = result.filter((c) => c.name?.toLowerCase().includes(s) || c.symbol?.toLowerCase().includes(s));
    }
    if (activeFilter === "favorites") result = result.filter((c) => favoritesIds.includes(c.id));
    else if (activeFilter === "gainers") {
      result = result.filter((c) => (c.price_change_percentage_24h || 0) > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    } else if (activeFilter === "losers") {
      result = result.filter((c) => (c.price_change_percentage_24h || 0) < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    }
    return result;
  }, [cryptos, search, activeFilter, favoritesIds]);

  const topGainer = useMemo(() => {
    if(!cryptos || cryptos.length === 0) return null;
    return [...cryptos].sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))[0];
  }, [cryptos]);

  const getFngColor = (val) => {
    if(!val) return C.textMuted;
    const v = parseInt(val);
    if(v <= 25) return C.danger;
    if(v <= 45) return "#F59E0B";
    if(v <= 55) return "#94A3B8";
    if(v <= 75) return C.primary;
    return C.primaryDark;
  };

  const currentCurrencyLower = userCurrency.toLowerCase();
  const globalMarketCap = globalData?.total_market_cap?.[currentCurrencyLower] 
                          ? (globalData.total_market_cap[currentCurrencyLower] / 1e12).toFixed(2)
                          : "---";
  const currencySymbol = CURRENCY_SYMBOLS[userCurrency] || userCurrency;

  const MainContent = () => (
    <View style={styles.flex1}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER GREETING */}
        <View style={styles.headerTitleContainer}>
           <Text style={styles.headerGreeting}>{t("home.bento.greeting", { name: user?.name || "Trader" })}</Text>
           <Text style={styles.headerSubtitle}>{t("home.bento.subtitle")}</Text>
        </View>

        {/* BENTO DASHBOARD */}
        <View style={styles.bentoContainer}>
          {/* ROW 1: Global Market Cap */}
          <View style={[styles.bentoBox, styles.bentoFull]}>
            <View style={styles.bentoHeader}>
              <View style={styles.bentoIconWrap}><Globe size={18} color={C.primary} /></View>
              <Text style={styles.bentoTitle}>{t("home.bento.globalMarket")}</Text>
            </View>
            <Text style={styles.bentoValueBig}>
              {globalMarketCap !== "---" ? `${currencySymbol}${globalMarketCap}T` : "Loading..."}
            </Text>
            <View style={styles.bentoRow}>
              <Text style={[styles.bentoSub, {color: globalData?.market_cap_change_percentage_24h_usd >= 0 ? C.primary : C.danger}]}>
                {globalData?.market_cap_change_percentage_24h_usd > 0 ? "+" : ""}{globalData?.market_cap_change_percentage_24h_usd?.toFixed(2)}%
              </Text>
              <Text style={styles.bentoSubText}>  •  {t("home.bento.btcDominance")} {globalData?.market_cap_percentage?.btc?.toFixed(1)}%</Text>
            </View>
          </View>

          {/* ROW 2: Half width boxes */}
          <View style={styles.bentoRowContainer}>
            {/* Box 2A: Fear & Greed */}
            <View style={[styles.bentoBox, styles.bentoHalf]}>
              <View style={styles.bentoHeader}>
                  <View style={styles.bentoIconWrap}><Activity size={18} color={C.primary} /></View>
                  <Text style={styles.bentoTitle}>{t("home.bento.fearGreed")}</Text>
              </View>
              <View style={styles.fngCenter}>
                <View style={{flexDirection: "row", alignItems: "baseline", gap: 5}}>
                  <Text style={[styles.bentoValue, {color: getFngColor(fearAndGreed?.value)}]}>{fearAndGreed?.value || "--"}</Text>
                  <Text style={styles.bentoSubTextCenter}>{fearAndGreed?.value_classification || "Loading"}</Text>
                </View>
                <FearAndGreedBar value={fearAndGreed?.value} t={t} />
              </View>
            </View>

            {/* Box 2B: Top Gainer */}
            <View style={[styles.bentoBox, styles.bentoHalf, { borderColor: C.primarySoft, borderWidth: 1.5, overflow: "hidden" }]}>
              <View style={styles.bentoHeader}>
                  <View style={styles.bentoIconWrap}><TrendingUp size={18} color={C.primary} /></View>
                  <Text style={[styles.bentoTitle, {color: C.primary}]}>{t("home.bento.topGainer")}</Text>
              </View>
              {topGainer ? (
                <View style={[styles.gainerCenter, {flex: 1, justifyContent: "center"}]}>
                  <View style={{flexDirection: "row", alignItems: "center", gap: 8, width: "100%"}}>
                    <Image source={{uri: topGainer.image}} style={{width: 38, height: 38, borderRadius: 19}}/>
                    <View style={{alignItems: "flex-start", flexShrink: 1}}>
                       <Text style={{color: C.textMain, fontSize: 14, fontWeight: "bold"}} numberOfLines={1}>{topGainer.symbol.toUpperCase()}</Text>
                       <Text style={{color: C.primary, fontSize: 18, fontWeight: "900"}} numberOfLines={1}>
                          +{topGainer.price_change_percentage_24h?.toFixed(2)}%
                       </Text>
                    </View>
                  </View>
                  <View style={{position: 'absolute', right: -25, bottom: -20, opacity: 0.1, zIndex: -1}}>
                     <TrendingUp size={90} color={C.primary} />
                  </View>
                </View>
              ) : <ActivityIndicator color={C.primary} style={{marginTop: 20}}/>}
            </View>
          </View>
        </View>

        {/* NEWS SLIDER */}
        {news.length > 0 && (
          <View style={styles.newsSection}>
            <View style={styles.sectionHeaderList}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Newspaper size={20} color={C.textMain} style={{marginRight: 8}}/>
                  <Text style={styles.sectionTitle}>{t("home.bento.flashNews")}</Text>
                </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsScroll}>
              {news.map(item => (
                  <TouchableOpacity key={item.id} style={styles.newsCard} onPress={() => Linking.openURL(item.url)}>
                    <Image source={{uri: item.imageurl}} style={styles.newsImage} />
                    <View style={styles.newsCardContent}>
                        <Text style={styles.newsSource}>{item.source_info?.name}</Text>
                        <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
                    </View>
                  </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* SEARCH & FILTERS FOR MARKET GRID */}
        <View style={styles.sectionHeaderList}>
            <Text style={styles.sectionTitle}>{t("home.sections.cryptos")}</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color={C.textMuted} style={styles.searchIcon} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t("home.searchPlaceholder")}
              placeholderTextColor={C.textMuted}
              style={styles.input}
            />
            {search !== "" && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <X size={18} color={C.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          {["all", "favorites", "gainers", "losers"].map((filterKey) => (
            <TouchableOpacity
              key={filterKey}
              onPress={() => setActiveFilter(filterKey)}
              style={[styles.chip, activeFilter === filterKey && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeFilter === filterKey && styles.chipTextActive]}>
                {t(`home.filters.${filterKey}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* MARKET GRID */}
        <View style={styles.marketSection}>
          <View style={styles.marketGrid}>
            {filteredCryptos.length > 0 ? (
              filteredCryptos.map((item) => (
                <AssetCard
                  key={item.id}
                  item={item}
                  isFav={favoritesIds.includes(item.id)}
                  onFavPress={() => toggleFavorite(item)}
                  C={C}
                  styles={styles}
                  currencySymbol={currencySymbol}
                />
              ))
            ) : (
              <View style={[styles.emptyContainer, {width: "100%"}]}>
                {loading ? <ActivityIndicator color={C.primary} /> : <Text style={styles.emptyText}>{t("home.empty.noData")}</Text>}
              </View>
            )}
          </View>

          {activeFilter === "all" && filteredCryptos.length > 0 && (
            <TouchableOpacity
              style={[styles.seeMoreBottom, loading && styles.opacity05]}
              onPress={handleLoadMore}
              disabled={loading}
            >
              {loading ? <ActivityIndicator size="small" color={C.primary} /> : (
                <>
                  <Text style={styles.seeMoreText}>{t("home.actions.loadMore")}</Text>
                  <ArrowRight size={16} color={C.primary} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.flex1, { backgroundColor: C.bg }]}>
      {isWeb ? (
        <SafeAreaView style={[common.safe, styles.safeWeb]}>
          <View style={styles.page}>
            <View style={[styles.webScroll, { height: "100vh", overflow: "auto" }]}>
              {MainContent()}
            </View>
            <View style={[styles.navWrap, styles.navWrapWeb]}>
              <Nav />
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <>
          <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <View style={styles.flex1}>
              {MainContent()}
            </View>
          </SafeAreaView>
          <View style={styles.mobileNavFixed}>
            <Nav />
          </View>
        </>
      )}
    </View>
  );
}

const FearAndGreedBar = ({ value, width = "100%", t }) => {
  const v = parseInt(value || "0");
  return (
    <View style={{ width, alignItems: "center", marginTop: 10 }}>
       <View style={{ 
          width: "100%", height: 6, borderRadius: 3, flexDirection: "row", overflow: "hidden", 
          backgroundColor: "#333", position: "relative" 
       }}>
          <View style={{flex: 1, backgroundColor: "#EF4444"}} />
          <View style={{flex: 1, backgroundColor: "#F97316"}} />
          <View style={{flex: 1, backgroundColor: "#EAB308"}} />
          <View style={{flex: 1, backgroundColor: "#84CC16"}} />
          <View style={{flex: 1, backgroundColor: "#22C55E"}} />
          <View style={{
            position: "absolute", left: `${v}%`, top: -2, bottom: -2, width: 4,
            backgroundColor: "#FFF", borderRadius: 2, transform: [{translateX: -2}],
            shadowColor: "#FFF", shadowOpacity: 0.8, shadowRadius: 4, elevation: 5
          }} />
       </View>
    </View>
  );
};

const Sparkline = ({ data, color, width = 120, height = 45 }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  
  const pointsData = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d - min) / range) * height;
    return {x, y};
  });

  const linePoints = pointsData.map(p => `${p.x},${p.y}`).join(' ');
  const polygonPoints = `${pointsData[0].x},${height} ${linePoints} ${pointsData[pointsData.length-1].x},${height}`;

  return (
    <View style={{ alignItems: 'center', marginVertical: 8, overflow: 'hidden' }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.4" />
            <Stop offset="1" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        <Polygon points={polygonPoints} fill={`url(#grad-${color.replace('#','')})`} />
        <Polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
};

const AssetCard = ({ item, isFav, onFavPress, C, styles, currencySymbol }) => {
  const isPositive = (item.price_change_percentage_24h || 0) >= 0;
  const color = isPositive ? C.primary : C.danger;
  
  return (
    <View style={styles.assetCard}>
      <View style={styles.assetHeader}>
         <Image source={{ uri: item.image }} style={styles.assetIcon} />
         <TouchableOpacity onPress={onFavPress} style={styles.starBtnGrid}>
          <Star size={18} color={isFav ? "#FFD700" : C.textMuted} fill={isFav ? "#FFD700" : "transparent"} />
        </TouchableOpacity>
      </View>
      <Text style={styles.assetSymbol}>{String(item.symbol || "").toUpperCase()}</Text>
      <Text style={styles.assetName} numberOfLines={1}>{item.name}</Text>
      
      <Sparkline data={item.sparkline} color={color} width={130} height={45} />

      <View style={styles.assetFooter}>
         <Text style={styles.assetPrice} numberOfLines={1} adjustsFontSizeToFit>
            {currencySymbol}{item.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
         </Text>
         <Text style={[styles.assetChange, { color }]}>
            {isPositive ? "+" : ""}{Number(item.price_change_percentage_24h || 0).toFixed(2)}%
         </Text>
      </View>
    </View>
  );
};

const makeStyles = (C) => StyleSheet.create({
  flex1: { flex: 1 },
  page: { flex: 1, position: "relative", backgroundColor: C.bg },
  safeWeb: { height: "100vh", overflow: "hidden" },
  webScroll: { position: "absolute", top: 0, left: 0, right: 0, bottom: NAV_HEIGHT },
  navWrap: { left: 0, right: 0, bottom: 0, height: NAV_HEIGHT, zIndex: 9999 },
  navWrapWeb: { position: "fixed" },
  mobileNavFixed: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: C.cardBg, zIndex: 10 },

  headerTitleContainer: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 10,
  },
  headerGreeting: {
    fontSize: 28,
    fontWeight: "800",
    color: C.textMain,
  },
  headerSubtitle: {
    fontSize: 15,
    color: C.textMuted,
    marginTop: 4,
  },

  bentoContainer: {
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 15,
  },
  bentoBox: {
    backgroundColor: C.cardBg || "rgba(255,255,255,0.05)",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border || "rgba(255,255,255,0.1)",
  },
  bentoFull: {
    width: "100%",
    marginBottom: 15,
  },
  bentoRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bentoHalf: {
    width: "48%",
    minHeight: 145,
    justifyContent: "space-between",
  },
  bentoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bentoIconWrap: {
    backgroundColor: C.primarySoft || "rgba(168, 85, 247, 0.15)",
    padding: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  bentoTitle: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bentoValueBig: {
    fontSize: 34,
    fontWeight: "800",
    color: C.textMain,
    marginBottom: 6,
  },
  bentoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  bentoSub: {
    fontSize: 15,
    fontWeight: "bold",
  },
  bentoSubText: {
    fontSize: 13,
    color: C.textMuted,
  },
  fngCenter: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  bentoValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  bentoSubTextCenter: {
    fontSize: 12,
    color: C.textMuted,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  gainerCenter: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  gainerImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
  },
  bentoSymbol: {
    color: C.textMain,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },

  newsSection: {
    marginBottom: 20,
  },
  newsScroll: {
    paddingLeft: 24,
    paddingRight: 8,
    paddingBottom: 10,
  },
  newsCard: {
    width: 260,
    backgroundColor: C.cardBg || "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border || "rgba(255,255,255,0.1)",
    marginRight: 16,
    overflow: "hidden",
  },
  newsImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  newsCardContent: {
    padding: 14,
  },
  newsSource: {
    color: C.primary,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  newsTitle: {
    color: C.textMain,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  /* MARKET GRID STYLES */
  searchContainer: { paddingHorizontal: 24, paddingTop: 5, paddingBottom: 10 },
  searchBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.cardBg,
    borderRadius: 16, paddingHorizontal: 16, height: 54, borderWidth: 1, borderColor: C.border,
  },
  searchIcon: { marginRight: 10 },
  input: { flex: 1, color: C.textMain, fontSize: 15, fontWeight: "500" },

  chipsScroll: { paddingHorizontal: 24, paddingVertical: 10 },
  chip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999,
    backgroundColor: C.cardBg, borderWidth: 1, borderColor: C.border, marginRight: 12,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primarySoft || C.primary },
  chipText: { color: C.textMuted, fontSize: 14, fontWeight: "600" },
  chipTextActive: { color: "#000000" },

  sectionHeaderList: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 24, marginTop: 15, marginBottom: 10,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: C.textMain },

  marketSection: { marginTop: 10 },
  
  marketGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  assetCard: {
    width: "48%",
    backgroundColor: C.cardBg || "rgba(255,255,255,0.05)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border || "rgba(255,255,255,0.1)",
    padding: 14,
    marginBottom: 15,
    justifyContent: "space-between",
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  assetIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  starBtnGrid: {
    padding: 2,
  },
  assetSymbol: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  assetName: {
    color: C.textMain,
    fontSize: 15,
    fontWeight: "700",
  },
  assetFooter: {
    marginTop: 0,
  },
  assetPrice: {
    color: C.textMain,
    fontSize: 16,
    fontWeight: "800",
  },
  assetChange: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },

  seeMoreBottom: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 10, paddingVertical: 15, backgroundColor: C.isDark ? "rgba(168, 85, 247, 0.05)" : "rgba(168, 85, 247, 0.1)",
    borderRadius: 16, marginHorizontal: 24, borderWidth: 1, borderColor: C.border,
  },
  seeMoreText: { color: C.primary, fontSize: 15, fontWeight: "700" },

  emptyContainer: { paddingVertical: 40 },
  emptyText: { color: C.textMuted, textAlign: "center", marginTop: 30, fontSize: 14 },
  loadingMargin: { marginTop: 30 },
  opacity05: { opacity: 0.5 },
  bottomSpacer: { height: 110 },
});