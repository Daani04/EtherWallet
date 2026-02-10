import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Platform,
    Dimensions,
    SafeAreaView
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Nav from "../../components/Nav"; 

const Billetera = (props) => {
    const [ocultarSaldo, setOcultarSaldo] = useState(false);
    const [screenW, setScreenW] = useState(Dimensions.get("window").width);

    useEffect(() => {
        const sub = Dimensions.addEventListener("change", ({ window }) => {
            setScreenW(window.width);
        });
        return () => {
            if (sub && sub.remove) sub.remove();
        };
    }, []);

    // ====== Responsive ======
    const esWeb = Platform.OS === "web";
    const esPC = esWeb && screenW >= 900;

    let titleSize = esPC ? 30 : 28;
    let balanceSize = esPC ? 34 : 32;
    let padH = esPC ? 28 : 24;
    let cardPad = esPC ? 20 : 18;

    // ====== Datos demo ======
    const saldoTotal = 2450.35;
    const variacion24h = 3.42;

    const activos = [
        { symbol: "BTC", name: "Bitcoin", amount: 0.0324, valueEUR: 1336.5, change24h: 2.1 },
        { symbol: "ETH", name: "Ethereum", amount: 0.54, valueEUR: 1209.8, change24h: -1.3 },
        { symbol: "SOL", name: "Solana", amount: 18.2, valueEUR: 178.9, change24h: 5.7 },
        { symbol: "USDT", name: "Tether", amount: 420.0, valueEUR: 420.0, change24h: 0.0 },
    ];

    const movimientos = [
        { type: "receive", title: "Recibido", subtitle: "0.0100 BTC", date: "Hoy", value: "+412.50 €" },
        { type: "send", title: "Enviado", subtitle: "0.20 ETH", date: "Ayer", value: "-448.00 €" },
        { type: "swap", title: "Swap", subtitle: "SOL → USDT", date: "Hace 3 días", value: "+120.00 €" },
    ];

    // ====== Helpers ======
    const formatEUR = (num) => {
        let s = Number(num).toFixed(2);
        s = s.replace(".", ",");
        return s + " €";
    };

    const saldoTexto = ocultarSaldo ? "•••••" : formatEUR(saldoTotal);
    const sube = variacion24h >= 0;

    const colorTrend = sube ? COLORS.primary : "#ff6b6b";
    const bordeTrend = sube ? "rgba(43,238,121,0.35)" : "rgba(255,107,107,0.35)";
    const fondoTrend = sube ? "rgba(43,238,121,0.08)" : "rgba(255,107,107,0.07)";
    const textoVariacion = ocultarSaldo ? "•••" : (sube ? "+" : "") + variacion24h.toFixed(2) + "%";

    const iconMovimiento = (tipo) => {
        if (tipo === "receive") return "south-west";
        if (tipo === "send") return "north-east";
        return "swap-horiz";
    };

    // ====== Estilos dinámicos ======
    const dyn = {
        safeWeb: esWeb ? { height: "100vh" } : {},
        container: { paddingHorizontal: padH },
        title: { fontSize: titleSize },
        balanceValue: { fontSize: balanceSize },
        balanceCard: { padding: cardPad },
        twoCols: esPC ? { flexDirection: "row", gap: 14, alignItems: "flex-start" } : { flexDirection: "column" },
        col: esPC ? { flex: 1 } : { width: "100%" },
    };

    return (
        <View style={[styles.safe, dyn.safeWeb]}>
            {/* Blobs de fondo (ahora fijos) */}
            <View style={[styles.blob, styles.blobTopRight]} />
            <View style={[styles.blob, styles.blobBottomLeft]} />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContainer}
                bounces={true}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.container, dyn.container]}>
                    {/* Header */}
                    <View style={styles.topRow}>
                        <View>
                            <Text style={styles.kicker}>Billetera</Text>
                            <Text style={[styles.title, dyn.title]}>Tu cartera segura</Text>
                        </View>

                        <Pressable
                            onPress={() => setOcultarSaldo(!ocultarSaldo)}
                            style={styles.iconBtn}
                        >
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
                            colors={["rgba(43,238,121,0.18)", "rgba(16,34,23,0.0)"]}
                            locations={[0, 1]}
                            style={styles.balanceGlow}
                        />
                        <Text style={styles.balanceLabel}>Balance total</Text>
                        <View style={styles.balanceRow}>
                            <Text style={[styles.balanceValue, dyn.balanceValue]}>{saldoTexto}</Text>
                            <View style={[styles.pill, { borderColor: bordeTrend, backgroundColor: fondoTrend }]}>
                                <MaterialIcons name={sube ? "trending-up" : "trending-down"} size={16} color={colorTrend} />
                                <Text style={[styles.pillText, { color: colorTrend }]}>{textoVariacion}</Text>
                            </View>
                        </View>
                        <Text style={styles.balanceSub}>
                            {ocultarSaldo ? "Últimas 24h" : "Últimas 24h · variación estimada"}
                        </Text>
                    </View>

                    {/* Contenido principal */}
                    <View style={[styles.twoColsWrap, dyn.twoCols]}>
                        <View style={dyn.col}>
                            <View style={styles.sectionRow}>
                                <Text style={styles.sectionTitle}>Activos</Text>
                            </View>
                            <View style={styles.card}>
                                {activos.map((a, index) => (
                                    <View key={a.symbol} style={styles.assetRow}>
                                        <View style={styles.assetLeft}>
                                            <View style={styles.coinBadge}><Text style={styles.coinBadgeText}>{a.symbol}</Text></View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.assetName}>{a.name}</Text>
                                                <Text style={styles.assetSub}>{ocultarSaldo ? "•••" : `${a.amount} ${a.symbol}`}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.assetRight}>
                                            <Text style={styles.assetValue}>{ocultarSaldo ? "••••" : formatEUR(a.valueEUR)}</Text>
                                            <Text style={[styles.assetChange, { color: a.change24h >= 0 ? COLORS.primary : "#ff6b6b" }]}>
                                                {ocultarSaldo ? "•••" : (a.change24h >= 0 ? "+" : "") + a.change24h + "%"}
                                            </Text>
                                        </View>
                                        {index !== activos.length - 1 && <View style={styles.divider} />}
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={dyn.col}>
                            <View style={[styles.sectionRow, !esPC && { marginTop: 18 }]}>
                                <Text style={styles.sectionTitle}>Movimientos</Text>
                            </View>
                            <View style={styles.card}>
                                {movimientos.map((m, index) => (
                                    <View key={m.type + "-" + index} style={styles.movRow}>
                                        <View style={styles.movLeft}>
                                            <View style={styles.movIconWrap}>
                                                <MaterialIcons name={iconMovimiento(m.type)} size={20} color={COLORS.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.movTitle}>{m.title}</Text>
                                                <Text style={styles.movSub}>{m.subtitle} · {m.date}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.movValue}>{ocultarSaldo ? "••••" : m.value}</Text>
                                        {index !== movimientos.length - 1 && <View style={styles.divider} />}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Espaciado para que el Nav no tape nada */}
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Nav fijo al fondo */}
            <Nav />
        </View>
    );
};

const COLORS = {
    primary: "#2bee79",
    backgroundDark: "#102217",
    inputBg: "#1c2720",
    border: "#3b5445",
    textMuted: "#9db9a8",
    textMutedSoft: "rgba(255,255,255,0.6)",
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.backgroundDark },
    blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
    blobTopRight: { width: 400, height: 400, top: -110, right: -120 },
    blobBottomLeft: { width: 300, height: 300, bottom: -60, left: -120 },
    scroll: { flex: 1 },
    scrollContainer: { 
        flexGrow: 1, 
        paddingTop: Platform.OS === 'ios' ? 60 : 20, 
    },
    container: { width: "100%", maxWidth: 980, alignSelf: "center" },
    topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    kicker: { color: COLORS.textMuted, fontSize: 13, letterSpacing: 0.8, textTransform: "uppercase" },
    title: { color: "#fff", fontWeight: "800", marginTop: 4 },
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
    twoColsWrap: { marginTop: 10 },
    sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18, marginBottom: 10 },
    sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
    card: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, overflow: "hidden" },
    divider: { height: 1, backgroundColor: "rgba(59,84,69,0.7)", marginLeft: 16 },
    assetRow: { paddingHorizontal: 16, paddingVertical: 14 },
    assetLeft: { flexDirection: "row", alignItems: "center" },
    coinBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(43,238,121,0.25)",
        backgroundColor: "rgba(43,238,121,0.08)",
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
        borderColor: "rgba(43,238,121,0.25)",
        backgroundColor: "rgba(43,238,121,0.08)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    movTitle: { color: "#fff", fontSize: 15, fontWeight: "900" },
    movSub: { color: COLORS.textMutedSoft, fontSize: 13, marginTop: 2 },
    movValue: { position: "absolute", right: 16, top: 22, color: "#fff", fontSize: 14, fontWeight: "800" },
});

export default Billetera;