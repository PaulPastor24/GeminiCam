import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { imageToBase64 } from '../lib/gemini'; // <-- Import the new helper

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  // The new function to convert the image and navigate
  async function handleAnalyze() {
    console.log("Converting image...");
    const base64Image = await imageToBase64(photoUri);
    console.log("Converted! Base64 length:", base64Image.length);

    router.push({
      pathname: '/result',
      params: { 
        base64Image: base64Image, 
        photoUri: photoUri // Passing this along too so we can still see the image on the final screen!
      }
    });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.retakeButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Retake</Text>
        </TouchableOpacity>
        
        {/* Update the button to use the new handleAnalyze function */}
        <TouchableOpacity style={styles.analyzeButton} onPress={handleAnalyze}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, resizeMode: 'contain' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20 },
  retakeButton: { backgroundColor: '#5A6472', padding: 14, borderRadius: 8 },
  analyzeButton: { backgroundColor: '#5B3FA3', padding: 14, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});