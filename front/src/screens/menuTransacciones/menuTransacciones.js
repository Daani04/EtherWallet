import React, { useMemo, useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";

import Nav from "../../components/Nav";
import common from "../../styles/common";
import Context from "../../context/Context";

const BASE_URL = "http://192.168.1.138:8080";

export default function MenuTransacciones({ navigation }) {
  const { t } = useTranslation();
  const { user, isLogged } = useContext(Context);
  const { C } = useSettings();

  const styles = useMemo(() => makeStyles(C), [C]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false); 
  const [transactions, setTransactions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [senderPrivKey, setSenderPrivKey] = useState("");

  const fetchTransactions = useCallback(async () => {
    if (!user?.userId || !isLogged) return;
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/blockchain/MyTransactions/${user.userId}`);
      if (response.ok) {
        const data = await response.json();
        const sorted = Array.isArray(data)
          ? data.sort((a, b) => new Date(b.date) - new Date(a.date))
          : [];
        setTransactions(sorted);
      }
    } catch (error) {
      console.warn(t("transactions.errors.fetchTransactions"), error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, isLogged, t]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return transactions;
    return transactions.filter(tx =>
      tx.receiverId?.toLowerCase().includes(q) ||
      tx.senderId?.toLowerCase().includes(q)
    );
  }, [search, transactions]);

  // Cálculos de Insights Financieros
  const { totalIn, totalOut } = useMemo(() => {
     let inAmount = 0;
     let outAmount = 0;
     transactions.forEach(tx => {
         if (tx.senderId === user?.userId) {
             outAmount += parseFloat(tx.amount || 0);
         } else {
             inAmount += parseFloat(tx.amount || 0);
         }
     });
     return { totalIn: inAmount, totalOut: outAmount };
  }, [transactions, user]);

  const totalVolume = totalIn + totalOut;
  const inWidth = totalVolume > 0 ? (totalIn / totalVolume) * 100 : 50;
  const outWidth = totalVolume > 0 ? (totalOut / totalVolume) * 100 : 50;

  const handleTransfer = async () => {
    if (!walletAddress || !amount || !senderPrivKey) {
      Alert.alert(t("common.error"), t("transactions.alerts.fillAllFields"));
      return;
    }

    setSending(true); 

    try {
      const res = await fetch(`${BASE_URL}/api/blockchain/Transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.userId,
          receiverId: walletAddress,
          amount: parseFloat(amount),
          crypto: "ETH",
          type: "TRANSFER",
          privateKey: senderPrivKey,
        }),
      });

      if (res.ok) {
        Alert.alert(t("transactions.alerts.successTitle"), t("transactions.alerts.transferOk"));
        setModalVisible(false);
        setWalletAddress("");
        setAmount("");
        setSenderPrivKey("");
        fetchTransactions();
      } else {
        const msg = await res.text();
        Alert.alert(t("common.error"), msg || t("transactions.alerts.transactionError"));
      }
    } catch (e) {
      Alert.alert(t("common.error"), t("transactions.alerts.serverError"));
    } finally {
      setSending(false);
    }
  };

  const renderContent = () => (
    <View style={styles.flex1}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={22} color={C.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("transactions.headerTitle")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Panel de Estadísticas Mensuales / Insights */}
        <Text style={[styles.sectionTitle, {marginTop: 10}]}>{t("newFeatures.overview")}</Text>
        <View style={styles.insightCard}>
            <LinearGradient
                colors={["rgba(168, 85, 247, 0.15)", "transparent"]}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.insightRow}>
                <View style={styles.insightBox}>
                    <View style={[styles.insightIcon, {backgroundColor: 'rgba(34,197,94,0.1)'}]}>
                       <MaterialIcons name="arrow-downward" size={16} color="#22C55E" />
                    </View>
                    <View>
                        <Text style={styles.insightLabel}>{t("newFeatures.totalReceived")}</Text>
                        <Text style={[styles.insightValue, {color: "#22C55E"}]}>+{totalIn.toFixed(4)} ETH</Text>
                    </View>
                </View>

                <View style={styles.insightBox}>
                    <View style={[styles.insightIcon, {backgroundColor: 'rgba(239,68,68,0.1)'}]}>
                       <MaterialIcons name="arrow-upward" size={16} color="#EF4444" />
                    </View>
                    <View>
                        <Text style={styles.insightLabel}>{t("newFeatures.totalSent")}</Text>
                        <Text style={[styles.insightValue, {color: "#EF4444"}]}>-{totalOut.toFixed(4)} ETH</Text>
                    </View>
                </View>
            </View>
            
            {/* Gráfica de Barras Horizontal */}
            <View style={styles.barGraphContainer}>
                <View style={[styles.barIn, {width: `${inWidth}%`}]} />
                <View style={[styles.barOut, {width: `${outWidth}%`}]} />
            </View>
        </View>

        <Text style={styles.sectionTitle}>{t("transactions.sections.quickActions")}</Text>
        <TouchableOpacity style={styles.actionCard} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <LinearGradient
              colors={[C.primary, C.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionIcon}
          >
              <Feather name="send" size={20} color="#FFF" />
          </LinearGradient>
          <View style={styles.flex1}>
            <Text style={styles.actionTitle}>{t("transactions.sendFunds.title")}</Text>
            <Text style={styles.actionSub}>{t("transactions.sendFunds.subtitle")}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={C.textMuted} />
        </TouchableOpacity>

        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={C.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t("transactions.searchPlaceholder")}
            placeholderTextColor={C.textMuted}
            style={styles.searchInput}
          />
        </View>

        <Text style={styles.sectionTitle}>{t("transactions.sections.recentMovements")}</Text>
        <View style={styles.listCard}>
          {loading ? (
            <ActivityIndicator color={C.primary} style={styles.loader} />
          ) : filteredTransactions.length === 0 ? (
            <Text style={styles.emptyText}>{t("transactions.empty.noTransactions")}</Text>
          ) : (
            filteredTransactions.map((tx, idx) => {
              const isSend = tx.senderId === user?.userId;
              return (
                <View key={idx} style={[styles.txRow, idx !== 0 && styles.txBorder]}>
                  <View style={[styles.txIconCircle, { backgroundColor: isSend ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)' }]}>
                    <MaterialIcons
                      name={isSend ? "north-east" : "south-west"}
                      size={20}
                      color={isSend ? "#EF4444" : "#22C55E"}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>
                      {isSend ? t("transactions.movement.sent") : t("transactions.movement.received")}
                    </Text>
                    <Text style={styles.txWallet} numberOfLines={1}>
                      {isSend
                        ? `${t("transactions.movement.to")}: ${tx.receiverId}`
                        : `${t("transactions.movement.from")}: ${tx.senderId}`}
                    </Text>
                    <Text style={styles.txDate}>
                      {tx.date ? new Date(tx.date).toLocaleDateString() : t("transactions.movement.recent")}
                    </Text>
                  </View>
                  <Text style={[styles.txAmount, { color: isSend ? "#EF4444" : "#22C55E" }]}>
                    {isSend ? "-" : "+"}{tx.amount} ETH
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal Modernizado */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
               <View style={styles.modalIconWrap}>
                   <Feather name="send" size={24} color={C.primary} />
               </View>
               <Text style={styles.modalTitle}>{t("transactions.modal.title")}</Text>
            </View>

            <Text style={styles.modalLabel}>{t("transactions.modal.destinationAddress")}</Text>
            <View style={styles.modalInputWrap}>
                <TextInput
                  placeholder={t("transactions.modal.placeholders.destination")}
                  style={styles.modalInput}
                  value={walletAddress}
                  onChangeText={setWalletAddress}
                  placeholderTextColor={C.textMuted}
                  autoCapitalize="none"
                  editable={!sending}
                />
            </View>

            <Text style={styles.modalLabel}>{t("transactions.modal.amount")}</Text>
            <View style={styles.modalInputWrap}>
                <TextInput
                  placeholder={t("transactions.modal.placeholders.amount")}
                  keyboardType="numeric"
                  style={styles.modalInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor={C.textMuted}
                  editable={!sending}
                />
                <Text style={styles.currencyTag}>ETH</Text>
            </View>

            <Text style={styles.modalLabel}>{t("transactions.modal.privateKey")}</Text>
            <View style={styles.modalInputWrap}>
                <TextInput
                  placeholder={t("transactions.modal.placeholders.privateKey")}
                  secureTextEntry
                  style={styles.modalInput}
                  value={senderPrivKey}
                  onChangeText={setSenderPrivKey}
                  placeholderTextColor={C.textMuted}
                  editable={!sending}
                />
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, sending && styles.btnDisabled]}
              onPress={handleTransfer}
              disabled={sending}
            >
              <LinearGradient colors={[C.primary, C.primaryDark]} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.confirmBtnGradient}>
                  {sending ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.confirmBtnText}>{t("transactions.modal.confirm")}</Text>
                  )}
              </LinearGradient>
            </TouchableOpacity>

            {!sending && (
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{t("transactions.modal.close")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
      <View style={[styles.flex1, { backgroundColor: C.bg }]}>
          <SafeAreaView style={{ flex: 1 }}>
              {renderContent()}
          </SafeAreaView>
          <View style={styles.mobileNavFixed}>
              <Nav />
          </View>
      </View>
    );
  }

const makeStyles = (C) => StyleSheet.create({
  flex1: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: C.textMain
  },
  headerSpacer: {
    width: 44
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 120
  },
  insightCard: {
      backgroundColor: C.cardBg,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      marginBottom: 10
  },
  insightRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20
  },
  insightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
  },
  insightIcon: {
      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'
  },
  insightLabel: {
      fontSize: 12, color: C.textMuted, fontWeight: "700"
  },
  insightValue: {
      fontSize: 16, fontWeight: "900", marginTop: 2
  },
  barGraphContainer: {
      height: 8,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: 4,
      flexDirection: 'row',
      overflow: 'hidden'
  },
  barIn: {
      backgroundColor: "#22C55E", height: "100%"
  },
  barOut: {
      backgroundColor: "#EF4444", height: "100%"
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginTop: 20,
    borderWidth: 1,
    borderColor: C.border
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: C.textMain,
    fontSize: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: C.textMain,
    marginTop: 25,
    marginBottom: 15
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primary,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTitle: {
    marginLeft: 15,
    fontWeight: '800',
    color: C.textMain,
    fontSize: 16
  },
  actionSub: {
    marginLeft: 15,
    color: C.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  listCard: {
    backgroundColor: C.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden'
  },
  loader: {
    margin: 30
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18
  },
  txBorder: {
    borderTopWidth: 1,
    borderTopColor: C.border
  },
  txIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  txInfo: {
    flex: 1,
    marginLeft: 15
  },
  txTitle: {
    fontWeight: '800',
    color: C.textMain,
    fontSize: 15
  },
  txWallet: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  txDate: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2
  },
  txAmount: {
    fontWeight: '900',
    fontSize: 16
  },
  emptyText: {
    textAlign: 'center',
    padding: 50,
    color: C.textMuted,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: C.cardBg,
    borderRadius: 35,
    padding: 28,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.primary,
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 20
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 30
  },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(168, 85, 247, 0.15)",
    alignItems: 'center', justifyContent: 'center', marginBottom: 15
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: C.textMain,
    textAlign: 'center'
  },
  modalLabel: {
    color: C.textMuted,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: "uppercase"
  },
  modalInputWrap: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  modalInput: {
    flex: 1,
    height: 56,
    color: C.textMain,
    fontSize: 16,
    fontWeight: "600"
  },
  currencyTag: {
    color: C.primary,
    fontWeight: "900",
    fontSize: 16
  },
  confirmBtn: {
    marginTop: 10,
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5
  },
  confirmBtnGradient: {
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 17
  },
  btnDisabled: {
    opacity: 0.6
  },
  cancelBtn: {
    marginTop: 20,
    padding: 10
  },
  cancelBtnText: {
    color: C.textMuted,
    textAlign: 'center',
    fontWeight: '700'
  },
  mobileNavFixed: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0
  }
});