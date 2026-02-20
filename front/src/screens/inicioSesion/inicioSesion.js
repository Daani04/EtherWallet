import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
  SafeAreaView,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useTranslation } from "react-i18next";
import CryptoJS from "crypto-js";

import common from "../../styles/common";
import theme from "../../styles/theme";
import Context from "../../context/Context";
import i18n from "../../../assets/i18n";

const COLORS = theme?.colors || theme?.COLORS || theme;
const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const BASE_URL = "http://35.170.12.68:8080";

const InicioSesion = (props) => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser, setUserId } = useContext(Context);

  const [mail, setMail] = useState("");
  const [psw, setPsw] = useState("");

  const [langModalVisible, setLangModalVisible] = useState(false);
  const LANGUAGES = Object.keys(i18n.options.resources).map((lng) =>
    lng.toUpperCase()
  );

  const currentLng = String(i18n.language || "ES")
    .split("-")[0]
    .toUpperCase();

  const changeLang = async (lng) => {
    try {
      await i18n.changeLanguage(String(lng).toUpperCase());
    } catch (e) {
      console.log("CHANGE LANG ERROR", e);
    } finally {
      setLangModalVisible(false);
    }
  };

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      console.log({ hasHardware, isEnrolled, supportedTypes });

      if (!hasHardware) {
        return Alert.alert(
          t("login.biometric.noSupportTitle"),
          t("login.biometric.noSupportMsg")
        );
      }

      if (!isEnrolled) {
        return Alert.alert(
          t("login.biometric.notEnrolledTitle"),
          t("login.biometric.notEnrolledMsg")
        );
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("login.biometric.promptMessage"),
        fallbackLabel: t("login.biometric.fallbackLabel"),
      });

      if (result.success) {
        Alert.alert(t("login.biometric.successTitle"), t("login.biometric.successMsg"));
      } else {
        Alert.alert(
          t("login.biometric.notAuthTitle"),
          result.error ? `Motivo: ${result.error}` : t("login.biometric.cancelled")
        );
      }
    } catch (error) {
      Alert.alert(t("login.biometric.criticalTitle"), error.message);
    }
  };

  const handleLogin = async () => {
    console.log("LOGIN CLICK", { mail, psw });

    if (!mail || !psw) {
      Alert.alert(t("login.alerts.errorTitle"), t("login.alerts.fillAllFields"));
      return;
    }

    const hashedPassword = CryptoJS.SHA256(psw).toString();

    try {
      // 1) LOGIN: Validar credenciales
      const response = await fetch(`${BASE_URL}/API/Login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mail, password: hashedPassword }),
      });

      const text = await response.text();

      Alert.alert(
        response.ok ? t("login.biometric.successTitle") : t("login.alerts.errorTitle"),
        text
      );

      if (!response.ok) return;

      // 2) Obtener ID por email
      const idRes = await fetch(
        `${BASE_URL}/API/UserIdByEmail?email=${encodeURIComponent(mail)}`,
        { method: "GET" }
      );

      const idText = await idRes.text();

      if (!idRes.ok) {
        Alert.alert(t("login.alerts.errorTitle"), "Login OK, pero no se pudo obtener el ID.");
        return;
      }

      const idData = JSON.parse(idText);
      const fetchedId = idData?.id;

      if (!fetchedId) {
        Alert.alert(
          t("login.alerts.errorTitle"),
          "Login OK, pero la respuesta no trae un ID válido."
        );
        return;
      }

      // 3) Obtener datos completos del usuario (walletAddress, firstName, etc.)
      const userRes = await fetch(`${BASE_URL}/API/User/${fetchedId}`, { method: "GET" });

      if (!userRes.ok) {
        Alert.alert("Error", "Login OK, pero no se pudieron recuperar los datos del perfil.");
        return;
      }

      const fullUserData = await userRes.json();
      console.log("DATOS COMPLETOS RECUPERADOS:", fullUserData);

      // 4) Guardar en Context
      setUserId(fetchedId);
      await loginUser({ ...fullUserData, userId: fetchedId });

      // 5) Navegar
      props.navigation.navigate("HomeNav");
    } catch (error) {
      console.log("FETCH ERROR", error);
      Alert.alert(t("login.alerts.errorTitle"), t("login.alerts.connectionError"));
    }
  };

  const renderLangModal = () => (
    <Modal
      transparent
      visible={langModalVisible}
      animationType="fade"
      onRequestClose={() => setLangModalVisible(false)}
    >
      <Pressable style={styles.langOverlay} onPress={() => setLangModalVisible(false)}>
        <Pressable style={styles.langModal} onPress={() => { }}>
          {LANGUAGES.map((lng) => (
            <TouchableOpacity
              key={lng}
              style={styles.langItem}
              onPress={() => changeLang(lng)}
              activeOpacity={0.85}
            >
              <Text style={styles.langText}>{lng}</Text>
              {currentLng === lng && (
                <MaterialIcons name="check" size={20} color={COLORS.primary || "#2bee79"} />
              )}
            </TouchableOpacity>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );


const renderContent = () => (
  <View style={[styles.root, isWeb && styles.rootWeb]}>
      <View style={[styles.blob, styles.blobTopRight]} />
      <View style={[styles.blob, styles.blobBottomLeft]} />

      <View style={[styles.container, isWeb && styles.containerWeb]}>
        <View style={styles.langBtnWrap}>
          <TouchableOpacity
            onPress={() => setLangModalVisible(true)}
            activeOpacity={0.85}
            style={styles.langBtn}
          >
            <MaterialIcons name="language" size={22} color={COLORS.primary || "#2bee79"} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroWrap}>
          <View style={styles.heroCard}>
            <ImageBackground source={require("../../../assets/logo.png")} style={styles.heroImg}>
              <LinearGradient
                colors={["transparent", "rgba(16,34,23,0.8)", COLORS?.backgroundDark || "#102217"]}
                locations={[0.0, 0.7, 1.0]}
                style={styles.heroGradient}
              />
            </ImageBackground>
          </View>
        </View>

        <View style={styles.head}>
          <Text style={styles.title}>{t("login.title")}</Text>
          <Text style={styles.subtitle}>{t("login.subtitle")}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="mail-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
            <TextInput
              placeholder={t("login.placeholders.email")}
              placeholderTextColor={COLORS?.textMuted || "#9db9a8"}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={(userMail) => setMail(userMail)}
              value={mail}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
            <TextInput
              placeholder={t("login.placeholders.password")}
              placeholderTextColor="rgba(157,185,168,0.55)"
              style={styles.input}
              secureTextEntry={!showPassword}
              onChangeText={(userPsw) => setPsw(userPsw)}
              value={psw}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              activeOpacity={0.7}
              onPress={() => setShowPassword((v) => !v)}
            >
              <MaterialIcons
                name={showPassword ? "visibility" : "visibility-off"}
                size={20}
                color={COLORS?.textMuted || "rgba(255,255,255,0.6)"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotPassRow}>
            <Text style={styles.forgotPassText}>{t("login.forgotPassword")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleLogin}>
            <Text style={styles.primaryBtnText}>{t("login.buttons.login")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.8} onPress={handleBiometricAuth}>
            <MaterialIcons name="face" size={24} color="#ffffff" />
            <Text style={styles.secondaryBtnText}>{t("login.buttons.faceId")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t("NoAccount.Question")}{" "}
            <Pressable onPress={() => props.navigation.navigate("RegistroUsuario")}>
              <Text style={styles.footerLink}>{t("NoAccount.Register")}</Text>
            </Pressable>
          </Text>
        </View>

    {renderLangModal()}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[common.safe || styles.safe, isWeb && styles.safeWeb]}>
      <View style={styles.page}>
        {isWeb ? (
          <View style={styles.webScroll}>
  {renderContent()}
</View>
        ) : (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={common.safe || styles.safe}
          >
            <ScrollView
              contentContainerStyle={common.container || styles.scrollContainer}
              bounces={false}
            >
              <Content />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS?.backgroundDark || "#102217" },
  scrollContainer: { flexGrow: 1 },

  // ✅ WEB scroll como tú querías
  safeWeb: {
    height: "100vh",
    overflow: "hidden",
  },
  page: {
    flex: 1,
    position: "relative",
  },
  webScroll: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: "auto",
    overflowX: "hidden",
  },
  rootWeb: {
    justifyContent: "flex-start",
    paddingVertical: 20,
  },
  containerWeb: {
    transform: [{ scale: 0.9 }],
    alignSelf: "center",
  },

  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },

  blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
  blobTopRight: { width: 400, height: 400, top: -100, right: -100 },
  blobBottomLeft: { width: 300, height: 300, bottom: -50, left: -100 },

  container: { width: "100%", maxWidth: 450, paddingHorizontal: 24, position: "relative" },

  langBtnWrap: { position: "absolute", top: 0, right: 24, zIndex: 50 },
  langBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS?.cardBg || "#1c2720",
    borderWidth: 1,
    borderColor: COLORS?.border || "#3b5445",
  },

  heroWrap: { marginBottom: 20, alignItems: "center", width: "100%" },
  heroCard: {
    width: "90%",
    aspectRatio: 16.4 / 12,
    borderRadius: 24,
    backgroundColor: "transparent",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    overflow: "hidden",
  },
  heroImg: { flex: 1, width: "100%", height: "100%" },
  heroGradient: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },

  head: { marginBottom: 32, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "700", color: COLORS?.textMain || "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS?.textMuted || "rgba(255,255,255,0.6)" },

  form: { width: "100%", gap: 16 },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS?.cardBg || "#1c2720",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS?.border || "#3b5445",
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS?.textMain || "#fff", fontSize: 16 },
  eyeIcon: { padding: 4 },

  forgotPassRow: { alignSelf: "flex-end", marginTop: -8 },
  forgotPassText: { color: COLORS?.primary || "#2bee79", fontSize: 14, fontWeight: "500" },

  primaryBtn: {
    backgroundColor: COLORS?.primary || "#2bee79",
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: COLORS?.primary || "#2bee79",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: { color: COLORS?.backgroundDark || "#102217", fontSize: 18, fontWeight: "700" },

  secondaryBtn: {
    flexDirection: "row",
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: COLORS?.border || "#3b5445",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryBtnText: { color: COLORS?.textMain || "#fff", fontSize: 16, fontWeight: "500" },

  footer: { marginTop: 32, alignItems: "center" },
  footerText: { color: COLORS?.textMuted || "rgba(255,255,255,0.6)", fontSize: 14 },
  footerLink: { color: COLORS?.primary || "#2bee79", fontWeight: "700" },

  langOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  langModal: {
    width: 220,
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: COLORS?.cardBg || "#ffffff",
    borderWidth: 1,
    borderColor: COLORS?.border || "rgba(0,0,0,0.15)",
  },
  langItem: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langText: { fontSize: 16, color: COLORS?.textMain || "#000" },
});

export default InicioSesion;
