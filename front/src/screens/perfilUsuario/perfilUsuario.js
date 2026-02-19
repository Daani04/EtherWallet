import React, { useState, useEffect, useContext, useMemo, useCallback } from "react";
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
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../context/SettingsContext";
import { useFocusEffect } from "@react-navigation/native";

import Context from "../../context/Context";
import common from "../../styles/common";
import Nav from "../../components/Nav";

const BASE_URL = "http://35.170.12.68:8080";

export default function PerfilUsuario(props) {
  const { t } = useTranslation();

  // ✅ SOLO una fuente de settings (nada de useState duplicado)
  const {
    C,
    isDarkMode,
    setIsDarkMode,
    faceId,
    setFaceId,
    language,
    setLanguage,
    currency,
    setCurrency,
    saveSettings,
  } = useSettings();

  const { userId, setUserId, logoutUser, user: userFromContext } = useContext(Context);
  const userFromRoute = props?.route?.params?.user ?? null;
  const user = userFromContext ?? userFromRoute ?? null;

  const [dbUser, setDbUser] = useState(null);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const LANGUAGES = ["ES", "EN", "CA"];

  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const CURRENCIES = ["USD", "EUR", "GBP", "MXN"];

  const loadUser = useCallback(async () => {
    if (!userId) return;

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
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser])
  );

  // Cargar settings desde API y volcarlos al SettingsContext
  useEffect(() => {
    if (!userId) return;

    const loadSettingsFromApi = async () => {
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

    loadSettingsFromApi();
  }, [userId, setIsDarkMode, setFaceId, setLanguage, setCurrency]);

  const shownUser = dbUser ?? user ?? {};

  const resolveAvatarUri = () => {
    const raw = shownUser?.userImageUrl || shownUser?.userImage || "";
    if (!raw) return "https://randomuser.me/api/portraits/men/1.jpg";

    const s = String(raw).trim();

    if (
      s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("data:image/") ||
      s.startsWith("file://") ||
      s.startsWith("content://")
    ) {
      return s;
    }

    if (s.includes("base64,")) {
      return s.startsWith("data:") ? s : `data:image/jpeg;${s}`;
    }

    return `data:image/jpeg;base64,${s}`;
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;

    const id = String(userId).trim();

    const doDelete = async () => {
      try {
        const url = `${BASE_URL}/API/DeleteUser/${id}`;
        const res = await fetch(url, { method: "DELETE" });
        const txt = await res.text();

        if (!res.ok) {
          Alert.alert("Error", txt || "No se pudo eliminar la cuenta.");
          return;
        }

        await logoutUser();
        setUserId(0);

        props.navigation.reset({
          index: 0,
          routes: [{ name: "InicioSesion" }],
        });
      } catch (e) {
        Alert.alert("Error", "Error de conexión. Inténtalo más tarde.");
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Esta acción es irreversible. ¿Seguro que quieres eliminar tu cuenta?"
      );
      if (ok) await doDelete();
      return;
    }

    Alert.alert(
      "Eliminar cuenta",
      "Esta acción es irreversible. ¿Seguro que quieres eliminar tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: doDelete },
      ]
    );
  };

  const styles = useMemo(() => makeStyles(C), [C]);

  // ✅ tu fix de scroll en web (sin liarla con Nav)
  const webScrollFix =
    Platform.OS === "web" ? { height: "100vh", overflowY: "auto" } : null;

  return (
    <SafeAreaView style={[common.safe, { backgroundColor: C.bg }]}>
      <View style={styles.header}>
        {/* si quieres back, descomenta */}
        {/*
        <TouchableOpacity
          onPress={() =>
            props.navigation.canGoBack()
              ? props.navigation.goBack()
              : props.navigation.navigate("HomeNav")
          }
          activeOpacity={0.85}
        >
          <Icon name="arrow-back-ios-new" size={22} color={C.textMain || "#fff"} />
        </TouchableOpacity>
        */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={[{ backgroundColor: C.bg }, webScrollFix]}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileContainer}>
          <Image source={{ uri: resolveAvatarUri() }} style={styles.avatar} />

          <Text style={styles.name}>{shownUser?.firstName || "User"}</Text>

          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>
              {shownUser?.walletAddress
                ? shownUser.walletAddress.substring(0, 6) + "..."
                : "Sin dirección"}
            </Text>
            <Icon name="content-copy" size={14} color={C.textMuted} />
          </View>
        </View>

        <Section title={t("profile.sections.account")} styles={styles}>
          <Item
            icon="person"
            label={t("profile.items.editProfile")}
            onPress={() =>
              props.navigation.navigate("EditarPerfil", {
                user:
                  shownUser ?? {
                    id: "",
                    firstName: "",
                    lastName: "",
                    birthDate: "",
                    userImage: "",
                    email: "",
                    dni: "",
                    password: "",
                    favoriteId: "",
                  },
              })
            }
            C={C}
            styles={styles}
          />

          <Item icon="dark-mode" label={t("profile.items.lightDark")} C={C} styles={styles}>
            <Switch
              value={!!isDarkMode}
              onValueChange={(val) => {
                setIsDarkMode(val);
                saveSettings({ theme: val });
              }}
              trackColor={{ false: "#cbd5e1", true: C.primary }}
              thumbColor="#fff"
            />
          </Item>
        </Section>

        <Section title={t("profile.sections.security")} styles={styles}>
          <Item icon="face" label={t("profile.items.faceId")} C={C} styles={styles}>
            <Switch
              value={!!faceId}
              onValueChange={(val) => {
                setFaceId(val);
                saveSettings({ faceId: val });
              }}
              trackColor={{ false: "#cbd5e1", true: C.primary }}
              thumbColor="#fff"
            />
          </Item>

          <Item
            icon="shield"
            label={t("profile.items.twoFA")}
            rightText={t("profile.status.enabled")}
            C={C}
            styles={styles}
          />

          <Item
            icon="badge"
            label={t("profile.items.kyc")}
            subLabel={t("profile.status.kycLevel2")}
            C={C}
            styles={styles}
          />
        </Section>

        <Section title={t("profile.sections.preferences")} styles={styles}>
          <Item icon="notifications" label={t("profile.items.notifications")} C={C} styles={styles} />

          <Item
            icon="currency-exchange"
            label={t("profile.items.localCurrency")}
            rightText={currency}
            onPress={() => setCurrencyModalVisible(true)}
            C={C}
            styles={styles}
          />

          <Item
            icon="language"
            label={t("profile.items.language")}
            rightText={language}
            onPress={() => setLanguageModalVisible(true)}
            C={C}
            styles={styles}
          />
        </Section>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logoutUser();
            props.navigation.replace("InicioSesion");
          }}
          activeOpacity={0.85}
        >
          <Icon name="logout" size={20} color={C.danger} />
          <Text style={styles.logoutText}>{t("profile.items.logout")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
          <Icon name="delete-forever" size={20} color={C.danger} />
          <Text style={styles.deleteText}>Eliminar Cuenta</Text>
        </TouchableOpacity>
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
                activeOpacity={0.85}
              >
                <Text style={[styles.modalText, lang === language && { color: C.primary }]}>
                  {lang}
                </Text>
                {lang === language && <Icon name="check" size={20} color={C.primary} />}
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
                activeOpacity={0.85}
              >
                <Text style={[styles.modalText, cur === currency && { color: C.primary }]}>
                  {cur}
                </Text>
                {cur === currency && <Icon name="check" size={20} color={C.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Nav />
    </SafeAreaView>
  );
}

const Section = ({ title, children, styles }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.cardBox}>{children}</View>
  </View>
);

const Item = ({ icon, label, subLabel, rightText, children, onPress, C, styles }) => (
  <TouchableOpacity style={styles.item} disabled={!!children} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.row}>
      <Icon name={icon} size={22} color={C.textMain} />
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.itemText}>{label}</Text>
        {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
      </View>
    </View>
    {children || (
      <View style={styles.row}>
        {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
        <Icon name="chevron-right" size={22} color={C.chevron} />
      </View>
    )}
  </TouchableOpacity>
);

const makeStyles = (C) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      backgroundColor: C.bg,
    },

    profileContainer: { alignItems: "center", paddingVertical: 20 },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 2,
      borderColor: C.primary,
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      marginTop: 10,
      color: C.textMain,
    },

    walletRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: C.pillBg,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 8,
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    dot: {
      width: 7,
      height: 7,
      backgroundColor: C.primary,
      borderRadius: 4,
      marginRight: 6,
    },
    walletText: { color: C.textMain, fontSize: 12 },

    section: { paddingHorizontal: 16, marginTop: 14 },
    sectionTitle: {
      fontSize: 12,
      color: C.textMuted,
      marginBottom: 8,
      marginLeft: 4,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      fontWeight: "700",
    },

    cardBox: {
      backgroundColor: C.cardBg,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },

    row: { flexDirection: "row", alignItems: "center" },

    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderBottomWidth: 1,
      borderColor: C.border,
      backgroundColor: C.cardBg,
    },
    itemText: { fontSize: 16, color: C.textMain, fontWeight: "600" },
    subLabel: { fontSize: 12, color: C.primary, marginTop: 2, fontWeight: "700" },
    rightText: { color: C.textMuted, marginRight: 6, fontWeight: "600" },

    logoutBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: C.dangerSoft,
      margin: 20,
      padding: 16,
      borderRadius: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(255,92,92,0.25)",
    },
    logoutText: { color: C.danger, fontWeight: "700" },

    deleteBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255, 70, 70, 0.10)",
      marginHorizontal: 20,
      marginTop: 8,
      padding: 16,
      borderRadius: 16,
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 70, 70, 0.28)",
    },
    deleteText: { color: C.danger, fontWeight: "800" },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalContent: {
      backgroundColor: C.modalBg,
      borderColor: C.border,
      borderRadius: 16,
      paddingVertical: 10,
      width: 220,
      borderWidth: 1,
      shadowColor: C.shadow,
      shadowOpacity: 0.10,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 4,
    },
    modalItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
    },
    modalText: { color: C.textMain, fontSize: 16, fontWeight: "600" },
  });
