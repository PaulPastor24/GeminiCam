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

const PROMPTS = {
  academic: `Act as a university professor. Provide an academic-style analysis. Include 'Context' and 'Recommendation' sections.`,
  safety: `Act as a workplace safety inspector. Identify any visible hazards, risks, or safety concerns. Include three sections exactly in this order: 'Safety Result' (overall assessment), 'Context' (hazard analysis), and 'Recommendation' (safety advice).`,
  inventory: `Act as an asset management clerk. List physical assets and provide a summary 'Context' and 'Recommendation' for storage.`,
};

const InfoCard = ({ title, content }: { title: string, content: string }) => (
  <View style={styles.cardContainer}>
    <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
    <View style={styles.resultCard}>
      <Text style={styles.bodyText}>{content.trim()}</Text>
    </View>
  </View>
);

export default function ResultScreen() {
  const { base64Image, photoUri, promptKey } = useLocalSearchParams<{ 
    base64Image: string, 
    photoUri: string, 
    promptKey: keyof typeof PROMPTS 
  }>();
  
  const insets = useSafeAreaInsets();
  const [sections, setSections] = useState<{ title: string, content: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runAnalysis();
  }, []);

  async function runAnalysis() {
    setLoading(true);
    try {
      const promptText = PROMPTS[promptKey] || PROMPTS.inventory;
      const result = await analyzeImage(base64Image, promptText);
      const textPart = result?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Clean Markdown
      const cleanText = textPart
        .replace(/\*\*/g, '')
        .replace(/^\s*\*\s+/gm, '• ')
        .replace(/^#+\s+/gm, '')
        .replace(/```[a-z]*\n?/g, '')
        .trim();

      const lowerText = cleanText.toLowerCase();
      const safeIdx = lowerText.indexOf('safety result');
      const contextIdx = lowerText.indexOf('context');
      const recIdx = lowerText.indexOf('recommendation');
      
      const newSections = [];
      
      // 1. Safety Result
      if (safeIdx !== -1) {
        const start = safeIdx + 13;
        const end = (contextIdx !== -1 && contextIdx > start) ? contextIdx : (recIdx !== -1 && recIdx > start) ? recIdx : undefined;
        newSections.push({ title: 'Safety Result', content: cleanText.substring(start, end).replace(/^[:\s-]+/, '') });
      }

      // 2. Context
      if (contextIdx !== -1) {
        const start = contextIdx + 7;
        const end = (recIdx !== -1 && recIdx > start) ? recIdx : undefined;
        newSections.push({ title: 'Context', content: cleanText.substring(start, end).replace(/^[:\s-]+/, '') });
      }
      
      // 3. Recommendation
      if (recIdx !== -1) {
        newSections.push({ title: 'Recommendation', content: cleanText.substring(recIdx + 14).replace(/^[:\s-]+/, '') });
      }
      
      // Fallback
      if (newSections.length === 0) {
        newSections.push({ title: 'Analysis', content: cleanText });
      }

      setSections(newSections);
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
    </View>
  );

  return (
    <ScrollView 
      style={[styles.container, { paddingBottom: insets.bottom + 20 }]}
      contentContainerStyle={{ padding: 20 }}
    >
      {photoUri && <Image source={{ uri: photoUri }} style={styles.thumbnail} />}
      
      {sections.map((sec, index) => (
        <InfoCard key={index} title={sec.title} content={sec.content} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardContainer: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 8, color: '#5B3FA3', letterSpacing: 1.5 },
  resultCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  bodyText: { fontSize: 16, lineHeight: 24, color: '#2B2F38' },
  thumbnail: { width: '100%', height: 250, resizeMode: 'cover', borderRadius: 12, marginBottom: 20 }
});