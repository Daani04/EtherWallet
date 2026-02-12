import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

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
        colourTrend: COLORS.accent,
        edgeTrend: "rgba(115, 255, 200, 0.22)",
        backgroundTrend: "rgba(115, 255, 200, 0.08)",
        iconTrend: "trending-up",
      };
    }

    return {
      colourTrend: "#ff6b6b",
      edgeTrend: "rgba(255,107,107,0.28)",
      backgroundTrend: "rgba(255,107,107,0.08)",
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
    let colourChange = "#ff6b6b";
    if (a.change24h >= 0) colourChange = COLORS.accent;

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
    if (index !== length - 1) return <View style={styles.divider} />;
    return null;
  };

  const getVisibilityIconName = () => {
    if (hideBalance) return "visibility-off";
    return "visibility";
  };

  const getBalanceSubText = () => {
    if (hideBalance) return "Últimas 24h";
    return "Últimas 24h · variación estimada";
  };

  const trend = getTrendConfig();
  const textBalance = getBalanceText();
  const textAvailable = getAvailableText();
  const retText = getRetainedText();
  const textVariation = getVariationText();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
        bounces={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
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
              colors={["rgba(255,255,255,0.08)", "rgba(16,34,23,0.0)"]}
              locations={[0, 1]}
              style={styles.balanceGlow}
            />

            <Text style={styles.balanceLabel}>Balance total</Text>

            <View style={styles.balanceRow}>
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

          <View style={styles.twoColsWrap}>
            <View>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Activos</Text>
              </View>

              <View style={styles.card}>
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
            </View>

            <View>
              <View style={[styles.sectionRow, { marginTop: 18 }]}>
                <Text style={styles.sectionTitle}>Movimientos</Text>
              </View>

              <View style={styles.card}>
                {movements.map((m, index) => {
                  const mov = getMovementRowData(m);

                  return (
                    <View key={m.type + "-" + index} style={styles.movRow}>
                      <View style={styles.movLeft}>
                        <View style={styles.movIconWrap}>
                          <MaterialIcons name={iconMovement(m.type)} size={20} color={COLORS.accent} />
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
            </View>
          </View>

          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.navWrap}>
        <Nav />
      </View>
    </SafeAreaView>
  );
};

const COLORS = {
  accent: "#73FFC8",
  backgroundDark: "#102217",
  inputBg: "#1c2720",
  border: "#3b5445",
  textMuted: "#9db9a8",
  textMutedSoft: "rgba(255,255,255,0.6)",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundDark },

  blob: { position: "absolute", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 999 },
  blobTopRight: { width: 420, height: 420, top: -120, right: -140 },
  blobBottomLeft: { width: 320, height: 320, bottom: -70, left: -140 },

  scroll: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 140,
  },

  container: { width: "100%", maxWidth: 980, alignSelf: "center", paddingHorizontal: 24 },

  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  kicker: { color: COLORS.textMuted, fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase" },
  title: { color: "#fff", fontWeight: "800", marginTop: 4, fontSize: 28 },
  miniInfo: { color: COLORS.textMutedSoft, fontSize: 12, marginTop: 6 },

  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
  },

  balanceCard: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 22,
    overflow: "hidden",
    elevation: 8,
    padding: 18,
  },
  balanceGlow: { position: "absolute", left: 0, right: 0, top: 0, height: 120 },
  balanceLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  balanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  balanceValue: { color: "#fff", fontWeight: "900", fontSize: 32 },

  pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: "800", marginLeft: 6 },
  balanceSub: { marginTop: 6, color: COLORS.textMutedSoft, fontSize: 13 },

  smallGrid: { flexDirection: "row", gap: 10, marginTop: 14 },
  smallCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 12,
  },
  smallLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "700" },
  smallValue: { color: "#fff", fontSize: 14, fontWeight: "900", marginTop: 6 },

  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },

  twoColsWrap: { marginTop: 10 },

  card: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden" },
  divider: { height: 1, backgroundColor: "rgba(59,84,69,0.7)", marginLeft: 16 },

  assetRow: { paddingHorizontal: 16, paddingVertical: 14 },
  assetLeft: { flexDirection: "row", alignItems: "center" },
  coinBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  coinBadgeText: { color: "#fff", fontWeight: "900", letterSpacing: 0.6 },
  assetName: { color: "#fff", fontSize: 15, fontWeight: "800" },
  assetSub: { color: COLORS.textMutedSoft, fontSize: 13, marginTop: 2 },
  assetRight: { position: "absolute", right: 16, top: 14, alignItems: "flex-end" },
  assetValue: { color: "#fff", fontSize: 15, fontWeight: "900" },
  assetChange: { marginTop: 4, fontSize: 13, fontWeight: "800" },

  movRow: { paddingHorizontal: 16, paddingVertical: 14 },
  movLeft: { flexDirection: "row", alignItems: "center" },
  movIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  movHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  movSubRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2, gap: 10 },

  movTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
  movValueInline: { color: "#fff", fontSize: 14, fontWeight: "900", marginLeft: 10 },

  movSub: { color: COLORS.textMutedSoft, fontSize: 13, marginTop: 2, flex: 1 },
  movStatus: { fontSize: 12, fontWeight: "900" },

  navWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
});

export default Billetera;
