import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const Confessions: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('chatbot-lang');
    return (saved === 'id' || saved === 'en') ? saved : 'en';
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { 
    localStorage.setItem('chatbot-lang', currentLanguage); 
  }, [currentLanguage]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const englishIntro = 
      "Hi! I’m your friendly financial assistant for Indonesian youths. " +
      "You can share your financial mistakes, spending habits, or money challenges with me. " +
      "I’ll give practical, non-judgmental advice and help you build better financial habits. " +
      "Let’s start your confession!";
  
    const indonesianIntro = 
      "Hai! Saya asisten keuangan Anda yang ramah untuk anak muda Indonesia. " + 
      "Anda bisa berbagi kesalahan keuangan, kebiasaan belanja, atau tantangan keuangan Anda dengan saya. " + 
      "Saya akan memberikan saran praktis tanpa menghakimi dan membantu Anda membangun kebiasaan keuangan yang lebih baik. " + 
      "Mari kita mulai pengakuan Anda!";
  
    // Reset chat and show the intro
    setMessages([{ sender: 'bot', text: currentLanguage === 'en' ? englishIntro : indonesianIntro }]);
  }, [currentLanguage]);

  const navigate = useNavigate();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            message: 
                currentLanguage === "en"
                    ? `Respond only in English: ${userMessage.text}`
                    : `Respond only in Indonesian: ${userMessage.text}`
        }),
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
      <h2 style={{ textAlign: "center" }}>
        {currentLanguage === "en" ? "Confessions Bot" : "Bot Pengakuan"}
      </h2>


      {/* Language Switcher */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <button
          onClick={() => setCurrentLanguage("en")}
          style={{
            marginRight: 8,
            padding: "4px 10px",
            borderRadius: 6,
            border: currentLanguage === "en" ? "2px solid #4f46e5" : "1px solid #ccc",
            backgroundColor: currentLanguage === "en" ? "#e0e7ff" : "white",
            cursor: "pointer",
          }}
        >
          EN
        </button>
        <button
          onClick={() => setCurrentLanguage("id")}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: currentLanguage === "id" ? "2px solid #4f46e5" : "1px solid #ccc",
            backgroundColor: currentLanguage === "id" ? "#e0e7ff" : "white",
            cursor: "pointer",
          }}
        >
          ID
        </button>
      </div>
      
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
        {loading && messages.length === 0 && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
                {currentLanguage === "en"
                    ? "Bot is preparing a response..."
                    : "Bot sedang menyiapkan jawaban..."}
            </div>
        )}

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
        {loading && messages.length > 0 && (
            <div style={{ color: "#666", fontStyle: "italic" }}>
                {currentLanguage === "en" ? "Bot is typing..." : "Bot sedang mengetik..."}
            </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Row */}
      <div style={{ display: "flex", marginTop: "1rem" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={
            currentLanguage === "en" ? "Type your message..." : "Ketik pesan Anda..."
        }
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
          {currentLanguage === "en" ? "Send" : "Kirim"}
        </button>
      </div>

      {/* Post Conversation Anonymously Button */}
{messages.length > 0 && (
  <button
    onClick={goToPostPage}
    style={{
      marginTop: "1rem",
      width: "100%",
      padding: "0.5rem 1rem",
      borderRadius: "20px",
      border: "none",
      backgroundColor: "#4f46e5",
      color: "white",
      cursor: "pointer",
    }}
  >
    {currentLanguage === "en"
      ? "Post Conversation Anonymously"
      : "Posting Percakapan Secara Anonim"}
  </button>
)}

{/* Go to Forum Button */}
<button
  onClick={() => navigate("/forum")}
  style={{
    marginTop: "0.5rem",
    width: "100%",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    border: "none",
    backgroundColor: "#10b981", // green color
    color: "white",
    cursor: "pointer",
  }}
>
  {currentLanguage === "en" ? "Go to Forum" : "Ke Forum"}
</button>

    </div>
  );
};

export default Confessions;
