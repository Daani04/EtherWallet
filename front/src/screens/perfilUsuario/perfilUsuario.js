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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Nav from "../../components/Nav";
import Context from "../../context/Context";
import common from "../../styles/common";
import theme from "../../styles/theme";
import { useTranslation } from "react-i18next";

const COLORS = theme?.colors || theme?.COLORS || theme;

export default function PerfilUsuario(props) {
  const { t } = useTranslation();

  const { userId } = useContext(Context);
  const { logoutUser } = useContext(Context);

  const [faceId, setFaceId] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [language, setLanguage] = useState("EN");
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const LANGUAGES = ["ES", "EN", "CA"];

  const [currency, setCurrency] = useState("USD");
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
  const CURRENCIES = ["USD", "EUR", "GBP", "MXN"];

  const BASE_URL = "http://10.10.5.215:8080";

  useEffect(() => {
    if (!userId) return;

    const loadSettings = async () => {
      try {
        const res = await fetch(`${BASE_URL}/API/Settings/${userId}`);
        if (!res.ok) return;

        const data = await res.json();

        if (typeof data.theme === "boolean") setIsDarkMode(data.theme);
        if (typeof data.faceId === "boolean") setFaceId(data.faceId);
        if (data.language) setLanguage(data.language);
        if (data.currency) setCurrency(data.currency);
      } catch (e) {
        console.log("LOAD SETTINGS ERROR", e);
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
        console.log("SAVE SETTINGS ERROR", res.status, txt);
      }
    } catch (e) {
      console.log("SAVE SETTINGS EXCEPTION", e);
    }
  };

  return (
    <SafeAreaView style={common.safe || styles.container}>
      <View style={common.headerRow || styles.header}>
        <TouchableOpacity>
          <Icon name="arrow-back-ios-new" size={22} color={COLORS.textMain || "#fff"} />
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
              source={{ uri: "https://randomuser.me/api/portraits/men/1.jpg" }}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Icon name="edit" size={14} color={COLORS.bg || "#000"} />
            </View>
          </View>

          <Text style={styles.name}>Juan Pérez</Text>

          <View style={styles.walletRow}>
            <View style={styles.dot} />
            <Text style={styles.walletText}>0x71C...9A21</Text>
            <Icon
              name="content-copy"
              size={14}
              color={COLORS.textMuted || "rgba(255,255,255,0.6)"}
            />
          </View>
        </View>

        <Section title={t("profile.sections.account")}>
          <Item
            icon="person"
            label={t("profile.items.editProfile")}
            onPress={() =>
              props.navigation.navigate("EditarPerfil", {
                user: {
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
  walletText: {
    color: COLORS.textMain || "#fff",
    fontSize: 12,
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
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
  itemText: {
    fontSize: 16,
    color: COLORS.textMain || "#fff",
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.primary,
  },
  rightText: {
    color: COLORS.textMuted || "rgba(255,255,255,0.6)",
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
    color: COLORS.danger || "#ff4444",
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: COLORS.textMuted || "rgba(255,255,255,0.6)",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.cardBg || "#ffffff",
    borderRadius: 16,
    paddingVertical: 10,
    width: 200,
    borderWidth: 1,
    borderColor: COLORS.border || "rgba(0,0,0,0.15)",
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  modalText: {
    color: COLORS.textMain || "#000",
    fontSize: 16,
  },
});
