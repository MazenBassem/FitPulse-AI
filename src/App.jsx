import React, { useState, useRef, useEffect } from "react";
import {
  Dumbbell,
  FileText,
  Send,
  Sparkles,
  Loader2,
  HeartPulse,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Activity,
  AlertCircle,
} from "lucide-react";

export default function App() {
  const [apiUrl, setApiUrl] = useState(
    "https://gumdrop-paralyses-replica.ngrok-free.dev/api/chat",
  );
  const [query, setQuery] = useState("");
  const [inbodyImageBase64, setInbodyImageBase64] = useState(null);
  const [inbodyPreview, setInbodyPreview] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [failedImages, setFailedImages] = useState(new Set());

  const responseContainerRef = useRef(null);

  // Auto-scroll to bottom as streamed response updates
  useEffect(() => {
    if (responseContainerRef.current) {
      responseContainerRef.current.scrollTop =
        responseContainerRef.current.scrollHeight;
    }
  }, [response]);

  // Handle graphical InBody scan image uploads (reads as Base64 for Vision VLM)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInbodyPreview(reader.result);
        setInbodyImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeInbodyImage = () => {
    setInbodyPreview(null);
    setInbodyImageBase64(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse("");
    setFailedImages(new Set());

    // try {
    //   const res = await fetch(apiUrl, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //       query,
    //       inbody_image: inbodyImageBase64,
    //     }),
    //   });

    //   if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    //   const reader = res.body.getReader();
    //   const decoder = new TextDecoder();

    //   while (true) {
    //     const { done, value } = await reader.read();
    //     if (done) break;
    //     const chunk = decoder.decode(value, { stream: true });
    //     setResponse((prev) => prev + chunk);
    //   }
    // } catch (err) {
    //   setResponse(
    //     "❌ Error connecting to backend server. Verify your API endpoint URL and CORS settings."
    //   );
    // } finally {
    //   setLoading(false);
    // }
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420", // 👈 Prevents ngrok warning screen
        },
        body: JSON.stringify({
          query,
          inbody_image: inbodyImageBase64,
        }),
      });

      if (!res.ok) {
        // 🔍 Log the exact error coming back from FastAPI
        const errorText = await res.text();
        console.error(`Status ${res.status}:`, errorText);
        throw new Error(`Server returned status ${res.status}: ${errorText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setResponse((prev) => prev + chunk);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
      setResponse(`❌ ${err.message}`); // 👈 Displays the actual error on screen
    } finally {
      setLoading(false);
    }
  };

  const getApiOrigin = () => {
    try {
      return new URL(apiUrl).origin;
    } catch {
      return "";
    }
  };

  // Parses fine-tuned syntax: [EXERCISE: {"id": "...", "name": "...", "image": "..."}]
  const renderFormattedContent = (content) => {
    // 🛡️ Guard 1: Ensure content is a valid string before calling .split()
    if (typeof content !== "string" || !content) {
      return content || "";
    }

    const parts = content.split(/(\[EXERCISE:\s*\{[\s\S]*?\}\])/g);

    const resolveExerciseImageUrl = (exercise) => {
      const apiOrigin = getApiOrigin();
      if (!apiOrigin || !exercise || typeof exercise !== "object") return null;

      if (typeof exercise.image_url === "string" && exercise.image_url.trim()) {
        return `${apiOrigin}/api/image?url=${encodeURIComponent(exercise.image_url.trim())}`;
      }

      if (
        typeof exercise.image === "string" &&
        /^https?:\/\//i.test(exercise.image.trim())
      ) {
        return `${apiOrigin}/api/image?url=${encodeURIComponent(exercise.image.trim())}`;
      }

      if (typeof exercise.id === "string" && exercise.id.trim()) {
        const slugId = exercise.id
          .trim()
          .split(/([_-])/)
          .map((part) => {
            // 🛡️ Guard 2: Ensure part is a string before calling part.split()
            if (typeof part !== "string") return "";
            if (part === "_" || part === "-") return part;
            return part
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join("_");
          })
          .join("");

        return `${apiOrigin}/api/image?url=${encodeURIComponent(
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${slugId}/0.jpg`,
        )}`;
      }

      if (typeof exercise.name === "string" && exercise.name.trim()) {
        const slugName = exercise.name
          .trim()
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join("_");

        return `${apiOrigin}/api/image?url=${encodeURIComponent(
          `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${slugName}/0.jpg`,
        )}`;
      }

      return null;
    };

    return parts.map((part, index) => {
      const match = part.match(/^\[EXERCISE:\s*(\{[\s\S]*\})\]$/);
      if (match) {
        try {
          const exercise = JSON.parse(match[1]);
          const imageUrl = resolveExerciseImageUrl(exercise);
          const hasImageFailed = failedImages.has(index);

          return (
            <div
              key={index}
              className="my-3 overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-800/90 shadow-md transition hover:border-emerald-500/60"
            >
              {imageUrl && !hasImageFailed && (
                <div className="border-b border-emerald-500/15 bg-slate-950/60 relative min-h-[11rem]">
                  <img
                    src={imageUrl}
                    alt={exercise.name || "Exercise"}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                    onError={() =>
                      setFailedImages((prev) => new Set(prev).add(index))
                    }
                  />
                </div>
              )}
              <div className="flex items-start gap-3 p-3.5">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 shrink-0">
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-emerald-300">
                    {exercise.name || "Exercise"}
                  </p>
                  {exercise.id && (
                    <p className="font-mono text-[10px] text-slate-400">
                      ID: {exercise.id}
                    </p>
                  )}
                  {imageUrl && !hasImageFailed && (
                    <p className="mt-1 break-all text-[10px] text-slate-500">
                      Image Endpoint: {imageUrl}
                    </p>
                  )}
                </div>
                {imageUrl && !hasImageFailed ? (
                  <span className="rounded bg-slate-700/80 px-2 py-1 text-[10px] text-emerald-300 border border-emerald-500/20 shrink-0">
                    Catalog Verified
                  </span>
                ) : (
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-400 border border-slate-700 shrink-0 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> Text Only
                  </span>
                )}
              </div>
            </div>
          );
        } catch (err) {
          return <span key={index}>{part}</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-6">
      {/* Header */}
      <header className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              FitPulse AI Engine
            </h1>
            <p className="text-xs text-slate-400">
              Fine-Tuned Qwen2.5 + LlamaIndex InBody RAG
            </p>
          </div>
        </div>

        {/* API Endpoint Input */}
        <input
          type="text"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          placeholder="API Endpoint (e.g. ngrok URL)"
          className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-3 py-2 w-full sm:w-72 text-slate-300 focus:outline-none focus:border-emerald-500"
        />
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Context Controls & Image Upload */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3 text-slate-200">
              <ImageIcon className="w-4 h-4 text-emerald-400" /> InBody
              Graphical Scan
            </h2>

            {!inbodyPreview ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer bg-slate-900/30 transition">
                <FileText className="w-6 h-6 text-slate-500 mb-1" />
                <span className="text-[11px] text-slate-400 font-medium">
                  Upload Scan Image (.png, .jpg)
                </span>
                <span className="text-[9px] text-slate-600">
                  Parses Muscle-Fat Graphs & Metrics
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-950 p-2">
                <img
                  src={inbodyPreview}
                  alt="InBody Scan Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={removeInbodyImage}
                  className="absolute top-3 right-3 bg-slate-950/80 hover:bg-rose-500 text-slate-300 hover:text-white p-1 rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scan image attached to context</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Workflows */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
            <h3 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Preset
              Workflows
            </h3>
            {[
              "Analyze my InBody graph & recommend a fat loss meal strategy",
              "Design a targeted workout split based on my SMM & PBF",
              "What are my daily calorie and macro targets based on my BMR?",
            ].map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(preset)}
                className="w-full text-left text-xs bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl p-2.5 transition text-slate-300 leading-snug"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Query & Response Output */}
        <div className="md:col-span-2 flex flex-col space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask for a custom workout or nutrition plan..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-semibold px-5 rounded-xl transition flex items-center gap-2 text-sm shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Response Container with Custom Exercise Tag Rendering */}
          <div
            ref={responseContainerRef}
            className="flex-1 max-h-[500px] min-h-[380px] bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-y-auto font-sans text-sm leading-relaxed text-slate-200"
          >
            {response ? (
              <div className="whitespace-pre-wrap">
                {renderFormattedContent(response)}
              </div>
            ) : (
              <div className="h-full min-h-[340px] flex flex-col items-center justify-center text-slate-500 gap-2">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p className="text-xs">
                  Submit a request to generate workout or diet plans
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
