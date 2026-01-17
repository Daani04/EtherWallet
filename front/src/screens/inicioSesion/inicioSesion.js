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
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';

const { width } = Dimensions.get("window");

export default function InicioSesion() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.safe}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        <View style={styles.root}>
          {/* Elementos decorativos de fondo (Blobs del HTML) */}
          <View style={[styles.blob, styles.blobTopRight]} />
          <View style={[styles.blob, styles.blobBottomLeft]} />

          <View style={styles.container}>
            {/* Header Image Card (Blockchain Globe) */}
            <View style={styles.heroWrap}>
              <View style={styles.heroCard}>
                <ImageBackground
                  source={require("../../../assets/logo.jpeg")}
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

            {/* Headline corregido */}
            <View style={styles.head}>
              <Text style={styles.title}>Bienvenido</Text>
              <Text style={styles.subtitle}>Accede a tu cartera segura</Text>
            </View>

            {/* Formulario */}
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor="#9db9a8"
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Password Field */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color="#9db9a8" style={styles.inputIcon} />
                <TextInput
                  placeholder="Contraseña"
                  placeholderTextColor="#9db9a8"
                  style={styles.input}
                  secureTextEntry={true}
                />
                <TouchableOpacity style={styles.eyeIcon}>
                  <MaterialIcons name="visibility" size={20} color="#9db9a8" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotPassRow}>
                <Text style={styles.forgotPassText}>¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>

              {/* Primary Action (Botón verde con sombra) */}
              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
                <Text style={styles.primaryBtnText}>Iniciar Sesión</Text>
              </TouchableOpacity>

              {/* Biometric Login (Botón secundario contorneado) */}
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.8}
                onPress={handleBiometricAuth}
              >
                <MaterialIcons name="face" size={24} color="#ffffff" />
                <Text style={styles.secondaryBtnText}>Ingresar con Face ID</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                ¿No tienes una cuenta?{" "}
                <Text style={styles.footerLink}>Regístrate</Text>
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

  // Fondo decorativo
  blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
  blobTopRight: { width: 400, height: 400, top: -100, right: -100 },
  blobBottomLeft: { width: 300, height: 300, bottom: -50, left: -100 },

  container: { width: "100%", maxWidth: 450, paddingHorizontal: 24 },

  heroWrap: {
    marginBottom: 20,
    alignItems: "center",
    width: "100%", // Ocupa todo el ancho disponible
  },
  heroCard: {
    width: "90%", // Deja un pequeño margen a los lados
    aspectRatio: 15.3 / 9, // Mantiene una proporción de aspecto cinematográfica
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: 'transparent',
    // Sombra para dar profundidad
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
    resizeMode: "contain", // "contain" asegura que se vea todo el logo sin cortarse
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: "30%", // El degradado solo cubre la parte inferior para no tapar el logo
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