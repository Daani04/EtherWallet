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
  ActivityIndicator
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; 
import * as SecureStore from "expo-secure-store"; 

import common from "../../styles/common";
import theme from "../../styles/theme";
import Context from '../../context/Context';

const BREAKPOINT_MD = 768;
const BASE_URL = "http://10.10.6.84:8080";

const THEME = theme?.colors || theme?.COLORS || theme || {};
const COLORS = {
  primary: THEME.primary || "#2bee79",
  backgroundDark: THEME.bg || THEME.backgroundDark || "#102217",
  inputBg: THEME.cardBg || THEME.inputBg || "#1c2720",
  border: THEME.border || "#3b5445",
  textMuted: THEME.textMuted || "#9db9a8",
  textMutedSoft: THEME.textSoft || "rgba(255,255,255,0.6)",
  danger: THEME.danger || "#ff5a7a",
};

export default function MenuTransacciones({ navigation }) {
  const { t } = useTranslation(); 
  const { user } = useContext(Context);
  const { width } = useWindowDimensions();
  const isDesktop = width >= BREAKPOINT_MD;

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [senderPrivKey, setSenderPrivKey] = useState(""); // Nuevo estado para la clave manual
  const [cryptoSymbol, setCryptoSymbol] = useState("ETH");

  const fetchTransactions = async () => {
    if (!user?.userId) return;
    try {
      const response = await fetch(`${BASE_URL}/api/blockchain/MyTransactions/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(sorted);
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleTransfer = async () => {
    // Validamos que ahora también incluya la clave privada manual
    if (!walletAddress || !amount || !senderPrivKey) {
      Alert.alert("Error", "Por favor, rellena todos los campos, incluida tu clave privada");
      return;
    }

    try {
      const newTransaction = {
        senderId: user.userId,
        receiverId: walletAddress,
        amount: parseFloat(amount),
        crypto: cryptoSymbol.toUpperCase(),
        type: "TRANSFER",
        privateKey: senderPrivKey // Enviamos la que el usuario escribió a mano
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
        setSenderPrivKey(""); // Limpiamos la clave por seguridad
        fetchTransactions(); 
      } else {
        const errorMsg = await response.text();
        Alert.alert("Error", errorMsg || "Fondos insuficientes o clave incorrecta");
      }
    } catch (error) {
      Alert.alert("Error", "Error de conexión con el servidor");
    }
  };

  const recentRecipients = useMemo(() => [
    { id: "1", initials: "CF", name: "Carlos Fernández Bou" },
    { id: "2", initials: "AM", name: "Ana Martínez" },
    { id: "3", initials: "JP", name: "Juan Pérez" },
  ], []);

  return (
    <View style={[common.safe, styles.safe]}>
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDesktop && styles.headerTitleDesktop]}>
          {t("transactions.headerTitle")}
        </Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.container, isDesktop && styles.containerDesktop]}>
          <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
            <View style={styles.leftCol}>
              <Text style={styles.sectionTitle}>{t("transactions.sections.quickActions")}</Text>
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

              <Text style={styles.sectionTitle}>{t("transactions.sections.recentRecipients")}</Text>
              <View style={styles.recipientsWrap}>
                {recentRecipients.map((r) => (
                  <TouchableOpacity 
                    key={r.id} 
                    style={styles.recipientCard} 
                    onPress={() => { setWalletAddress(r.name); setModalVisible(true); }}
                  >
                    <View style={styles.recipientInfo}>
                        <View style={styles.initialsCircle}>
                          <Text style={styles.initialsText}>{r.initials}</Text>
                        </View>
                        <Text style={styles.recipientName}>{r.name}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={COLORS.textMutedSoft} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.rightCol}>
              <Text style={styles.sectionTitle}>{t("transactions.sections.recentMovements")}</Text>
              <View style={styles.listCard}>
                {loading ? (
                  <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />
                ) : (
                  transactions.map((tx, idx) => (
                    <View key={tx.id} style={[styles.txRow, idx !== 0 && styles.txRowBorder]}>
                      <View style={styles.txIcon}>
                        <MaterialIcons 
                          name={tx.senderId === user?.userId ? "north-east" : "south-west"} 
                          size={18} 
                          color={tx.senderId === user?.userId ? COLORS.danger : COLORS.primary} 
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.txTitle}>{tx.senderId === user?.userId ? "Envío" : "Recibido"}</Text>
                        <Text style={styles.txSubtitle} numberOfLines={1}>
                          {tx.senderId === user?.userId ? `A: ${tx.receiverId}` : `De: ${tx.senderId}`}
                        </Text>
                      </View>
                      <Text style={[styles.txAmount, tx.senderId === user?.userId ? styles.negative : styles.positive]}>
                        {tx.senderId === user?.userId ? "-" : "+"}{tx.amount} {tx.crypto}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Transferencia</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.label}>Tu Clave Privada (Firma)</Text>
              <TextInput 
                style={styles.modalInput} 
                placeholder="Pega aquí tu clave privada" 
                placeholderTextColor={COLORS.textMutedSoft} 
                secureTextEntry={true} // Ocultar clave por seguridad
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
                style={[styles.modalInput, { opacity: 0.6, marginBottom: 30 }]} 
              />
              
              <TouchableOpacity style={styles.confirmBtn} onPress={handleTransfer}>
                <Text style={styles.confirmBtnText}>Firmar y Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (mantenemos tus estilos exactamente iguales)
  safe: { flex: 1, backgroundColor: COLORS.backgroundDark },
  header: { paddingTop: Platform.OS === "ios" ? 56 : 18, paddingHorizontal: 16, paddingBottom: 10, flexDirection: "row", alignItems: "center" },
  headerDesktop: { paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "900", color: "#fff" },
  headerTitleDesktop: { fontSize: 22 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border },
  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  container: { width: "100%" },
  containerDesktop: { alignSelf: "center", maxWidth: 1100 },
  layout: { marginTop: 10 },
  layoutDesktop: { flexDirection: "row", gap: 20 },
  leftCol: { flex: 1.2 },
  rightCol: { flex: 1 },
  sectionTitle: { marginTop: 20, marginBottom: 12, fontSize: 16, fontWeight: "900", color: "#fff" },
  actionCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 18, backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border },
  actionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(43,238,121,0.1)", alignItems: "center", justifyContent: "center" },
  actionTitle: { fontSize: 15, fontWeight: "900", color: "#fff" },
  actionSubtitle: { color: COLORS.textMutedSoft, fontSize: 13 },
  recipientsWrap: { gap: 10 },
  recipientCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, borderRadius: 18, backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border },
  recipientInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  initialsCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  initialsText: { color: "#fff", fontWeight: "900" },
  recipientName: { color: "#fff", fontSize: 15, fontWeight: "700" },
  listCard: { backgroundColor: COLORS.inputBg, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
  txRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  txIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(43,238,121,0.05)", alignItems: "center", justifyContent: "center" },
  txTitle: { color: "#fff", fontWeight: "700" },
  txSubtitle: { color: COLORS.textMutedSoft, fontSize: 12 },
  txAmount: { fontWeight: "900" },
  negative: { color: COLORS.danger },
  positive: { color: COLORS.primary },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxWidth: 400, backgroundColor: COLORS.backgroundDark, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  modalHeader: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  modalBody: { padding: 20 },
  label: { color: COLORS.textMuted, fontSize: 13, marginBottom: 8, fontWeight: "700" },
  modalInput: { backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, color: "#fff", marginBottom: 20 },
  confirmBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 14, alignItems: "center" },
  confirmBtnText: { color: COLORS.backgroundDark, fontWeight: "900", fontSize: 16 }
});