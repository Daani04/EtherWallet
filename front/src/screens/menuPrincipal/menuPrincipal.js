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

import Nav from '../../components/Nav';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  surfaceDark: "#162b20",
  textMuted: "#94a3b8",
  danger: "#ef4444",
};

export default function MenuPrincipal({ navigation }) {
  const [search, setSearch] = useState("");

  const formatEUR = (n) => n.toFixed(2).replace(".", ",") + " €";
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
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

          {/*"Todos", "Favoritos", "Ganadores", "Perdedores" => De momento no se utiilza*/}
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
            snapToInterval={width * 0.75} 
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
              <MarketItem name="BNB" symbol="BNB" price="312.50" change="0.85" isPositive icon={Coins} color="#f3ba2f" />
            </View>
          </View>
          
          <View style={{ height: 120 }} />
        </ScrollView>


      </View>
          <Nav />
    </SafeAreaView>
  );
}

//Tendencias
const TrendingCard = ({ name, symbol, price, change, isPositive, icon: Icon, color, path }) => (
  <View style={styles.trendingCard}>
    <View style={styles.cardHeader}>
      <View style={styles.coinInfo}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Icon size={20} color="white" />
        </View>
        <View>
          <Text style={styles.coinName}>{name}</Text>
          <Text style={styles.coinSymbol}>{symbol}</Text>
        </View>
      </View>
      <View style={[styles.badge, { backgroundColor: isPositive ? 'rgba(43,238,121,0.2)' : 'rgba(239,68,68,0.1)' }]}>
        <Text style={[styles.badgeText, { color: isPositive ? COLORS.primary : COLORS.danger }]}>
          {isPositive ? '↑' : '↓'} {change}%
        </Text>
      </View>
    </View>
    <Text style={styles.cardPrice}>${price}</Text>
    <View style={styles.chartMini}>
      <Svg height="40" width="100%">
        <Path d={path} fill="none" stroke={isPositive ? COLORS.primary : COLORS.danger} strokeWidth="2" />
      </Svg>
    </View>
  </View>
);

//Criptomonedas
const MarketItem = ({ name, symbol, price, change, isPositive, icon: Icon, color }) => (
  <TouchableOpacity style={styles.marketItem} activeOpacity={0.7}>
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
      <Text style={[styles.marketChange, { color: isPositive ? COLORS.primary : COLORS.danger }]}>
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
    paddingVertical: 15 
  },
  chip: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 99, 
    backgroundColor: COLORS.surfaceDark, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 12
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
    paddingVertical: 15 
  },
  trendingCard: { 
    width: 280, 
    backgroundColor: COLORS.surfaceDark, 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.05)',
    marginRight: 16
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
    marginTop: 15 
  },
  marketItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 10
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
