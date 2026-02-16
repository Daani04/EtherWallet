import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav";

import common from "../../styles/common";
import theme from "../../styles/theme";
import Context from '../../context/Context';

const COLORS = theme?.colors || theme?.COLORS || theme;

const Billetera = (props) => {
  const [hideBalance, setHideBalance] = useState(false);
  const [screenW, setScreenW] = useState(Dimensions.get("window").width);
  const [lastUpdate, setLastUpdate] = useState("");

  const { user, isLogged, isLoading } = useContext(Context);

  const [ethBalance, setEthBalance] = useState("0.00");
  const [loadingBalance, setLoadingBalance] = useState(true);

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
    setLastUpdate(hh + ":" + mm);
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user && user.walletAddress) {
        try {
          const response = await fetch(`http://localhost:8080/api/blockchain/balance/${user.walletAddress}`);
          if (!response.ok) throw new Error("Error en respuesta");
          
          const data = await response.json();
          setEthBalance(data.toString());
        } catch (error) {
          console.error("Error al obtener saldo:", error);
          setEthBalance("N/A");
        } finally {
          setLoadingBalance(false);
        }
      } else {
        setLoadingBalance(false);
      }
    };
  }, []);

    if (isLogged) fetchBalance();
  }, [user, isLogged]); 

  if (isLoading || loadingBalance) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2bee79" />
      </View>
    );
  }

  let isWeb = Platform.OS === "web";
  let isPC = isWeb && screenW >= 900;

  const totalBalance = 2450.35; 
  const variation24h = 3.42;

  const assets = [
    { symbol: "ETH", name: "Ethereum (Real)", amount: ethBalance, valueEUR: "Consultando...", change24h: 0.0 },
    { symbol: "BTC", name: "Bitcoin", amount: 0.0324, valueEUR: 1336.5, change24h: 2.1 },
    { symbol: "SOL", name: "Solana", amount: 18.2, valueEUR: 178.9, change24h: 5.7 },
  ];

  const movements = [
    { type: "receive", title: "Recibido", subtitle: "0.0100 BTC", date: "Hoy", value: "+412.50 €", status: "Confirmado" },
    { type: "send", title: "Enviado", subtitle: "0.20 ETH", date: "Ayer", value: "-448.00 €", status: "Confirmado" },
  ];

  const formatEUR = (num) => {
    if (isNaN(num)) return "0,00 €";
    return Number(num).toFixed(2).replace(".", ",") + " €";
  };

  const trend = (variation24h >= 0) ? {
    colour: COLORS.primaryDark,
    bg: "rgba(43,238,121,0.10)",
    icon: "trending-up"
  } : {
    colour: COLORS.danger,
    bg: "rgba(255,92,92,0.10)",
    icon: "trending-down"
  };

  return (
    <SafeAreaView style={common.safe || styles.safe}>
      <View style={[styles.blob, styles.blobTop]} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* CABECERA Y BIENVENIDA */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Hola, {user?.firstName || 'Usuario'}</Text>
            <Text style={styles.miniInfo}>Última actualización: {hideBalance ? "••:••" : lastUpdate}</Text>
          </View>

          <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
            <MaterialIcons name={hideBalance ? "visibility-off" : "visibility"} size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* TARJETA DE SALDO BLOCKCHAIN REAL */}
        <View style={styles.balanceCardMain}>
            <LinearGradient colors={[COLORS.primarySoft, "transparent"]} style={styles.balanceGlow} />
            <Text style={styles.balanceLabel}>Saldo en Ethereum (Red Sepolia)</Text>
            <View style={styles.balanceRowTop}>
                <Text style={styles.balanceValue}>
                    {hideBalance ? "••••" : `${ethBalance} ETH`}
                </Text>
                <View style={[styles.pill, { backgroundColor: trend.bg, borderColor: 'transparent' }]}>
                    <MaterialIcons name={trend.icon} size={16} color={trend.colour} />
                    <Text style={[styles.pillText, { color: trend.colour }]}>
                        {hideBalance ? "••%" : `${variation24h}%`}
                    </Text>
                </View>
            </View>
            <Text style={styles.addressSub}>
                {user?.walletAddress 
                    ? `${user.walletAddress.substring(0, 8)}...${user.walletAddress.substring(36)}`
                    : "Generando dirección..."}
            </Text>
        </View>

        {/* SECCIÓN DE ACTIVOS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tus Activos</Text>
          {assets.map((a, index) => (
            <View key={a.symbol} style={styles.assetRow}>
              <View style={styles.assetLeft}>
                <View style={styles.coinBadge}><Text style={styles.coinBadgeText}>{a.symbol}</Text></View>
                <View>
                  <Text style={styles.assetName}>{a.name}</Text>
                  <Text style={styles.assetSub}>{hideBalance ? "•••" : `${a.amount} ${a.symbol}`}</Text>
                </View>
              </View>
              {index !== assets.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* SECCIÓN DE MOVIMIENTOS */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Movimientos recientes</Text>
          {movements.map((m, index) => (
            <View key={index} style={styles.movRow}>
              <View style={styles.movLeft}>
                <View style={styles.movIconWrap}>
                   <MaterialIcons name={m.type === "receive" ? "south-west" : "north-east"} size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.movHeaderRow}>
                    <Text style={styles.movTitle}>{m.title}</Text>
                    <Text style={styles.movValueInline}>{hideBalance ? "••••" : m.value}</Text>
                  </View>
                  <Text style={styles.movSub}>{m.subtitle} · {m.date}</Text>
                </View>
              </View>
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
  safe: { flex: 1, backgroundColor: "#102217" },
  scrollContainer: { padding: 20 },
  loaderContainer: { flex: 1, backgroundColor: '#102217', justifyContent: 'center', alignItems: 'center' },
  
  blob: { position: "absolute", width: 500, height: 500, backgroundColor: "rgba(43,238,121,0.05)", borderRadius: 999, top: -200, right: -200 },
  
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  welcome: { color: "#fff", fontSize: 26, fontWeight: "800" },
  miniInfo: { color: COLORS.textMuted, fontSize: 12, marginTop: 4 },
  
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1c2720", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#3b5445" },

  balanceCardMain: { backgroundColor: "#1c2720", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#3b5445", marginBottom: 24, overflow: "hidden" },
  balanceGlow: { position: "absolute", top: 0, height: 100, left: 0, right: 0 },
  balanceLabel: { color: "#9db9a8", fontSize: 13, textTransform: "uppercase", letterSpacing: 1 },
  balanceRowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  balanceValue: { color: "#fff", fontSize: 32, fontWeight: "900" },
  
  pill: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
  
  addressSub: { color: "rgba(157,185,168,0.4)", fontSize: 11, marginTop: 15, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  card: { backgroundColor: "#1c2720", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#3b5445" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 15 },
  
  assetRow: { paddingVertical: 12 },
  assetLeft: { flexDirection: "row", alignItems: "center" },
  coinBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(43,238,121,0.1)", alignItems: "center", justifyContent: "center", marginRight: 15 },
  coinBadgeText: { color: "#2bee79", fontWeight: "bold" },
  assetName: { color: "#fff", fontWeight: "600" },
  assetSub: { color: "#9db9a8", fontSize: 13 },
  
  divider: { height: 1, backgroundColor: "#3b5445", marginTop: 12 },

  movRow: { marginBottom: 15 },
  movLeft: { flexDirection: "row", alignItems: "center" },
  movIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(43,238,121,0.1)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  movHeaderRow: { flexDirection: "row", justifyContent: "space-between", flex: 1 },
  movTitle: { color: "#fff", fontWeight: "600" },
  movValueInline: { color: "#fff", fontWeight: "bold" },
  movSub: { color: "#9db9a8", fontSize: 12, marginTop: 2 }
});

export default Billetera;