import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { API_URL, getImageUrl } from "../apiConfig";
import "../styles/PostPage.css";

function MapUpdater({ pins, defaultCenter, defaultZoom }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    if (pins && pins.length > 0) {
        const markers = pins.map(pin => [parseFloat(pin.lat), parseFloat(pin.lng)]);
        const bounds = L.latLngBounds(markers);
        
        if (markers.length === 1) {
            map.setView(markers[0], 12);
        } else {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    } else {
        if (defaultCenter[0] !== 0) {
            map.setView(defaultCenter, defaultZoom);
        }
    }
  }, [pins, defaultCenter, defaultZoom, map]);

  return null;
}

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

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/posts/${id}/`)
      .then(res => {
        if (!res.ok) throw new Error("Nie znaleziono wpisu");
        return res.json();
      })
      .then(data => {
        setPost(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{padding: '4rem', color: 'white', textAlign: 'center'}}>Ładowanie...</div>;
  if (!post) return <div style={{padding: '4rem', color: 'white', textAlign: 'center'}}>Nie znaleziono wpisu. <Link to="/" style={{color: '#38bdf8'}}>Wróć</Link></div>;

  const mapCenter = [
    parseFloat(post.map_center_lat) || 52.23, 
    parseFloat(post.map_center_lng) || 21.01
  ];
  const mapZoom = post.zoom || 6;

  return (
    <div className="post-page">
      <div className="post-header" style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${getImageUrl(post.cover_image)})` }}>
        <h1>{post.title}</h1>
      </div>

      <div className="post-container">
        <Link to="/" className="back-link">← Wróć do strony głównej</Link>

        <article className="post-content">
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>
        </article>

        <div className="post-map-section">
          <h3>Lokalizacja</h3>
          
          <div className="post-map-wrapper" style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative', zIndex: 1, border: '1px solid #334155' }}>
            
            <MapContainer 
                key={post.id} 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
            >
              <MapUpdater 
                  pins={post.pins} 
                  defaultCenter={mapCenter} 
                  defaultZoom={mapZoom} 
              />

              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              
              {post.pins && post.pins.map((pin) => (
                <Marker 
                  key={pin.id} 
                  position={[parseFloat(pin.lat) || 0, parseFloat(pin.lng) || 0]} 
                  icon={createColoredSvgIcon(pin.color || "#3b82f6")}
                >
                  <Popup>
                    <strong>{pin.name}</strong><br />
                    {pin.description}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {post.gallery && post.gallery.length > 0 && (
          <div className="post-gallery-section">
            <h3 style={{marginTop: '3rem'}}>Galeria zdjęć</h3>
            <div className="post-gallery-grid">
              {post.gallery.map((imgObj) => (
                <img 
                    key={imgObj.id} 
                    src={getImageUrl(imgObj.image)} 
                    alt="Galeria" 
                    onClick={() => window.open(getImageUrl(imgObj.image), '_blank')} 
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}