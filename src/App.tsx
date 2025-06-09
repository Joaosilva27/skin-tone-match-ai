import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CustomWebcam from "./components/CustomWebcam";
import "./App.css";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-05-06" });

interface FoundationData {
  name: string;
  brand: string;
  shade: string;
  imageUrl?: string | null;
  fullLine: string;
}

type MakeupType = "foundation" | "concealer" | "blush" | "custom";

function App() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("");
  const [foundations, setFoundations] = useState<FoundationData[]>([]);
  const [analysisText, setAnalysisText] = useState<string>("");
  const [selectedMakeup, setSelectedMakeup] =
    useState<MakeupType>("foundation");
  const [customMakeupType, setCustomMakeupType] = useState<string>("");

  async function searchProductImages(query: string) {
    try {
      const response = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": import.meta.env.VITE_API_SERPER_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: `${query} ${
            selectedMakeup === "custom" ? customMakeupType : selectedMakeup
          } makeup product`,
        }),
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
    // Split the response to separate analysis and makeup recommendations
    const makeupTitle = getMakeupTitle(selectedMakeup);
    const parts = responseText.split(
      new RegExp(`## Recommended ${makeupTitle}`, "i")
    );
    const analysisSection = parts[0] || "";
    setAnalysisText(analysisSection);

    // Extract makeup recommendations
    const makeupLines = responseText
      .split("\n")
      .filter(
        (line) => line.trim().startsWith("- ") && line.includes("Brand:")
      );

    const processed = await Promise.all(
      makeupLines.map(async (line) => {
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

    setFoundations(processed.filter(Boolean) as FoundationData[]);

    return analysisSection;
  }

  function getMakeupTitle(type: MakeupType): string {
    switch (type) {
      case "foundation":
        return "Foundations";
      case "concealer":
        return "Concealers";
      case "blush":
        return "Blushes";
      case "custom":
        return customMakeupType
          ? customMakeupType.charAt(0).toUpperCase() +
              customMakeupType.slice(1) +
              "s"
          : "Products";
      default:
        return "Products";
    }
  }

  function getMakeupIcon(type: MakeupType): string {
    switch (type) {
      case "foundation":
        return "💄";
      case "concealer":
        return "🖌️";
      case "blush":
        return "🌸";
      case "custom":
        return "✨";
      default:
        return "🎀";
    }
  }

  function getMakeupPrompt(type: MakeupType): string {
    const productType = type === "custom" ? customMakeupType : type;
    const basePrompt = `You are a professional makeup analyzer. 
      With the given picture:
      - Analyze my skin color and tell me what shade it is.
      - Give me a list of ${productType}s to buy with name, shade, and brand.
      - ${productType}s must be available in ${country || "Europe"}.
      - Use exact format: "- [Product Name], Shade: [Shade], Brand: [Brand]"
      - IMPORTANT!! You must only write two sections, first a in-depth skin analysys, and then the ${productType} recommendation.
      - IMPORTANT!! When I say two sections, I mean ONLY TWO SECTIONS. You CANNOT write more than one '${productType} recommendation' section.`;
    // MUST keep above important prompt. For some reason gemini 2.5 pro model keeps generating sections non-stop

    switch (type) {
      case "foundation":
        return basePrompt;
      case "concealer":
        return (
          basePrompt +
          "\n- Focus on concealers that would match my undertones and cover imperfections."
        );
      case "blush":
        return (
          basePrompt +
          "\n- Recommend blush colors that would complement my skin tone and undertones."
        );
      case "custom":
        return (
          basePrompt +
          `\n- Focus on ${customMakeupType}s that would match my undertones and complement my features.`
        );
      default:
        return basePrompt;
    }
  }

  async function run() {
    if (!imgSrc) return;
    if (selectedMakeup === "custom" && !customMakeupType.trim()) {
      alert("Please enter a custom makeup type");
      return;
    }

    setIsLoading(true);
    setFoundations([]);
    setAnalysisText("");
    setAiResponse("");

    try {
      const prompt = getMakeupPrompt(selectedMakeup);

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
        <p className="subtitle">Find Your Perfect Makeup Match</p>
      </header>

      <div className="content-wrapper">
        <div className="media-container">
          <div className="webcam-wrapper">
            <CustomWebcam setImgSrc={setImgSrc} />
          </div>
          {imgSrc && (
            <div className="preview-wrapper flex items-center flex-col">
              <img src={imgSrc} alt="Captured" className="preview-image" />
              <span className="mt-2 text-center text-pink-500">
                ✨ Use natural lighting and a clear, close-up photo of your face
                for the most accurate makeup matches! ✨
              </span>
            </div>
          )}
        </div>

        <div className="makeup-selector-container">
          <h3 className="selector-title">Choose Your Makeup Type</h3>
          <div className="makeup-buttons">
            <button
              className={`makeup-button ${
                selectedMakeup === "foundation" ? "active" : ""
              }`}
              onClick={() => setSelectedMakeup("foundation")}
            >
              <span className="makeup-icon">💄</span>
              Foundation
            </button>
            <button
              className={`makeup-button ${
                selectedMakeup === "concealer" ? "active" : ""
              }`}
              onClick={() => setSelectedMakeup("concealer")}
            >
              <span className="makeup-icon">🖌️</span>
              Concealer
            </button>
            <button
              className={`makeup-button ${
                selectedMakeup === "blush" ? "active" : ""
              }`}
              onClick={() => setSelectedMakeup("blush")}
            >
              <span className="makeup-icon">🌸</span>
              Blush
            </button>
            <button
              className={`makeup-button ${
                selectedMakeup === "custom" ? "active" : ""
              }`}
              onClick={() => setSelectedMakeup("custom")}
            >
              <span className="makeup-icon">✨</span>
              Custom
            </button>
          </div>

          {selectedMakeup === "custom" && (
            <div className="custom-makeup-input-container">
              <input
                type="text"
                value={customMakeupType}
                onChange={(e) => setCustomMakeupType(e.target.value)}
                placeholder="Enter custom makeup type (e.g. lipstick, eyeshadow)"
                className="custom-makeup-input"
              />
              <p className="custom-makeup-disclaimer">
                <span className="disclaimer-icon">📸</span> For best results,
                take a close-up picture focused on the relevant area (e.g., for
                lipstick, focus on your lips; for eyeshadow, focus on your eyes)
              </p>
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
            {isLoading
              ? "Analyzing..."
              : `Analyze for ${getMakeupTitle(selectedMakeup)}`}
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
                  <p className="ai-response-paragraph text-xs md:text-base">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="ai-response-bold">{children}</strong>
                ),
              }}
            />

            {/* Product Recommendations Section */}
            {foundations.length > 0 && (
              <>
                <h3 className="ai-response-subheader text-3xl font-medium mb-8 text-rose-500 text-center tracking-wide">
                  {getMakeupIcon(selectedMakeup)} Recommended{" "}
                  {getMakeupTitle(selectedMakeup)} available in{" "}
                  <span className="capitalize">{country || "Europe"}</span>
                  {getMakeupIcon(selectedMakeup)}
                </h3>
                <div className="foundation-grid flex flex-wrap justify-center gap-8 px-4">
                  {foundations.map((foundation, index) => (
                    <a
                      key={index}
                      href={`https://www.google.com/search?q=${
                        foundation.brand + foundation.name + foundation.shade
                      }`}
                      target="_blank"
                    >
                      <div className="foundation-card relative bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 w-80 shadow-md hover:shadow-lg transition-all duration-300 border border-rose-100">
                        <div className="makeup-type-label">
                          {selectedMakeup === "custom"
                            ? customMakeupType
                            : selectedMakeup}
                        </div>
                        <div className="foundation-info mb-4">
                          <p className="text-xl font-semibold text-rose-700 mb-3 tracking-tight">
                            {foundation.name}
                          </p>
                          <div className="space-y-2 text-rose-600">
                            <p className="text-sm uppercase tracking-wide font-medium text-rose-500">
                              {foundation.brand}
                            </p>
                            <p className="text-sm text-rose-400">
                              Shade: {foundation.shade}
                            </p>
                          </div>
                        </div>
                        {foundation.imageUrl && (
                          <div className="foundation-image-container relative h-48 rounded-md overflow-hidden border border-rose-100 group">
                            <img
                              src={foundation.imageUrl}
                              alt={`${foundation.brand} ${foundation.name}`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-50/30 to-transparent" />
                          </div>
                        )}
                      </div>
                    </a>
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
