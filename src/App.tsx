import { useState } from "react";
import "./App.css";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = import.meta.env.VITE_API_KEY; // get API key from .env file
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25", // currently using the experimental 2.5 pro, might change later
});

const generationConfig = {
  // default config, might change later
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseModalities: [],
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const result = await chatSession.sendMessage("hey bozo whatsupp");
  console.log(result.response.text());
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
