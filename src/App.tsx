import "./App.css";

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const apiKey = import.meta.env.VITE_API_KEY; // get API key from .env file
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25", // currently using the experimental 2.5 pro, might change later
});

const generationConfig = {
  // default config, might apply it / change it later
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseModalities: [],
  responseMimeType: "text/plain",
};

// Converts local file information to base64
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function run() {
  const prompt =
    "Write an advertising jingle showing how the product in the first image could solve the problems shown in the second two images.";

  const imageParts = [
    fileToGenerativePart("jetpack.jpg", "image"),
    fileToGenerativePart("piranha.jpg", "image"),
  ];

  const generatedContent = await model.generateContent([prompt, ...imageParts]);

  console.log(generatedContent.response.text());
}

run();

if (!apiKey) {
  throw new Error(
    "API key is missing. Please set REACT_APP_API_KEY in your environment."
  );
}

function App() {
  return (
    <div>
      <h1>Skin Tone Match AI</h1>
    </div>
  );
}

export default App;
