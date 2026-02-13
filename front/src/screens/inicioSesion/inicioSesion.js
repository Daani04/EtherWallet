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
  Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';
import CryptoJS from 'crypto-js';

const { width } = Dimensions.get("window");

const InicioSesion = (props) => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const [mail, setMail] = useState("");
  const [psw, setPsw] = useState("");


  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      // 1. Verificar qué detecta el teléfono exactamente
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // Debug: Esto te dirá en pantalla qué está pasando
      // Si sale hardware: false, es un tema de permisos/configuración de Expo
      console.log({ hasHardware, isEnrolled, supportedTypes });

      if (!hasHardware) {
        return Alert.alert('Error', 'Este dispositivo no soporta biometría.');
      }

      if (!isEnrolled) {
        return Alert.alert('Error', 'No tienes un rostro registrado en este iPhone.');
      }

      // 2. Autenticación (Configuración más compatible para iPhone 13)
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentícate con Face ID',
        fallbackLabel: 'Introducir código',
      });

      if (result.success) {
        Alert.alert('Éxito', 'Bienvenido');
      } else {
        Alert.alert('No autenticado', result.error ? `Motivo: ${result.error}` : 'Cancelado');
      }
    } catch (error) {
      Alert.alert('Error crítico', error.message);
    }
  };

  const handleLogin = async () => {
  console.log("LOGIN CLICK", { mail, psw });

  if (!mail || !psw) {
    Alert.alert("Error", "Por favor, rellena todos los campos");
    return;
  }

  const hashedPassword = CryptoJS.SHA256(psw).toString();
  console.log("HASHED", hashedPassword);

  try {
    const response = await fetch("http://10.10.3.178:8080/API/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: mail, password: hashedPassword }),
    });

    const text = await response.text();
    console.log("RESP", response.status, text);

    Alert.alert(response.ok ? "Éxito" : "Error", text);

    if (response.ok){
      props.navigation.navigate('HomeNav');
    }
  } catch (error) {
    console.log("FETCH ERROR", error);
    Alert.alert("Error", "Error de conexión. Inténtalo más tarde.");
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.safe}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.root}>
          <View style={[styles.blob, styles.blobTopRight]} />
          <View style={[styles.blob, styles.blobBottomLeft]} />

          <View style={styles.container}>
            <View style={styles.heroWrap}>
              <View style={styles.heroCard}>
                <ImageBackground
                  source={require("../../../assets/logo.png")}
                  style={styles.heroImg}
                >
                  <LinearGradient
                    colors={["transparent", "rgba(16,34,23,0.8)", "#102217"]}
                    locations={[0.0, 0.7, 1.0]}
                    style={styles.heroGradient}
                  />
                </ImageBackground>
              </View>
            </View>

            <View style={styles.head}>
              <Text style={styles.title}>Bienvenido</Text>
              <Text style={styles.subtitle}>Accede a tu cartera segura</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#9db9a8"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(userMail) => setMail(userMail)}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
                <TextInput
                  placeholder="••••••••••••"
                  placeholderTextColor="rgba(157,185,168,0.55)"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  onChangeText={(userPsw) => setPsw(userPsw)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassRow}>
                <Text style={styles.forgotPassText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8} onPress={handleLogin}>
                <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={handleBiometricAuth}
              >
                <MaterialIcons name="face" size={24} color="#ffffff" />
                <Text style={styles.secondaryBtnText}>Ingresar con Face ID</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {t('NoAccount.Question')}
                {" "}
                <Pressable onPress={() => props.navigation.navigate('RegistroUsuario')}>
                  <Text style={styles.footerLink}>Regístrate</Text>
                </Pressable>
                <Pressable onPress={() => props.navigation.navigate('HomeNav')}>
                  <Text style={styles.footerLink}>PerfilUsuari</Text>
                </Pressable>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const COLORS = {
  primary: "#2bee79",
  backgroundDark: "#102217",
  inputBg: "#1c2720",
  border: "#3b5445",
  textMuted: "rgba(255,255,255,0.6)",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.backgroundDark },
  scrollContainer: { flexGrow: 1 },
  root: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 },

  blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
  blobTopRight: { width: 400, height: 400, top: -100, right: -100 },
  blobBottomLeft: { width: 300, height: 300, bottom: -50, left: -100 },

  container: { width: "100%", maxWidth: 450, paddingHorizontal: 24 },

  heroWrap: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%", 
  },
  heroCard: {
    width: "90%", 
    aspectRatio: 16.4 / 12,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  heroImg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  heroImgRadius: {
    borderRadius: 24,
    resizeMode: "contain", 
  },

  head: { marginBottom: 32, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "700", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textMuted },

  form: { width: "100%", gap: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  eyeIcon: { padding: 4 },

  forgotPassRow: { alignSelf: "flex-end", marginTop: -8 },
  forgotPassText: { color: COLORS.primary, fontSize: 14, fontWeight: "500" },

  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  primaryBtnText: { color: COLORS.backgroundDark, fontSize: 18, fontWeight: "700" },

  secondaryBtn: {
    flexDirection: "row",
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "500" },

  footer: { marginTop: 32, alignItems: "center" },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
  footerLink: { color: COLORS.primary, fontWeight: "700" },
});

export default InicioSesion;