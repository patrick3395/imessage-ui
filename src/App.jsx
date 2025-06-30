import { useState, useEffect } from "react";
import { sendMessage, fetchConversations } from "./api";
import "./App.css";

export default function App() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState("");

  // Load conversations on mount
  useEffect(() => {
    fetchConversations()
      .then(setConversations)
      .catch(console.error);
  }, []);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedChat) return;
    fetch(
      `${import.meta.env.VITE_API_BASE}/conversations/${selectedChat.chat_id}/messages`,
      {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` },
      }
    )
      .then((res) => res.json())
      .then(setMessages)
      .catch(console.error);
  }, [selectedChat]);

  const handleSend = async () => {
    setStatus("Sending…");
    try {
      await sendMessage(to, msg);
      setStatus("✅ Sent!");
      setMsg("");
      // Refresh messages after send
      if (selectedChat) {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/conversations/${selectedChat.chat_id}/messages`,
          { headers: { Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}` } }
        );
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error(e);
      setStatus("❌ " + (e.response?.data?.error || e.message));
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 border-r overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>
        <ul>
          {conversations.map((c) => (
            <li
              key={c.chat_id}
              className={`p-2 cursor-pointer ${
                selectedChat?.chat_id === c.chat_id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedChat(c)}
            >
              {c.name || `Chat ${c.chat_id}`}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col p-4">
        {selectedChat ? (
          <>
            <h2 className="text-xl font-bold mb-2">{selectedChat.name}</h2>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-xs p-2 rounded ${
                    m.fromMe ? "ml-auto bg-blue-100" : "mr-auto bg-gray-100"
                  }`}
                >
                  <p className="text-sm">{m.body}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(m.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                className="flex-1 border p-2"
                placeholder="+1234567890"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <input
                className="flex-2 border p-2"
                placeholder="Type a message…"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
              />
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={handleSend}
              >
                Send
              </button>
            </div>

            {status && <p className="mt-2 text-sm">{status}</p>}
          </>
        ) : (
          <p>Select a conversation to view messages.</p>
        )}
      </main>
    </div>
  );
}

