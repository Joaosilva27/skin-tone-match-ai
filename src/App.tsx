import "./App.css";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import CustomWebcam from "./components/CustomWebcam";

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

if (!apiKey) {
  throw new Error(
    "API key is missing. Please set REACT_APP_API_KEY in your environment."
  );
}

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [foundationOtputResult, setFoundationOutputResult] = useState<
    string | null
  >(null);

  async function run() {
    if (!imgSrc) {
      console.error("No image captured.");
      return;
    }

    const prompt = `You are a professional makeup analyzer and you will do what you're told:
    With the given picture, analyze my skin color and tell me what makeup foundation would fit best my skip color type.
  
   
    `;

    // Directly use imgSrc (which is already a base64-encoded string)
    const image = {
      inlineData: {
        data: imgSrc.split(",")[1], // Remove the 'data:image/jpeg;base64,' part
        mimeType: "image/jpeg", // Adjust mime type based on the image format (can be 'image/png' for PNG images)
      },
    };

    try {
      const generatedContent = await model.generateContent([prompt, image]);
      console.log(generatedContent.response.text());
      setFoundationOutputResult(generatedContent.response.text());
    } catch (error) {
      console.error("Error generating content:", error);
    }
  }

  return (
    <div>
      <h1>Skin Tone Match AI</h1>
      <CustomWebcam setImgSrc={setImgSrc} />
      <button onClick={run}>Run AI</button>
      {imgSrc && <img src={imgSrc} alt="Captured" />} {foundationOtputResult}
    </div>
  );
}

export default App;
