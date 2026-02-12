import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { 
  Search, TrendingUp, TrendingDown, 
  ArrowRight, Bitcoin, Coins, Infinity, 
  Repeat, X 
} from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';

const MenuPrincipal = ({ navigation }) => {
  const totalBalance = 4906.0;
  const variation24h = 2.84;

  const market = [
    { symbol: "BTC", name: "Bitcoin", price: 41250, change: 2.15 },
    { symbol: "ETH", name: "Ethereum", price: 2210, change: -1.02 },
    { symbol: "SOL", name: "Solana", price: 98.4, change: 4.72 },
    { symbol: "BNB", name: "BNB", price: 312.5, change: 0.85 },
  ];

  const [favourites, setFavourites] = useState(["BTC"]);

  const toggleFavourite = (symbol) => {
    setFavourites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatEUR = (n) => n.toFixed(2).replace(".", ",") + " €";

  const goUp = variation24h >= 0;
  const colourTrend = goUp ? COLORS.primaryDark : COLORS.danger;

  const favouritesList = market.filter((c) =>
    favourites.includes(c.symbol)
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Blobs de fondo */}
      <View style={styles.blob} />

      {/* CABECERA FIJA */}
      <View style={styles.headerFixed}>
        <Text style={styles.kicker}>Mercado</Text>
        <Text style={styles.title}>Mercado en tiempo real</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BALANCE */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={[COLORS.primarySoft, "transparent"]} style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Balance total</Text>
          <Text style={styles.balanceValue}>{formatEUR(totalBalance)}</Text>

          <View style={styles.balanceRow}>
            <MaterialIcons
              name={goUp ? "trending-up" : "trending-down"}
              size={18}
              color={colourTrend}
            />
            <Text style={[styles.balanceChange, { color: colourTrend }]}>
              {goUp ? "+" : ""}
              {variation24h}%
            </Text>
            <Text style={styles.balanceSub}>últimas 24h</Text>
          </View>
        </View>

        {/* ACCIONES */}
        <View style={styles.actionsRow}>
          <Action icon="add" label="Buy" />
          <Action icon="south-west" label="Sell" />
          <Action icon="swap-horiz" label="Swap" />
          <Action icon="north-east" label="Send" />
        </View>

        {/* ⭐ FAVORITAS */}
        {favouritesList.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favoritas</Text>

            {favouritesList.map((coin) => (
              <CoinRow
                key={coin.symbol}
                coin={coin}
                isFav
                onToggle={toggleFavourite}
              />
            ))}
          </View>
        )}

        {/* 📈 MERCADO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mercado</Text>

          <ScrollView
            style={{ maxHeight: 280 }}
            showsVerticalScrollIndicator={false}
          >
            {market.map((coin) => (
              <CoinRow
                key={coin.symbol}
                coin={coin}
                isFav={favourites.includes(coin.symbol)}
                onToggle={toggleFavourite}
              />
            ))}
          </ScrollView>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={styles.mainTitleContainer}>
            <Text style={styles.mainTitle}>Mercados</Text>
          </View>

          {/* Barra de Búsqueda */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color={COLORS.textMuted} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar moneda (ej. Bitcoin)"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
              />
              {search !== "" && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <X size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/*Todos", "Favoritos", "Ganadores", "Perdedores => De momento no esta implementado, si da tiempo se mete*/}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {["Todos", "Favoritos", "Ganadores", "Perdedores"].map((label, i) => (
              <TouchableOpacity key={label} style={[styles.chip, i === 0 && styles.chipActive]}>
                <Text style={[styles.chipText, i === 0 && styles.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tendencias</Text>
            <TouchableOpacity style={styles.seeMore}>
              <Text style={styles.seeMoreText}>Ver más</Text>
              <ArrowRight size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            snapToInterval={296} 
            decelerationRate="fast" 
            contentContainerStyle={styles.trendingScroll}
          >
            <TrendingCard 
              name="Bitcoin" symbol="BTC" price="43,205.12" change="2.4" isPositive icon={Bitcoin} color="#f59e0b"
              path="M0 30 Q 20 35, 40 20 T 80 15 T 150 5"
            />
            <TrendingCard 
              name="Ethereum" symbol="ETH" price="2,240.55" change="0.5" isPositive={false} icon={Coins} color="#627EEA"
              path="M0 10 Q 20 5, 40 15 T 80 20 T 150 35"
            />
          </ScrollView>

          <View style={styles.marketSection}>
            <Text style={styles.sectionTitle}>Criptomonedas</Text>
            <View style={styles.marketList}>
              <MarketItem name="Bitcoin" symbol="BTC" price="43,205.12" change="2.45" isPositive icon={Bitcoin} color="#f59e0b" />
              <MarketItem name="Ethereum" symbol="ETH" price="2,240.55" change="0.51" isPositive={false} icon={Coins} color="#627EEA" />
              <MarketItem name="Solana" symbol="SOL" price="95.42" change="12.1" isPositive icon={Infinity} color="#a855f7" />
            </View>
          </View>
          
          <View style={{ height: 120 }} />
        </ScrollView>

        <Nav />

      </View>
    </SafeAreaView>
  );
}

/* COMPONENTES INTERNOS */
const CoinRow = ({ coin, isFav, onToggle }) => {
  const up = coin.change >= 0;
  const colour = up ? COLORS.primaryDark : COLORS.danger;

  return (
    <View style={styles.marketRow}>
      <View style={styles.marketLeft}>
        <View style={styles.coinBadge}><Text style={styles.coinBadgeText}>{coin.symbol}</Text></View>
        <View>
          <Text style={styles.coinName}>{name}</Text>
          <Text style={styles.coinSymbol}>{symbol}</Text>
        </View>
      </View>
      <View style={styles.marketRight}>
        <Text style={[styles.coinChange, { color: colour }]}>
          {up ? "+" : ""}
          {coin.change.toFixed(2)}%
        </Text>
      </View>
    </View>
    <Text style={styles.cardPrice}>${price}</Text>
    <View style={styles.chartMini}>
      <Svg height="40" width="100%">
        <Path d={path} fill="none" stroke={isPositive ? COLORS.primary : "#ef4444"} strokeWidth="2" />
      </Svg>
    </View>
  </View>
);

//Criptomonedas
const MarketItem = ({ name, symbol, price, change, isPositive, icon: Icon, color }) => (
  <TouchableOpacity style={styles.marketItem}>
    <View style={styles.marketInfo}>
      <View style={[styles.marketIconWrap, { backgroundColor: color + '20' }]}>
        <Icon size={22} color={color} />
      </View>
      <View>
        <Text style={styles.marketName}>{name}</Text>
        <Text style={styles.marketSymbol}>{symbol}</Text>
      </View>
    </View>
    <View style={styles.marketValues}>
      <Text style={styles.marketPrice}>${price}</Text>
      <Text style={[styles.marketChange, { color: isPositive ? COLORS.primary : "#ef4444" }]}>
        {isPositive ? '+' : ''}{change}%
      </Text>
    </View>
  </TouchableOpacity>
);


const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.backgroundDark 
  },
  container: { 
    flex: 1 
  },
  mainTitleContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 5
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5
  },
  searchContainer: { 
    paddingHorizontal: 24, 
    paddingTop: 15, 
    paddingBottom: 10 
  },
  searchBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surfaceDark, 
    borderRadius: 16, 
    paddingHorizontal: 16, 
    height: 54 
  },
  searchIcon: { 
    marginRight: 10 
  },
  input: { 
    flex: 1, 
    color: 'white', 
    fontSize: 15, 
    fontWeight: '500' 
  },
  chipsScroll: { 
    paddingHorizontal: 24, 
    paddingVertical: 15, 
    gap: 12 
  },
  chip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 99, 
    backgroundColor: COLORS.surfaceDark, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  chipActive: { 
    backgroundColor: COLORS.primary 
  },
  chipText: { 
    color: COLORS.textMuted, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  chipTextActive: { 
    color: 'black' 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginTop: 10 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: 'white' 
  },
  seeMore: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  seeMoreText: { 
    color: COLORS.primary, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  trendingScroll: { 
    paddingLeft: 24, 
    paddingVertical: 15, 
    gap: 16 
  },
  trendingCard: { 
    width: 280, 
    backgroundColor: COLORS.surfaceDark, 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  coinInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  iconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  coinName: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
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
    fontWeight: 'bold' 
  },
  cardPrice: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: 'white', 
    marginTop: 15 
  },
  chartMini: { 
    marginTop: 10, 
    height: 40 
  },
  marketSection: { 
    marginTop: 20, 
    paddingHorizontal: 24 
  },
  marketList: { 
    marginTop: 15, 
    gap: 10 
  },
  marketItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.02)' 
  },
  marketInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  marketIconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  marketName: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  marketSymbol: { 
    color: COLORS.textMuted, 
    fontSize: 13 
  },
  marketValues: { 
    alignItems: 'flex-end' 
  },
  marketPrice: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  marketChange: { 
    fontSize: 14, 
    fontWeight: '600' 
  }
});