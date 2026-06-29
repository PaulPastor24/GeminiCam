import { Slot } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function RootLayout() {
  return (
    <>
      <Slot />
      {/* Global toast notification mounting anchor */}
      <Toast />
    </>
  );
}