import { createStackNavigator } from "@react-navigation/stack";

import PerfilUsuario from './perfilUsuario/perfilUsuario';
import MenuTransacciones from './menuTransacciones/menuTransacciones'
import MenuPrincipal from './menuPrincipal/menuPrincipal';
import Billetera from './billetera/billetera';
import MenuNoticias from './menuNoticias/menuNoticias'

const Stack = createStackNavigator();

const HomeNav = () => {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PerfilUsuario" component={PerfilUsuario} />
        <Stack.Screen name="MenuTransacciones" component={MenuTransacciones} />
        <Stack.Screen name="Billetera" component={Billetera} />
        <Stack.Screen name="MenuNoticias" component={MenuNoticias} />
      </Stack.Navigator>
  );
};

export default HomeNav;

