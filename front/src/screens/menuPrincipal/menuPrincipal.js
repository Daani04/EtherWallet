import React, { useState, useEffect, useContext, useMemo } from "react";
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
} from "react-native";
import { Search, ArrowRight, X, Star } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";

import Nav from "../../components/Nav";
import common from "../../styles/common";
import Context from "../../context/Context";
import getData from "../../services/services";
import { useSettings } from "../../context/SettingsContext";

const { width } = Dimensions.get("window");
const BASE_URL = "http://35.170.12.68:8080";

export default function MenuPrincipal({ navigation }) {
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { user } = useContext(Context);
  const [search, setSearch] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);
  const [activeFilter, setActiveFilter] = useState("Todos");

  const fetchFavorites = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${BASE_URL}/API/SeeFavorites/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setFavoritesIds(Array.isArray(data) ? data.map((f) => f.crypto) : []);
      }
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    }
  };

  const fetchMarketData = async () => {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h`;
    const apiKey = "";

    try {
      const data = await getData(url, apiKey);
      if (data && Array.isArray(data)) {
        setCryptos(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error en fetchMarketData:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, [limit]);

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (crypto) => {
    const isFav = favoritesIds.includes(crypto.id);
    if (!isFav) {
      try {
        const res = await fetch(`${BASE_URL}/API/NewFavorite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clientId: user.userId, crypto: crypto.id }),
        });
        if (res.ok) setFavoritesIds((prev) => [...prev, crypto.id]);
      } catch (error) {
        Alert.alert("Error", "Error al guardar");
      }
    } else {
      try {
        const res = await fetch(
          `${BASE_URL}/API/RemoveFavorite?clientId=${user.userId}&crypto=${crypto.id}`,
          { method: "DELETE" }
        );
        if (res.ok) setFavoritesIds((prev) => prev.filter((id) => id !== crypto.id));
      } catch (error) {
        Alert.alert("Error", "Error al eliminar");
      }
    }
  };

  const generateSVGPath = (prices) => {
    if (!prices || prices.length === 0) return "";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const widthSVG = 150;
    const heightSVG = 40;
    return prices
      .map((price, i) => {
        const x = (i / (prices.length - 1)) * widthSVG;
        const y = heightSVG - ((price - min) / range) * heightSVG;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const getFilteredAndSortedCryptos = () => {
    let result = Array.isArray(cryptos) ? [...cryptos] : [];

    if (search) {
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.symbol?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeFilter === "Favoritos") {
      result = result.filter((c) => favoritesIds.includes(c.id));
    } else if (activeFilter === "Ganadores") {
      result = result
        .filter((c) => c.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    } else if (activeFilter === "Perdedores") {
      result = result
        .filter((c) => c.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    }
    return result;
  };

  const filteredCryptos = getFilteredAndSortedCryptos();

  return (
    <SafeAreaView style={[common.safe, { backgroundColor: C.bg }]}>
      <View style={[common.container, { backgroundColor: C.bg }]}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: C.bg }}>
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
                <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.85}>
                  <X size={18} color={C.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {["Todos", "Favoritos", "Ganadores", "Perdedores"].map((label) => (
              <TouchableOpacity
                key={label}
                onPress={() => setActiveFilter(label)}
                style={[styles.chip, activeFilter === label && styles.chipActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.chipText, activeFilter === label && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tendencias</Text>
          </View>

          {loading && cryptos.length === 0 ? (
            <ActivityIndicator color={C.primary} style={{ marginTop: 30 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={width * 0.75}
              decelerationRate="fast"
              contentContainerStyle={styles.trendingScroll}
            >
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
                <Text style={styles.emptyText}>No hay datos disponibles para este filtro</Text>
              )}
            </View>

            {activeFilter === "Todos" && filteredCryptos.length > 0 && (
              <TouchableOpacity style={styles.seeMoreBottom} onPress={() => setLimit(limit + 10)} activeOpacity={0.85}>
                <Text style={styles.seeMoreText}>Cargar más monedas</Text>
                <ArrowRight size={16} color={C.primary} />
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
        <View
          style={[
            styles.badge,
            { backgroundColor: isPositive ? "rgba(43,238,121,0.15)" : "rgba(255,92,92,0.15)" },
          ]}
        >
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

      <View style={styles.marketRight}>
        <Text style={styles.marketPrice}>{item.current_price?.toLocaleString()} €</Text>
        <Text style={[styles.marketChange, { color: isPositive ? C.primary : C.danger }]}>
          {item.price_change_percentage_24h?.toFixed(2)}%
        </Text>
      </View>

      <TouchableOpacity onPress={onFavPress} style={styles.favBtn} activeOpacity={0.8}>
        <Star size={18} color={isFav ? C.primary : C.textMuted} fill={isFav ? C.primary : "transparent"} />
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (C) =>
  StyleSheet.create({
    mainTitleContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
    mainTitle: { fontSize: 28, fontWeight: "900", color: C.textMain },

    searchContainer: { paddingHorizontal: 20, marginBottom: 14 },
    searchBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.cardBg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 18,
      paddingHorizontal: 14,
      height: 54,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.05 : 0.10,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 2,
    },
    searchIcon: { marginRight: 10 },
    input: { flex: 1, color: C.textMain, fontSize: 16 },

    chipsScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.cardBg,
    },
    chipActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    chipText: { color: C.textMain, fontWeight: "800" },
    chipTextActive: { color: "#000" },

    sectionHeader: { paddingHorizontal: 20, marginTop: 14, marginBottom: 10 },
    sectionHeaderList: { marginBottom: 10 },
    sectionTitle: { color: C.textMain, fontSize: 18, fontWeight: "900" },

    trendingScroll: { paddingHorizontal: 20, gap: 14 },
    trendingCard: {
      width: width * 0.75,
      backgroundColor: C.cardBg,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: C.border,
      padding: 16,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.06 : 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 2,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    coinInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
    coinLogo: { width: 34, height: 34, borderRadius: 17 },
    coinName: { color: C.textMain, fontWeight: "900" },
    coinSymbol: { color: C.textMuted, fontWeight: "800", marginTop: 2, fontSize: 12 },
    badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
    badgeText: { fontWeight: "900", fontSize: 12 },
    cardPrice: { marginTop: 12, color: C.textMain, fontWeight: "900", fontSize: 20 },
    chartMini: { marginTop: 10 },

    marketSection: { paddingHorizontal: 20, marginTop: 18 },
    marketList: {
      backgroundColor: C.cardBg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 22,
      overflow: "hidden",
    },
    marketItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)",
    },
    marketInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
    marketIcon: { width: 34, height: 34, borderRadius: 17, marginRight: 10 },
    marketName: { color: C.textMain, fontWeight: "900" },
    marketSymbol: { color: C.textMuted, fontWeight: "800", fontSize: 12, marginTop: 2 },

    marketRight: { alignItems: "flex-end", marginRight: 12 },
    marketPrice: { color: C.textMain, fontWeight: "900" },
    marketChange: { fontWeight: "900", marginTop: 4, fontSize: 12 },

    favBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.03)",
    },

    emptyText: { color: C.textMuted, padding: 16, textAlign: "center", fontWeight: "700" },

    seeMoreBottom: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.cardBg,
    },
    seeMoreText: { color: C.textMain, fontWeight: "900" },
  });
