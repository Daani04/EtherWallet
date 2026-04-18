import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, G, Text as SvgText, Defs, Stop } from "react-native-svg";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import Context from "../../context/Context";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "react-i18next";

const NAV_HEIGHT = 90;

const DonutChart = ({ assets, totalEur, C, t }) => {
  const size = 180;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  if (!assets || assets.length === 0 || totalEur <= 0) {
    return (
      <View style={{alignItems: 'center', justifyContent: 'center', height: size, marginVertical: 20}}>
        <View style={{width: size, height: size, borderRadius: center, borderWidth: 2, borderColor: C.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center'}}>
           <Text style={{color: C.textMuted, fontWeight: "600"}}>{t("newFeatures.noAssets")}</Text>
        </View>
      </View>
    );
  }

  const colors = [C.primary, "#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#14B8A6", "#EAB308", "#8B5CF6"];

  let startAngle = 0;

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <View style={stylesChart.chartWrapper}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background Track */}
            <Circle cx={center} cy={center} r={radius} stroke={C.cardBg} strokeWidth={strokeWidth} fill="transparent" />
            
            {assets.map((asset, index) => {
              const ratio = (asset.valueEur || 0) / totalEur;
              const strokeLength = ratio * circumference;
              const spaceLength = circumference - strokeLength;
              const offset = circumference - startAngle;
              
              const circle = (
                <Circle
                  key={asset.symbol}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${spaceLength}`}
                  strokeDashoffset={offset}
                  fill="transparent"
                  strokeLinecap="round"
                />
              );
              startAngle += strokeLength;
              return circle;
            })}
          </G>
          <SvgText x={center} y={center - 5} textAnchor="middle" fill={C.textMain} fontSize="22" fontWeight="900">
            {assets.length}
          </SvgText>
          <SvgText x={center} y={center + 15} textAnchor="middle" fill={C.textMuted} fontSize="12" fontWeight="600">
            {t("newFeatures.assetsLabel")}
          </SvgText>
        </Svg>
      </View>

      <View style={stylesChart.legendContainer}>
        {assets.map((a, i) => (
          <View key={a.symbol} style={stylesChart.legendItem}>
            <View style={[stylesChart.legendColor, { backgroundColor: colors[i % colors.length] }]} />
            <Text style={[stylesChart.legendText, {color: C.textMain}]}>
              {a.symbol} <Text style={{color: C.textMuted}}>({((a.valueEur / totalEur) * 100).toFixed(0)}%)</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const stylesChart = StyleSheet.create({
  chartWrapper: {
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 25,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)"
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "700",
  }
});


const Billetera = (props) => {
  const { t } = useTranslation();
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { user, isLogged, isLoading } = useContext(Context);

  const [hideBalance, setHideBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [portfolio, setPortfolio] = useState({
    totalBalanceEur: 0,
    assets: [],
  });

  const [trend, setTrend] = useState("neutral");
  const prevBalanceRef = useRef(0);

  const isWeb = Platform.OS === "web";
  const topInset = Platform.OS === "android" ? (StatusBar.currentHeight || 0) : 0;

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {});
    return () => { if (sub && sub.remove) sub.remove(); };
  }, []);

  const fetchPortfolio = async () => {
    if (!user?.walletAddress) return;
    try {
      const url = `http://192.168.1.138:8080/api/blockchain/portfolio/${user.walletAddress}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(t("wallet.errors.server"));
      const data = await response.json();

      const newTotal = Number(data.totalBalanceEur || 0);

      if (prevBalanceRef.current !== 0 && newTotal !== prevBalanceRef.current) {
        setTrend(newTotal > prevBalanceRef.current ? "up" : "down");
      }

      prevBalanceRef.current = newTotal;
      setPortfolio(data);

      const d = new Date();
      setLastUpdate(
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0") + ":" +
        String(d.getSeconds()).padStart(2, "0")
      );
    } catch (error) {
      console.error(t("wallet.errors.fetchPortfolio"), error);
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (isLogged) {
      setLoadingBalance(true);
      fetchPortfolio();
      const interval = setInterval(() => fetchPortfolio(), 5000);
      return () => clearInterval(interval);
    } else {
      setLoadingBalance(false);
    }
  }, [user?.walletAddress, isLogged, t]);

  const trendStyle = useMemo(() => {
    if (trend === "up") return { color: "#22C55E", icon: "trending-up" };
    if (trend === "down") return { color: "#EF4444", icon: "trending-down" };
    return { color: C.textMain, icon: null };
  }, [trend, C.textMain]);

  if (isLoading || loadingBalance) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const renderContent = () => (
    <>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.welcome}>{t("wallet.greeting", { name: user?.firstName || "Trader" })}</Text>
          <Text style={styles.miniInfo}>{t("wallet.live")} • {lastUpdate}</Text>
        </View>

        <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
          <MaterialIcons name={hideBalance ? "visibility-off" : "visibility"} size={22} color={C.textMuted} />
        </Pressable>
      </View>

      {/* Tarjeta Holográfica de Balance */}
      <View style={styles.balanceCardMain}>
        <LinearGradient
          colors={[C.primary, C.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.glassOverlay} />
        
        <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start"}}>
           <Text style={styles.balanceLabel}>{t("wallet.totalBalance")}</Text>
           <MaterialIcons name="account-balance-wallet" size={24} color="rgba(255,255,255,0.7)" />
        </View>

        <View style={styles.balanceRowTop}>
          <Text style={styles.balanceValue}>
            {hideBalance ? "•••• €" : `${Number(portfolio.totalBalanceEur || 0).toFixed(2)} €`}
          </Text>
          {trendStyle.icon && !hideBalance && (
            <View style={[styles.trendBadge, {backgroundColor: trend === "up" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}]}>
               <MaterialIcons name={trendStyle.icon} size={18} color={trendStyle.color} />
            </View>
          )}
        </View>

        <Text style={styles.addressSub}>
          {user?.walletAddress ? user.walletAddress : t("wallet.noWallet")}
        </Text>
        
        {/* Adorno visual de tarjeta */}
        <View style={styles.cardCircle1} />
        <View style={styles.cardCircle2} />
      </View>

      {/* Donut Chart Component */}
      <DonutChart assets={portfolio.assets} totalEur={portfolio.totalBalanceEur} C={C} t={t} />

      {/* Assets List */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("wallet.yourAssets")}</Text>
          <View style={styles.liveIndicator} />
        </View>

        {(portfolio.assets || []).map((asset, index) => {
           const isNeg = String(asset.change24h || "").includes("-");
           const chgColor = hideBalance ? C.textMuted : isNeg ? "#EF4444" : "#22C55E";
           
           return (
            <View key={`${asset.symbol}-${index}`}>
              <View style={styles.assetRow}>
                <View style={styles.assetLeft}>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinBadgeText}>{asset.symbol}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetSub}>
                      {hideBalance ? "••••" : `${Number(asset.cryptoAmount || 0).toFixed(4)} ${asset.symbol}`}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.assetValueEur}>
                      {hideBalance ? "•••• €" : `${Number(asset.valueEur || 0).toFixed(2)} €`}
                    </Text>
                    <Text style={[styles.assetChange, { color: chgColor }]}>
                        {hideBalance ? "••%" : asset.change24h}
                    </Text>
                  </View>
                </View>
              </View>
              {index !== (portfolio.assets || []).length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>

      <View style={{ height: isWeb ? 20 : NAV_HEIGHT + 20 }} />
    </>
  );

  return (
    <View style={[styles.page, { backgroundColor: C.bg }]}>
      <SafeAreaView style={[common.safe, { backgroundColor: C.bg, paddingTop: topInset }, isWeb && styles.safeWeb]}>
        <View style={styles.flex1}>
          {isWeb ? (
            <View style={styles.webScroll}>
              <View style={styles.scrollContainer}>{renderContent()}</View>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1, backgroundColor: C.bg }}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {renderContent()}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>

      <View style={[styles.navWrap, isWeb ? styles.navWrapWeb : styles.navWrapNative]}>
        <Nav />
      </View>
    </View>
  );
};

const makeStyles = (C) => StyleSheet.create({
  flex1: { flex: 1 },
  page: { flex: 1, position: "relative" },
  safeWeb: { height: "100vh", overflow: "hidden" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  webScroll: { position: "absolute", top: 0, left: 0, right: 0, bottom: 90, overflowY: "auto", scrollbarWidth: "none" },
  navWrap: { left: 0, right: 0, bottom: 0, height: 90, zIndex: 9999 },
  navWrapWeb: { position: "fixed" },
  navWrapNative: { position: "absolute", backgroundColor: C.bg },
  scrollContainer: { padding: 24, paddingBottom: 110 },

  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  welcome: { color: C.textMain, fontSize: 26, fontWeight: "900" },
  miniInfo: { color: C.textMuted, fontSize: 13, fontWeight: "700", marginTop: 2 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.cardBg, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: C.border },

  balanceCardMain: {
    borderRadius: 28,
    padding: 25,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    minHeight: 180,
    justifyContent: 'center'
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardCircle1: {
     position: 'absolute', width: 200, height: 200, borderRadius: 100,
     backgroundColor: "rgba(255,255,255,0.1)", top: -80, right: -50
  },
  cardCircle2: {
     position: 'absolute', width: 150, height: 150, borderRadius: 75,
     backgroundColor: "rgba(0,0,0,0.1)", bottom: -60, left: -40
  },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
  balanceRowTop: { flexDirection: "row", alignItems: "center", marginTop: 15, zIndex: 2 },
  balanceValue: { fontSize: 40, fontWeight: "900", color: "#FFF" },
  trendBadge: { marginLeft: 15, padding: 6, borderRadius: 12 },
  addressSub: { color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 25, fontFamily: Platform.OS === "ios" ? "Courier" : "monospace", zIndex: 2 },

  card: { backgroundColor: C.cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: C.border },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { color: C.textMain, fontSize: 20, fontWeight: "800" },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginLeft: 10, shadowColor: C.primary, shadowOpacity: 1, shadowRadius: 5 },
  
  assetRow: { paddingVertical: 15 },
  assetLeft: { flexDirection: "row", alignItems: "center" },
  coinBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(168, 85, 247, 0.15)", borderColor: C.border, marginRight: 15, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  coinBadgeText: { color: C.primary, fontWeight: "900", fontSize: 12 },
  assetName: { color: C.textMain, fontSize: 16, fontWeight: "800" },
  assetSub: { color: C.textMuted, fontSize: 13, marginTop: 4, fontWeight: "700" },
  assetValueEur: { color: C.textMain, fontWeight: "900", fontSize: 17 },
  assetChange: { fontSize: 13, fontWeight: "800", marginTop: 4 },
  divider: { height: 1, backgroundColor: C.border },
});

export default Billetera;