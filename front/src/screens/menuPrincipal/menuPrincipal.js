import React, { useState, useEffect, useContext } from "react";
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
import theme from "../../styles/theme";
import Context from '../../context/Context';

import getData from "../../services/services";

const { width } = Dimensions.get("window");
const COLORS = theme?.colors || theme?.COLORS || theme;
const BASE_URL = "http://10.10.6.84:8080";

export default function MenuPrincipal({ navigation }) {
  const { user } = useContext(Context);
  const [search, setSearch] = useState("");
  const [cryptos, setCryptos] = useState([]);
  const [favoritesIds, setFavoritesIds] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20); 
  const [activeFilter, setActiveFilter] = useState("Todos");

  //Obtiene el usuario para cargas sus favoritos
  const fetchFavorites = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${BASE_URL}/API/SeeFavorites/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        setFavoritesIds(Array.isArray(data) ? data.map(f => f.crypto) : []);
      }
    } catch (error) {
      console.error("Error cargando favoritos:", error);
    }
  };

  //API que carga los datos reales
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

  useEffect(() => { fetchMarketData(); }, [limit]);
  useEffect(() => { fetchFavorites(); }, [user]);

  //Guarda o elimina de favoritos la moneda
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

  //Dibuja los graficos con los datos 
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

  //Funcion de buscar, con filtros, solo mustra las cryptos que estan en la pestaña,
  //si estas en favoritos y buscas una crypto que no se encuentra en esa pestaña no aparecera 
  const getFilteredAndSortedCryptos = () => {
    let result = (Array.isArray(cryptos) ? [...cryptos] : []);

    if (search) {
      result = result.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) || 
        c.symbol?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (activeFilter === "Favoritos") {
      result = result.filter(c => favoritesIds.includes(c.id));
    } 
    else if (activeFilter === "Ganadores") {
      result = result
        .filter(c => c.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    } 
    else if (activeFilter === "Perdedores") {
      result = result
        .filter(c => c.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
    }
    return result;
  };

  const filteredCryptos = getFilteredAndSortedCryptos();

  return (
    <SafeAreaView style={common.safe}>
      <View style={common.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={styles.mainTitleContainer}>
            <Text style={styles.mainTitle}>Mercados</Text>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar moneda..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
              {search !== "" && (
                <TouchableOpacity onPress={() => setSearch("")}><X size={18} color={COLORS.textMuted} /></TouchableOpacity>
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
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: 30 }} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={width * 0.75} decelerationRate="fast" contentContainerStyle={styles.trendingScroll}>
              {cryptos.slice(0, 5).map((item) => (
                <TrendingCard key={item.id} item={item} path={generateSVGPath(item.sparkline_in_7d?.price)} />
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
                  <MarketItem key={item.id} item={item} isFav={favoritesIds.includes(item.id)} onFavPress={() => toggleFavorite(item)} />
                ))
              ) : (
                <Text style={styles.emptyText}>No hay datos disponibles para este filtro</Text>
              )}
            </View>

            {activeFilter === "Todos" && filteredCryptos.length > 0 && (
                <TouchableOpacity style={styles.seeMoreBottom} onPress={() => setLimit(limit + 10)}>
                    <Text style={styles.seeMoreText}>Cargar más monedas</Text>
                    <ArrowRight size={16} color={COLORS.primary} />
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

//Componente que define como se ve cada grafico
const TrendingCard = ({ item, path }) => {
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
          <Text style={[styles.badgeText, { color: isPositive ? COLORS.primary : COLORS.danger }]}>
            {isPositive ? "↑" : "↓"} {item.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
      </View>
      <Text style={styles.cardPrice}>{item.current_price?.toLocaleString()} €</Text>
      <View style={styles.chartMini}>
        <Svg height="40" width="100%">
          <Path d={path} fill="none" stroke={isPositive ? COLORS.primary : COLORS.danger} strokeWidth="2" />
        </Svg>
      </View>
    </View>
  );
};

//Componente que define como se ve cada plantilla de cryptos
const MarketItem = ({ item, isFav, onFavPress }) => {
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
          <Text style={[styles.marketChange, { color: isPositive ? COLORS.primary : COLORS.danger }]}>
            {isPositive ? "+" : ""}{item.price_change_percentage_24h?.toFixed(2)}%
          </Text>
        </View>
        <TouchableOpacity onPress={onFavPress} style={styles.starBtn}>
          <Star size={20} color={isFav ? "#FFD700" : COLORS.textMuted} fill={isFav ? "#FFD700" : "transparent"} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainTitleContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 20, 
    paddingBottom: 5 
  },
  mainTitle: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: COLORS.textMain, 
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
    backgroundColor: COLORS.cardBg, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 54, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  searchIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: COLORS.textMain, 
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
    backgroundColor: COLORS.cardBg, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    marginRight: 12 
  },
  chipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primarySoft 
  },
  chipText: { 
    color: COLORS.textMuted, 
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
    color: COLORS.textMain 
  },
  seeMoreBottom: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(43,238,121,0.05)",
    borderRadius: 16,
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: "rgba(43,238,121,0.2)"
  },
  seeMoreText: { 
    color: COLORS.primary, 
    fontSize: 15, 
    fontWeight: "700" 
  },
  trendingScroll: { 
    paddingLeft: 24, 
    paddingVertical: 15 
  },
  trendingCard: { 
    width: 280, 
    backgroundColor: COLORS.cardBg, 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
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
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  coinSymbol: { 
    color: COLORS.textMuted, 
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
    color: COLORS.textMain, 
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
    backgroundColor: COLORS.cardBg, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
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
    color: COLORS.textMain, 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  marketSymbol: { 
    color: COLORS.textMuted, 
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
    color: COLORS.textMain, 
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
    color: COLORS.textMuted, 
    textAlign: "center", 
    marginTop: 30, 
    fontSize: 14 
  }
});