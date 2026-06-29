import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { imageToBase64 } from '../lib/gemini';

// Define the prompts object here or import it from a constants file
const PROMPTS = {
  academic: `Act as a university professor. Looking at this image, provide an academic-style analysis: identify the objects present, the educational context, and one piece of constructive feedback.`,
  safety: `Act as a workplace safety inspector. Looking at this image, identify any visible hazards, risks, or safety concerns. If none are visible, state that clearly.`,
  inventory: `Act as an asset management clerk. Looking at this image, list every visible physical asset as a clean inventory list, with no extra commentary.`,
};

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  async function handleAnalyze(promptKey: keyof typeof PROMPTS) {
    console.log(`Analyzing with persona: ${promptKey}...`);
    const base64Image = await imageToBase64(photoUri);

    router.push({
      pathname: '/result',
      params: { 
        base64Image, 
        promptKey, // Pass the key instead of the full prompt string
        photoUri 
      }
    });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />
      
      {/* Persona Selection Row */}
      <View style={styles.personaRow}>
        {(Object.keys(PROMPTS) as Array<keyof typeof PROMPTS>).map((key) => (
          <TouchableOpacity 
            key={key} 
            style={styles.personaButton} 
            onPress={() => handleAnalyze(key)}
          >
            <Text style={styles.buttonText}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, resizeMode: 'contain' },
  personaRow: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: '#1a1a1a' },
  personaButton: { backgroundColor: '#5B3FA3', padding: 12, borderRadius: 8, marginHorizontal: 5 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});