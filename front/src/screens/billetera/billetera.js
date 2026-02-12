import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import theme from "../../styles/theme";

const COLORS = theme?.colors || theme?.COLORS || theme;

const Billetera = (props) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setLastUpdate(hh + ":" + mm);
  }, []);

  const totalBalance = 2450.35;
  const variation24h = 3.42;

  const availableBalance = 2310.2;
  const retainedEarnings = 140.15;

  const assets = [
    { symbol: "BTC", name: "Bitcoin", amount: 0.0324, valueEUR: 1336.5, change24h: 2.1 },
    { symbol: "ETH", name: "Ethereum", amount: 0.54, valueEUR: 1209.8, change24h: -1.3 },
    { symbol: "SOL", name: "Solana", amount: 18.2, valueEUR: 178.9, change24h: 5.7 },
    { symbol: "USDT", name: "Tether", amount: 420.0, valueEUR: 420.0, change24h: 0.0 },
  ];

  const movements = [
    { type: "receive", title: "Recibido", subtitle: "0.0100 BTC", date: "Hoy", value: "+412.50 €", status: "Confirmado" },
    { type: "send", title: "Enviado", subtitle: "0.20 ETH", date: "Ayer", value: "-448.00 €", status: "Confirmado" },
    { type: "swap", title: "Swap", subtitle: "SOL → USDT", date: "Hace 3 días", value: "+120.00 €", status: "Procesando" },
  ];

  const formatEUR = (num) => {
    let s = Number(num).toFixed(2);
    s = s.replace(".", ",");
    return s + " €";
  };

  const hiddenTime = () => {
    if (hideBalance) return "••:••";
    return lastUpdate;
  };

  const getBalanceText = () => {
    if (hideBalance) return "•••••";
    return formatEUR(totalBalance);
  };

  const getAvailableText = () => {
    if (hideBalance) return "••••";
    return formatEUR(availableBalance);
  };

  const getRetainedText = () => {
    if (hideBalance) return "••••";
    return formatEUR(retainedEarnings);
  };

  const getTrendConfig = () => {
    if (variation24h >= 0) {
      return {
        colourTrend: COLORS.primaryDark,
        edgeTrend: COLORS.primarySoft,
        backgroundTrend: "rgba(43,238,121,0.10)",
        iconTrend: "trending-up",
      };
    }

    return {
      colourTrend: COLORS.danger,
      edgeTrend: COLORS.dangerSoft,
      backgroundTrend: "rgba(255,92,92,0.10)",
      iconTrend: "trending-down",
    };
  };

  const getVariationText = () => {
    if (hideBalance) return "•••";

    if (variation24h >= 0) return "+" + variation24h.toFixed(2) + "%";
    return variation24h.toFixed(2) + "%";
  };

  const iconMovement = (type) => {
    let icon = "swap-horiz";
    if (type === "receive") icon = "south-west";
    else if (type === "send") icon = "north-east";
    return icon;
  };

  const getAssetRowData = (a) => {
    let colourChange = COLORS.danger;
    if (a.change24h >= 0) colourChange = COLORS.primaryDark;

    let amountText = "•••";
    if (!hideBalance) amountText = String(a.amount) + " " + a.symbol;

    let valText = "••••";
    if (!hideBalance) valText = formatEUR(a.valueEUR);

    let chText = "•••";
    if (!hideBalance) {
      if (a.change24h >= 0) chText = "+" + a.change24h + "%";
      else chText = a.change24h + "%";
    }

    return { colourChange, amountText, valText, chText };
  };

  const getMovementRowData = (m) => {
    let valMov = "••••";
    if (!hideBalance) valMov = m.value;

    let statusColour = "#ffd166";
    if (m.status === "Confirmado") statusColour = COLORS.textMuted;

    let statusText = "•••";
    if (!hideBalance) statusText = m.status;

    return { valMov, statusColour, statusText };
  };

  const renderDividerIfNotLast = (index, length) => {
    if (index !== length - 1) return <View style={common.divider || styles.divider} />;
    return null;
  };

  const getVisibilityIconName = () => {
    if (hideBalance) return "visibility-off";
    return "visibility";
  };

  const getBalanceSubText = () => {
    if (hideBalance) return "últimas 24h";
    return "últimas 24h · variación estimada";
  };

  const trend = getTrendConfig();
  const textBalance = getBalanceText();
  const textAvailable = getAvailableText();
  const retText = getRetainedText();
  const textVariation = getVariationText();

  return (
    <View style={common.safe}>
      <View style={[styles.blob, styles.blobTop]} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={common.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.kicker}>Billetera</Text>
            <Text style={styles.title}>Tu cartera segura</Text>
            <Text style={styles.miniInfo}>Última actualización: {hiddenTime()}</Text>
          </View>

          <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
            <MaterialIcons name={getVisibilityIconName()} size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <LinearGradient
            colors={[COLORS.primarySoft, "transparent"]}
            style={styles.balanceGlow}
          />

          <Text style={styles.balanceLabel}>Balance total</Text>

          <View style={styles.balanceRowTop}>
            <Text style={styles.balanceValue}>{textBalance}</Text>

            <View style={[styles.pill, { borderColor: trend.edgeTrend, backgroundColor: trend.backgroundTrend }]}>
              <MaterialIcons name={trend.iconTrend} size={16} color={trend.colourTrend} />
              <Text style={[styles.pillText, { color: trend.colourTrend }]}>{textVariation}</Text>
            </View>
          </View>

          <Text style={styles.balanceSub}>{getBalanceSubText()}</Text>

          <View style={styles.smallGrid}>
            <View style={styles.smallCard}>
              <Text style={styles.smallLabel}>Disponible</Text>
              <Text style={styles.smallValue}>{textAvailable}</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallLabel}>Retenido</Text>
              <Text style={styles.smallValue}>{retText}</Text>
            </View>
          </View>
        </View>

        <View style={common.card || styles.card}>
          <Text style={common.sectionTitle || styles.sectionTitle}>Activos</Text>

          {assets.map((a, index) => {
            const row = getAssetRowData(a);

            return (
              <View key={a.symbol} style={styles.assetRow}>
                <View style={styles.assetLeft}>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinBadgeText}>{a.symbol}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.assetName}>{a.name}</Text>
                    <Text style={styles.assetSub}>{row.amountText}</Text>
                  </View>
                </View>

                <View style={styles.assetRight}>
                  <Text style={styles.assetValue}>{row.valText}</Text>
                  <Text style={[styles.assetChange, { color: row.colourChange }]}>{row.chText}</Text>
                </View>

                {renderDividerIfNotLast(index, assets.length)}
              </View>
            );
          })}
        </View>

        <View style={common.card || styles.card}>
          <Text style={common.sectionTitle || styles.sectionTitle}>Movimientos</Text>

          {movements.map((m, index) => {
            const mov = getMovementRowData(m);

            return (
              <View key={m.type + "-" + index} style={styles.movRow}>
                <View style={styles.movLeft}>
                  <View style={styles.movIconWrap}>
                    <MaterialIcons name={iconMovement(m.type)} size={20} color={COLORS.primary} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.movHeaderRow}>
                      <Text style={styles.movTitle}>{m.title}</Text>
                      <Text style={styles.movValueInline}>{mov.valMov}</Text>
                    </View>

                    <View style={styles.movSubRow}>
                      <Text style={styles.movSub}>
                        {m.subtitle} · {m.date}
                      </Text>
                      <Text style={[styles.movStatus, { color: mov.statusColour }]}>
                        {mov.statusText}
                      </Text>
                    </View>
                  </View>
                </View>

                {renderDividerIfNotLast(index, movements.length)}
              </View>
            );
          })}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <Nav />
    </View>
  );
};

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    width: 520,
    height: 520,
    backgroundColor: COLORS.primarySoft,
    borderRadius: 999,
    top: -220,
    right: -220,
  },
  blobTop: {},

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kicker: { color: COLORS.textMuted, fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase" },
  title: { color: COLORS.textMain, fontWeight: "800", marginTop: 4, fontSize: 28 },
  miniInfo: { color: COLORS.textSoft, fontSize: 12, marginTop: 6 },

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    alignItems: "center",
    justifyContent: "center",
  },

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
  balanceGlow: { position: "absolute", top: 0, height: 160, left: 0, right: 0 },
  balanceLabel: { color: COLORS.textMuted, fontSize: 14 },

  balanceRowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  balanceValue: { color: COLORS.textMain, fontSize: 36, fontWeight: "900" },

  pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: "800", marginLeft: 6 },

  balanceSub: { marginTop: 8, color: COLORS.textMuted, fontSize: 13 },

  smallGrid: { flexDirection: "row", gap: 10, marginTop: 14 },

  smallCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    padding: 14,
  },
  smallLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  smallValue: { color: COLORS.textMain, fontSize: 14, fontWeight: "900", marginTop: 6 },

  divider: { height: 1, backgroundColor: COLORS.border, marginTop: 14 },

  assetRow: { paddingVertical: 14 },
  assetLeft: { flexDirection: "row", alignItems: "center" },
  assetRight: { position: "absolute", right: 0, top: 14, alignItems: "flex-end" },

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

  assetName: { color: COLORS.textMain, fontWeight: "800" },
  assetSub: { color: COLORS.textSoft, fontSize: 13, marginTop: 2 },

  assetValue: { color: COLORS.textMain, fontWeight: "900" },
  assetChange: { marginTop: 4, fontSize: 13, fontWeight: "800" },

  movRow: { paddingVertical: 14 },
  movLeft: { flexDirection: "row", alignItems: "center" },

  movIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(43,238,121,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  movHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  movSubRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, gap: 10 },

  movTitle: { color: COLORS.textMain, fontWeight: "900" },
  movValueInline: { color: COLORS.textMain, fontWeight: "900" },

  movSub: { color: COLORS.textSoft, fontSize: 13, flex: 1 },
  movStatus: { fontSize: 12, fontWeight: "900" },
});

export default Billetera;
