import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { API_URL, getImageUrl } from "../apiConfig"; 
import "../styles/DashboardPage.css";

export default function DashboardPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authTokens } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/`)
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Czy na pewno chcesz trwale usunąć ten wpis z bazy danych?")) {
      try {
        const response = await fetch(`${API_URL}/api/posts/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + String(authTokens.access)
          }
        });

        if (response.ok) {
          setPosts(posts.filter((post) => post.id !== id));
        } else {
          alert("Błąd podczas usuwania (brak uprawnień lub błąd serwera).");
        }
      } catch (error) {
        console.error("Błąd:", error);
        alert("Nie udało się połączyć z serwerem.");
      }
    }
  };

  const totalPins = posts.reduce((acc, post) => acc + (post.pins ? post.pins.length : 0), 0);
  const uniqueCountries = new Set(
    posts.flatMap(post => 
      (post.pins || [])
        .map(pin => pin.country)
        .filter(c => c && c.trim() !== "")
    )
  ).size;

  return (
    <div className="dashboard-page">
      
      <div className="dashboard-header">
        <div>
          <h1>Panel Administratora</h1>
          <p>Zarządzaj treściami na stronie.</p>
        </div>
        <Link to="/create-post" className="btn-add-new">
          + Nowy Wpis
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Liczba wpisów</h3>
          <p className="stat-number">{loading ? "..." : posts.length}</p>
        </div>
        <div className="stat-card">
          <h3>Liczba pinezek</h3>
          <p className="stat-number">{loading ? "..." : totalPins}</p>
        </div>
        <div className="stat-card">
          <h3>Odwiedzone kraje</h3>
          <p className="stat-number">{loading ? "..." : uniqueCountries}</p> 
        </div>
      </div>

      <div className="posts-manager">
        <h2>Twoje Wpisy</h2>
        
        {loading ? <p>Ładowanie...</p> : (
          <div className="posts-list">
            {posts.length === 0 ? (
              <p className="no-posts">Brak wpisów w bazie danych.</p>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="post-row">
                  <div className="post-img">
                    <img src={getImageUrl(post.cover_image)} alt="Cover" />
                  </div>

                  <div className="post-info">
                    <h4>{post.title}</h4>
                    <span className="post-desc">{post.short_description}</span>
                  </div>

                  <div className="post-status">
                     <span className="badge published">Opublikowany</span>
                  </div>

                  <div className="post-actions">
                    <Link to={`/post/${post.id}`} className="action-btn view" title="Zobacz">
                      👁️
                    </Link>
                    <Link to={`/edit-post/${post.id}`} className="action-btn edit" title="Edytuj">
                      ✏️
                    </Link>
                    <div 
                      className="action-btn delete" 
                      title="Usuń"
                      onClick={() => handleDelete(post.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      🗑️
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}