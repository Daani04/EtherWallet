import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Pressable
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const RegistroUsuario = (props) => {
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const termsText = useMemo(() => {
        return "Acepto los Términos de Servicio y la Política de Privacidad.";
    }, []);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.safe}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
                <View style={styles.root}>
                    {/* Decoración tipo “blobs” (igual que InicioSesion) */}
                    <View style={[styles.blob, styles.blobTopRight]} />
                    <View style={[styles.blob, styles.blobBottomLeft]} />

                    <View style={styles.container}>
           
                        {/* Headline */}
                        <View style={styles.headLeft}>
                            <Text style={styles.title}>Crea tu cuenta</Text>
                            <Text style={styles.subtitle}>
                                Únete al futuro de las finanzas cripto hoy.{"\n"}Regístrate para comenzar a operar.
                            </Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            {/* Username */}
                            <Text style={styles.label}>Nombre de usuario</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="person-outline"
                                    size={20}
                                    color={COLORS.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    placeholder="ej. usuario2001"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    autoCapitalize="none"
                                />
                            </View>

                            {/* Email */}
                            <Text style={styles.label}>Correo electrónico</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons
                                    name="mail-outline"
                                    size={20}
                                    color={COLORS.textMuted}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    placeholder="ej. usuario2001@email.com"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Password */}
                            <Text style={styles.label}>Contraseña</Text>
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

                            {/* Terms */}
                            <TouchableOpacity
                                style={styles.termsRow}
                                activeOpacity={0.8}
                                onPress={() => setAcceptedTerms((v) => !v)}
                            >
                                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                    {acceptedTerms ? (
                                        <MaterialIcons name="check" size={16} color={COLORS.backgroundDark} />
                                    ) : null}
                                </View>

                                <Text style={styles.termsText}>
                                    Acepto los{" "}
                                    <Text style={styles.termsLink}>Términos de Servicio</Text> y la{" "}
                                    <Text style={styles.termsLink}>Política de Privacidad</Text>.
                                </Text>
                            </TouchableOpacity>

                            {/* Submit */}
                            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85}>
                                <Text style={styles.primaryBtnText}>REGISTRARSE</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>O regístrate con</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialGrid}>
                            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.85}>
                                <View style={styles.socialIconCircle}>
                                    {/* “G” simple para no depender de SVG */}
                                    <Text style={styles.socialIconText}>G</Text>
                                </View>
                                <Text style={styles.socialBtnText}>Google</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                ¿Ya tienes una cuenta?{" "}
                                <Pressable onPress={() => props.navigation.navigate('InicioSesion')}>
                                    <Text style={styles.footerLink}>Iniciar Sesion</Text>
                                </Pressable>
                            </Text>
                        </View>

                        <View style={{ height: 10 }} />
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
    textMuted: "#9db9a8",
    textMutedSoft: "rgba(255,255,255,0.6)",
};

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.backgroundDark },
    scrollContainer: { flexGrow: 1 },
    root: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 32,
    },

    // Fondo decorativo
    blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
    blobTopRight: { width: 400, height: 400, top: -110, right: -120 },
    blobBottomLeft: { width: 300, height: 300, bottom: -60, left: -120 },

    container: { width: "100%", maxWidth: 450, paddingHorizontal: 24 },

    // Top bar
    topBar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 6,
        paddingBottom: 10,
    },
    backBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },

    // Headline
    headLeft: { marginTop: 4, marginBottom: 22 },
    title: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textMuted, lineHeight: 22 },

    // Form
    form: { width: "100%", gap: 12 },
    label: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
        marginTop: 6,
        marginBottom: -2,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.inputBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 56,
        paddingHorizontal: 16,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, color: "#fff", fontSize: 16 },
    eyeIcon: { padding: 4 },

    // Terms
    termsRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginTop: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    checkboxChecked: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    termsText: {
        flex: 1,
        color: COLORS.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
    termsLink: {
        color: COLORS.primary,
        fontWeight: "700",
    },

    // Primary button
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
    primaryBtnText: { color: COLORS.backgroundDark, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },

    // Divider
    dividerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 22,
        marginBottom: 14,
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { marginHorizontal: 12, color: COLORS.textMuted, fontSize: 13 },

    // Social
    socialGrid: { flexDirection: "row", gap: 12 },
    socialBtn: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.inputBg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    socialBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    socialIconCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    socialIconText: { color: "#000", fontSize: 12, fontWeight: "900" },

    // Footer
    footer: { marginTop: 24, alignItems: "center" },
    footerText: { color: COLORS.textMuted, fontSize: 14 },
    footerLink: { color: COLORS.primary, fontWeight: "800" },
});

export default RegistroUsuario;