import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PerfilUsuario from './perfilUsuario/perfilUsuario'

const Tab = createBottomTabNavigator();

const Home = () => {
  return (
      <Tab.Navigator>
        <Tab.Screen name="PerfilUsuario" component={PerfilUsuario} />
      </Tab.Navigator>
  );
};

export default Home;
