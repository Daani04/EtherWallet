import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Image,
  Alert,
  Platform
} from "react-native";
import { Search, ArrowRight, X, Star } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";

import Nav from "../../components/Nav";
import common from "../../styles/common";
import Context from '../../context/Context';
import { useSettings } from "../../context/SettingsContext"; 
import getData from "../../services/services";

const { width } = Dimensions.get("window");
const COLORS = theme?.colors || theme?.COLORS || theme;
const BASE_URL = "http://35.170.12.68:8080";

export default function MenuPrincipal({ navigation }) {
  const { user } = useContext(Context);
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [search, setSearch] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20); 
  const [activeFilter, setActiveFilter] = useState("Todos");

  const isFetching = useRef(false);

  const fetchFavorites = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${BASE_URL}/API/SeeFavorites/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setFavoritesIds(Array.isArray(data) ? data.map(f => f.crypto) : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMarketData = async (currentLimit) => {
      if (isFetching.current) return;
      isFetching.current = true;
      
      if (cryptos.length === 0) setLoading(true);

      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${currentLimit}&page=1&sparkline=true&price_change_percentage=24h`;
      
      try {
        const data = await getData(url, "");
        if (data && Array.isArray(data)) {
          setCryptos(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

  useEffect(() => { fetchFavorites(); }, [user]);
  useEffect(() => { fetchMarketData(limit); }, [limit]);

  const handleLoadMore = () => {
      if (!loading) {
        const nextLimit = limit + 10; 
        setLimit(nextLimit); 
        fetchMarketData(nextLimit); 
      }
  };

  const toggleFavorite = async (crypto) => {
    const isFav = favoritesIds.includes(crypto.id);
    if (!isFav) {
      try {
        const res = await fetch(`${BASE_URL}/API/NewFavorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: user.userId, crypto: crypto.id }),
        });
        if (res.ok) setFavoritesIds(prev => [...prev, crypto.id]);
      } catch (error) { Alert.alert("Error", "Error al guardar"); }
    } else {
      try {
        const res = await fetch(`${BASE_URL}/API/RemoveFavorite?clientId=${user.userId}&crypto=${crypto.id}`, { method: "DELETE" });
        if (res.ok) setFavoritesIds(prev => prev.filter(id => id !== crypto.id));
      } catch (error) { Alert.alert("Error", "Error al eliminar"); }
    }
  };

  const generateSVGPath = (prices) => {
    if (!prices || prices.length === 0) return "";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const widthSVG = 150;
    const heightSVG = 40;
    return prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * widthSVG;
      const y = heightSVG - ((price - min) / range) * heightSVG;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const filteredCryptos = useMemo(() => {
    let result = (Array.isArray(cryptos) ? [...cryptos] : []);
    if (search) {
      result = result.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) || 
        c.symbol?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (activeFilter === "Favoritos") result = result.filter(c => favoritesIds.includes(c.id));
    else if (activeFilter === "Ganadores") {
      result = result.filter(c => c.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    } 
    else if (activeFilter === "Perdedores") {
      result = result.filter(c => c.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    }
    return result;
  }, [cryptos, search, activeFilter, favoritesIds]);

  return (
    <SafeAreaView style={[common.safe, { backgroundColor: C.bg }]}>
      <View style={[common.container, { backgroundColor: C.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.mainTitleContainer}>
            <Text style={styles.mainTitle}>Mercados</Text>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color={C.textMuted} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar moneda..."
                placeholderTextColor={C.textMuted}
                style={styles.input}
              />
              {search !== "" && (
                <TouchableOpacity onPress={() => setSearch("")}><X size={18} color={C.textMuted} /></TouchableOpacity>
              )}
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {["Todos", "Favoritos", "Ganadores", "Perdedores"].map((label) => (
              <TouchableOpacity 
                key={label} 
                onPress={() => setActiveFilter(label)}
                style={[styles.chip, activeFilter === label && styles.chipActive]}
              >
                <Text style={[styles.chipText, activeFilter === label && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tendencias</Text>
          </View>
          {loading && cryptos.length === 0 ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 30 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.75} decelerationRate="fast" contentContainerStyle={styles.trendingScroll}>
              {cryptos.slice(0, 5).map((item) => (
                <TrendingCard 
                    key={item.id} 
                    item={item} 
                    path={generateSVGPath(item.sparkline_in_7d?.price)} 
                    C={C} 
                    styles={styles} 
                />
              ))}
            </ScrollView>
          )}
          <View style={styles.marketSection}>
            <View style={styles.sectionHeaderList}>
                <Text style={styles.sectionTitle}>
                    {activeFilter === "Todos" ? "Criptomonedas" : `Top ${activeFilter}`}
                </Text>
            </View>
            <View style={styles.marketList}>
              {filteredCryptos.length > 0 ? (
                filteredCryptos.map((item) => (
                  <MarketItem 
                    key={item.id} 
                    item={item} 
                    isFav={favoritesIds.includes(item.id)} 
                    onFavPress={() => toggleFavorite(item)} 
                    C={C} 
                    styles={styles} 
                  />
                ))
              ) : (
                <View style={{ paddingVertical: 40 }}>
                  {loading ? (
                    <ActivityIndicator color={C.primary} />
                  ) : (
                    <Text style={styles.emptyText}>No hay datos disponibles para este filtro</Text>
                  )}
                </View>
              )}
            </View>
            {activeFilter === "Todos" && filteredCryptos.length > 0 && (
                <TouchableOpacity 
                  style={[styles.seeMoreBottom, loading && { opacity: 0.5 }]} 
                  onPress={handleLoadMore}
                  disabled={loading}
                >
                    {loading ? (
                      <ActivityIndicator size="small" color={C.primary} />
                    ) : (
                      <>
                        <Text style={styles.seeMoreText}>Cargar más monedas</Text>
                        <ArrowRight size={16} color={C.primary} />
                      </>
                    )}
                </TouchableOpacity>
            )}
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </View>
      <Nav />
    </SafeAreaView>
  );
}

const TrendingCard = ({ item, path, C, styles }) => {
  const isPositive = item.price_change_percentage_24h >= 0;
  return (
    <View style={styles.trendingCard}>
      <View style={styles.cardHeader}>
        <View style={styles.coinInfo}>
          <Image source={{ uri: item.image }} style={styles.coinLogo} />
          <View>
            <Text style={styles.coinName}>{item.name}</Text>
            <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: isPositive ? "rgba(43,238,121,0.15)" : "rgba(255,92,92,0.15)" }]}>
          <Text style={[styles.badgeText, { color: isPositive ? C.primary : C.danger }]}>
            {isPositive ? "↑" : "↓"} {item.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
      </View>
      <Text style={styles.cardPrice}>{item.current_price?.toLocaleString()} €</Text>
      <View style={styles.chartMini}>
        <Svg height="40" width="100%">
          <Path d={path} fill="none" stroke={isPositive ? C.primary : C.danger} strokeWidth="2" />
        </Svg>
      </View>
    </View>
  );
};

const MarketItem = ({ item, isFav, onFavPress, C, styles }) => {
  const isPositive = item.price_change_percentage_24h >= 0;
  return (
    <View style={styles.marketItem}>
      <View style={styles.marketInfo}>
        <Image source={{ uri: item.image }} style={styles.marketIcon} />
        <View>
          <Text style={styles.marketName}>{item.name}</Text>
          <Text style={styles.marketSymbol}>{item.symbol.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.rightAction}>
        <View style={styles.marketValues}>
          <Text style={styles.marketPrice}>{item.current_price?.toLocaleString()} €</Text>
          <Text style={[styles.marketChange, { color: isPositive ? C.primary : C.danger }]}>
            {isPositive ? "+" : ""}{item.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
        <TouchableOpacity onPress={onFavPress} style={styles.starBtn}>
          <Star size={20} color={isFav ? "#FFD700" : C.textMuted} fill={isFav ? "#FFD700" : "transparent"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const makeStyles = (C) => StyleSheet.create({
  mainTitleContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 5 
  },
  mainTitle: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: C.textMain, 
    letterSpacing: -0.5 
  },
  searchContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 15, 
    paddingBottom: 10 
  },
  searchBox: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: C.cardBg, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 54, 
    borderWidth: 1, 
    borderColor: C.border 
  },
  searchIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: C.textMain, 
    fontSize: 15, 
    fontWeight: "500" 
  },
  chipsScroll: { 
    paddingHorizontal: 24, 
    paddingVertical: 15 
  },
  chip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 999, 
    backgroundColor: C.cardBg, 
    borderWidth: 1, 
    borderColor: C.border, 
    marginRight: 12 
  },
  chipActive: { 
    backgroundColor: C.primary, 
    borderColor: C.primarySoft || C.primary 
  },
  chipText: { 
    color: C.textMuted, 
    fontSize: 14, 
    fontWeight: "600" 
  },
  chipTextActive: { 
    color: "#000000" 
  },
  sectionHeader: { 
    paddingHorizontal: 24, 
    marginTop: 10 
  },
  sectionHeaderList: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 24, 
    marginTop: 20, 
    marginBottom: 10 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: C.textMain 
  },
  seeMoreBottom: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8, 
    marginTop: 20, 
    paddingVertical: 15, 
    backgroundColor: C.isDark ? "rgba(43,238,121,0.05)" : "rgba(43,238,121,0.1)", 
    borderRadius: 16, 
    marginHorizontal: 24, 
    borderWidth: 1, 
    borderColor: C.border 
  },
  seeMoreText: { 
    color: C.primary, 
    fontSize: 15, 
    fontWeight: "700" 
  },
  trendingScroll: { 
    paddingLeft: 24, 
    paddingVertical: 15 
  },
  trendingCard: { 
    width: 280, 
    backgroundColor: C.cardBg, 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: C.border, 
    marginRight: 16 
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start" 
  },
  coinInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  coinLogo: { 
    width: 32, 
    height: 32, 
    borderRadius: 16 
  },
  coinName: { 
    color: C.textMain, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  coinSymbol: { 
    color: C.textMuted, 
    fontSize: 12 
  },
  badge: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  badgeText: { 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  cardPrice: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: C.textMain, 
    marginTop: 15 
  },
  chartMini: { 
    marginTop: 10, 
    height: 40 
  },
  marketSection: { 
    marginTop: 10 
  },
  marketList: { 
    paddingHorizontal: 24 
  },
  marketItem: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: C.cardBg, 
    borderWidth: 1, 
    borderColor: C.border, 
    marginBottom: 10 
  },
  marketInfo: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  marketIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: 20 
  },
  marketName: { 
    color: C.textMain, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  marketSymbol: { 
    color: C.textMuted, 
    fontSize: 13 
  },
  rightAction: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 15 
  },
  marketValues: { 
    alignItems: "flex-end" 
  },
  marketPrice: { 
    color: C.textMain, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  marketChange: {
    fontSize: 14,
    fontWeight: "600"
  },
  starBtn: { 
    padding: 5 
  },
  emptyText: { 
    color: C.textMuted, 
    textAlign: "center", 
    marginTop: 30, 
    fontSize: 14 
  }
});