import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomWebcam from "./components/CustomWebcam";
import "./App.css";

const apiKey = import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-exp-03-25",
});

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");

  async function run() {
    if (!imgSrc) return;

    const prompt = `You are a professional makeup analyzer:
    With the given picture:
    - Analyze my skin color and tell me what shade it is.
    - Give me a list of foundations to buy, with name, shade, and brand.
    - Foundations must be available in Europe.
    - Start immediately with color analysis.`;

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
      console.error(error);
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title-gradient">🌸 Skin Match AI</h1>
        <p className="subtitle">Discover Your Perfect Makeup Match</p>
      </header>

      <div className="content-wrapper">
        <div className="media-container">
          <div className="webcam-wrapper">
            <CustomWebcam setImgSrc={setImgSrc} />
          </div>
          {imgSrc && (
            <div className="preview-wrapper">
              <img src={imgSrc} alt="Captured" className="preview-image" />
            </div>
          )}
        </div>

        <button onClick={run} className="analyze-button">
          Analyze My Skin
        </button>

        {aiResponse && (
          <div className="ai-response-container">
            <ReactMarkdown
              children={aiResponse}
              remarkPlugins={[remarkGfm]}
              components={{
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
    </div>
  );
}

export default App;
