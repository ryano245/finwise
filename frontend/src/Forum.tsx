import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: number;
  caption: string;
  conversation: { sender?: string; text: string }[];
  timestamp: string;
}

const Forum: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/forum");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching forum posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p>Loading posts...</p>;

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center" }}>Anonymous Forum</h2>

      {posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          {/* Conversation Preview */}
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              maxHeight: "300px",
              overflowY: "auto",
              marginBottom: "0.5rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            {post.conversation.map((msg, idx) => (
              <div
                key={idx}
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
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {/* Caption at the bottom */}
          {post.caption && (
            <div style={{ marginTop: "0.5rem", color: "black", fontWeight: "bold" }}>
              {post.caption}
            </div>
          )}

          {/* Timestamp */}
          <small style={{ color: "#555" }}>
            {new Date(post.timestamp).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Forum;
