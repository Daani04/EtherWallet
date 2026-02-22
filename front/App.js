import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "./src/context/Context";
import { SettingsProvider } from "./src/context/SettingsContext";

import InicioSesion from "./src/screens/inicioSesion/inicioSesion";
import RegistroUsuario from "./src/screens/registroUsuario/registroUsuario";
import HomeNav from "./src/screens/HomeNav";
import LegalModal from "./src/screens/registroUsuario/LegalModal";
import "./assets/i18n";

import "react-native-get-random-values";
import "@ethersproject/shims";

const Stack = createStackNavigator();

const App = () => (
  <Provider>
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="InicioSesion" component={InicioSesion} />
          <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
          <Stack.Screen name="HomeNav" component={HomeNav} />
          <Stack.Screen name="LegalModal" component={LegalModal} />
        </Stack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  </Provider>
);

export default App;
