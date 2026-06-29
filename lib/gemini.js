const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_KEY;
if (!GEMINI_KEY) {
  console.error("Missing Gemini API Key. Please check your .env file.");
}

export { GEMINI_KEY }