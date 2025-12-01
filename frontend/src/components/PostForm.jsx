import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet";
import L from "leaflet";
import AuthContext from "../context/AuthContext";
import "leaflet/dist/leaflet.css";
import "../styles/PostForm.css";
import { API_URL, getImageUrl } from "../apiConfig";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

const AVAILABLE_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#f97316", "#64748b"];
const DEFAULT_COLOR = AVAILABLE_COLORS[0];

const createColoredSvgIcon = (color) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.4)"/>
      </filter>
      <path fill="${color}" stroke="${color}" stroke-width="1" filter="url(#shadow)" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 7 13 7 13s7-7.75 7-13c0-4.42-3.58-8-8-8z"/>
      <circle fill="white" cx="12" cy="8" r="3.5"/>
    </svg>
  `;
  return L.divIcon({
    className: "custom-svg-icon",
    html: svgString,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

export default function PostForm({ initialData }) {
  const navigate = useNavigate();
  const { authTokens } = useContext(AuthContext);
  const initialGalleryState = initialData?.gallery?.map(imgObj => ({
      id: imgObj.id,
      url: imgObj.image,
      isNew: false,
      file: null
  })) || [];

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    shortDescription: initialData?.short_description || "",
    content: initialData?.content || "",
    coverImage: initialData?.cover_image || null, 
    coverImageFile: null,
    gallery: initialGalleryState, 
    idsToDelete: [], 

    pins: initialData?.pins?.map(p => ({
        ...p,
        latlng: [p.lat, p.lng]
    })) || [],
    mapCenter: initialData?.map_center_lat 
        ? [initialData.map_center_lat, initialData.map_center_lng] 
        : [52.23, 21.01],
    zoom: initialData?.zoom || 6
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCoverImage = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, coverImage: url, coverImageFile: file }));
    }
  };

  const handleGallery = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => ({
          id: null,
          url: URL.createObjectURL(file),
          isNew: true,
          file: file
      }));

      setFormData(prev => ({ 
          ...prev, 
          gallery: [...prev.gallery, ...newImages]
      }));
    }
  };

  const handleRemovePhoto = (indexToRemove) => {
    setFormData(prev => {
        const itemToRemove = prev.gallery[indexToRemove];
        let newIdsToDelete = [...prev.idsToDelete];
        if (!itemToRemove.isNew && itemToRemove.id) {
            newIdsToDelete.push(itemToRemove.id);
        }

        const newGallery = prev.gallery.filter((_, i) => i !== indexToRemove);

        return {
            ...prev,
            gallery: newGallery,
            idsToDelete: newIdsToDelete
        };
    });
  };

  function MapClick() {
    useMapEvents({
      click(e) {
        const newPin = {
          id: Date.now(),
          name: "", 
          country: "",
          description: "",
          latlng: [e.latlng.lat, e.latlng.lng],
          color: DEFAULT_COLOR
        };
        setFormData(prev => ({ 
            ...prev, 
            pins: [...prev.pins, newPin],
            mapCenter: [e.latlng.lat, e.latlng.lng]
        }));
      }
    });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("short_description", formData.shortDescription);
    data.append("content", formData.content);
    data.append("zoom", formData.zoom);

    let finalLat = formData.mapCenter[0];
    let finalLng = formData.mapCenter[1];
    if (formData.pins.length > 0) {
        const firstPin = formData.pins[0];
        finalLat = firstPin.latlng ? firstPin.latlng[0] : firstPin.lat;
        finalLng = firstPin.latlng ? firstPin.latlng[1] : firstPin.lng;
    }
    data.append("map_center_lat", String(finalLat));
    data.append("map_center_lng", String(finalLng));

    if (formData.coverImageFile) {
       data.append("cover_image", formData.coverImageFile);
    }
    formData.gallery.forEach(item => {
        if (item.isNew && item.file) {
            data.append("uploaded_gallery", item.file);
        }
    });
    formData.idsToDelete.forEach(id => {
        data.append("images_to_delete", id); 
    });

    const cleanPins = formData.pins.map(p => ({
        name: p.name,
        country: p.country,
        description: p.description || "",
        lat: p.latlng ? p.latlng[0] : p.lat,
        lng: p.latlng ? p.latlng[1] : p.lng,
        color: p.color || DEFAULT_COLOR
    }));
    data.append("pins_data", JSON.stringify(cleanPins));

    const method = initialData ? "PATCH" : "POST";
    const url = initialData 
        ? `${API_URL}/api/posts/${initialData.id}/`
        : `${API_URL}/api/posts/`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': 'Bearer ' + String(authTokens.access)
            },
            body: data,
        });

        if (response.ok) {
            alert("Zapisano pomyślnie!");
            navigate("/dashboard");
        } else {
            const errorData = await response.json();
            console.error("Błąd serwera:", errorData);
            alert("Błąd zapisu. Sprawdź konsolę.");
        }
    } catch (error) {
        console.error("Błąd sieci:", error);
        alert("Nie udało się połączyć z serwerem.");
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>📝 Treść wpisu</h2>
        <label>Tytuł</label>
        <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="Np. Wyprawa w Tatry" />
        <label>Krótki opis (zajawka)</label>
        <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" placeholder="To co widać na kafelku..." />
        <label>Pełna treść artykułu</label>
        <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Opisz swoją przygodę..." />
      </div>

      <div className="form-section">
        <h2>📷 Zdjęcia</h2>
        <div className="file-input-wrapper">
          <label>Zdjęcie główne (Okładka)</label>
          <input type="file" accept="image/*" onChange={handleCoverImage} />
          {formData.coverImage && (
            <div style={{position: 'relative', display: 'inline-block'}}>
                <img src={getImageUrl(formData.coverImage)} alt="Cover Preview" className="preview-img cover" />
            </div>
          )}
        </div>
        <div className="file-input-wrapper">
          <label>Galeria zdjęć (Dodaj nowe)</label>
          <input type="file" accept="image/*" multiple onChange={handleGallery} />
          
          <div className="gallery-preview">
            {formData.gallery.map((item, idx) => (
              <div key={idx} className="gallery-item-wrapper">
                  <img src={getImageUrl(item.url)} alt="Gallery" className="preview-img" />
                  <button 
                    type="button" 
                    className="btn-remove-photo"
                    onClick={() => handleRemovePhoto(idx)}
                    title="Usuń zdjęcie"
                  >
                    ✕
                  </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h2>🗺️ Mapa podróży</h2>
        <p className="hint">Kliknij na mapę, aby dodać punkt trasy.</p>
        <div className="form-map-wrapper">
          <MapContainer center={formData.mapCenter} zoom={formData.zoom} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <ZoomControl position="bottomright" />
            <MapClick />
            {formData.pins.map(pin => (
              <Marker key={pin.id} position={pin.latlng || [pin.lat, pin.lng]} icon={createColoredSvgIcon(pin.color || DEFAULT_COLOR)}>
                <Popup><strong>{pin.name || "Nowy punkt"}</strong></Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="pins-manager">
          {formData.pins.map((pin, index) => (
            <div key={pin.id} className="pin-row">
              <span>📍</span>
              <input type="text" value={pin.name} onChange={(e) => {
                  const newPins = [...formData.pins];
                  newPins[index].name = e.target.value;
                  setFormData({ ...formData, pins: newPins });
                }} placeholder="Nazwa miejsca" />
              <input type="text" value={pin.country || ""} onChange={(e) => {
                  const newPins = [...formData.pins];
                  newPins[index].country = e.target.value;
                  setFormData({ ...formData, pins: newPins });
                }} placeholder="Kraj" />
              <button type="button" className="btn-remove-pin" onClick={() => {
                 setFormData(prev => ({...prev, pins: prev.pins.filter(p => p.id !== pin.id)}))
              }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={() => navigate("/dashboard")}>Anuluj</button>
        <button type="submit" className="btn-save">Zapisz Wpis</button>
      </div>
    </form>
  );
}