import { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  async function takePicture() {
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (result?.uri) {
        router.push({ pathname: '/preview', params: { photoUri: result.uri } });
      }
    }
  }

  if (!permission?.granted) {
    return (
      <View style={styles.center}><Text>Camera access needed.</Text>
      <TouchableOpacity onPress={requestPermission}><Text>Grant</Text></TouchableOpacity></View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" />
      <TouchableOpacity 
        style={[styles.captureButton, { bottom: insets.bottom + 24 }]} 
        onPress={takePicture}
      >
        <Text style={styles.text}>Capture</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({ 
    container: { flex: 1 }, 
    camera: { flex: 1 }, 
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    captureButton: { position: 'absolute', alignSelf: 'center', backgroundColor: '#2E5BBA', padding: 20, borderRadius: 30 },
    text: { color: '#fff' }
});