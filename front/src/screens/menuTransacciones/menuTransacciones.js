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
  const isDesktop = width >= BREAKPOINT_MD;
  const isLarge = width >= BREAKPOINT_LG;

  const [search, setSearch] = useState("");

  const quickActions = useMemo(
    () => [
      {
        id: "deposit",
        title: "Depositar",
        subtitle: "Añade EUR a tu wallet",
        icon: "south-west",
        onPress: () => navigation?.navigate?.("Depositar"),
      },
      {
        id: "transfer",
        title: "Transferir",
        subtitle: "A otra cuenta/IBAN",
        icon: "compare-arrows",
        onPress: () => navigation?.navigate?.("Transferencia"),
      },
      {
        id: "withdraw",
        title: "Retirar",
        subtitle: "A tu banco",
        icon: "north-east",
        onPress: () => navigation?.navigate?.("Retirar"),
      },
    ],
    [navigation]
  );

  const recentRecipients = useMemo(
    () => [
      { id: "1", initials: "CF", name: "Carlos Fernández Bou", favorite: true },
      { id: "2", initials: "AM", name: "Ana Martínez", favorite: false },
      { id: "3", initials: "JP", name: "Juan Pérez", favorite: false },
    ],
    []
  );

  const transactions = useMemo(
    () => [
      { id: "t1", type: "Transferencia", to: "Carlos Fernández Bou", amount: -25.5, date: "Hoy" },
      { id: "t2", type: "Depósito", to: "Wallet EUR", amount: 150, date: "Ayer" },
      { id: "t3", type: "Retiro", to: "Banco", amount: -60, date: "05/02" },
    ],
    []
  );

  const filteredRecipients = useMemo(() => {
    if (!search.trim()) return recentRecipients;
    const q = search.toLowerCase();
    return recentRecipients.filter((r) => r.name.toLowerCase().includes(q));
  }, [search, recentRecipients]);

  const filteredTransactions = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (t) => t.type.toLowerCase().includes(q) || t.to.toLowerCase().includes(q)
    );
  }, [search, transactions]);

  return (
    <View style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.iconBtn} activeOpacity={0.8}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, isDesktop && styles.headerTitleDesktop]}>Transacciones</Text>

        <TouchableOpacity
          onPress={() => navigation?.navigate?.("AyudaTransacciones")}
          style={styles.iconBtn}
          activeOpacity={0.8}
        >
          <MaterialIcons name="help-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* Contenedor centrado (maxWidth) */}
        <View style={[styles.container, isDesktop && styles.containerDesktop, isLarge && styles.containerLarge]}>
          {/* Search */}
          <View style={[styles.searchWrap, isDesktop && styles.searchWrapDesktop]}>
            <MaterialIcons name="search" size={20} color={COLORS.textMutedSoft} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar destinatario o movimiento…"
              placeholderTextColor={COLORS.textMutedSoft}
              style={styles.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")} activeOpacity={0.7} style={styles.clearBtn}>
                <MaterialIcons name="close" size={18} color={COLORS.textMutedSoft} />
              </TouchableOpacity>
            )}
          </View>

          {/* Layout responsive */}
          <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
            {/* Columna izquierda */}
            <View style={[styles.col, isDesktop && styles.leftCol]}>
              <Text style={styles.sectionTitle}>Acciones rápidas</Text>

              <View style={styles.actionsGrid}>
                {quickActions.map((a) => (
                  <TouchableOpacity key={a.id} style={styles.actionCard} activeOpacity={0.85} onPress={a.onPress}>
                    <View style={styles.actionIcon}>
                      <MaterialIcons name={a.icon} size={20} color={COLORS.primary} />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.actionTitle}>{a.title}</Text>
                      <Text style={styles.actionSubtitle}>{a.subtitle}</Text>
                    </View>

                    <MaterialIcons name="chevron-right" size={22} color={COLORS.textMutedSoft} />
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>Últimos destinatarios</Text>
                <TouchableOpacity onPress={() => navigation?.navigate?.("Destinatarios")} activeOpacity={0.8}>
                  <Text style={styles.link}>Ver todos</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.recipientsWrap, isDesktop && styles.recipientsWrapDesktop]}>
                {filteredRecipients.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.recipientCard, isDesktop && styles.recipientCardDesktop]}
                    activeOpacity={0.85}
                    onPress={() => navigation?.navigate?.("Transferencia", { recipientId: r.id })}
                  >
                    <View style={styles.recipientTop}>
                      <View style={styles.initialsCircle}>
                        <Text style={styles.initialsText}>{r.initials}</Text>
                      </View>

                      <TouchableOpacity onPress={() => {}} activeOpacity={0.7} style={styles.favBtn}>
                        <MaterialIcons
                          name={r.favorite ? "favorite" : "favorite-border"}
                          size={18}
                          color={r.favorite ? COLORS.primary : COLORS.textMutedSoft}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.recipientName} numberOfLines={2}>
                      {r.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Columna derecha */}
            <View style={[styles.col, isDesktop && styles.rightCol]}>
              <Text style={[styles.sectionTitle, isDesktop && { marginTop: 18 }]}>Movimientos recientes</Text>

              <View style={styles.listCard}>
                {filteredTransactions.map((t, idx) => (
                  <View key={t.id} style={[styles.txRow, idx !== 0 && styles.txRowBorder]}>
                    <View style={styles.txIcon}>
                      <MaterialIcons
                        name={t.type === "Depósito" ? "south-west" : t.type === "Retiro" ? "north-east" : "compare-arrows"}
                        size={18}
                        color={COLORS.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.txTitle}>{t.type}</Text>
                      <Text style={styles.txSubtitle} numberOfLines={1}>
                        {t.to} · {t.date}
                      </Text>
                    </View>

                    <Text style={[styles.txAmount, t.amount < 0 ? styles.negative : styles.positive]}>
                      {formatEUR(t.amount)}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, isDesktop && styles.primaryBtnDesktop]}
                activeOpacity={0.9}
                onPress={() => navigation?.navigate?.("NuevaTransaccion")}
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
  const sign = value < 0 ? "-" : "+";
  const abs = Math.abs(value);
  return `${sign}${abs.toFixed(2)} €`;
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
