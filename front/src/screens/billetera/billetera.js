import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

const Billetera = (props) => {
<<<<<<< HEAD
  const [ocultarSaldo, setOcultarSaldo] = useState(false);
  const [screenW, setScreenW] = useState(Dimensions.get("window").width);
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");
=======
  const [hideBalance, setHideBalance] = useState(false);
  const [screenW, setScreenW] = useState(Dimensions.get("window").width);
  const [lastUpdate, setLastUpdate] = useState("");
>>>>>>> Dani

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenW(window.width);
    });
    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, []);

  useEffect(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
<<<<<<< HEAD
    setUltimaActualizacion(hh + ":" + mm);
  }, []);

  // ====== Responsive (IF/ELSE) ======
  let esWeb = false;
  if (Platform.OS === "web") esWeb = true;
  else esWeb = false;

  let esPC = false;
  if (esWeb && screenW >= 900) esPC = true;
  else esPC = false;
=======
    setLastUpdate(hh + ":" + mm);
  }, []);

  let isWeb = false;
  if (Platform.OS === "web") isWeb = true;

  let isPC = false;
  if (isWeb && screenW >= 900) isPC = true;
>>>>>>> Dani

  let titleSize = 28;
  let balanceSize = 32;
  let padH = 24;
  let cardPad = 18;

<<<<<<< HEAD
  if (esPC) {
=======
  if (isPC) {
>>>>>>> Dani
    titleSize = 30;
    balanceSize = 34;
    padH = 28;
    cardPad = 20;
<<<<<<< HEAD
  } else {
    titleSize = 28;
    balanceSize = 32;
    padH = 24;
    cardPad = 18;
  }

  // ====== Datos demo ======
  const saldoTotal = 2450.35;
  const variacion24h = 3.42;

  const saldoDisponible = 2310.2;
  const saldoRetenido = 140.15;

  const activos = [
=======
  }

  const totalBalance = 2450.35;
  const variation24h = 3.42;

  const availableBalance = 2310.2;
  const retainedEarnings = 140.15;

  const assets = [
>>>>>>> Dani
    { symbol: "BTC", name: "Bitcoin", amount: 0.0324, valueEUR: 1336.5, change24h: 2.1 },
    { symbol: "ETH", name: "Ethereum", amount: 0.54, valueEUR: 1209.8, change24h: -1.3 },
    { symbol: "SOL", name: "Solana", amount: 18.2, valueEUR: 178.9, change24h: 5.7 },
    { symbol: "USDT", name: "Tether", amount: 420.0, valueEUR: 420.0, change24h: 0.0 },
  ];

<<<<<<< HEAD
  const movimientos = [
=======
  const movements = [
>>>>>>> Dani
    { type: "receive", title: "Recibido", subtitle: "0.0100 BTC", date: "Hoy", value: "+412.50 €", status: "Confirmado" },
    { type: "send", title: "Enviado", subtitle: "0.20 ETH", date: "Ayer", value: "-448.00 €", status: "Confirmado" },
    { type: "swap", title: "Swap", subtitle: "SOL → USDT", date: "Hace 3 días", value: "+120.00 €", status: "Procesando" },
  ];

<<<<<<< HEAD
  // ====== Helpers ======
=======
>>>>>>> Dani
  const formatEUR = (num) => {
    let s = Number(num).toFixed(2);
    s = s.replace(".", ",");
    return s + " €";
  };

<<<<<<< HEAD
  let saldoTexto = "";
  if (ocultarSaldo) saldoTexto = "•••••";
  else saldoTexto = formatEUR(saldoTotal);

  let dispTexto = "";
  if (ocultarSaldo) dispTexto = "••••";
  else dispTexto = formatEUR(saldoDisponible);

  let retTexto = "";
  if (ocultarSaldo) retTexto = "••••";
  else retTexto = formatEUR(saldoRetenido);

  let sube = false;
  if (variacion24h >= 0) sube = true;
  else sube = false;

  let colorTrend = COLORS.accent;
  let bordeTrend = "rgba(115, 255, 200, 0.22)";
  let fondoTrend = "rgba(115, 255, 200, 0.08)";
  let iconTrend = "trending-up";

  if (sube) {
    colorTrend = COLORS.accent;
    bordeTrend = "rgba(115, 255, 200, 0.22)";
    fondoTrend = "rgba(115, 255, 200, 0.08)";
    iconTrend = "trending-up";
  } else {
    colorTrend = "#ff6b6b";
    bordeTrend = "rgba(255,107,107,0.28)";
    fondoTrend = "rgba(255,107,107,0.08)";
    iconTrend = "trending-down";
  }

  let textoVariacion = "";
  if (ocultarSaldo) textoVariacion = "•••";
  else {
    if (sube) textoVariacion = "+" + variacion24h.toFixed(2) + "%";
    else textoVariacion = variacion24h.toFixed(2) + "%";
  }

  const iconMovimiento = (tipo) => {
    let icon = "swap-horiz";
    if (tipo === "receive") icon = "south-west";
    else if (tipo === "send") icon = "north-east";
    else icon = "swap-horiz";
    return icon;
  };

  // ====== Estilos dinámicos ======
  const dyn = {
    container: { paddingHorizontal: padH },
    title: { fontSize: titleSize },
    balanceValue: { fontSize: balanceSize },
    balanceCard: { padding: cardPad },
    twoCols: {},
    col: {},
  };

  if (esPC) {
    dyn.twoCols = { flexDirection: "row", gap: 14, alignItems: "flex-start" };
    dyn.col = { flex: 1 };
  } else {
    dyn.twoCols = { flexDirection: "column" };
    dyn.col = { width: "100%" };
  }

  // ✅ CONTENEDOR SCROLL SEGÚN PLATAFORMA
  let Wrapper = View; // web
  let wrapperProps = { style: styles.webWrapper };
  let ScrollComp = View;
  let scrollProps = { style: styles.webScroll };
  let innerStyle = styles.webInner;

  if (!esWeb) {
    Wrapper = SafeAreaView;
    wrapperProps = { style: styles.safe };

    ScrollComp = ScrollView;
    scrollProps = {
      style: styles.scroll,
      contentContainerStyle: styles.scrollContainer,
      bounces: true,
      showsVerticalScrollIndicator: false,
    };
    innerStyle = null;
  }

  return (
    <Wrapper {...wrapperProps}>
      {/* Blobs */}
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <ScrollComp {...scrollProps}>
        <View style={innerStyle}>
          <View style={[styles.container, dyn.container]}>
            {/* Header */}
            <View style={styles.topRow}>
              <View>
                <Text style={styles.kicker}>Billetera</Text>
                <Text style={[styles.title, dyn.title]}>Tu cartera segura</Text>
                <Text style={styles.miniInfo}>
                  Última actualización: {ocultarSaldo ? "••:••" : ultimaActualizacion}
                </Text>
              </View>

              <Pressable onPress={() => setOcultarSaldo(!ocultarSaldo)} style={styles.iconBtn}>
                <MaterialIcons
                  name={ocultarSaldo ? "visibility-off" : "visibility"}
                  size={22}
                  color={COLORS.textMuted}
                />
              </Pressable>
            </View>

            {/* Card saldo */}
            <View style={[styles.balanceCard, dyn.balanceCard]}>
              <LinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(16,34,23,0.0)"]}
                locations={[0, 1]}
                style={styles.balanceGlow}
              />

              <Text style={styles.balanceLabel}>Balance total</Text>

              <View style={styles.balanceRow}>
                <Text style={[styles.balanceValue, dyn.balanceValue]}>{saldoTexto}</Text>

                <View style={[styles.pill, { borderColor: bordeTrend, backgroundColor: fondoTrend }]}>
                  <MaterialIcons name={iconTrend} size={16} color={colorTrend} />
                  <Text style={[styles.pillText, { color: colorTrend }]}>{textoVariacion}</Text>
                </View>
              </View>

              <Text style={styles.balanceSub}>
                {ocultarSaldo ? "Últimas 24h" : "Últimas 24h · variación estimada"}
              </Text>

              {/* Disponible / Retenido */}
              <View style={styles.smallGrid}>
                <View style={styles.smallCard}>
                  <Text style={styles.smallLabel}>Disponible</Text>
                  <Text style={styles.smallValue}>{dispTexto}</Text>
=======
  const hiddenText = (text) => {
    if (hideBalance) return "••••";
    return text;
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

  const isUpTrend = () => {
    if (variation24h >= 0) return true;
    return false;
  };

  const getTrendConfig = () => {
    const up = isUpTrend();

    if (up) {
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

  const trend = getTrendConfig();
  const textBalance = getBalanceText();
  const textAvailable = getAvailableText();
  const retText = getRetainedText();
  const textVariation = getVariationText();

  const dyn = {
    container: { paddingHorizontal: padH },
    title: { fontSize: titleSize },
    balanceValue: { fontSize: balanceSize },
    balanceCard: { padding: cardPad },
    twoCols: {},
    col: {},
  };

  if (isPC) {
    dyn.twoCols = { flexDirection: "row", gap: 14, alignItems: "flex-start" };
    dyn.col = { flex: 1 };
  } else {
    dyn.twoCols = { flexDirection: "column" };
    dyn.col = { width: "100%" };
  }

  let Wrapper = View; 
  let wrapperProps = { style: styles.webWrapper };
  let ScrollComp = View;
  let scrollProps = { style: styles.webScroll };
  let innerStyle = styles.webInner;

  if (!isWeb) {
    Wrapper = SafeAreaView;
    wrapperProps = { style: styles.safe };

    ScrollComp = ScrollView;
    scrollProps = {
      style: styles.scroll,
      contentContainerStyle: styles.scrollContainer,
      bounces: true,
      showsVerticalScrollIndicator: false,
    };
    innerStyle = null;
  }

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

  const renderMiniInfo = () => {
    return <Text style={styles.miniInfo}>Última actualización: {hiddenTime()}</Text>;
  };

  return (
    <Wrapper {...wrapperProps}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <ScrollComp {...scrollProps}>
        <View style={innerStyle}>
          <View style={[styles.container, dyn.container]}>
            <View style={styles.topRow}>
              <View>
                <Text style={styles.kicker}>Billetera</Text>
                <Text style={[styles.title, dyn.title]}>Tu cartera segura</Text>
                {renderMiniInfo()}
              </View>

              <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
                <MaterialIcons
                  name={getVisibilityIconName()}
                  size={22}
                  color={COLORS.textMuted}
                />
              </Pressable>
            </View>

            <View style={[styles.balanceCard, dyn.balanceCard]}>
              <LinearGradient
                colors={["rgba(255,255,255,0.08)", "rgba(16,34,23,0.0)"]}
                locations={[0, 1]}
                style={styles.balanceGlow}
              />

              <Text style={styles.balanceLabel}>Balance total</Text>

              <View style={styles.balanceRow}>
                <Text style={[styles.balanceValue, dyn.balanceValue]}>{textBalance}</Text>

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
>>>>>>> Dani
                </View>

                <View style={styles.smallCard}>
                  <Text style={styles.smallLabel}>Retenido</Text>
<<<<<<< HEAD
                  <Text style={styles.smallValue}>{retTexto}</Text>
=======
                  <Text style={styles.smallValue}>{retText}</Text>
>>>>>>> Dani
                </View>
              </View>
            </View>

<<<<<<< HEAD
            {/* Contenido principal */}
            <View style={[styles.twoColsWrap, dyn.twoCols]}>
              {/* Activos */}
              <View style={dyn.col}>
                <View style={esPC ? styles.sectionRowPC : styles.sectionRow}>
=======
            <View style={[styles.twoColsWrap, dyn.twoCols]}>
              <View style={dyn.col}>
                <View style={isPC ? styles.sectionRowPC : styles.sectionRow}>
>>>>>>> Dani
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
<<<<<<< HEAD
                            <Text style={styles.assetSub}>{amountText}</Text>
=======
                            <Text style={styles.assetSub}>{row.amountText}</Text>
>>>>>>> Dani
                          </View>
                        </View>

                        <View style={styles.assetRight}>
<<<<<<< HEAD
                          <Text style={styles.assetValue}>{valText}</Text>
                          <Text style={[styles.assetChange, { color: cambioColor }]}>{chText}</Text>
                        </View>

                        {index !== activos.length - 1 ? <View style={styles.divider} /> : null}
=======
                          <Text style={styles.assetValue}>{row.valText}</Text>
                          <Text style={[styles.assetChange, { color: row.colourChange }]}>{row.chText}</Text>
                        </View>

                        {renderDividerIfNotLast(index, assets.length)}
>>>>>>> Dani
                      </View>
                    );
                  })}
                </View>
              </View>

<<<<<<< HEAD
              {/* Movimientos */}
              <View style={dyn.col}>
                <View style={esPC ? styles.sectionRowPC : [styles.sectionRow, { marginTop: 18 }]}>
=======
              <View style={dyn.col}>
                <View style={isPC ? styles.sectionRowPC : [styles.sectionRow, { marginTop: 18 }]}>
>>>>>>> Dani
                  <Text style={styles.sectionTitle}>Movimientos</Text>
                </View>

                <View style={styles.card}>
<<<<<<< HEAD
                  {movimientos.map((m, index) => {
                    let valMov = "";
                    if (ocultarSaldo) valMov = "••••";
                    else valMov = m.value;

                    let statusColor = COLORS.textMuted;
                    if (m.status === "Confirmado") statusColor = COLORS.textMuted;
                    else statusColor = "#ffd166";
=======
                  {movements.map((m, index) => {
                    const mov = getMovementRowData(m);
>>>>>>> Dani

                    return (
                      <View key={m.type + "-" + index} style={styles.movRow}>
                        <View style={styles.movLeft}>
                          <View style={styles.movIconWrap}>
<<<<<<< HEAD
                            <MaterialIcons name={iconMovimiento(m.type)} size={20} color={COLORS.accent} />
=======
                            <MaterialIcons name={iconMovement(m.type)} size={20} color={COLORS.accent} />
>>>>>>> Dani
                          </View>

                          <View style={{ flex: 1 }}>
                            <View style={styles.movHeaderRow}>
                              <Text style={styles.movTitle}>{m.title}</Text>
<<<<<<< HEAD
                              <Text style={styles.movValueInline}>{valMov}</Text>
=======
                              <Text style={styles.movValueInline}>{mov.valMov}</Text>
>>>>>>> Dani
                            </View>

                            <View style={styles.movSubRow}>
                              <Text style={styles.movSub}>
                                {m.subtitle} · {m.date}
                              </Text>
<<<<<<< HEAD
                              <Text style={[styles.movStatus, { color: statusColor }]}>
                                {ocultarSaldo ? "•••" : m.status}
=======
                              <Text style={[styles.movStatus, { color: mov.statusColour }]}>
                                {mov.statusText}
>>>>>>> Dani
                              </Text>
                            </View>
                          </View>
                        </View>

<<<<<<< HEAD
                        {index !== movimientos.length - 1 ? <View style={styles.divider} /> : null}
=======
                        {renderDividerIfNotLast(index, movements.length)}
>>>>>>> Dani
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

<<<<<<< HEAD
            {/* Espaciado */}
=======
>>>>>>> Dani
            <View style={{ height: 140 }} />
          </View>
        </View>
      </ScrollComp>

<<<<<<< HEAD
      {/* Nav fijo abajo sin bloquear scroll */}
=======
>>>>>>> Dani
      <View pointerEvents="box-none" style={styles.navWrap}>
        <Nav />
      </View>
    </Wrapper>
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

<<<<<<< HEAD
  // WEB
=======
>>>>>>> Dani
  webWrapper: { height: "100vh", backgroundColor: COLORS.backgroundDark },
  webScroll: { flex: 1, height: "100vh", overflow: "auto" },
  webInner: { paddingTop: 20, paddingBottom: 160 },

<<<<<<< HEAD
  // MÓVIL
=======
>>>>>>> Dani
  scroll: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 140,
  },

  container: { width: "100%", maxWidth: 980, alignSelf: "center" },

  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  kicker: { color: COLORS.textMuted, fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase" },
  title: { color: "#fff", fontWeight: "800", marginTop: 4 },
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
  },
  balanceGlow: { position: "absolute", left: 0, right: 0, top: 0, height: 120 },
  balanceLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  balanceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 },
  balanceValue: { color: "#fff", fontWeight: "900" },

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
  sectionRowPC: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
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
