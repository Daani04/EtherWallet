import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from "react-native";
import CryptoJS from "crypto-js";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";

const COLORS = {
  primary: "#2bee79",
  bg: "#0d1a12",
  card: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.15)",
  white: "#ffffff",
  muted: "rgba(255, 255, 255, 0.6)",
  danger: "#ff4444",
};

const API_BASE = "http://10.10.5.238:8080";

const pad2 = (n) => String(n).padStart(2, "0");

const isValidDateStr = (s) => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return false;
  const [dd, mm, yyyy] = s.split("/").map((x) => parseInt(x, 10));
  if (yyyy < 1900 || yyyy > 2100) return false;
  if (mm < 1 || mm > 12) return false;
  if (dd < 1 || dd > 31) return false;

  const d = new Date(yyyy, mm - 1, dd);
  return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
};

export default function EditarPerfil({ navigation, route }) {
  const { t } = useTranslation();

  const user = route?.params?.user ?? null;
  const userId = user?.id ?? user?.userId ?? null;

  const initialImage =
    user?.userImageUrl ||
    user?.userImage ||
    "https://randomuser.me/api/portraits/men/1.jpg";

  const initialBirth = user?.birthDateFormatted || user?.birthDate || "";

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [birthDate, setBirthDate] = useState(initialBirth);
  const [userImage, setUserImage] = useState(initialImage);
  const [password, setPassword] = useState("");

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dd, setDd] = useState("");
  const [mm, setMm] = useState("");
  const [yyyy, setYyyy] = useState("");

  const canSave = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      birthDate.trim() &&
      isValidDateStr(birthDate.trim())
    );
  }, [firstName, lastName, birthDate]);

  const openDateModal = () => {
    const current =
      birthDate && /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate) ? birthDate : "";
    if (current) {
      const [d1, m1, y1] = current.split("/");
      setDd(d1);
      setMm(m1);
      setYyyy(y1);
    } else {
      setDd("");
      setMm("");
      setYyyy("");
    }
    setDateModalVisible(true);
  };

  const applyDate = () => {
    const value = `${pad2(dd)}/${pad2(mm)}/${yyyy}`;
    if (!isValidDateStr(value)) {
      Alert.alert("Fecha inválida", "Usa un formato válido dd/mm/yyyy.");
      return;
    }
    setBirthDate(value);
    setDateModalVisible(false);
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso denegado", "Necesito permiso para acceder a tus fotos.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset) return;

      if (asset.base64) {
        const mime = asset.mimeType || "image/jpeg";
        setUserImage(`data:${mime};base64,${asset.base64}`);
      } else if (asset.uri) {
        setUserImage(asset.uri);
      }
    } catch (e) {
      console.log("PICK IMAGE ERROR", e);
      Alert.alert("Error", "No se pudo cargar la imagen.");
    }
  };

  const onSave = async () => {
    if (!userId) {
      Alert.alert(t("common.error"), t("editProfile.errors.missingUserId"));
      return;
    }
    if (!canSave) {
      Alert.alert(t("common.error"), t("editProfile.errors.fillAllRequired"));
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dni: user?.dni ?? "",
      email: user?.email ?? "",
      favoriteId: user?.favoriteId ?? "null",
      birthDateFormatted: birthDate.trim(),
      birthDate: birthDate.trim(),
      userImage: (userImage ?? "").trim(),
      password: user?.password ?? "",
    };

    if (password.trim().length > 0) {
      payload.password = CryptoJS.SHA256(password.trim()).toString();
    }

    try {
      const res = await fetch(`${API_BASE}/API/EditUser/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const txt = await res.text();

      if (!res.ok) {
        Alert.alert(t("common.error"), txt);
        return;
      }

      Alert.alert(t("common.ok"), t("editProfile.success.updated"));
      navigation.goBack();
    } catch (e) {
      Alert.alert(t("common.error"), t("editProfile.errors.serverConnection"));
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16 }}
    >
      <Text style={styles.title}>{t("editProfile.title")}</Text>

      <View style={styles.avatarBox}>
        <Image source={{ uri: userImage }} style={styles.avatar} />
        <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
          <Text style={styles.pickBtnText}>Cambiar foto</Text>
        </TouchableOpacity>
        <Text style={styles.help}>{t("editProfile.help.imageUrl")}</Text>
      </View>

      <Text style={styles.label}>{t("editProfile.labels.image")}</Text>
      <TextInput
        value={userImage}
        onChangeText={setUserImage}
        style={styles.input}
        placeholder="https://..."
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.label}>{t("editProfile.labels.firstName")}</Text>
      <TextInput
        value={firstName}
        onChangeText={setFirstName}
        style={styles.input}
        placeholder={t("editProfile.placeholders.firstName")}
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.label}>{t("editProfile.labels.lastName")}</Text>
      <TextInput
        value={lastName}
        onChangeText={setLastName}
        style={styles.input}
        placeholder={t("editProfile.placeholders.lastName")}
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.label}>{t("editProfile.labels.birthDate")}</Text>
      <TextInput
        value={birthDate}
        onChangeText={setBirthDate}
        style={styles.input}
        placeholder={t("editProfile.placeholders.birthDate")}
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.label}>{t("editProfile.labels.newPassword")}</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder={t("editProfile.placeholders.newPassword")}
        placeholderTextColor={COLORS.muted}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.btn, { opacity: canSave ? 1 : 0.5 }]}
        onPress={onSave}
        disabled={!canSave}
      >
        <Text style={styles.btnText}>{t("editProfile.actions.save")}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}>
        <Text style={styles.btnGhostText}>{t("common.cancel")}</Text>
      </TouchableOpacity>

      {/* MODAL FECHA */}
      <Modal
        transparent
        visible={dateModalVisible}
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setDateModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Fecha de nacimiento</Text>

            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Text style={styles.modalLabel}>Día</Text>
                <TextInput
                  value={dd}
                  onChangeText={(t) => setDd(t.replace(/\D/g, "").slice(0, 2))}
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  placeholder="dd"
                  placeholderTextColor={COLORS.muted}
                />
              </View>

              <View style={styles.dateCol}>
                <Text style={styles.modalLabel}>Mes</Text>
                <TextInput
                  value={mm}
                  onChangeText={(t) => setMm(t.replace(/\D/g, "").slice(0, 2))}
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  placeholder="mm"
                  placeholderTextColor={COLORS.muted}
                />
              </View>

              <View style={styles.dateColWide}>
                <Text style={styles.modalLabel}>Año</Text>
                <TextInput
                  value={yyyy}
                  onChangeText={(t) => setYyyy(t.replace(/\D/g, "").slice(0, 4))}
                  style={styles.dateInput}
                  keyboardType="number-pad"
                  placeholder="yyyy"
                  placeholderTextColor={COLORS.muted}
                />
              </View>
            </View>

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalBtnGhost}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.modalBtnGhostText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalBtn} onPress={applyDate}>
                <Text style={styles.modalBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { color: COLORS.white, fontSize: 22, fontWeight: "800", marginBottom: 16 },
  label: { color: COLORS.muted, marginTop: 12, marginBottom: 6, fontSize: 12 },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.white,
  },

  rowField: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowFieldText: { color: COLORS.white, fontWeight: "700" },
  rowChevron: { color: COLORS.muted, fontSize: 22, marginLeft: 10 },

  btn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: "center",
  },
  btnText: { color: "#000", fontWeight: "900" },

  btnGhost: {
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnGhostText: { color: COLORS.white, fontWeight: "700" },

  avatarBox: { alignItems: "center", marginBottom: 8 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 10,
  },
  pickBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  pickBtnText: { color: COLORS.white, fontWeight: "800" },
  help: { color: COLORS.muted, fontSize: 12, marginTop: 8, textAlign: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0f2218",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  modalTitle: { color: COLORS.white, fontWeight: "900", fontSize: 16, marginBottom: 12 },
  modalLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },

  dateRow: { flexDirection: "row", gap: 10 },
  dateCol: { flex: 1 },
  dateColWide: { flex: 1.4 },
  dateInput: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.white,
  },

  modalBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 },
  modalBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
  modalBtnText: { color: "#000", fontWeight: "900" },
  modalBtnGhost: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  modalBtnGhostText: { color: COLORS.white, fontWeight: "800" },
});
