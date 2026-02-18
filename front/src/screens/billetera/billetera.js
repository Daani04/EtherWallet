import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, SafeAreaView, ActivityIndicator, Platform } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import theme from "../../styles/theme";
import Context from '../../context/Context';

const COLORS = theme?.colors || theme?.COLORS || theme;

const Billetera = (props) => {
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
        const url = `http://10.10.5.238:8080/api/blockchain/portfolio/${user.walletAddress}`;
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
        setLastUpdate(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0"));
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
    return { color: "#fff", icon: null };
  };

  const trendData = getTrendStyle();

  if (isLoading || loadingBalance) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2bee79" />
      </View>
    );
  }

  return (
    <SafeAreaView style={common.safe || styles.safe}>
      <View style={[styles.blob, styles.blobTop]} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Hola, {user?.firstName}</Text>
            <Text style={styles.miniInfo}>Live • {lastUpdate}</Text>
          </View>
          <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
            <MaterialIcons name={hideBalance ? "visibility-off" : "visibility"} size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>

        <View style={styles.balanceCardMain}>
          <LinearGradient colors={["rgba(43,238,121,0.05)", "transparent"]} style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Balance Total Estimado</Text>
          <View style={styles.balanceRowTop}>
            <Text style={[styles.balanceValue, { color: hideBalance ? "#fff" : trendData.color }]}>
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
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.assetValueEur}>
                        {hideBalance ? "•••• €" : `${asset.valueEur.toFixed(2)} €`}
                    </Text>
                    <View style={styles.changeRow}>
                      <Text style={[styles.assetChange, { color: hideBalance ? COLORS.textMuted : (asset.change24h.includes('-') ? '#ff3333' : '#00ff88') }]}>
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

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: "#102217" 
  },
  scrollContainer: { 
    padding: 20 
  },
  loaderContainer: { 
    flex: 1, 
    backgroundColor: '#102217', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  topRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 25 
  },
  welcome: { 
    color: "#fff", 
    fontSize: 28, 
    fontWeight: "800" 
  },
  miniInfo: { 
    color: "#6b8a78", 
    fontSize: 12, 
    fontWeight: "600" 
  },
  iconBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: "#1c2720", 
    alignItems: "center", 
    justifyContent: "center", 
    borderWidth: 1, 
    borderColor: "#3b5445" 
  },
  balanceCardMain: { 
    backgroundColor: "#1c2720", 
    borderRadius: 28, 
    padding: 25, 
    borderWidth: 1, 
    borderColor: "#3b5445", 
    marginBottom: 25 
  },
  balanceLabel: { 
    color: "#6b8a78", 
    fontSize: 13, 
    fontWeight: "700", 
    textTransform: "uppercase" 
  },
  balanceRowTop: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 8 
  },
  balanceValue: { 
    fontSize: 34, 
    fontWeight: "900" 
  },
  addressSub: { 
    color: "rgba(157,185,168,0.3)", 
    fontSize: 10, 
    marginTop: 15, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' 
  },
  card: { 
    backgroundColor: "#1c2720", 
    borderRadius: 24, 
    padding: 20, 
    borderWidth: 1, 
    borderColor: "#3b5445" 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  sectionTitle: { 
    color: "#fff", 
    fontSize: 18, 
    fontWeight: "700" 
  },
  liveIndicator: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#2bee79', 
    marginLeft: 10 
  },
  assetRow: { 
    paddingVertical: 15 
  },
  assetLeft: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  coinBadge: { 
    width: 45, 
    height: 45, 
    borderRadius: 14, 
    backgroundColor: "rgba(43,238,121,0.1)", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: 15 
  },
  coinBadgeText: { 
    color: "#2bee79", 
    fontWeight: "800", 
    fontSize: 11 
  },
  assetName: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },
  assetSub: { 
    color: "#9db9a8", 
    fontSize: 13 
  },
  assetValueEur: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 16 
  },
  assetChange: { 
    fontSize: 13, 
    fontWeight: "600" 
  },
  divider: { 
    height: 1, 
    backgroundColor: "#3b5445" 
  },
  blob: { 
    position: "absolute", 
    width: 400, 
    height: 400, 
    backgroundColor: "rgba(43,238,121,0.03)", 
    borderRadius: 200, 
    top: -100, 
    right: -100 
  },
  balanceGlow: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    height: 100 
  }
});

export default Billetera;