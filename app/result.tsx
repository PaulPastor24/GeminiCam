import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { analyzeImage } from '../lib/gemini';

// Define the same PROMPTS object here as in PreviewScreen
const PROMPTS = {
  academic: `Act as a university professor. Looking at this image, provide an academic-style analysis: identify the objects present, the educational context, and one piece of constructive feedback.`,
  safety: `Act as a workplace safety inspector. Looking at this image, identify any visible hazards, risks, or safety concerns. If none are visible, state that clearly.`,
  inventory: `Act as an asset management clerk. Looking at this image, list every visible physical asset as a clean inventory list, with no extra commentary.`,
};

export default function ResultScreen() {
  const { base64Image, photoUri, promptKey } = useLocalSearchParams<{ 
    base64Image: string, 
    photoUri: string, 
    promptKey: keyof typeof PROMPTS 
  }>();
  
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    try {
      // Look up the prompt based on the key passed from PreviewScreen
      const promptText = PROMPTS[promptKey];
      const result = await analyzeImage(base64Image, promptText);
      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textPart) throw new Error('Empty response from Gemini');
      
      setAnalysis(textPart.trim());
    } catch (err) {
      console.error(err);
      setError('Could not analyze this image.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#5B3FA3" />
      <Text style={styles.loadingText}>Thinking like a {promptKey}...</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {photoUri && <Image source={{ uri: photoUri }} style={styles.thumbnail} />}
      <Text style={styles.sectionTitle}>{promptKey.toUpperCase()} ANALYSIS</Text>
      <Text style={styles.bodyText}>{analysis}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#5A6472' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#5B3FA3' },
  bodyText: { fontSize: 16, lineHeight: 24, color: '#2B2F38' },
  thumbnail: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 8, marginBottom: 16 }
});