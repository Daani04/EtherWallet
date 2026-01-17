import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import { Provider } from './src/context/Context';

import InicioSesion from "./src/screens/inicioSesion/inicioSesion";

const Stack = createStackNavigator();

const App = () => (
  <Provider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="InicioSesion" component={InicioSesion} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

export default App;