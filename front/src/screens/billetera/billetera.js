import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

import theme from "../../styles/theme";
import common from "../../styles/common";
import Context from "../../context/Context";
import { useSettings } from "../../context/SettingsContext";

const Billetera = (props) => {
  const { C } = useSettings();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [hideBalance, setHideBalance] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const { user, isLogged, isLoading } = useContext(Context);

  const [portfolio, setPortfolio] = useState({ totalBalanceEur: 0, assets: [] });
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [trend, setTrend] = useState("neutral");
  const prevBalanceRef = useRef(0);

  const fetchPortfolio = async () => {
    if (user && user.walletAddress) {
      try {
        const url = `http://10.10.6.84:8080/api/blockchain/portfolio/${user.walletAddress}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en el servidor");
        const data = await response.json();

        if (prevBalanceRef.current !== 0) {
          if (data.totalBalanceEur > prevBalanceRef.current) setTrend("up");
          else if (data.totalBalanceEur < prevBalanceRef.current) setTrend("down");
        }

        prevBalanceRef.current = data.totalBalanceEur;
        setPortfolio(data);

        const d = new Date();
        setLastUpdate(
          String(d.getHours()).padStart(2, "0") +
            ":" +
            String(d.getMinutes()).padStart(2, "0") +
            ":" +
            String(d.getSeconds()).padStart(2, "0")
        );
      } catch (error) {
        console.error("Error al obtener portfolio:", error);
      } finally {
        setLoadingBalance(false);
      }
    }
  };

  useEffect(() => {
    if (isLogged) {
      fetchPortfolio();
      const interval = setInterval(fetchPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [isLogged, user]);

  const getTrendStyle = () => {
    if (trend === "up") return { color: "#00ff88", icon: "arrow-up-circle" };
    if (trend === "down") return { color: "#ff3333", icon: "arrow-down-circle" };
    return { color: C.textMain, icon: null };
  };

  const trendData = getTrendStyle();

  if (isLoading || loadingBalance) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: C.bg }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[common.safe || styles.safe, { backgroundColor: C.bg }]}>
      <View style={[styles.blob, styles.blobTop]} />

      <ScrollView
        style={{ flex: 1, backgroundColor: C.bg }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Hola, {user?.firstName}</Text>
            <Text style={styles.miniInfo}>Live • {lastUpdate}</Text>
          </View>

          <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
            <MaterialIcons
              name={hideBalance ? "visibility-off" : "visibility"}
              size={22}
              color={C.textMuted}
            />
          </Pressable>
        </View>

        <View style={styles.balanceCardMain}>
          <LinearGradient
            colors={[C.isDark ? "rgba(43,238,121,0.05)" : "rgba(43,238,121,0.10)", "transparent"]}
            style={styles.balanceGlow}
          />
          <Text style={styles.balanceLabel}>Balance Total Estimado</Text>
          <View style={styles.balanceRowTop}>
            <Text style={[styles.balanceValue, { color: hideBalance ? C.textMain : trendData.color }]}>
              {hideBalance ? "•••• €" : `${portfolio.totalBalanceEur.toFixed(2)} €`}
            </Text>
            {trendData.icon && !hideBalance && (
              <Ionicons name={trendData.icon} size={28} color={trendData.color} style={{ marginLeft: 10 }} />
            )}
          </View>
          <Text style={styles.addressSub}>{user?.walletAddress}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Activos</Text>
            <View style={styles.liveIndicator} />
          </View>

          {portfolio.assets.map((asset, index) => (
            <View key={asset.symbol}>
              <View style={styles.assetRow}>
                <View style={styles.assetLeft}>
                  <View style={styles.coinBadge}>
                    <Text style={styles.coinBadgeText}>{asset.symbol}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.assetName}>{asset.name}</Text>
                    <Text style={styles.assetSub}>
                      {hideBalance ? "••••" : `${asset.cryptoAmount.toFixed(4)} ${asset.symbol}`}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.assetValueEur}>
                      {hideBalance ? "•••• €" : `${asset.valueEur.toFixed(2)} €`}
                    </Text>
                    <View style={styles.changeRow}>
                      <Text
                        style={[
                          styles.assetChange,
                          {
                            color: hideBalance
                              ? C.textMuted
                              : asset.change24h.includes("-")
                              ? "#ff3333"
                              : "#00ff88",
                          },
                        ]}
                      >
                        {hideBalance ? "••%" : asset.change24h}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {index !== portfolio.assets.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Nav />
    </SafeAreaView>
  );
};

const makeStyles = (C) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },

    scrollContainer: { padding: 20 },

    loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 25,
    },
    welcome: { color: C.textMain, fontSize: 28, fontWeight: "800" },
    miniInfo: { color: C.textMuted, fontSize: 12, fontWeight: "700" },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.cardBg,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.05 : 0.10,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },

    balanceCardMain: {
      backgroundColor: C.cardBg,
      borderRadius: 28,
      padding: 25,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 25,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.06 : 0.12,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 2,
      overflow: "hidden",
    },
    balanceGlow: { position: "absolute", top: 0, left: 0, right: 0, height: 100 },

    balanceLabel: { color: C.textMuted, fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
    balanceRowTop: { flexDirection: "row", alignItems: "center", marginTop: 8 },
    balanceValue: { fontSize: 34, fontWeight: "900" },

    addressSub: {
      color: C.isDark ? "rgba(157,185,168,0.3)" : "rgba(15,23,42,0.45)",
      fontSize: 10,
      marginTop: 15,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    },

    card: {
      backgroundColor: C.cardBg,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: C.isDark ? 0.05 : 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 10 },
      elevation: 2,
    },

    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
    sectionTitle: { color: C.textMain, fontSize: 18, fontWeight: "800" },
    liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary, marginLeft: 10 },

    assetRow: { paddingVertical: 15 },
    assetLeft: { flexDirection: "row", alignItems: "center" },

    coinBadge: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor: C.isDark ? "rgba(43,238,121,0.10)" : "rgba(43,238,121,0.14)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 15,
      borderWidth: 1,
      borderColor: C.isDark ? "rgba(43,238,121,0.20)" : "rgba(43,238,121,0.28)",
    },
    coinBadgeText: { color: C.primary, fontWeight: "900", fontSize: 11 },

    assetName: { color: C.textMain, fontSize: 16, fontWeight: "800" },
    assetSub: { color: C.textMuted, fontSize: 13, marginTop: 2, fontWeight: "700" },
    assetValueEur: { color: C.textMain, fontWeight: "900", fontSize: 16 },
    changeRow: { marginTop: 4 },
    assetChange: { fontSize: 13, fontWeight: "900" },

    divider: { height: 1, backgroundColor: C.isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.08)" },

    blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.06)", borderRadius: 999 },
    blobTop: { width: 400, height: 400, top: -100, right: -100 },
  });

export default Billetera;
