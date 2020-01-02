import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import MainScreen from "./src/MainScreen";


const RootStack = createStackNavigator({

  
  MainScreen: {screen: MainScreen},

	},

	{ mode: 'modal', headerMode: 'none' }
	
	);

const App = createAppContainer(RootStack);

export default App;
