import PostForm from "../components/PostForm";

export default function CreatePostPage() {
  console.log("JESTEM W CREATE POST PAGE");
  return (
    <div style={{ 
      width: "60%",
      height: "100%",
      maxWidth: "95%",
      margin: "0 auto",
      padding: "2rem 0",
      color: "white" 
    }}>
      <h1 style={{ marginBottom: "2rem" }}>Dodaj nowy wpis</h1>
      <PostForm />
    </div>
  );
}