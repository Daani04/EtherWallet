import React, { useState, useEffect, useContext } from "react";
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
  Pressable,
  Alert,
  Platform
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Nav from "../../components/Nav";
import Context from "../../context/Context";
import common from "../../styles/common";
import theme from "../../styles/theme";
import { useTranslation } from "react-i18next";

const COLORS = theme?.colors || theme?.COLORS || theme;

const BASE_URL = "http://35.170.12.68:8080";

export default function PerfilUsuario(props) {
  const { t } = useTranslation();

  const { userId, setUserId, logoutUser, user: userFromContext } = useContext(Context);
  const user = userFromContext ?? props.route?.params?.user ?? null;

  console.log("USERID CONTEXT:", userId);

  const [dbUser, setDbUser] = useState(null);

  const [faceId, setFaceId] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [language, setLanguage] = useState("EN");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const LANGUAGES = ["ES", "EN", "CA"];

  const [currency, setCurrency] = useState("USD");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const CURRENCIES = ["USD", "EUR", "GBP", "MXN"];

  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/API/User/${userId}`);

        if (!res.ok) {
          const txt = await res.text();
          console.log("GET USER ERROR", res.status, txt);
          return;
        }

        const data = await res.json();
        setDbUser(data);
      } catch (e) {
        console.log("LOAD USER EXCEPTION", e);
      }
    };

    loadUser();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/API/Settings/${userId}`);

        if (!res.ok) {
          const txt = await res.text();
          console.log("GET SETTINGS ERROR", res.status, txt);
          return;
        }

        const data = await res.json();

        if (typeof data.theme === "boolean") setIsDarkMode(data.theme);
        if (typeof data.faceId === "boolean") setFaceId(data.faceId);
        if (data.language) setLanguage(data.language);
        if (data.currency) setCurrency(data.currency);
      } catch (e) {
        console.log("LOAD SETTINGS EXCEPTION", e);
      }
    };

    loadSettings();
  }, [userId]);

  const saveSettings = async (partial) => {
    if (!userId) return;

    const payload = {
      userId,
      theme: isDarkMode,
      language,
      currency,
      faceId,
      ...partial,
    };

    try {
      const res = await fetch(`${BASE_URL}/API/EditSettings/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.log("PUT SETTINGS ERROR", res.status, txt);
        return;
      }
    } catch (e) {
      console.log("SAVE SETTINGS EXCEPTION", e);
    }
  };

  const shownUser = dbUser ?? user;

  const handleDeleteAccount = async () => {
    console.log("[DELETE] Click eliminar. userId:", userId);

    if (!userId) {
      console.log("[DELETE] Abort: userId vacío");
      return;
    }

    const id = String(userId).trim();
    console.log("[DELETE] id final:", id);

    const doDelete = async () => {
      console.log("[DELETE] Confirmado -> llamando fetch...");

      try {
        const url = `${BASE_URL}/API/DeleteUser/${id}`;
        console.log("[DELETE] URL:", url);

        const res = await fetch(url, { method: "DELETE" });

        const txt = await res.text();
        console.log("[DELETE] RESP status:", res.status, "ok:", res.ok, "body:", txt);

        if (!res.ok) {
          Alert.alert("Error", txt || "No se pudo eliminar la cuenta.");
          return;
        }

        console.log("[DELETE] OK -> logout + reset navigation");
        await logoutUser();
        setUserId(0);

        props.navigation.reset({
          index: 0,
          routes: [{ name: "InicioSesion" }],
        });
      } catch (e) {
        console.log("[DELETE] EXCEPTION:", e);
        Alert.alert("Error", "Error de conexión. Inténtalo más tarde.");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm("Esta acción es irreversible. ¿Seguro que quieres eliminar tu cuenta?");
      console.log("[DELETE] web confirm:", ok);
      if (ok) await doDelete();
      return;
    }

    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. ¿Seguro que quieres eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel", onPress: () => console.log("[DELETE] cancelado") },
        { text: "Eliminar", style: "destructive", onPress: doDelete },
      ]
    );
  };

  const resolveAvatarUri = () => {
    const raw =
      shownUser?.userImageUrl ||
      shownUser?.userImage ||
      "";

    if (!raw) return "https://randomuser.me/api/portraits/men/1.jpg";

    const s = String(raw).trim();

    // ya viene como url / data-uri / file / content
    if (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("data:image/") ||
      s.startsWith("file://") ||
      s.startsWith("content://")
    ) {
      return s;
    }

    // si ya contiene "base64," pero sin data:image
    if (s.includes("base64,")) {
      return s.startsWith("data:") ? s : `data:image/jpeg;${s}`;
    }

    // si parece base64 "pelado"
    return `data:image/jpeg;base64,${s}`;
  };

  return (
    <SafeAreaView style={common.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <Icon name="arrow-back-ios-new" size={22} color={COLORS.textMain} />
        </TouchableOpacity>

        <Text style={common.headerTitle || styles.headerTitle}>
          {t("profile.settingsTitle")}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.profileContainer}>
          <View>
            <Image
              source={{ uri: resolveAvatarUri() }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Icon name="edit" size={14} color={COLORS.bg || "#000"} />
            </View>
          </View>

          <Text style={styles.name}>{shownUser?.firstName || "Usuario"}</Text>

          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>
              {shownUser?.walletAddress
                ? shownUser.walletAddress.substring(0, 6) + "..."
                : "Sin dirección"}
            </Text>
            <Icon name="content-copy" size={14} color={COLORS.textMuted} />
          </View>
        </View>

        <Section title={t("profile.sections.account")}>
          <Item
            icon="person"
            label={t("profile.items.editProfile")}
            onPress={() =>
              props.navigation.navigate("EditarPerfil", {
                user:
                  shownUser ?? {
                    id: "698f3af76ed4f87933e2018d",
                    firstName: "Dani",
                    lastName: "Arastell",
                    birthDate: "13/01/2002",
                    userImage: "default-avatar.png",
                    email: "dani@gmail.com",
                    dni: "24508735Z",
                    password:
                      "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
                    favoriteId: "null",
                  },
              })
            }
          />

          <Item icon="dark-mode" label={t("profile.items.lightDark")}>
            <Switch
              value={isDarkMode}
              onValueChange={(val) => {
                setIsDarkMode(val);
                saveSettings({ theme: val });
              }}
              trackColor={{ false: "#3e3e3e", true: COLORS.primary }}
              thumbColor="#fff"
            />
          </Item>
        </Section>

        <Section title={t("profile.sections.security")}>
          <Item icon="face" label={t("profile.items.faceId")}>
            <Switch
              value={faceId}
              onValueChange={(val) => {
                setFaceId(val);
                saveSettings({ faceId: val });
              }}
              trackColor={{ false: "#3e3e3e", true: COLORS.primary }}
              thumbColor="#fff"
            />
          </Item>

          <Item
            icon="shield"
            label={t("profile.items.twoFA")}
            rightText={t("profile.status.enabled")}
          />

          <Item
            icon="badge"
            label={t("profile.items.kyc")}
            subLabel={t("profile.status.kycLevel2")}
          />
        </Section>

        <Section title={t("profile.sections.preferences")}>
          <Item icon="notifications" label={t("profile.items.notifications")} />

          <Item
            icon="currency-exchange"
            label={t("profile.items.localCurrency")}
            rightText={currency}
            onPress={() => setCurrencyModalVisible(true)}
          />

          <Item
            icon="language"
            label={t("profile.items.language")}
            rightText={language}
            onPress={() => setLanguageModalVisible(true)}
          />
        </Section>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logoutUser();
            props.navigation.replace("InicioSesion");
          }}
        >
          <Icon name="logout" size={20} color={COLORS.danger || "#ff4444"} />
          <Text style={styles.logoutText}>{t("profile.items.logout")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Icon name="delete-forever" size={20} color="#ff4444" />
          <Text style={styles.deleteText}>Eliminar Cuenta</Text>
        </TouchableOpacity>

        <Text style={styles.version}>
          {t("profile.versionPrefix")} 0.1.0
        </Text>
      </ScrollView>

      {/* MODAL IDIOMA */}
      <Modal
        transparent
        visible={languageModalVisible}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContent}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={styles.modalItem}
                onPress={() => {
                  setLanguage(lang);
                  setLanguageModalVisible(false);
                  saveSettings({ language: lang });
                }}
              >
                <Text style={[styles.modalText, lang === language && { color: COLORS.primary }]}>
                  {lang}
                </Text>
                {lang === language && <Icon name="check" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* MODAL DIVISA */}
      <Modal
        transparent
        visible={currencyModalVisible}
        animationType="fade"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setCurrencyModalVisible(false)}>
          <View style={styles.modalContent}>
            {CURRENCIES.map((cur) => (
              <TouchableOpacity
                key={cur}
                style={styles.modalItem}
                onPress={() => {
                  setCurrency(cur);
                  setCurrencyModalVisible(false);
                  saveSettings({ currency: cur });
                }}
              >
                <Text style={[styles.modalText, cur === currency && { color: COLORS.primary }]}>
                  {cur}
                </Text>
                {cur === currency && <Icon name="check" size={20} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Nav />
    </SafeAreaView>
  );
}

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={common.sectionTitle || styles.sectionTitle}>{title}</Text>
    <View style={common.card || styles.cardBox}>{children}</View>
  </View>
);

const Item = ({ icon, label, subLabel, rightText, children, onPress }) => (
  <TouchableOpacity style={styles.item} disabled={!!children} onPress={onPress}>
    <View style={styles.row}>
      <Icon name={icon} size={22} color={COLORS.textMain || "#fff"} />
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
    backgroundColor: COLORS.bg || "#0d1a12",
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
    color: COLORS.textMain || "#fff",
  },
  profileContainer: { alignItems: "center", paddingVertical: 20 },
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
    color: COLORS.textMain || "#fff",
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
  walletText: { color: COLORS.textMain, fontSize: 12 },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textMuted || "rgba(255,255,255,0.6)",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
  },

  cardBox: {
    backgroundColor: COLORS.cardBg || "rgba(255,255,255,0.08)",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border || "rgba(255,255,255,0.15)",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  row: { flexDirection: "row", alignItems: "center" },
  itemText: { fontSize: 16, color: COLORS.textMain },
  subLabel: { fontSize: 12, color: COLORS.primary },
  rightText: { color: COLORS.textMuted, marginRight: 4 },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.dangerSoft,
    margin: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: { color: COLORS.danger, fontWeight: "600" },
  version: { textAlign: "center", fontSize: 12, color: COLORS.textMuted },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 10,
    width: 200,
    borderWidth: 1,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  modalText: { color: COLORS.textMain, fontSize: 16 },
  deleteBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 70, 70, 0.12)",
    marginHorizontal: 20,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 70, 70, 0.35)",
  },
  deleteText: {
    color: "#ff4444",
    fontWeight: "700",
  },
});
