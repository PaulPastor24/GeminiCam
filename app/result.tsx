import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView, 
  Image, 
  Platform 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { analyzeImage } from '../lib/gemini';

// Prompt library
const PROMPTS = {
  academic: `Act as a university professor. Provide an academic-style analysis: identify the objects present, the educational context, and one piece of constructive feedback.`,
  safety: `Act as a workplace safety inspector. Identify any visible hazards, risks, or safety concerns. If none are visible, state that clearly.`,
  inventory: `Act as an asset management clerk. List every visible physical asset as a clean inventory list, with no extra commentary.`,
};

export default function ResultScreen() {
  const { base64Image, photoUri, promptKey } = useLocalSearchParams<{ 
    base64Image: string, 
    photoUri: string, 
    promptKey: keyof typeof PROMPTS 
  }>();
  
  const insets = useSafeAreaInsets();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    try {
      const promptText = PROMPTS[promptKey] || PROMPTS.inventory;
      const result = await analyzeImage(base64Image, promptText);
      let textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textPart) throw new Error('Empty response from Gemini');
      
      // Clean up Markdown:
      // 1. Remove bolding (**)
      // 2. Remove bullet points (*) 
      // 3. Remove header hashes (#)
      // 4. Remove code blocks (```)
      const cleanText = textPart
        .replace(/\*\*/g, '')          // Removes **bold**
        .replace(/^\s*\*\s+/gm, '• ')  // Converts * bullets to clean •
        .replace(/^#+\s+/gm, '')       // Removes # headers
        .replace(/```[a-z]*\n?/g, '')  // Removes ```code blocks```
        .trim();
      
      setAnalysis(cleanText);
    } catch (err) {
      console.error(err);
      setError('Could not analyze this image. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#5B3FA3" />
      <Text style={styles.loadingText}>Applying {promptKey} expertise...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>{error}</Text>
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingBottom: insets.bottom + 20 }]}
      contentContainerStyle={{ padding: 20 }}
    >
      {photoUri && <Image source={{ uri: photoUri }} style={styles.thumbnail} />}
      
      <Text style={styles.sectionTitle}>{promptKey?.toUpperCase()} ANALYSIS</Text>
      
      <View style={styles.resultCard}>
        <Text style={styles.bodyText}>{analysis}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#5A6472', fontWeight: '500' },
  errorText: { color: '#B3261E', textAlign: 'center', fontSize: 16 },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#5B3FA3',
    letterSpacing: 1
  },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: { 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowOffset: { width: 0, height: 2 }, 
        shadowRadius: 8 
      },
      android: { elevation: 4 },
    }),
  },
  bodyText: { fontSize: 16, lineHeight: 24, color: '#2B2F38' },
  thumbnail: { 
    width: '100%', 
    height: 250, 
    resizeMode: 'cover', 
    borderRadius: 12, 
    marginBottom: 20 
  }
});