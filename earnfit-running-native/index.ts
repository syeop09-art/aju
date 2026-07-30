import { registerRootComponent } from 'expo';

// 백그라운드 Task는 React 컴포넌트가 마운트되기 전에 전역에서 등록합니다.
import './src/services/backgroundLocationTask';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
