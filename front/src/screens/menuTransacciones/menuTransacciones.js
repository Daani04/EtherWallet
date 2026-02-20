import React, { useMemo, useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";

import Nav from "../../components/Nav";
import common from "../../styles/common";
import theme from "../../styles/theme";
import Context from "../../context/Context";

const BREAKPOINT_MD = 768;
const BASE_URL = "http://10.10.6.84:8080";

const THEME = theme?.colors || theme?.COLORS || theme || {};
const NAV_HEIGHT = 90;
const isWeb = Platform.OS === "web";


export default function MenuTransacciones({ navigation }) {
  const { t } = useTranslation();
  const { user } = useContext(Context);
  const { C } = useSettings();

  const COLORS = useMemo(
  () => ({
    primary: C.primary,
    bg: C.bg,
    cardBg: C.cardBg,
    inputBg: C.inputBg,
    border: C.border,
    textMain: C.textMain,
    textMuted: C.textMuted,
    textMutedSoft: C.isDark ? "rgba(255,255,255,0.6)" : "rgba(15,23,42,0.6)",
    danger: C.danger,
  }),
  [C]
);

const styles = useMemo(() => createStyles(COLORS), [COLORS]);

  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT_MD;

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [senderPrivKey, setSenderPrivKey] = useState("");
  const [cryptoSymbol] = useState("ETH");

  const goBack = () => navigation.goBack();
  const goToScreen = (name, params) => navigation.navigate(name, params);

  const normalize = (txt) => String(txt || "").toLowerCase();
  const hasQuery = () => search && search.trim().length > 0;
  const clearSearch = () => setSearch("");

  const recentRecipients = useMemo(
    () => [
      { id: "1", initials: "CF", name: "Carlos Fernández Bou" },
      { id: "2", initials: "AM", name: "Ana Martínez" },
      { id: "3", initials: "JP", name: "Juan Pérez" },
    ],
    []
  );

  const filteredRecipients = useMemo(() => {
    if (!hasQuery()) return recentRecipients;
    const q = normalize(search);
    return recentRecipients.filter((r) => normalize(r.name).includes(q));
  }, [search, recentRecipients]);

  const fetchTransactions = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/blockchain/MyTransactions/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        setTransactions(sorted);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const filteredTransactions = useMemo(() => {
    if (!hasQuery()) return transactions;
    const q = normalize(search);

    return transactions.filter((tx) => {
      const dir = tx?.senderId === user?.userId ? "envio" : "recibido";
      const a = normalize(dir).includes(q);
      const b = normalize(tx?.receiverId).includes(q);
      const c = normalize(tx?.senderId).includes(q);
      const d = normalize(tx?.crypto).includes(q);
      return a || b || c || d;
    });
  }, [search, transactions, user?.userId]);

  const handleTransfer = async () => {
    if (!user?.userId) {
      Alert.alert("Error", "No hay usuario logueado");
      return;
    }

    if (!walletAddress || !amount || !senderPrivKey) {
      Alert.alert("Error", "Rellena todos los campos, incluida tu clave privada");
      return;
    }

    try {
      const newTransaction = {
        senderId: user.userId,
        receiverId: walletAddress,
        amount: parseFloat(amount),
        crypto: String(cryptoSymbol).toUpperCase(),
        type: "TRANSFER",
        privateKey: senderPrivKey,
      };

      const response = await fetch(`${BASE_URL}/api/blockchain/Transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        Alert.alert("Éxito", "Transferencia firmada y enviada a Sepolia");
        setModalVisible(false);
        setWalletAddress("");
        setAmount("");
        setSenderPrivKey("");
        fetchTransactions();
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg || "Fondos insuficientes o clave incorrecta");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error de conexión con el servidor");
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && styles.headerDesktop]}>
      <TouchableOpacity onPress={goBack} style={styles.iconBtn} activeOpacity={0.85}>
        <MaterialIcons name="arrow-back" size={22} color={COLORS.textMain} />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, isDesktop && styles.headerTitleDesktop]}>
        {t("transactions.headerTitle")}
      </Text>

      <TouchableOpacity
        onPress={() => goToScreen("AyudaTransacciones")}
        style={styles.iconBtn}
        activeOpacity={0.85}
      >
        <MaterialIcons name="help-outline" size={22} color={COLORS.textMain} />
      </TouchableOpacity>
    </View>
  );

  const renderSearch = () => (
    <View style={styles.searchWrap}>
      <MaterialIcons name="search" size={20} color={COLORS.textMutedSoft} />
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder={t("transactions.searchPlaceholder")}
        placeholderTextColor={COLORS.textMutedSoft}
        style={styles.searchInput}
      />
      {hasQuery() && (
        <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={styles.clearBtn}>
          <MaterialIcons name="close" size={18} color={COLORS.textMutedSoft} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.actionsGrid}>
      {/* SOLO TRANSFERIR */}
      <TouchableOpacity
        style={styles.actionCard}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.actionIcon}>
          <MaterialIcons name="compare-arrows" size={20} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionTitle}>{t("transactions.quickActions.transfer.title")}</Text>
          <Text style={styles.actionSubtitle}>{t("transactions.quickActions.transfer.subtitle")}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={COLORS.textMutedSoft} />
      </TouchableOpacity>
    </View>
  );

  const renderRecipients = () => (
    <View style={[styles.recipientsWrap, isDesktop && styles.recipientsWrapDesktop]}>
      {filteredRecipients.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.recipientCard}
          activeOpacity={0.85}
          onPress={() => {
            // prefilla el campo para abrir el modal (si luego quieres address real, aquí pondrías r.address)
            setWalletAddress(r.name);
            setModalVisible(true);
          }}
        >
          <View style={styles.recipientInfo}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{r.initials}</Text>
            </View>
            <Text style={styles.recipientName} numberOfLines={1}>
              {r.name}
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.textMutedSoft} />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTransactions = () => (
    <View style={styles.listCard}>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
      ) : filteredTransactions.length === 0 ? (
        <Text style={styles.emptyText}>No hay transacciones</Text>
      ) : (
        filteredTransactions.map((tx, idx) => {
          const isSend = tx?.senderId === user?.userId;

          const iconName = isSend ? "north-east" : "south-west";
          const iconColor = isSend ? COLORS.danger : COLORS.primary;

          const title = isSend ? "Envío" : "Recibido";
          const sub = isSend ? `A: ${tx?.receiverId}` : `De: ${tx?.senderId}`;

          return (
            <View key={tx?.id ?? `${idx}-${tx?.date}`} style={[styles.txRow, idx !== 0 && styles.txRowBorder]}>
              <View style={styles.txIcon}>
                <MaterialIcons name={iconName} size={18} color={iconColor} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.txTitle}>{title}</Text>
                <Text style={styles.txSubtitle} numberOfLines={1}>
                  {sub}
                </Text>
                {!!tx?.date && (
                  <Text style={styles.txSubtitle} numberOfLines={1}>
                    {String(tx.date)}
                  </Text>
                )}
              </View>

              <Text style={[styles.txAmount, isSend ? styles.negative : styles.positive]}>
                {isSend ? "-" : "+"}
                {tx?.amount} {tx?.crypto}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );

  const renderContent = () => (
    <View style={[styles.scroll, isDesktop && styles.scrollDesktop]}>
      {renderHeader()}

      <View style={[styles.container, isDesktop && styles.containerDesktop]}>
        {renderSearch()}

        <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
          {/* LEFT */}
          <View style={[styles.col, isDesktop && styles.leftCol]}>
            <Text style={styles.sectionTitle}>{t("transactions.sections.quickActions")}</Text>
            {renderQuickActions()}

            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>{t("transactions.sections.recentRecipients")}</Text>
              <TouchableOpacity onPress={() => goToScreen("Destinatarios")} activeOpacity={0.85}>
                <Text style={styles.link}>{t("transactions.viewAll")}</Text>
              </TouchableOpacity>
            </View>

            {renderRecipients()}
          </View>

          {/* RIGHT */}
          <View style={[styles.col, isDesktop && styles.rightCol]}>
            <Text style={[styles.sectionTitle, isDesktop && { marginTop: 20 }]}>
              {t("transactions.sections.recentMovements")}
            </Text>

            {renderTransactions()}

            {/* Botón: abre el modal (no navega a pantalla inexistente) */}
            <TouchableOpacity
              style={[styles.primaryBtn, isDesktop && styles.primaryBtnDesktop]}
              activeOpacity={0.9}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.primaryBtnText}>{t("transactions.newTransaction")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 18 }} />
      </View>

      {/* MODAL TRANSFER */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => { }}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Transferencia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <MaterialIcons name="close" size={24} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Tu Clave Privada (Firma)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Pega aquí tu clave privada"
                placeholderTextColor={COLORS.textMutedSoft}
                secureTextEntry
                value={senderPrivKey}
                onChangeText={setSenderPrivKey}
              />

              <Text style={styles.label}>Billetera Destino (Address)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0x..."
                placeholderTextColor={COLORS.textMutedSoft}
                value={walletAddress}
                onChangeText={setWalletAddress}
                autoCapitalize="none"
              />

              <Text style={styles.label}>Cantidad (ETH)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMutedSoft}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={styles.label}>Cripto</Text>
              <TextInput
                value={cryptoSymbol}
                editable={false}
                style={[styles.modalInput, { opacity: 0.6, marginBottom: 18 }]}
              />

              <TouchableOpacity style={styles.confirmBtn} onPress={handleTransfer} activeOpacity={0.9}>
                <Text style={styles.confirmBtnText}>Firmar y Enviar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );

  if (isWeb) {
    return (
      <SafeAreaView style={[common.safe, styles.safe, styles.safeWeb]}>
        <View style={styles.page}>
          <View style={styles.webScroll}>{renderContent()}</View>

          <View style={[styles.navWrap, styles.navWrapWeb]}>
            <Nav />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[common.safe, styles.safe]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: NAV_HEIGHT }} />
      </ScrollView>
      <Nav />
    </SafeAreaView>
  );
}

const createStyles = (COLORS) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.bg },

    // --- WEB SCROLL FIX
    safeWeb: { height: "100vh", overflow: "hidden" },
    page: { flex: 1, position: "relative" },
    webScroll: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: NAV_HEIGHT,
      overflowY: "auto",
      overflowX: "hidden",
    },
    navWrap: {
      left: 0,
      right: 0,
      bottom: 0,
      height: NAV_HEIGHT,
      zIndex: 9999,
    },
    navWrapWeb: { position: "fixed" },

    scroll: { paddingHorizontal: 16, paddingBottom: 20 },
    scrollDesktop: { paddingHorizontal: 24 },

    header: {
      paddingTop: Platform.OS === "ios" ? 56 : 18,
      paddingBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerDesktop: { paddingBottom: 20 },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "900",
      color: COLORS.textMain,
    },
    headerTitleDesktop: { fontSize: 22 },

    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.border,
    },

    container: { width: "100%" },
    containerDesktop: { alignSelf: "center", maxWidth: 1100 },

    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 16,
      paddingHorizontal: 14,
      height: 56,
      marginTop: 6,
      marginBottom: 14,
    },
    searchInput: { flex: 1, color: COLORS.textMain, fontSize: 16 },
    clearBtn: { padding: 6 },

    layout: { marginTop: 6 },
    layoutDesktop: { flexDirection: "row", gap: 20 },

    leftCol: { flex: 1.2 },
    rightCol: { flex: 1 },

    sectionRow: {
      marginTop: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      marginTop: 16,
      marginBottom: 12,
      fontSize: 16,
      fontWeight: "900",
      color: COLORS.textMain,
    },
    link: { color: COLORS.primary, fontWeight: "900" },

    actionsGrid: { gap: 10 },
    actionCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 18,
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    actionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(43,238,121,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },
    actionTitle: { fontSize: 15, fontWeight: "900", color: COLORS.textMain },
    actionSubtitle: { color: COLORS.textMutedSoft, fontSize: 13 },

    recipientsWrap: { gap: 10 },
    recipientCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      borderRadius: 18,
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    recipientInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
    initialsCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    initialsText: { color: COLORS.textMain, fontWeight: "900" },
    recipientName: { color: COLORS.textMain, fontSize: 15, fontWeight: "700", flex: 1 },

    listCard: {
      backgroundColor: COLORS.inputBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
    },
    emptyText: { color: COLORS.textMutedSoft, padding: 16, textAlign: "center", fontWeight: "800" },

    txRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
    txRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
    txIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(43,238,121,0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    txTitle: { color: COLORS.textMain, fontWeight: "800" },
    txSubtitle: { color: COLORS.textMutedSoft, fontSize: 12, marginTop: 2 },
    txAmount: { fontWeight: "900" },
    negative: { color: COLORS.danger },
    positive: { color: COLORS.primary },

    primaryBtn: {
      backgroundColor: COLORS.primary,
      height: 58,
      borderRadius: 29,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
      shadowColor: COLORS.primary,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    primaryBtnText: { color: COLORS.bg, fontSize: 16, fontWeight: "900", letterSpacing: 0.4 },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
    },
    modalContent: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: COLORS.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
    },
    modalHeader: {
      padding: 18,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    modalTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: "900" },
    modalBody: { padding: 18 },
    label: { color: COLORS.textMuted, fontSize: 13, marginBottom: 8, fontWeight: "700" },
    modalInput: {
      backgroundColor: COLORS.inputBg,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderRadius: 12,
      padding: 12,
      color: COLORS.textMain,
      marginBottom: 16,
    },
    confirmBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: "center" },
    confirmBtnText: { color: COLORS.bg, fontWeight: "900", fontSize: 16 },
  });