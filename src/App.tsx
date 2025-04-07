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
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState(""); // Add country state

  async function run() {
    if (!imgSrc) return;
    setIsLoading(true);

    const prompt = `You are a professional makeup analyzer:
    With the given picture:
    - Analyze my skin color and tell me what shade it is.
    - Give me a list of foundations to buy, with name, shade, and brand.
    - Foundations must be available in ${country || "Europe"}. 
    - Start immediately with color analysis.
    - IMPORTANT!!! You must only write two sections, the first one being a in-depth color analysis, second one being the recommended foundations.`;

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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-container pt-6">
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

        <div className="input-container">
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Enter your country"
            className="country-input"
          />
          <button onClick={run} className="analyze-button" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Analyze My Skin"}
          </button>
        </div>

        {isLoading && (
          <div className="loader-container">
            <div className="makeup-loader">
              <div className="lipstick"></div>
              <div className="dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        )}

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
