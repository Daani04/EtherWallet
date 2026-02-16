import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Nav from "../../components/Nav";

const COLORS = {
  primary: "#2bee79",
  bg: "#0d1a12",
  card: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.15)",
  white: "#ffffff",
  muted: "rgba(255, 255, 255, 0.6)",
};

export default function PerfilUsuario(props) {
  const [faceId, setFaceId] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back-ios-new" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.profileContainer}>
          <View>
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Icon name="edit" size={14} color="#000" />
            </View>
          </View>
          <Text style={styles.name}>Juan Pérez</Text>
          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>0x71C...9A21</Text>
            <Icon name="content-copy" size={14} color={COLORS.muted} />
          </View>
        </View>

        <Section title="Cuenta">
          {/* POR TERMINAR UPDATE USUARIO */}
          <Item
            icon="person"
            label="Editar Perfil"
            onPress={() => props.navigation.navigate("EditarPerfil", {
              user: {
                id: "698f3af76ed4f87933e2018d",
                firstName: "Dani",
                lastName: "Arastell",
                birthDate: "13/01/2002",
                userImage: "default-avatar.png",
                email: "dani@gmail.com",
                dni: "24508735Z",
                password: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
                favoriteId: "null",
              },
            })
            }
          />
          <Item icon="badge" label="Verificación KYC" subLabel="Verificado nivel 2" />
        </Section>

        <Section title="Seguridad">
          <Item icon="face" label="Face ID">
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: "#3e3e3e", true: COLORS.primary }}
              thumbColor="#fff"
            />
          </Item>
          <Item icon="shield" label="Autenticación 2FA" rightText="Activado" />
        </Section>

        <Section title="Preferencias">
          <Item icon="notifications" label="Notificaciones" />
          <Item icon="currency-exchange" label="Moneda Local" rightText="USD" />
        </Section>

        <TouchableOpacity style={styles.logoutBtn}>
          <Icon name="logout" size={20} color="#ff4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 0.1.0</Text>
      </ScrollView>

      <Nav />
    </SafeAreaView>
  );
}


const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.cardBox}>{children}</View>
  </View>
);

const Item = ({ icon, label, subLabel, rightText, children, onPress }) => (
  <TouchableOpacity style={styles.item} disabled={!!children} onPress={onPress}>
    <View style={styles.row}>
      <Icon name={icon} size={22} color={COLORS.white} />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.itemText}>{label}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      </View>
    </View>
    {children || (
      <View style={styles.row}>
        {rightText && <Text style={styles.rightText}>{rightText}</Text>}
        <Icon name="chevron-right" size={22} color="rgba(255,255,255,0.2)" />
      </View>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
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
    color: COLORS.white,
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 5,
    borderRadius: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: COLORS.white,
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    marginRight: 6,
  },
  walletText: {
    color: COLORS.white,
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  cardBox: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  itemText: {
    fontSize: 16,
    color: COLORS.white,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.primary,
  },
  rightText: {
    color: COLORS.muted,
    marginRight: 4,
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 70, 70, 0.1)",
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.muted,
  },
});