import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

const MenuPrincipal = ({ navigation }) => {
  const saldoTotal = 4906.0;
  const variacion24h = 2.84;

  const mercado = [
    { symbol: "BTC", name: "Bitcoin", price: 41250, change: 2.15 },
    { symbol: "ETH", name: "Ethereum", price: 2210, change: -1.02 },
    { symbol: "SOL", name: "Solana", price: 98.4, change: 4.72 },
    { symbol: "BNB", name: "BNB", price: 312.5, change: 0.85 },
  ];

  const [favoritas, setFavoritas] = useState(["BTC"]);

  const toggleFavorita = (symbol) => {
    setFavoritas((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const formatEUR = (n) => n.toFixed(2).replace(".", ",") + " €";
  const sube = variacion24h >= 0;

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
          <Text style={styles.balanceValue}>{formatEUR(saldoTotal)}</Text>
          <View style={styles.balanceRow}>
            <MaterialIcons name={sube ? "trending-up" : "trending-down"} size={18} color={sube ? COLORS.primary : COLORS.danger} />
            <Text style={[styles.balanceChange, { color: sube ? COLORS.primary : COLORS.danger }]}>
              {sube ? "+" : ""}{variacion24h}%
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

        {/* MERCADO */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Mercado</Text>
          {mercado.map((coin) => (
            <CoinRow
              key={coin.symbol}
              coin={coin}
              isFav={favoritas.includes(coin.symbol)}
              onToggle={toggleFavorita}
            />
          ))}
        </View>
        
        {/* Espacio para que el Nav no tape nada */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Nav />
    </SafeAreaView>
  );
};

/* COMPONENTES INTERNOS */
const CoinRow = ({ coin, isFav, onToggle }) => {
  const up = coin.change >= 0;
  return (
    <View style={styles.marketRow}>
      <View style={styles.marketLeft}>
        <View style={styles.coinBadge}><Text style={styles.coinBadgeText}>{coin.symbol}</Text></View>
        <View>
          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinPrice}>{coin.price.toFixed(2)} €</Text>
        </View>
      </View>
      <View style={styles.marketRight}>
        <Text style={[styles.coinChange, { color: up ? COLORS.primary : COLORS.danger }]}>
          {up ? "+" : ""}{coin.change.toFixed(2)}%
        </Text>
        <TouchableOpacity onPress={() => onToggle(coin.symbol)}>
          <MaterialIcons name={isFav ? "star" : "star-border"} size={20} color={isFav ? COLORS.primary : COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Action = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBtn}>
    <View style={styles.actionIcon}>
      <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const COLORS = {
  backgroundDark: "#102217",
  cardBg: "#1f2e26",
  border: "#355b49",
  primary: "#2bee79",
  primarySoft: "rgba(43,238,121,0.18)",
  danger: "#ff5c5c",
  textMain: "#ffffff",
  textMuted: "#9db9a8",
  textSoft: "rgba(255,255,255,0.65)",
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark
  },
  headerFixed: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10
  },
  kicker: {
    color: COLORS.textMuted,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800"
  },
  blob: {
    position: "absolute",
    width: 400,
    height: 400,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 200,
    top: -150,
    right: -150
  },
  container: {
    paddingHorizontal: 20
  },
  balanceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20
  },
  balanceGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100
  },
  balanceLabel: {
    color: COLORS.textMuted,
    fontSize: 14
  },
  balanceValue: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    marginVertical: 5
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  balanceChange: {
    marginLeft: 5,
    fontWeight: "700"
  },
  balanceSub: {
    marginLeft: 10,
    color: COLORS.textMuted,
    fontSize: 12
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25
  },
  actionBtn: {
    alignItems: "center",
    flex: 1
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600"
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)"
  },
  marketLeft: {
    flexDirection: "row",
    alignItems: "center"
  },
  marketRight: {
    alignItems: "flex-end"
  },
  coinBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(43,238,121,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  coinBadgeText: {
    color: "#fff",
    fontWeight: "bold"
  },
  coinName: {
    color: "#fff",
    fontWeight: "700"
  },
  coinPrice: {
    color: COLORS.textSoft,
    fontSize: 12
  },
  coinChange: {
    fontWeight: "700",
    marginBottom: 2
  }
});

export default MenuPrincipal;