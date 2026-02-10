import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

const COLORS = {
  primary: "#2bee79",
  bg: "#0d1a12",
  white: "#ffffff",
};

const BottomBar = () => {
  const navigation = useNavigation();
  const route = useRoute(); // Para saber en qué pantalla estamos

  // Función para determinar si el botón debe estar activo (verde)
  const isActive = (screenName) => route.name === screenName;

  return (
    <View style={styles.bottomBar}>
      <TabItem 
        icon="candlestick-chart" 
        label="Inicio"
        onPress={() => navigation.navigate('MenuPrincipal')}  
      />

      <TabItem 
        icon="account-balance-wallet" 
        label="Billetera" 
        active={isActive('Billetera')} 
        onPress={() => navigation.navigate('Billetera')} 
      />

      {/* Botón Central */}
      <Pressable onPress={() => navigation.navigate('MenuTransacciones')}>
        <View style={styles.centerButton}>
          <Icon name="swap-vert" size={28} color="#000" />
        </View>
      </Pressable>

      <TabItem
        icon="article" 
        label="Noticias" 
        onPress={() => {}} 
      />

      <TabItem 
        icon="settings" 
        label="Ajustes" 
        active={isActive('PerfilUsuario')} 
        onPress={() => navigation.navigate('PerfilUsuario')} 
    />
    
    </View>
  );
};

const TabItem = ({ icon, label, active, onPress }) => (
  <Pressable onPress={onPress} style={styles.tabItem}>
    <Icon name={icon} size={24} color={active ? COLORS.primary : "#888"} />
    <Text style={[styles.bottomText, active && { color: COLORS.primary }]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 75,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(13, 26, 18, 0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingBottom: 10, 
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomText: {
    fontSize: 10,
    marginTop: 4,
    color: "#888",
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25, 
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});

export default BottomBar;