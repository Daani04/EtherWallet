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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import CryptoJS from "crypto-js";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { ethers } from "ethers";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

const RegistroUsuario = (props) => {
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
                // abre el selector del input file
                if (webFileInputRef.current) webFileInputRef.current.click();
                return;
            }

            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Necesitas permisos para acceder a la galería.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
                base64: true, // ✅ importante para mandar al back
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset) return;

            setUserImagePreview(asset.uri || "");
            if (asset.base64) {
                // puedes mandar solo base64, o con prefijo data:
                setUserImageBase64(asset.base64);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "No se pudo abrir la galería.");
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
            Alert.alert("Error", "Por favor, completa todos los campos.");
            return;
        }

        if (!acceptedTerms) {
            Alert.alert("Error", "Debes aceptar los términos y condiciones.");
            return;
        }

        try {
            // WALLET
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const publicAddress = wallet.address;

            await SecureStore.setItemAsync("user_private_key", privateKey);
            await SecureStore.setItemAsync("user_address", publicAddress);

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

            if (response.ok) {
                Alert.alert("Éxito", "Usuario registrado correctamente");
                props.navigation.navigate("InicioSesion");
            } else {
                const text = await response.text();
                Alert.alert("Error", text || "No se pudo registrar");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo conectar con el servidor.");
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
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.safe}>
            <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
                <View style={styles.root}>
                    <View style={[styles.blob, styles.blobTopRight]} />
                    <View style={[styles.blob, styles.blobBottomLeft]} />

                    <View style={styles.container}>
                        <View style={styles.headLeft}>
                            <Text style={styles.title}>Crea tu cuenta</Text>
                            <Text style={styles.subtitle}>
                                Únete al futuro de las finanzas cripto hoy.{"\n"}Regístrate para comenzar a operar.
                            </Text>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Foto de perfil (opcional)</Text>
                            <TouchableOpacity style={styles.avatarRow} activeOpacity={0.85} onPress={pickImage}>
                                <View style={styles.avatarCircle}>
                                    {userImagePreview ? (
                                        <Image source={{ uri: userImagePreview }} style={styles.avatarImg} />
                                    ) : (
                                        <MaterialIcons name="person" size={28} color={COLORS.textMuted} />
                                    )}
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text style={styles.avatarTitle}>Seleccionar imagen</Text>
                                    <Text style={styles.avatarSub}>
                                        {Platform.OS === "web" ? "Desde archivos" : "Desde galería"}
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

                            <Text style={styles.label}>Nombre</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Tu nombre"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <Text style={styles.label}>Apellido</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="person-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="Tu apellido"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>

                            <Text style={styles.label}>Correo electrónico</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="ej. usuario@email.com"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    value={mail}
                                    onChangeText={setMail}
                                />
                            </View>

                            <Text style={styles.label}>Contraseña</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="lock-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
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
                                    <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color={COLORS.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.label}>DNI / NIE</Text>
                            <View style={styles.inputContainer}>
                                <MaterialIcons name="fingerprint" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    placeholder="12345678X"
                                    placeholderTextColor="rgba(157,185,168,0.55)"
                                    style={styles.input}
                                    autoCapitalize="characters"
                                    value={dni}
                                    onChangeText={setDni}
                                />
                            </View>

                            <Text style={styles.label}>Fecha de nacimiento</Text>

                            {Platform.OS === "web" ? (
                                <View style={{ position: "relative" }}>
                                    <TouchableOpacity style={styles.inputContainer} activeOpacity={0.7} onPress={() => setWebDateOpen(true)}>
                                        <MaterialIcons name="calendar-today" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                        <Text style={[styles.input, !fNac && { color: "rgba(157,185,168,0.55)" }, { lineHeight: 56 }]}>
                                            {fNac ? fNac : "Seleccionar fecha de nacimiento"}
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
                                    <MaterialIcons name="calendar-today" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                                    <Text style={[styles.input, !fNac && { color: "rgba(157,185,168,0.55)" }, { lineHeight: 56 }]}>
                                        {fNac ? fNac : "Seleccionar fecha de nacimiento"}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {show && Platform.OS === "ios" && (
                                <View style={styles.iosPickerWrap}>
                                    <DateTimePicker value={date} mode="date" display="inline" onChange={onChange} maximumDate={new Date()} />
                                </View>
                            )}

                            <TouchableOpacity style={styles.termsRow} activeOpacity={0.8} onPress={() => setAcceptedTerms(!acceptedTerms)}>
                                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                                    {acceptedTerms && <MaterialIcons name="check" size={16} color={COLORS.backgroundDark} />}
                                </View>
                                <Text style={styles.termsText}>
                                    Acepto los <Text style={styles.termsLink}>Términos de Servicio</Text> y la{" "}
                                    <Text style={styles.termsLink}>Política de Privacidad</Text>.
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleRegister}>
                                <Text style={styles.primaryBtnText}>REGISTRARSE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
                        <Pressable onPress={() => props.navigation.navigate("InicioSesion")}>
                            <Text style={styles.footerLink}>Iniciar Sesión</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

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
    root: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 32 },

    blob: { position: "absolute", backgroundColor: "rgba(43,238,121,0.08)", borderRadius: 999 },
    blobTopRight: { width: 400, height: 400, top: -110, right: -120 },
    blobBottomLeft: { width: 300, height: 300, bottom: -60, left: -120 },

    container: { width: "100%", maxWidth: 450, paddingHorizontal: 24 },
    headLeft: { marginTop: 4, marginBottom: 22 },
    title: { fontSize: 32, fontWeight: "800", color: "#fff", marginBottom: 8 },
    subtitle: { fontSize: 16, color: COLORS.textMuted, lineHeight: 22 },

    form: { width: "100%", gap: 12 },
    label: { color: "#fff", fontSize: 14, fontWeight: "600", marginLeft: 4, marginTop: 6, marginBottom: -2 },

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

    // ✅ avatar selector
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: COLORS.inputBg,
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
    avatarTitle: { color: "#fff", fontWeight: "800" },
    avatarSub: { color: COLORS.textMuted, marginTop: 2, fontSize: 12 },

    termsRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginTop: 32 },
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
    primaryBtnText: { color: COLORS.backgroundDark, fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },

    footer: { marginTop: 24, alignItems: "center" },
    footerText: { color: COLORS.textMuted, fontSize: 14 },
    footerLink: { color: COLORS.primary, fontWeight: "800" },

    iosPickerWrap: { backgroundColor: "#fff", borderRadius: 16, marginTop: 8, overflow: "hidden", padding: 6 },
});

export default RegistroUsuario;
