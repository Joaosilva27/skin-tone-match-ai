import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomWebcam from "./components/CustomWebcam";
import "./App.css"; // You can use your existing CSS file or add custom styles here

const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
});

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");

  async function run() {
    if (!imgSrc) {
      console.error("No image captured.");
      return;
    }

    const prompt = `You are a professional makeup analyzer and you will do what you're told:
    With the given picture:
    
    - Analyze my skin color and tell me what shade it is.
    - Give me a list of foundations to buy, with the name of the foundation, shade, and brand.
    - IMPORTANT: The list of foundations available to buy should be available in Europe.
    - IMPORTANT: DO NOT start off by saying stuff like 'Okay, acting as your professional makeup analyzer, let's look at the picture provided.' - IMMEDIATELY GET STRAIGHT TO THE POINT, START WITH COLOR ANALYSYS

   
    `;

    const image = {
      inlineData: {
        data: imgSrc.split(",")[1],
        mimeType: "image/jpeg",
      },
    };

    try {
      const generatedContent = await model.generateContent([prompt, image]);
      setAiResponse(generatedContent.response.text());
    } catch (error) {
      console.error("Error generating content:", error);
    }
  }

  return (
    <div className="app-container">
      <h1>Skin Tone Match AI</h1>
      <CustomWebcam setImgSrc={setImgSrc} />
      <button onClick={run}>Run AI</button>
      {imgSrc && <img src={imgSrc} alt="Captured" />}
      {aiResponse && (
        <div className="ai-response-container">
          <ReactMarkdown
            children={aiResponse}
            remarkPlugins={[remarkGfm]} // Enable GitHub-flavored markdown support
            components={{
              // Customize Markdown elements here:
              h1: ({ children }) => (
                <h2 className="ai-response-header">{children}</h2>
              ),
              h2: ({ children }) => (
                <h3 className="ai-response-subheader">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="ai-response-paragraph">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="ai-response-bold">{children}</strong>
              ),
              ul: ({ children }) => (
                <ul className="ai-response-list">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="ai-response-ordered-list">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="ai-response-list-item">{children}</li>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
