import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function PerfilUsuario() {
  const [faceId, setFaceId] = useState(true);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back-ios-new" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* PROFILE */}
        <View style={styles.profileContainer}>
          <View>
            <Image
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXlT2t3CCBzn1ROAG64iHWKQJvLfVEx3fr1enuLVw-tMmEUcwtzj6qArBhkvlvjDJLr1BXAazKv1iC1TO0A-yCMH2okfsLx9_TwFLwHeCdN3qTr1j1G-liNDHvz11QQPcDKMUTa6LH8aP0OZHxxE5fYJ7xmQM7f61Rl3uJPRDhuMJ6-0Tgy9Jlt3w4R6tGddWcOHgQO_qbf2-8GnAH8pcdC9yLYCAmMdGySOb8mPOtH0hx1cr07k9IFcSjaEjUGRpifmXehKC1zWI",
              }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Icon name="edit" size={14} />
            </View>
          </View>

          <Text style={styles.name}>Juan Pérez</Text>

          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>0x71C...9A21</Text>
            <Icon name="content-copy" size={14} color="#777" />
          </View>
        </View>

        {/* SECTION */}
        <Section title="Cuenta">
          <Item icon="person" label="Editar Perfil" />
          <Item
            icon="badge"
            label="Verificación KYC"
            subLabel="Verificado nivel 2"
          />
        </Section>

        <Section title="Seguridad">
          <View style={styles.item}>
            <View style={styles.itemLeft}>
              <Icon name="face" size={22} />
              <Text style={styles.itemText}>Face ID</Text>
            </View>
            <Switch value={faceId} onValueChange={setFaceId} />
          </View>

          <Item
            icon="shield"
            label="Autenticación 2FA"
            rightText="Activado"
          />
        </Section>

        <Section title="Preferencias">
          <Item icon="notifications" label="Notificaciones" />
          <Item icon="currency-exchange" label="Moneda Local" rightText="USD" />
        </Section>

        <Section title="Soporte">
          <Item icon="support-agent" label="Centro de Ayuda" />
        </Section>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Icon name="logout" size={20} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 2.4.0 (Build 592)</Text>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <BottomItem icon="account-balance-wallet" label="Billetera" />
        <BottomItem icon="candlestick-chart" label="Mercado" />
        <View style={styles.centerButton}>
          <Icon name="swap-vert" size={28} color="#000" />
        </View>
        <BottomItem icon="history" label="Historial" />
        <BottomItem icon="settings" label="Ajustes" active />
      </View>
    </View>
  );
}

/* ================= COMPONENTS ================= */

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>{children}</View>
  </View>
);

const Item = ({ icon, label, subLabel, rightText }) => (
  <TouchableOpacity style={styles.item}>
    <View style={styles.itemLeft}>
      <Icon name={icon} size={22} />
      <View>
        <Text style={styles.itemText}>{label}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      </View>
    </View>

    {rightText ? (
      <Text style={styles.rightText}>{rightText}</Text>
    ) : (
      <Icon name="chevron-right" size={22} />
    )}
  </TouchableOpacity>
);

const BottomItem = ({ icon, label, active }) => (
  <TouchableOpacity style={styles.bottomItem}>
    <Icon name={icon} size={24} color={active ? "#2bee79" : "#888"} />
    <Text style={[styles.bottomText, active && { color: "#2bee79" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f8f7" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },

  profileContainer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2bee79",
    padding: 6,
    borderRadius: 20,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 6,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#2bee79",
    borderRadius: 4,
    marginRight: 6,
  },

  walletText: { marginHorizontal: 6 },

  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 12,
    color: "#777",
    marginBottom: 6,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  itemText: { fontSize: 16 },
  subLabel: { fontSize: 12, color: "#2bee79" },
  rightText: { color: "#777" },

  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#ffecec",
    margin: 16,
    padding: 14,
    borderRadius: 14,
  },

  logoutText: { color: "#d00", fontWeight: "600" },
  version: { textAlign: "center", fontSize: 12, color: "#999" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  bottomItem: {
    alignItems: "center",
  },

  bottomText: { fontSize: 10, color: "#888" },

  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2bee79",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
});
