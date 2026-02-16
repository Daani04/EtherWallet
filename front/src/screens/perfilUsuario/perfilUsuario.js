import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import CryptoJS from "crypto-js";
import Nav from "../../components/Nav";
import Context from "../../context/Context";
import common from "../../styles/common";
import theme from "../../styles/theme";

const COLORS = theme.colors;

export default function PerfilUsuario(props) {
  const [faceId, setFaceId] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const { user, logoutUser } = useContext(Context);

  const handleDeleteAccount = async () => {
    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Debes introducir tu contraseña.");
      return;
    }

    const hashedInput = CryptoJS.SHA256(confirmPassword.trim()).toString();

    if (hashedInput !== user?.password) {
      Alert.alert("Error", "La contraseña no es correcta.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/API/DeleteUser/${user.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        Alert.alert("Error", "No se pudo eliminar la cuenta.");
        return;
      }

      await logoutUser();
      setShowDeleteModal(false);
      setConfirmPassword("");
      Alert.alert("Cuenta eliminada", "Tu cuenta ha sido eliminada.");
    } catch (error) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  return (
    <SafeAreaView style={common.safe}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back-ios-new" size={22} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
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
          <Text style={styles.name}>{user?.firstName || "Usuario"}</Text>
          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>
              {user?.walletAddress
                ? user.walletAddress.substring(0, 6) + "..."
                : "Sin dirección"}
            </Text>
            <Icon name="content-copy" size={14} color={COLORS.textMuted} />
          </View>
        </View>

        <Section title="Cuenta">
          <Item
            icon="person"
            label="Editar Perfil"
            onPress={() =>
              props.navigation.navigate("EditarPerfil", { user })
            }
          />
          <Item
            icon="badge"
            label="Verificación KYC"
            subLabel="Verificado nivel 2"
          />
          <Item
            icon="delete"
            label="Eliminar cuenta"
            onPress={() => setShowDeleteModal(true)}
          />
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

        <TouchableOpacity style={styles.logoutBtn} onPress={logoutUser}>
          <Icon name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Versión 0.1.0</Text>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>

            <TextInput
              placeholder="Contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry
              style={styles.modalInput}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setShowDeleteModal(false);
                  setConfirmPassword("");
                }}
              >
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeleteAccount}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Eliminar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Nav />
    </SafeAreaView>
  );
}

const Section = ({ title, children }) => (
  <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.cardBox}>{children}</View>
  </View>
);

const Item = ({ icon, label, subLabel, rightText, children, onPress }) => (
  <TouchableOpacity style={styles.item} disabled={!!children} onPress={onPress}>
    <View style={styles.row}>
      <Icon name={icon} size={22} color={COLORS.textMain} />
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
    color: COLORS.textMain,
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
    color: COLORS.textMain,
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg,
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
    color: COLORS.textMain,
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },
  cardBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: theme.radius.lg,
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
    color: COLORS.textMain,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.primary,
  },
  rightText: {
    color: COLORS.textMuted,
    marginRight: 4,
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    margin: 20,
    padding: 16,
    borderRadius: 16,
  },
  logoutText: {
    color: COLORS.danger,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: COLORS.inputBg,
    padding: 20,
    borderRadius: theme.radius.md,
  },
  modalTitle: {
    color: COLORS.textMain,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    color: COLORS.textMain,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelBtn: {
    padding: 10,
  },
  deleteBtn: {
    backgroundColor: COLORS.danger,
    padding: 10,
    borderRadius: 8,
  },
});
