import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { imageToBase64 } from '../lib/gemini';

const PROMPTS = { academic: "...", safety: "...", inventory: "..." };

export default function PreviewScreen() {
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();
  const router = useRouter();

  async function handleAnalyze(promptKey: keyof typeof PROMPTS) {
    const base64Image = await imageToBase64(photoUri);
    router.push({ pathname: '/result', params: { base64Image, promptKey, photoUri } });
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.preview} />
      <View style={styles.row}>
        {Object.keys(PROMPTS).map((key) => (
          <TouchableOpacity key={key} onPress={() => handleAnalyze(key as any)} style={styles.btn}>
            <Text>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({ container: { flex: 1 }, preview: { flex: 1 }, row: { flexDirection: 'row', padding: 20 }, btn: { padding: 10, backgroundColor: '#ddd' } });