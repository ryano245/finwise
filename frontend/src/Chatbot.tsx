import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const sendIntroMessage = async () => {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: "Introduce yourself to the user and explain what you can help with."
        })
      });
      const data = await res.json();
      setMessages([{ sender: 'bot', text: data.reply }]);
    };
  
    sendIntroMessage();
  }, []);

  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();

      setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: failed to get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  // Navigate to Post page and clear chat
  const goToPostPage = () => {
    navigate("/post", { state: { messages } });
    setMessages([]); // clear chat after redirect
  };

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Financial Assistant Chatbot</h2>
      
      {/* Chat Window */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          height: "400px",
          width: "450px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              margin: "0.5rem 0",
            }}
          >
            <div
              style={{
                backgroundColor: msg.sender === "user" ? "#4f46e5" : "#e5e7eb",
                color: msg.sender === "user" ? "white" : "black",
                padding: "0.5rem 1rem",
                borderRadius: "10px",
                maxWidth: "70%",
                wordBreak: "break-word",
              }}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        {loading && <div>Bot is typing...</div>}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Row */}
      <div style={{ display: "flex", marginTop: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "0.5rem",
            borderRadius: "20px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            marginLeft: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#4f46e5",
            color: "white",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>

      {/* Go to Post Page */}
      {messages.length > 0 && (
        <button
          onClick={goToPostPage}
          style={{
            marginTop: "1rem",
            width: "100%",
            padding: "0.5rem 1rem",
            borderRadius: "20px",
            border: "none",
            backgroundColor: "#16a34a",
            color: "white",
            cursor: "pointer",
          }}
        >
          Post Conversation Anonymously
        </button>
      )}
    </div>
  );
};

export default Chat;
