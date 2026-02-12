import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const BREAKPOINT_MD = 768;
const BREAKPOINT_LG = 1100;

const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  inputBg: "#1c2720",
  border: "#3b5445",
  textMuted: "#9db9a8",
  textMutedSoft: "rgba(255,255,255,0.6)",
};

export default function MenuTransacciones({ navigation }) {
  const { width } = useWindowDimensions();

  let isDesktop = false;
  if (width >= BREAKPOINT_MD) isDesktop = true;

  let isLarge = false;
  if (width >= BREAKPOINT_LG) isLarge = true;

  const [search, setSearch] = useState("");

  const goToScreen = (screenName, params) => {
    if (!navigation) return;
    if (!navigation.navigate) return;

    if (params) navigation.navigate(screenName, params);
    else navigation.navigate(screenName);
  };

  const goBack = () => {
    if (!navigation) return;
    if (!navigation.goBack) return;
    navigation.goBack();
  };

  const clearSearch = () => {
    setSearch("");
  };

  const showClearButton = () => {
    if (search && search.length > 0) return true;
    return false;
  };

  const quickActions = useMemo(() => {
    return [
      {
        id: "deposit",
        title: "Depositar",
        subtitle: "Añade EUR a tu wallet",
        icon: "south-west",
        onPress: () => goToScreen("Depositar"),
      },
      {
        id: "transfer",
        title: "Transferir",
        subtitle: "A otra cuenta/IBAN",
        icon: "compare-arrows",
        onPress: () => goToScreen("Transferencia"),
      },
      {
        id: "withdraw",
        title: "Retirar",
        subtitle: "A tu banco",
        icon: "north-east",
        onPress: () => goToScreen("Retirar"),
      },
    ];
  }, [navigation]);

  const recentRecipients = useMemo(() => {
    return [
      { id: "1", initials: "CF", name: "Carlos Fernández Bou", favorite: true },
      { id: "2", initials: "AM", name: "Ana Martínez", favorite: false },
      { id: "3", initials: "JP", name: "Juan Pérez", favorite: false },
    ];
  }, []);

  const transactions = useMemo(() => {
    return [
      { id: "t1", type: "Transferencia", to: "Carlos Fernández Bou", amount: -25.5, date: "Hoy" },
      { id: "t2", type: "Depósito", to: "Wallet EUR", amount: 150, date: "Ayer" },
      { id: "t3", type: "Retiro", to: "Banco", amount: -60, date: "05/02" },
    ];
  }, []);

  const normalize = (txt) => {
    return String(txt || "").toLowerCase();
  };

  const hasQuery = () => {
    if (!search) return false;
    if (!search.trim()) return false;
    return true;
  };

  const filteredRecipients = useMemo(() => {
    if (!hasQuery()) return recentRecipients;
    const q = normalize(search);
    return recentRecipients.filter((r) => normalize(r.name).includes(q));
  }, [search, recentRecipients]);

  const filteredTransactions = useMemo(() => {
    if (!hasQuery()) return transactions;
    const q = normalize(search);
    return transactions.filter((t) => {
      const a = normalize(t.type).includes(q);
      const b = normalize(t.to).includes(q);
      if (a || b) return true;
      return false;
    });
  }, [search, transactions]);

  const getHeaderStyle = () => {
    const arr = [styles.header];
    if (isDesktop) arr.push(styles.headerDesktop);
    return arr;
  };

  const getHeaderTitleStyle = () => {
    const arr = [styles.headerTitle];
    if (isDesktop) arr.push(styles.headerTitleDesktop);
    return arr;
  };

  const getScrollStyle = () => {
    const arr = [styles.scroll];
    if (isDesktop) arr.push(styles.scrollDesktop);
    return arr;
  };

  const getContainerStyle = () => {
    const arr = [styles.container];
    if (isDesktop) arr.push(styles.containerDesktop);
    if (isLarge) arr.push(styles.containerLarge);
    return arr;
  };

  const getSearchWrapStyle = () => {
    const arr = [styles.searchWrap];
    if (isDesktop) arr.push(styles.searchWrapDesktop);
    return arr;
  };

  const getLayoutStyle = () => {
    const arr = [styles.layout];
    if (isDesktop) arr.push(styles.layoutDesktop);
    return arr;
  };

  const getLeftColStyle = () => {
    const arr = [styles.col];
    if (isDesktop) arr.push(styles.leftCol);
    return arr;
  };

  const getRightColStyle = () => {
    const arr = [styles.col];
    if (isDesktop) arr.push(styles.rightCol);
    return arr;
  };

  const getRecipientsWrapStyle = () => {
    const arr = [styles.recipientsWrap];
    if (isDesktop) arr.push(styles.recipientsWrapDesktop);
    return arr;
  };

  const getRecipientCardStyle = () => {
    const arr = [styles.recipientCard];
    if (isDesktop) arr.push(styles.recipientCardDesktop);
    return arr;
  };

  const getMovTitleStyle = () => {
    const arr = [styles.sectionTitle];
    if (isDesktop) arr.push({ marginTop: 18 });
    return arr;
  };

  const getPrimaryBtnStyle = () => {
    const arr = [styles.primaryBtn];
    if (isDesktop) arr.push(styles.primaryBtnDesktop);
    return arr;
  };

  const getTxRowStyle = (idx) => {
    const arr = [styles.txRow];
    if (idx !== 0) arr.push(styles.txRowBorder);
    return arr;
  };

  const getTxIconName = (type) => {
    if (type === "Depósito") return "south-west";
    if (type === "Retiro") return "north-east";
    return "compare-arrows";
  };

  const getAmountStyle = (amount) => {
    const arr = [styles.txAmount];
    if (amount < 0) arr.push(styles.negative);
    else arr.push(styles.positive);
    return arr;
  };

  const getFavIconName = (favorite) => {
    if (favorite) return "favorite";
    return "favorite-border";
  };

  const getFavIconColor = (favorite) => {
    if (favorite) return COLORS.primary;
    return COLORS.textMutedSoft;
  };

  const renderClearButton = () => {
    if (!showClearButton()) return null;

    return (
      <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={styles.clearBtn}>
        <MaterialIcons name="close" size={18} color={COLORS.textMutedSoft} />
      </TouchableOpacity>
    );
  };

  const renderQuickActions = () => {
    return quickActions.map((a) => {
      return (
        <TouchableOpacity
          key={a.id}
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={a.onPress}
        >
          <View style={styles.actionIcon}>
            <MaterialIcons name={a.icon} size={20} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>{a.title}</Text>
            <Text style={styles.actionSubtitle}>{a.subtitle}</Text>
          </View>

          <MaterialIcons name="chevron-right" size={22} color={COLORS.textMutedSoft} />
        </TouchableOpacity>
      );
    });
  };

  const renderRecipients = () => {
    return filteredRecipients.map((r) => {
      return (
        <TouchableOpacity
          key={r.id}
          style={getRecipientCardStyle()}
          activeOpacity={0.85}
          onPress={() => goToScreen("Transferencia", { recipientId: r.id })}
        >
          <View style={styles.recipientTop}>
            <View style={styles.initialsCircle}>
              <Text style={styles.initialsText}>{r.initials}</Text>
            </View>

            <TouchableOpacity onPress={() => { }} activeOpacity={0.7} style={styles.favBtn}>
              <MaterialIcons
                name={getFavIconName(r.favorite)}
                size={18}
                color={getFavIconColor(r.favorite)}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.recipientName} numberOfLines={2}>
            {r.name}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  const renderTransactions = () => {
    return filteredTransactions.map((t, idx) => {
      return (
        <View key={t.id} style={getTxRowStyle(idx)}>
          <View style={styles.txIcon}>
            <MaterialIcons name={getTxIconName(t.type)} size={18} color={COLORS.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.txTitle}>{t.type}</Text>
            <Text style={styles.txSubtitle} numberOfLines={1}>
              {t.to} · {t.date}
            </Text>
          </View>

          <Text style={getAmountStyle(t.amount)}>{formatEUR(t.amount)}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.safe}>
      <View style={getHeaderStyle()}>
        <TouchableOpacity onPress={goBack} style={styles.iconBtn} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={getHeaderTitleStyle()}>Transacciones</Text>

        <TouchableOpacity
          onPress={() => goToScreen("AyudaTransacciones")}
          style={styles.iconBtn}
          activeOpacity={0.8}
        >
          <MaterialIcons name="help-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={getScrollStyle()} showsVerticalScrollIndicator={false}>
        <View style={getContainerStyle()}>
          <View style={getSearchWrapStyle()}>
            <MaterialIcons name="search" size={20} color={COLORS.textMutedSoft} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar destinatario o movimiento…"
              placeholderTextColor={COLORS.textMutedSoft}
              style={styles.searchInput}
            />
            {renderClearButton()}
          </View>

          <View style={getLayoutStyle()}>
            <View style={getLeftColStyle()}>
              <Text style={styles.sectionTitle}>Acciones rápidas</Text>

              <View style={styles.actionsGrid}>{renderQuickActions()}</View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Últimos destinatarios</Text>
                <TouchableOpacity onPress={() => goToScreen("Destinatarios")} activeOpacity={0.8}>
                  <Text style={styles.link}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              <View style={getRecipientsWrapStyle()}>{renderRecipients()}</View>
            </View>

            <View style={getRightColStyle()}>
              <Text style={getMovTitleStyle()}>Movimientos recientes</Text>

              <View style={styles.listCard}>{renderTransactions()}</View>

              <TouchableOpacity
                style={getPrimaryBtnStyle()}
                activeOpacity={0.9}
                onPress={() => goToScreen("NuevaTransaccion")}
              >
                <Text style={styles.primaryBtnText}>Nueva transacción</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </View>
  );
}

function formatEUR(value) {
  let sign = "+";
  if (value < 0) sign = "-";

  const abs = Math.abs(value);
  return sign + abs.toFixed(2) + " €";
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundDark },

  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 18,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerDesktop: { paddingTop: 18, paddingBottom: 14, paddingHorizontal: 24 },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 18, fontWeight: "900", color: "#fff" },
  headerTitleDesktop: { fontSize: 20 },

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

  scroll: { paddingHorizontal: 16, paddingBottom: 20 },
  scrollDesktop: { paddingHorizontal: 24 },

  container: { width: "100%" },
  containerDesktop: { alignSelf: "center", width: "100%", maxWidth: 1100 },
  containerLarge: { maxWidth: 1280 },

  searchWrap: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 56,
  },
  searchWrapDesktop: { height: 58, borderRadius: 18 },
  searchInput: { flex: 1, fontSize: 15, color: "#fff" },
  clearBtn: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },

  layout: { marginTop: 10 },
  layoutDesktop: { flexDirection: "row", alignItems: "flex-start", gap: 18 },

  col: { width: "100%" },
  leftCol: { flex: 1 },
  rightCol: { flex: 1 },

  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: "900", color: "#fff" },
  sectionRow: {
    marginTop: 18,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  link: { color: COLORS.primary, fontWeight: "900" },

  actionsGrid: { gap: 12 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(43,238,121,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: 15, fontWeight: "900", color: "#fff" },
  actionSubtitle: { marginTop: 2, fontSize: 13, color: COLORS.textMutedSoft },

  recipientsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  recipientsWrapDesktop: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  recipientCard: {
    width: "100%",
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recipientCardDesktop: { width: 230 },
  recipientTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  initialsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  initialsText: { fontWeight: "900", color: "#fff" },
  favBtn: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  recipientName: { marginTop: 14, fontSize: 15, fontWeight: "900", color: "#fff" },

  listCard: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    overflow: "hidden",
  },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  txRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(43,238,121,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  txTitle: { fontSize: 15, fontWeight: "900", color: "#fff" },
  txSubtitle: { marginTop: 2, fontSize: 13, color: COLORS.textMutedSoft },
  txAmount: { fontSize: 14, fontWeight: "900" },
  negative: { color: "#ff5a7a" },
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
  primaryBtnDesktop: { height: 60, borderRadius: 30 },
  primaryBtnText: { color: COLORS.backgroundDark, fontSize: 16, fontWeight: "900", letterSpacing: 0.4 },
});
