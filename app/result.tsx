import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { analyzeImage, ANALYSIS_PROMPT } from '../lib/gemini';

export default function ResultScreen() {
  // Expo Router grabs the base64 string AND the photo we passed from the Preview screen
  const { base64Image, photoUri } = useLocalSearchParams<{ base64Image: string, photoUri: string }>();
  
  // The Three States of fetching data!
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage(base64Image, ANALYSIS_PROMPT);
      let textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textPart) throw new Error('Empty response from Gemini');

      // SAFETY FIX: Strip out the Markdown ```json fences if Gemini includes them
      textPart = textPart.replace(/```json/g, '').replace(/```/g, '').trim();

      // Parse the clean text into a real JavaScript object
      setAnalysis(JSON.parse(textPart));
    } catch (err) {
      console.error(err);
      setError('Could not analyze this image. Please try again.');
    } finally {
      // Whether it succeeds or fails, stop the loading spinner!
      setLoading(false);
    }
  }

  // State 1: Loading
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5B3FA3" />
        <Text style={styles.loadingText}>Analyzing image...</Text>
      </View>
    );
  }

  // State 2: Error
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // State 3: Success!
  return (
    <ScrollView style={styles.container}>
      {/* A bonus touch: Show the thumbnail of the image we are analyzing */}
      {photoUri && <Image source={{ uri: photoUri }} style={styles.thumbnail} />}

      <Text style={styles.sectionTitle}>Objects</Text>
      {analysis.objects.map((obj: string, i: number) => (
        <Text key={i} style={styles.listItem}>• {obj}</Text>
      ))}

      <Text style={styles.sectionTitle}>Context</Text>
      <Text style={styles.bodyText}>{analysis.context}</Text>

      <Text style={styles.sectionTitle}>Activities</Text>
      <Text style={styles.bodyText}>{analysis.activities}</Text>

      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.bodyText}>{analysis.recommendations}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#5A6472' },
  errorText: { color: '#B3261E', textAlign: 'center', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, color: '#1F2A44' },
  listItem: { fontSize: 15, marginTop: 4 },
  bodyText: { fontSize: 15, marginTop: 4, color: '#2B2F38' },
  thumbnail: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 8, marginBottom: 16 }
});