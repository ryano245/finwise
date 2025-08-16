import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface Message {
  sender: string;
  text: string;
}

const Post: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { messages } = location.state as { messages: Message[] } || { messages: [] };

  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!messages || messages.length === 0) {
      alert("No conversation to post.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversation: messages, caption }),
      });

      const data = await response.json();
      alert(data.message || "Conversation posted successfully!");

      // After posting, go to forum page
      navigate("/forum");
    } catch (err) {
      console.error("Error posting confession:", err);
      alert("Failed to post conversation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Post Your Conversation</h2>

      {/* Conversation Preview */}
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "1rem",
          height: "300px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
          marginBottom: "1rem",
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
              {msg.sender === "bot" ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Caption Input */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Add a caption (optional)..."
        style={{
          width: "100%",
          height: "80px",
          padding: "0.5rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginBottom: "1rem",
          resize: "vertical",
        }}
      />

      {/* Confirm Post Button */}
      <button
        onClick={handlePost}
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          borderRadius: "20px",
          border: "none",
          backgroundColor: "#16a34a",
          color: "white",
          cursor: "pointer",
        }}
      >
        {loading ? "Posting..." : "Confirm Post"}
      </button>
    </div>
  );
};

export default Post;
