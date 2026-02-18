import "react-native-get-random-values";
import "@ethersproject/shims";

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  Image,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CryptoJS from "crypto-js";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import i18n from "../../../assets/i18n";

import common from "../../styles/common";
import theme from "../../styles/theme";

const COLORS = theme?.colors || theme?.COLORS || theme;

const RegistroUsuario = (props) => {
  const { t } = useTranslation();

  const [langModalVisible, setLangModalVisible] = useState(false);
  const LANGUAGES = ["ES", "EN", "CA"];
  const changeLang = (lng) => {
    i18n.changeLanguage(lng);
    setLangModalVisible(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const [mail, setMail] = useState("");
  const [psw, setPsw] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dni, setDni] = useState("");
  const [fNac, setFnac] = useState("");
  const [webDateOpen, setWebDateOpen] = useState(false);

  const [userImageBase64, setUserImageBase64] = useState("");
  const [userImagePreview, setUserImagePreview] = useState("");
  const webFileInputRef = useRef(null);

  const pickImage = async () => {
    try {
      if (Platform.OS === "web") {
        if (webFileInputRef.current) webFileInputRef.current.click();
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t("common.error"), t("register.errors.permissionGallery"));
        return;
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

      setUserImagePreview(asset.uri || "");
      if (asset.base64) setUserImageBase64(asset.base64);
    } catch (e) {
      console.error(e);
      Alert.alert(t("common.error"), t("register.errors.openGallery"));
    }
  };

  const onWebFileChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setUserImagePreview(dataUrl);
      const base64 = String(dataUrl).split(",")[1] || "";
      setUserImageBase64(base64);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleRegister = async () => {
    if (!name || !lastName || !mail || !psw || !dni || !fNac) {
      Alert.alert(t("common.error"), t("register.errors.completeAll"));
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(t("common.error"), t("register.errors.acceptTerms"));
      return;
    }

    try {
      const wallet = ethers.Wallet.createRandom();
      const privateKey = wallet.privateKey;
      const publicAddress = wallet.address;

      if (Platform.OS === "web") {
        if (typeof window !== "undefined") {
          window.localStorage.setItem("user_private_key", privateKey);
          window.localStorage.setItem("user_address", publicAddress);
        }
      } else {
        await SecureStore.setItemAsync("user_private_key", privateKey);
        await SecureStore.setItemAsync("user_address", publicAddress);
      }

      const hashedPassword = CryptoJS.SHA256(psw).toString();

      const response = await fetch("http://localhost:8080/API/NewUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: name,
          lastName: lastName,
          email: mail,
          password: hashedPassword,
          dni: dni,
          birthDate: fNac,
          userImage: userImageBase64 ? userImageBase64 : "default-avatar.png",
          favoriteId: "null",
          walletAddress: publicAddress,
        }),
      });

      const text = await response.text();

      if (response.ok) {
        Alert.alert(t("register.success.title"), t("register.success.registered"));
        props.navigation.navigate("InicioSesion");
      } else {
        Alert.alert(t("common.error"), text || t("register.errors.cannotRegister"));
      }
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      Alert.alert(t("common.error"), t("register.errors.serverConnection"));
    }
  };

  const onChange = (event, selectedDate) => {
    setShow(false);
    if (!selectedDate) return;

    setDate(selectedDate);

    const day = String(selectedDate.getDate()).padStart(2, "0");
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const year = selectedDate.getFullYear();

    setFnac(`${day}/${month}/${year}`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={common.safe || styles.safe}
    >
      <ScrollView contentContainerStyle={common.container || styles.scrollContainer} bounces={false}>
        <View style={styles.root}>
          <View style={[styles.blob, styles.blobTopRight]} />
          <View style={[styles.blob, styles.blobBottomLeft]} />

          <View style={styles.container}>
            {/* ✅ AÑADIDO: botón arriba a la derecha */}
            <View style={styles.langBtnWrap}>
              <TouchableOpacity
                onPress={() => setLangModalVisible(true)}
                activeOpacity={0.85}
                style={styles.langBtn}
              >
                <MaterialIcons name="language" size={22} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.headLeft}>
              <Text style={styles.title}>{t("register.title")}</Text>
              <Text style={styles.subtitle}>
                {t("register.subtitleLine1")}
                {"\n"}
                {t("register.subtitleLine2")}
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>{t("register.profilePhotoLabel")}</Text>

              <TouchableOpacity style={styles.avatarRow} activeOpacity={0.85} onPress={pickImage}>
                <View style={styles.avatarCircle}>
                  {userImagePreview ? (
                    <Image source={{ uri: userImagePreview }} style={styles.avatarImg} />
                  ) : (
                    <MaterialIcons name="person" size={28} color={COLORS.textMuted} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.avatarTitle}>{t("register.selectImage")}</Text>
                  <Text style={styles.avatarSub}>
                    {Platform.OS === "web" ? t("register.fromFiles") : t("register.fromGallery")}
                  </Text>
                </View>

                <MaterialIcons name="chevron-right" size={26} color={COLORS.textMuted} />
              </TouchableOpacity>

              {Platform.OS === "web" && (
                <input
                  ref={webFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={onWebFileChange}
                />
              )}

              <Text style={styles.label}>{t("register.labels.firstName")}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("register.placeholders.firstName")}
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <Text style={styles.label}>{t("register.labels.lastName")}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="person-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("register.placeholders.lastName")}
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>

              <Text style={styles.label}>{t("register.labels.email")}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="mail-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("register.placeholders.email")}
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={mail}
                  onChangeText={setMail}
                />
              </View>

              <Text style={styles.label}>{t("register.labels.password")}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock-outline"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  value={psw}
                  onChangeText={setPsw}
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>{t("register.labels.dni")}</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="fingerprint"
                  size={20}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("register.placeholders.dni")}
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  autoCapitalize="characters"
                  value={dni}
                  onChangeText={setDni}
                />
              </View>

              <Text style={styles.label}>{t("register.labels.birthDate")}</Text>

              {Platform.OS === "web" ? (
                <View style={{ position: "relative" }}>
                  <TouchableOpacity
                    style={styles.inputContainer}
                    activeOpacity={0.7}
                    onPress={() => setWebDateOpen(true)}
                  >
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color={COLORS.textMuted}
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.input,
                        !fNac && { color: "rgba(157,185,168,0.55)" },
                        { lineHeight: 56 },
                      ]}
                    >
                      {fNac ? fNac : t("register.placeholders.birthDate")}
                    </Text>
                  </TouchableOpacity>

                  {webDateOpen && (
                    <input
                      type="date"
                      autoFocus
                      max={new Date().toISOString().split("T")[0]}
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 60,
                        zIndex: 9999,
                      }}
                      onBlur={() => setWebDateOpen(false)}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;

                        const [yyyy, mm, dd] = value.split("-");
                        const selectedDate = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
                        setDate(selectedDate);
                        setFnac(`${dd}/${mm}/${yyyy}`);
                        setWebDateOpen(false);
                      }}
                    />
                  )}
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => {
                    if (Platform.OS === "android") {
                      DateTimePickerAndroid.open({
                        value: date,
                        mode: "date",
                        display: "calendar",
                        maximumDate: new Date(),
                        onChange,
                      });
                    } else {
                      setShow(true);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={20}
                    color={COLORS.textMuted}
                    style={styles.inputIcon}
                  />
                  <Text
                    style={[
                      styles.input,
                      !fNac && { color: "rgba(157,185,168,0.55)" },
                      { lineHeight: 56 },
                    ]}
                  >
                    {fNac ? fNac : t("register.placeholders.birthDate")}
                  </Text>
                </TouchableOpacity>
              )}

              {show && Platform.OS === "ios" && (
                <View style={styles.iosPickerWrap}>
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="inline"
                    onChange={onChange}
                    maximumDate={new Date()}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.8}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && (
                    <MaterialIcons name="check" size={16} color={COLORS.bg || COLORS.backgroundDark} />
                  )}
                </View>

                <Text style={styles.termsText}>
                  {t("register.terms.acceptPrefix")}{" "}
                  <Text style={styles.termsLink}>{t("register.terms.termsOfService")}</Text>{" "}
                  {t("register.terms.and")}{" "}
                  <Text style={styles.termsLink}>{t("register.terms.privacyPolicy")}</Text>.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleRegister}>
                <Text style={styles.primaryBtnText}>{t("register.actions.register")}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("register.footer.haveAccount")} </Text>
            <Pressable onPress={() => props.navigation.navigate("InicioSesion")}>
              <Text style={styles.footerLink}>{t("register.footer.login")}</Text>
            </Pressable>
          </View>

          {/* ✅ AÑADIDO: modal ES/EN/CA */}
          <Modal
            transparent
            visible={langModalVisible}
            animationType="fade"
            onRequestClose={() => setLangModalVisible(false)}
          >
            <Pressable
              style={styles.langOverlay}
              onPress={() => setLangModalVisible(false)}
            >
              <View style={styles.langModal}>
                {LANGUAGES.map((lng) => (
                  <TouchableOpacity
                    key={lng}
                    style={styles.langItem}
                    onPress={() => changeLang(lng)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.langText}>{lng}</Text>
                    {i18n.language === lng && (
                      <MaterialIcons name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Pressable>
          </Modal>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg || COLORS.backgroundDark },

  scrollContainer: { flexGrow: 1 },

  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32 },

  blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
  blobTopRight: { width: 400, height: 400, top: -110, right: -120 },
  blobBottomLeft: { width: 300, height: 300, bottom: -60, left: -120 },

  container: { width: "100%", maxWidth: 450, paddingHorizontal: 24 },

  // ✅ AÑADIDO (solo para el botón)
  langBtnWrap: { alignItems: "flex-end", marginTop: 6 },
  langBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBg || COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headLeft: { marginTop: 4, marginBottom: 22 },
  title: { fontSize: 32, fontWeight: "800", color: COLORS.textMain || "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textMuted, lineHeight: 22 },

  form: { width: "100%", gap: 12 },

  label: {
    color: COLORS.textMain || "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
    marginTop: 6,
    marginBottom: -2,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBg || COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: COLORS.textMain || "#fff", fontSize: 16 },
  eyeIcon: { padding: 4 },

  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.cardBg || COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 52, height: 52 },
  avatarTitle: { color: COLORS.textMain || "#fff", fontWeight: "800" },
  avatarSub: { color: COLORS.textMuted, marginTop: 2, fontSize: 12 },

  termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 32 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg || COLORS.inputBg,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  termsText: { flex: 1, color: COLORS.textMuted, fontSize: 14, lineHeight: 20 },
  termsLink: { color: COLORS.primary, fontWeight: "700" },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: {
    color: COLORS.bg || COLORS.backgroundDark,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  footer: { marginTop: 24, alignItems: "center" },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontWeight: "800" },

  iosPickerWrap: {
    backgroundColor: COLORS.textMain || "#fff",
    borderRadius: 16,
    marginTop: 8,
    overflow: "hidden",
    padding: 6,
  },

  // ✅ AÑADIDO (solo para el modal)
  langOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  langModal: {
    width: 220,
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.cardBg || "#fff",
    borderWidth: 1,
    borderColor: COLORS.border || "rgba(0,0,0,0.15)",
  },
  langItem: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  langText: { fontSize: 16, color: COLORS.textMain || "#000" },
});

export default RegistroUsuario;
