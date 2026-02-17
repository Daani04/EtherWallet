import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Platform, SafeAreaView, ActivityIndicator } from "react-native";
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

  // ESTADO PARA LA RESPUESTA DEL BACKEND
  const [portfolio, setPortfolio] = useState({
    totalBalanceEur: 0,
    assets: []
  });
  const [loadingBalance, setLoadingBalance] = useState(true);

  useEffect(() => {
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setScreenW(window.width);
    });
    return () => { if (sub && sub.remove) sub.remove(); };
  }, []);

  useEffect(() => {
    const d = new Date();
    setLastUpdate(String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"));
  }, []);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (user && user.walletAddress) {
        try {
          // URL actualizada al nuevo endpoint de Portfolio
          const url = `http://10.10.6.45:8080/api/blockchain/portfolio/${user.walletAddress}`;
          
          console.log("Consultando Portfolio real a:", url);
          const response = await fetch(url);

          if (!response.ok) throw new Error("Error en la respuesta del servidor");

          const data = await response.json();
          setPortfolio(data); // Guardamos el objeto completo (total + lista assets)
        } catch (error) {
          console.error("Error al obtener portfolio:", error);
        } finally {
          setLoadingBalance(false);
        }
      }
    };

    if (isLogged) fetchPortfolio();
  }, [user, isLogged]);

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
        
        {/* CABECERA */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.welcome}>Hola, {user?.firstName || 'Usuario'}</Text>
            <Text style={styles.miniInfo}>Actualizado: {hideBalance ? "••:••" : lastUpdate}</Text>
          </View>
          <Pressable onPress={() => setHideBalance(!hideBalance)} style={styles.iconBtn}>
            <MaterialIcons name={hideBalance ? "visibility-off" : "visibility"} size={22} color={COLORS.textMuted} />
          </Pressable>
        </View>

        {/* TARJETA DE SALDO TOTAL (EUROS) */}
        <View style={styles.balanceCardMain}>
          <LinearGradient colors={[COLORS.primarySoft, "transparent"]} style={styles.balanceGlow} />
          <Text style={styles.balanceLabel}>Balance Total Estimado</Text>
          <View style={styles.balanceRowTop}>
            <Text style={styles.balanceValue}>
              {hideBalance ? "•••• €" : `${portfolio.totalBalanceEur.toFixed(2)} €`}
            </Text>
          </View>
          <Text style={styles.addressSub}>
            {user?.walletAddress ? `${user.walletAddress.substring(0, 12)}...` : "Sin dirección"}
          </Text>
        </View>

        {/* SECCIÓN DE ACTIVOS REALES (Solo los que devuelve el back) */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tus Activos en Cartera</Text>
          {portfolio.assets.length > 0 ? (
            portfolio.assets.map((asset, index) => (
              <View key={asset.symbol}>
                <View style={styles.assetRow}>
                  <View style={styles.assetLeft}>
                    <View style={styles.coinBadge}>
                      <Text style={styles.coinBadgeText}>{asset.symbol.substring(0, 3)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.assetName}>{asset.name}</Text>
                      <Text style={styles.assetSub}>
                        {hideBalance ? "•••" : `${asset.cryptoAmount} ${asset.symbol}`}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.assetValueEur}>
                        {hideBalance ? "•••" : `${asset.valueEur.toFixed(2)} €`}
                      </Text>
                      <Text style={[styles.assetChange, { color: asset.change24h.includes('-') ? '#ff5c5c' : '#2bee79' }]}>
                        {asset.change24h}
                      </Text>
                    </View>
                  </View>
                </View>
                {index !== portfolio.assets.length - 1 && <View style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noAssets}>No se encontraron activos con saldo.</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <Nav />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Mantenemos la mayoría de tus estilos, pero añadimos/ajustamos algunos)
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
  addressSub: { color: "rgba(157,185,168,0.4)", fontSize: 11, marginTop: 15 },
  card: { backgroundColor: "#1c2720", borderRadius: 20, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: "#3b5445" },
  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 15 },
  assetRow: { paddingVertical: 12 },
  assetLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  coinBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(43,238,121,0.1)", alignItems: "center", justifyContent: "center", marginRight: 15 },
  coinBadgeText: { color: "#2bee79", fontWeight: "bold", fontSize: 10 },
  assetName: { color: "#fff", fontWeight: "600" },
  assetSub: { color: "#9db9a8", fontSize: 13 },
  assetValueEur: { color: "#fff", fontWeight: "700", fontSize: 15 },
  assetChange: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#3b5445" },
  noAssets: { color: "#9db9a8", textAlign: 'center', marginVertical: 20 }
});

export default Billetera;