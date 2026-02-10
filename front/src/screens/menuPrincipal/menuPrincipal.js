import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const MenuPrincipal = ({ navigation }) => {
  const saldoTotal = 4906.0;
  const variacion24h = 2.84;

  const mercado = [
    { symbol: "BTC", name: "Bitcoin", price: 41250, change: 2.15 },
    { symbol: "ETH", name: "Ethereum", price: 2210, change: -1.02 },
    { symbol: "SOL", name: "Solana", price: 98.4, change: 4.72 },
    { symbol: "BNB", name: "BNB", price: 312.5, change: 0.85 },
    { symbol: "XRP", name: "XRP", price: 0.54, change: -0.42 },
    { symbol: "ADA", name: "Cardano", price: 0.48, change: 1.22 },
  ];

  const [favoritas, setFavoritas] = useState(["BTC"]);

  const toggleFavorita = (symbol) => {
    setFavoritas((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const formatEUR = (n) => n.toFixed(2).replace(".", ",") + " €";

  const sube = variacion24h >= 0;
  const colorTrend = sube ? COLORS.primaryDark : COLORS.danger;

  const favoritasList = mercado.filter((c) =>
    favoritas.includes(c.symbol)
  );

  return (
    <View style={styles.safe}>
      {/* Blob decorativo */}
      <View style={[styles.blob, styles.blobTop]} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* BALANCE */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[COLORS.primarySoft, "transparent"]}
            style={styles.balanceGlow}
          />

          <Text style={styles.balanceLabel}>Balance total</Text>
          <Text style={styles.balanceValue}>{formatEUR(saldoTotal)}</Text>

          <View style={styles.balanceRow}>
            <MaterialIcons
              name={sube ? "trending-up" : "trending-down"}
              size={18}
              color={colorTrend}
            />
            <Text style={[styles.balanceChange, { color: colorTrend }]}>
              {sube ? "+" : ""}
              {variacion24h}%
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
        {favoritasList.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Favoritas</Text>

            {favoritasList.map((coin) => (
              <CoinRow
                key={coin.symbol}
                coin={coin}
                isFav
                onToggle={toggleFavorita}
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
            {mercado.map((coin) => (
              <CoinRow
                key={coin.symbol}
                coin={coin}
                isFav={favoritas.includes(coin.symbol)}
                onToggle={toggleFavorita}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

/* ========= COMPONENTES ========= */

const CoinRow = ({ coin, isFav, onToggle }) => {
  const up = coin.change >= 0;
  const color = up ? COLORS.primaryDark : COLORS.danger;

  return (
    <View style={styles.marketRow}>
      <View style={styles.marketLeft}>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>{coin.symbol}</Text>
        </View>

        <View>
          <Text style={styles.coinName}>{coin.name}</Text>
          <Text style={styles.coinPrice}>
            {coin.price.toFixed(2)} €
          </Text>
        </View>
      </View>

      <View style={styles.marketRight}>
        <Text style={[styles.coinChange, { color }]}>
          {up ? "+" : ""}
          {coin.change.toFixed(2)}%
        </Text>

        <TouchableOpacity
          style={[
            styles.starBtn,
            isFav && { backgroundColor: COLORS.primarySoft },
          ]}
          onPress={() => onToggle(coin.symbol)}
          activeOpacity={0.8}
        >
          <MaterialIcons
            name={isFav ? "star" : "star-border"}
            size={20}
            color={isFav ? COLORS.primary : COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Action = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBtn} activeOpacity={0.85}>
    <View style={styles.actionIcon}>
      <MaterialIcons name={icon} size={20} color={COLORS.primary} />
    </View>
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

/* ========= COLORES ========= */

const COLORS = {
  backgroundDark: "#102217",

  cardBg: "#1f2e26",
  border: "#355b49",

  primary: "#2bee79",
  primarySoft: "rgba(43,238,121,0.18)",
  primaryDark: "#1bbf63",

  danger: "#ff5c5c",
  dangerSoft: "rgba(255,92,92,0.15)",

  textMain: "#ffffff",
  textMuted: "#9db9a8",
  textSoft: "rgba(255,255,255,0.65)",
};

/* ========= ESTILOS ========= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundDark },

  blob: {
    position: "absolute",
    width: 520,
    height: 520,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    top: -220,
    right: -220,
  },

  container: { padding: 20, paddingBottom: 40 },

  balanceCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 26,
    overflow: "hidden",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 6,
  },
  balanceGlow: {
    position: "absolute",
    top: 0,
    height: 160,
    left: 0,
    right: 0,
  },
  balanceLabel: { color: COLORS.textMuted, fontSize: 14 },
  balanceValue: {
    color: COLORS.textMain,
    fontSize: 36,
    fontWeight: "900",
    marginTop: 6,
  },

  balanceRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  balanceChange: { marginLeft: 6, fontWeight: "800" },
  balanceSub: { marginLeft: 8, color: COLORS.textMuted, fontSize: 13 },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  actionBtn: { alignItems: "center", flex: 1 },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionText: {
    color: COLORS.textMain,
    fontWeight: "700",
    fontSize: 13,
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
  },

  sectionTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  marketLeft: { flexDirection: "row", alignItems: "center" },
  marketRight: { alignItems: "flex-end", gap: 6 },

  coinBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primarySoft,
    backgroundColor: "rgba(43,238,121,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  coinBadgeText: { color: COLORS.textMain, fontWeight: "900" },
  coinName: { color: COLORS.textMain, fontWeight: "800" },
  coinPrice: { color: COLORS.textSoft, fontSize: 13 },

  coinChange: { fontWeight: "800" },

  starBtn: {
    padding: 6,
    borderRadius: 10,
  },
});

export default MenuPrincipal;
