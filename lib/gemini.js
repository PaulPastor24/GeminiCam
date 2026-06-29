import { readAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;

export async function imageToBase64(uri) {
  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } else {
    const path = uri.startsWith('file://') ? uri : `file://${uri}`;
    return await readAsStringAsync(path, { encoding: 'base64' });
  }
}

export async function analyzeImage(base64Image, prompt) {
  // Strip potential data URI prefix if it exists
  const cleanBase64 = base64Image.includes('base64,') 
    ? base64Image.split('base64,')[1] 
    : base64Image;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } }
        ]
      }]
    }),
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}