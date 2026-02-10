import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import "./assets/i18n";
import { Provider } from "./src/context/Context";

import InicioSesion from "./src/screens/inicioSesion/inicioSesion";
import RegistroUsuario from "./src/screens/registroUsuario/registroUsuario";
import HomeNav from './src/screens/HomeNav';
import MenuTransacciones from "./src/screens/menuTransacciones/menuTransacciones";
import MenuPrincipal from "./src/screens/menuPrincipal/menuPrincipal";


const Stack = createStackNavigator();

const App = () => (
  <Provider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MenuPrincipal" component={MenuPrincipal} />
        <Stack.Screen name="Billetera" component={Billetera} />
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
        <Stack.Screen name="RegistroUsuario" component={RegistroUsuario} />
        <Stack.Screen name="HomeNav" component={HomeNav} />
        <Stack.Screen name="MenuTransacciones" component={MenuTransacciones} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

export default App;
