import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomWebcam from "./components/CustomWebcam";
import "./App.css";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

interface FoundationData {
  name: string;
  brand: string;
  shade: string;
  imageUrl?: string | null;
  fullLine: string;
}

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [foundations, setFoundations] = useState<FoundationData[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");

  async function searchProductImages(query: string) {
    try {
      const response = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": import.meta.env.VITE_API_SERPER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: `${query} foundation makeup product` }),
      });

      const data = await response.json();
      if (!data.images || data.images.length === 0) return null;
      return data.images[0]?.imageUrl || null;
    } catch (error) {
      console.error("Error fetching product image:", error);
      return null;
    }
  }

  async function processFoundations(responseText: string) {
    // Split the response to separate analysis and foundation recommendations
    const parts = responseText.split(/## Recommended Foundations/i);
    const analysisSection = parts[0] || "";
    setAnalysisText(analysisSection);

    // Extract foundation recommendations
    const foundationLines = responseText
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("- ") && line.includes("Brand:")
      );

    const processed = await Promise.all(
      foundationLines.map(async (line) => {
        const match = line.match(
          /-\s*(.*?),\s*Shade:\s*(.*?),\s*Brand:\s*(.*)/
        );
        if (!match) return null;

        const [, name, shade, brand] = match;
        const imageUrl = await searchProductImages(`${brand} ${name} ${shade}`);

        return {
          name: name.trim(),
          brand: brand.trim(),
          shade: shade.trim(),
          imageUrl,
          fullLine: line,
        };
      })
    );

    // Filter out null entries
    setFoundations(processed.filter(Boolean) as FoundationData[]);

    return analysisSection;
  }

  async function run() {
    if (!imgSrc) return;
    setIsLoading(true);
    setFoundations([]);
    setAnalysisText("");
    setAiResponse("");

    try {
      const prompt = `You are a professional makeup analyzer:
      With the given picture:
      - Analyze my skin color and tell me what shade it is.
      - Give me a list of foundations to buy with name, shade, and brand.
      - Foundations must be available in ${country || "Europe"}.
      - Use exact format: "- [Product Name], Shade: [Shade], Brand: [Brand]"
      - Start immediately with color analysis.`;

      const image = {
        inlineData: { data: imgSrc.split(",")[1], mimeType: "image/jpeg" },
      };

      const { response } = await model.generateContent([prompt, image]);
      await processFoundations(response.text());
      setAiResponse(response.text());
    } catch (error) {
      console.error("Error in analysis:", error);
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

        <div className="input-container flex justify-center items-center">
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
            {/* Skin Analysis Section */}
            <ReactMarkdown
              children={analysisText}
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
              }}
            />

            {/* Foundation Recommendations Section */}
            {foundations.length > 0 && (
              <>
                <h3 className="ai-response-subheader">
                  Recommended Foundations
                </h3>
                <div className="foundation-grid">
                  {foundations.map((foundation, index) => (
                    <div key={index} className="foundation-card">
                      <div className="foundation-info">
                        <p>
                          <strong>{foundation.name}</strong>
                        </p>
                        <p>Brand: {foundation.brand}</p>
                        <p>Shade: {foundation.shade}</p>
                      </div>
                      {foundation.imageUrl && (
                        <div className="foundation-image-container">
                          <img
                            src={foundation.imageUrl}
                            alt={`${foundation.brand} ${foundation.name}`}
                            className="foundation-image"
                            onError={(e) => {
                              console.log(
                                "Image failed to load:",
                                foundation.imageUrl
                              );
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
