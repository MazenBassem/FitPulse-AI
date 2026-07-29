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

// --- Lightweight Markdown -> JSX renderer -----------------------------------
// The backend now replies with plain Markdown (## headings, **bold**, lists,
// --- rules) but the response was previously dropped straight into a <span>,
// so all of that markup showed up as literal "###"/"**" characters instead of
// being rendered. These two helpers turn a markdown-ish text block into real
// JSX elements. Deliberately dependency-free (no react-markdown/marked) so it
// drops into this project without adding a package.

function renderInline(text, keyPrefix) {
  // Only handles **bold** (the one inline style the backend actually emits).
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    const boldMatch = seg.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={`${keyPrefix}-b-${i}`}>{boldMatch[1]}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-t-${i}`}>{seg}</React.Fragment>;
  });
}

function renderMarkdownBlock(text, keyPrefix) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let listBuffer = [];
  let listType = null;

  const flushList = () => {
    if (!listBuffer.length) return;
    const items = listBuffer;
    const ListTag = listType === "ol" ? "ol" : "ul";
    blocks.push(
      <ListTag
        key={`${keyPrefix}-list-${blocks.length}`}
        className={
          listType === "ol"
            ? "list-decimal ml-5 space-y-1 mb-3"
            : "list-disc ml-5 space-y-1 mb-3"
        }
      >
        {items.map((item, idx) => (
          <li key={idx}>
            {renderInline(item, `${keyPrefix}-li-${blocks.length}-${idx}`)}
          </li>
        ))}
      </ListTag>,
    );
    listBuffer = [];
    listType = null;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      flushList();
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const sizeClass =
        level === 1 ? "text-lg" : level === 2 ? "text-base" : "text-sm";
      blocks.push(
        <p
          key={`${keyPrefix}-h-${blocks.length}`}
          className={`font-bold text-emerald-300 mt-4 mb-2 first:mt-0 ${sizeClass}`}
        >
          {renderInline(heading[2], `${keyPrefix}-h-${blocks.length}`)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (/^-{3,}$/.test(line.trim())) {
      flushList();
      blocks.push(
        <hr
          key={`${keyPrefix}-hr-${blocks.length}`}
          className="my-4 border-slate-700"
        />,
      );
      i += 1;
      continue;
    }

    const unordered = line.match(/^[-*+]\s+(.*)$/);
    if (unordered) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listBuffer.push(unordered[1]);
      i += 1;
      continue;
    }

    const ordered = line.match(/^\d+\.\s+(.*)$/);
    if (ordered) {
      if (listType !== "ol") {
        flushList();
        listType = "ol";
      }
      listBuffer.push(ordered[1]);
      i += 1;
      continue;
    }

    flushList();
    const paragraphLines = [line];
    while (
      i + 1 < lines.length &&
      lines[i + 1].trim() &&
      !/^(#{1,4})\s+/.test(lines[i + 1]) &&
      !/^[-*+]\s+/.test(lines[i + 1]) &&
      !/^\d+\.\s+/.test(lines[i + 1]) &&
      !/^-{3,}$/.test(lines[i + 1].trim())
    ) {
      i += 1;
      paragraphLines.push(lines[i]);
    }
    blocks.push(
      <p
        key={`${keyPrefix}-p-${blocks.length}`}
        className="mb-3 leading-relaxed"
      >
        {paragraphLines.map((paragraphLine, idx) => (
          <React.Fragment key={idx}>
            {renderInline(
              paragraphLine,
              `${keyPrefix}-p-${blocks.length}-${idx}`,
            )}
            {idx < paragraphLines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>,
    );
    i += 1;
  }

  flushList();
  return blocks;
}

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

    try {
      // Backend's ChatRequest model expects "query" (not "prompt"), plus
      // optional inbody_image / history / use_rag. It replies with a single
      // JSON object { "response": "..." } -- it does not stream -- so we
      // just await res.json() rather than reading the body incrementally.
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420", // bypasses the ngrok splash page
        },
        body: JSON.stringify({
          query,
          inbody_image: inbodyImageBase64,
          history: [],
          use_rag: true,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      setResponse(data.response || data.detail || "No response received.");
    } catch (err) {
      console.error(err);
      setResponse(
        "❌ Error connecting to backend server. Verify your API endpoint URL and CORS settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getApiOrigin = () => {
    try {
      const trimmed = apiUrl.trim();
      const withProtocol = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      return new URL(withProtocol).origin;
    } catch {
      return "";
    }
  };

  // Parses the model's syntax: [EXERCISE: {"id": "...", "name": "..."}]
  // and renders everything else (headings, bold, lists, etc.) as real
  // Markdown instead of literal "###"/"**" text.
  const renderFormattedContent = (content) => {
    const parts = content.split(/(\[EXERCISE:\s*\{[\s\S]*?\}\])/g);

    // Resolves an image for a model-emitted exercise tag.
    //
    // Important: we do NOT guess a free-exercise-db GitHub folder name by
    // slugifying exercise.name/id (e.g. "Barbell Bench Press" ->
    // "Barbell_Bench_Press"). That guess is wrong far more often than right
    // -- the real repo entry is "Barbell_Bench_Press_-_Medium_Grip", and many
    // others have similar qualifiers a simple slug can't predict, so the
    // <img> just 404s. Instead: if the model gave a real URL, proxy that
    // directly. Otherwise send the name/id to the backend's
    // /api/exercise-image endpoint, which fuzzy-matches it against
    // free-exercise-db's own index and streams back the real image (or a
    // clean 404 if nothing matches closely enough).
    const resolveExerciseImageUrl = (exercise) => {
      const apiOrigin = getApiOrigin();
      if (!apiOrigin) return null;

      if (typeof exercise.image_url === "string" && exercise.image_url.trim()) {
        return `${apiOrigin}/api/image?url=${encodeURIComponent(exercise.image_url.trim())}`;
      }

      if (
        typeof exercise.image === "string" &&
        /^https?:\/\//i.test(exercise.image.trim())
      ) {
        return `${apiOrigin}/api/image?url=${encodeURIComponent(exercise.image.trim())}`;
      }

      const lookupTerm = (
        (typeof exercise.name === "string" && exercise.name.trim()) ||
        (typeof exercise.id === "string" && exercise.id.trim()) ||
        ""
      ).replace(/[_-]+/g, " ");

      if (!lookupTerm) return null;

      return `${apiOrigin}/api/exercise-image?query=${encodeURIComponent(lookupTerm)}`;
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
          return (
            <React.Fragment key={index}>
              {renderMarkdownBlock(part, `seg-${index}`)}
            </React.Fragment>
          );
        }
      }
      return (
        <React.Fragment key={index}>
          {renderMarkdownBlock(part, `seg-${index}`)}
        </React.Fragment>
      );
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
              <div className="markdown-body">
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
