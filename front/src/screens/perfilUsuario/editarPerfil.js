import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import CryptoJS from "crypto-js";

const COLORS = {
  primary: "#2bee79",
  bg: "#0d1a12",
  card: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.15)",
  white: "#ffffff",
  muted: "rgba(255, 255, 255, 0.6)",
};

const API_BASE = "http://10.10.5.213:8080";

export default function EditarPerfil({ navigation, route }) {
  const user = route?.params?.user;

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [birthDate, setBirthDate] = useState(user?.birthDate ?? "");
  const [userImage, setUserImage] = useState(user?.userImage ?? "");
  const [password, setPassword] = useState("");

  const canSave = useMemo(() => {
    return firstName.trim() && lastName.trim() && birthDate.trim() && userImage.trim();
  }, [firstName, lastName, birthDate, userImage]);

  const onSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "No tengo el id del usuario (falta user.id).");
      return;
    }
    if (!canSave) {
      Alert.alert("Error", "Rellena firstName, lastName, birthDate y userImage.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate.trim(),
      userImage: userImage.trim(),
      dni: user?.dni ?? "",
      email: user?.email ?? "",
      favoriteId: user?.favoriteId ?? "null",
      password: user?.password ?? "",
    };

    if (password.trim().length > 0) {
      payload.password = CryptoJS.SHA256(password.trim()).toString();
    }

    try {
      const res = await fetch(`${API_BASE}/EditUser/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.text();

      if (!res.ok) {
        Alert.alert("Error", data);
        return;
      }

      Alert.alert("Ok", "Perfil actualizado");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Editar perfil</Text>

      <View style={styles.avatarBox}>
        <Image
          source={{ uri: userImage?.startsWith("http") ? userImage : "https://via.placeholder.com/90" }}
          style={styles.avatar}
        />
        <Text style={styles.help}>Pega una URL de imagen (por ahora)</Text>
      </View>

      <Text style={styles.label}>Imagen (userImage)</Text>
      <TextInput value={userImage} onChangeText={setUserImage} style={styles.input} placeholder="https://..." placeholderTextColor={COLORS.muted} />

      <Text style={styles.label}>Nombre (firstName)</Text>
      <TextInput value={firstName} onChangeText={setFirstName} style={styles.input} placeholder="Nombre" placeholderTextColor={COLORS.muted} />

      <Text style={styles.label}>Apellidos (lastName)</Text>
      <TextInput value={lastName} onChangeText={setLastName} style={styles.input} placeholder="Apellidos" placeholderTextColor={COLORS.muted} />

      <Text style={styles.label}>Fecha nacimiento (birthDate)</Text>
      <TextInput value={birthDate} onChangeText={setBirthDate} style={styles.input} placeholder="dd/mm/yyyy" placeholderTextColor={COLORS.muted} />

      <Text style={styles.label}>Nueva contraseña (opcional)</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="Deja vacío para no cambiar"
        placeholderTextColor={COLORS.muted}
        secureTextEntry
      />

      <TouchableOpacity style={[styles.btn, { opacity: canSave ? 1 : 0.5 }]} onPress={onSave} disabled={!canSave}>
        <Text style={styles.btnText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}>
        <Text style={styles.btnGhostText}>Cancelar</Text>
      </TouchableOpacity>
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
  btn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: "center",
  },
  btnText: { color: "#000", fontWeight: "900" },
  btnGhost: { padding: 14, borderRadius: 14, marginTop: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  btnGhostText: { color: COLORS.white, fontWeight: "700" },
  avatarBox: { alignItems: "center", marginBottom: 8 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.primary, marginBottom: 6 },
  help: { color: COLORS.muted, fontSize: 12 },
});
