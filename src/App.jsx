import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [iframeSrc, setIframeSrc] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [bookmarks, setBookmarks] = useState([]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black";
  };

  const log = (msg, type = "info") =>
    setLogs((prev) => [...prev, { id: Date.now(), msg, type }]);

  const goToUrl = async (inputUrl, pushHistory = true) => {
    if (!inputUrl.startsWith("http")) {
      log("❌ Please enter a valid http(s) URL", "error");
      return;
    }

    setLogs([]);
    setIframeSrc("");
    setLoading(true);
    log(`🔍 Fetching ${inputUrl}`);

    try {
      const res = await fetch(
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(inputUrl)}`
      );
      const html = await res.text();
      log("✅ Site loaded successfully.");
      setIframeSrc(html);
      setUrl(inputUrl);

      if (pushHistory) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(inputUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    } catch (err) {
      log("🚨 Error loading site: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      goToUrl(history[historyIndex - 1], false);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      goToUrl(history[historyIndex + 1], false);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const bookmark = () => {
    if (url && !bookmarks.includes(url)) {
      setBookmarks((b) => [...b, url]);
      log("🔖 Bookmarked!");
    }
  };

  return (
    <div className={`min-h-screen p-4 transition ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Address Bar + Controls */}
        <div className="flex items-center space-x-2">
          <button onClick={goBack} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-30" disabled={historyIndex <= 0}>◀</button>
          <button onClick={goForward} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 disabled:opacity-30" disabled={historyIndex >= history.length - 1}>▶</button>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-grow px-4 py-2 rounded bg-gray-100 text-black"
          />
          <button onClick={() => goToUrl(url)} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Go</button>
          <button onClick={bookmark} className="bg-yellow-500 px-2 py-2 rounded hover:bg-yellow-600">★</button>
          <button onClick={toggleTheme} className="bg-gray-500 px-3 py-2 rounded hover:bg-gray-600">{theme === "dark" ? "☀️" : "🌙"}</button>
        </div>

        {/* Status Log */}
        <div className="bg-black text-green-300 font-mono p-4 rounded h-40 overflow-y-auto">
          <AnimatePresence>
            {logs.map((l) => (
              <motion.div key={l.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className={l.type === "error" ? "text-red-400" : ""}>
                {l.msg}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Renderer */}
        <div className="border rounded-lg overflow-hidden bg-white">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center text-xl">🔄 Loading site...</div>
          ) : iframeSrc ? (
            <iframe
              sandbox="allow-scripts allow-same-origin"
              srcDoc={iframeSrc}
              className="w-full h-[600px] border-none"
              title="Rendered Site"
            />
          ) : (
            <div className="h-[600px] flex items-center justify-center text-gray-400">🌐 Enter a URL to browse</div>
          )}
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">🔖 Bookmarks</h3>
            <div className="flex flex-wrap gap-2">
              {bookmarks.map((b) => (
                <button key={b} onClick={() => goToUrl(b)} className="bg-blue-100 text-blue-800 px-3 py-1 rounded hover:underline">
                  {new URL(b).hostname}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
