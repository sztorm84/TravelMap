export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080";

export const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("blob:")) return path;
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
};