import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/WelcomePage.css";
import heroBg from "../assets/PHOTO1.jpg"; 
import { API_URL, getImageUrl } from "../apiConfig";

export default function WelcomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Błąd sieci!");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Dane z Django:", data);
        setPosts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Błąd pobierania postów:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="welcome-page">
      <section className="hero-section" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroBg})` }}>
        <div className="hero-content">
          <h1>Odkrywaj Świat z TravelMap</h1>
          <p>Zbieraj wspomnienia, zaznaczaj miejsca i dziel się historiami.</p>
          <button className="hero-btn" onClick={() => document.getElementById('posts').scrollIntoView({ behavior: 'smooth' })}>
            Zobacz wpisy ↓
          </button>
        </div>
      </section>

      <div className="content-wrapper" id="posts">
        <section className="author-strip">
          <div className="author-avatar">
            <span>👨‍💻</span>
          </div>
          <div className="author-bio">
            <h3>Hej, tu Twój Przewodnik!</h3>
            <p>Nazywam się Dominik i podróżuję po świecie, tworząc tę cyfrową mapę wspomnień.</p>
          </div>
        </section>
        <h2 className="section-title">Najnowsze wpisy</h2>
        
        {loading ? (
            <p style={{textAlign: 'center', color: 'white'}}>Ładowanie wpisów...</p>
        ) : (
            <div className="posts-grid">
            {posts.map((post) => (
                <Link to={`/post/${post.id}`} key={post.id} className="post-card">
                <div className="card-image-wrapper">
                    <img 
                        src={getImageUrl(post.cover_image) || heroBg} 
                        alt={post.title} 
                    />
                    <span className="card-tag">Podróże</span>
                </div>
                <div className="card-content">
                    <h3>{post.title}</h3>
                    <p>{post.short_description}</p>
                    <span className="read-more">Czytaj dalej →</span>
                </div>
                </Link>
            ))}
            </div>
        )}

      </div>
    </div>
  );
}
