import { useState } from "react";
import { sendMessage } from "./api";
import "./App.css";

export default function App() {
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    setStatus("Sending…");
    try {
      await sendMessage(to, msg);
      setStatus("✅ Sent!");
      setMsg("");
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">iMessage Admin</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="+1234567890"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-2"
        rows="4"
        placeholder="Your message…"
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleSend}
      >
        Send
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
