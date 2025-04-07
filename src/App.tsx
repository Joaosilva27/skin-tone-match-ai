import { useState } from "react";
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
  imageUrl?: string | null;
}

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [foundations, setFoundations] = useState<FoundationData[]>([]);

  async function searchProductImages(query: string): Promise<string | null> {
    try {
      const response = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": import.meta.env.VITE_API_SERPER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query }),
      });

      const data = await response.json();
      return data.images[0]?.imageUrl || null; // Returns string or null
    } catch (error) {
      console.log(error);
    }
  }

  async function processFoundations(responseText: string): Promise<string> {
    const foundationLines = responseText
      .split("\n")
      .filter((line) => line.startsWith("- ") && line.includes("Brand:"));

    const processedFoundations = await Promise.all(
      foundationLines.map(async (line) => {
        const match = line.match(
          /-\s*(.*?),\s*Shade:\s*(.*?),\s*Brand:\s*(.*)/
        );
        if (!match) return line;

        const [, name, , brand] = match;
        const imageUrl = await searchProductImages(`${name} ${brand}`);
        setFoundations((prev) => [
          ...prev,
          {
            name,
            brand,
            imageUrl,
          },
        ]);

        return imageUrl ? `${line}\n![${name} ${brand}](${imageUrl})` : line;
      })
    );

    return responseText.replace(
      /## Recommended Foundations[\s\S]*/,
      `## Recommended Foundations\n${processedFoundations.join("\n")}`
    );
  }

  async function run() {
    if (!imgSrc) return;
    setIsLoading(true);
    setFoundations([]);

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
      const processedResponse = await processFoundations(response.text());
      setAiResponse(processedResponse);
    } catch (error) {
      console.log(error);
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
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    className="foundation-image"
                    crossOrigin="anonymous"
                    decoding="async"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (src?.startsWith("http")) {
                        target.src = `https://corsproxy.io/?${encodeURIComponent(
                          src
                        )}`;
                      } else {
                        target.style.display = "none";
                      }
                    }}
                  />
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
