import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: number;
  caption: string;
  conversation: { text: string }[];
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
          {post.caption && <h4>{post.caption}</h4>}

          {post.conversation.map((msg, idx) => (
            <div key={idx} style={{ margin: "0.3rem 0", color: "black" }}>
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p style={{ margin: 0, color: "black" }}>{children}</p>,
                  span: ({ children }) => <span style={{ color: "black" }}>{children}</span>,
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))}

          <small style={{ color: "#555" }}>
            {new Date(post.timestamp).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
};

export default Forum;
