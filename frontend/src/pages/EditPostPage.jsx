import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PostForm from "../components/PostForm";
import { API_URL } from "../apiConfig";

export default function EditPostPage() {
  const { id } = useParams();
  const [postToEdit, setPostToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Nie znaleziono wpisu");
        return res.json();
      })
      .then((data) => {
        setPostToEdit(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Błąd pobierania wpisu do edycji:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div style={{padding: '4rem', color: 'white', textAlign: 'center'}}>Ładowanie edytora...</div>;
  }

  if (!postToEdit) {
    return (
        <div style={{padding: '4rem', color: 'white', textAlign: 'center'}}>
            <h2>Nie znaleziono wpisu!</h2>
            <Link to="/dashboard" style={{color: '#38bdf8'}}>Wróć do panelu</Link>
        </div>
    );
  }

  return (
    <div style={{ 
      width: "60%",
      maxWidth: "95%", 
      margin: "0 auto", 
      padding: "2rem 0",
      color: "white" 
    }}>
      <h1 style={{ marginBottom: "2rem", paddingLeft: "1rem" }}>✏️ Edytuj wpis: {postToEdit.title}</h1>
      <PostForm initialData={postToEdit} />
      
    </div>
  );
}
