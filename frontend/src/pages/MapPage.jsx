import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import AuthContext from "../context/AuthContext";
import { API_URL } from "../apiConfig";
import "../styles/MapPage.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetinaUrl,
  iconUrl: iconUrl,
  shadowUrl: shadowUrl,
});

function MapUpdater({ activePost, allPosts }) {
    const map = useMap();
  
    useEffect(() => {
      map.invalidateSize();
  
      if (activePost && activePost.pins && activePost.pins.length > 0) {
          const markers = activePost.pins.map(pin => [parseFloat(pin.lat), parseFloat(pin.lng)]);
          const bounds = L.latLngBounds(markers);
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } 
      else if (!activePost && allPosts.length > 0) {
          const markers = [];
          allPosts.forEach(p => {
              let lat = parseFloat(p.map_center_lat);
              let lng = parseFloat(p.map_center_lng);
              
              if ((isNaN(lat) || isNaN(lng)) && p.pins && p.pins.length > 0) {
                  lat = parseFloat(p.pins[0].lat);
                  lng = parseFloat(p.pins[0].lng);
              }

              if (!isNaN(lat) && !isNaN(lng)) markers.push([lat, lng]);
          });

          if (markers.length > 0) {
              const bounds = L.latLngBounds(markers);
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
          } else {
             map.setView([52.0, 19.0], 4);
          }
      }
    }, [activePost, allPosts, map]);
  
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

export default function MapPage() {
  const { user, authTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mapPosts, setMapPosts] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const selectedPost = mapPosts.find(p => p.id === selectedPostId);

  useEffect(() => {
    const endpoint = user ? `${API_URL}/api/posts/mine/` : `${API_URL}/api/posts/`;
    const headers = user ? { "Authorization": "Bearer " + String(authTokens.access) } : {};

    fetch(endpoint, { headers })
        .then(res => res.json())
        .then(data => setMapPosts(data))
        .catch(err => console.error(err));
  }, [user, authTokens]);

  function MapClickHandler() {
    useMapEvents({
      click() {
        if (!user) {
          if(window.confirm("To jest Mapa Odkrywcy. Zaloguj się!")) navigate("/login");
        } 
      },
    });
    return null;
  }

  const getMainCoords = (post) => {
      let lat = parseFloat(post.map_center_lat);
      let lng = parseFloat(post.map_center_lng);
      if ((isNaN(lat) || isNaN(lng)) && post.pins && post.pins.length > 0) {
          lat = parseFloat(post.pins[0].lat);
          lng = parseFloat(post.pins[0].lng);
      }
      if (isNaN(lat) || isNaN(lng)) return null;
      return [lat, lng];
  }

  return (
    <div className="map-page">
      <div className="sidebar">
        {!user ? (
            <>
                <h2 style={{color: 'white', marginBottom: '1rem'}}>🗺️ Mapa Odkrywcy</h2>
                {mapPosts.map(post => (
                    <div key={post.id} className="list-card" onClick={() => setSelectedPostId(post.id)}>
                        <div className="row-flex center-v">
                            <span className="text-content">{post.title}</span>
                            <span style={{color: '#ef4444'}}>→</span>
                        </div>
                    </div>
                ))}
            </>
        ) : (
            <>
                <h2 style={{color: 'white', marginBottom: '1rem'}}>Twoja Mapa 🌍</h2>
                
                {!selectedPostId && (
                    <div className="list-card new-list" onClick={() => navigate("/create-post")}>
                        + Dodaj nową podróż
                    </div>
                )}

                <div className="posts-list-scroll">
                    {mapPosts.length === 0 ? (
                        <p style={{padding: '10px', color: '#94a3b8'}}>Brak wpisów.</p>
                    ) : (
                        mapPosts.map(post => {
                            const isSelected = selectedPostId === post.id;
                            
                            if (selectedPostId && !isSelected) return null; 

                            return (
                                <div 
                                    key={post.id} 
                                    className={`list-card ${isSelected ? 'active' : ''}`}
                                    onClick={() => !isSelected && setSelectedPostId(post.id)}
                                >
                                    <div className="list-card-header">
                                        <span className="text-content" style={{fontWeight: 'bold'}}>{post.title}</span>
                                        {isSelected ? (
                                            <button 
                                                className="btn-close-view" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedPostId(null);
                                                }}
                                            >✕</button>
                                        ) : (
                                            <span style={{color: '#38bdf8'}}>📍</span>
                                        )}
                                    </div>

                                    {isSelected && (
                                        <div className="expanded-pins">
                                            <p style={{fontSize: '0.9rem', color: '#94a3b8', marginBottom: '15px'}}>
                                                {post.short_description}
                                            </p>
                                            
                                            <h4 style={{color: 'white', marginBottom: '10px'}}>Trasa:</h4>
                                            
                                            {post.pins.map((pin) => (
                                                <div key={pin.id} className="mini-pin-row">
                                                    <span className="pin-dot" style={{color: pin.color || '#3b82f6'}}>●</span>
                                                    <div className="text-content">
                                                        <strong style={{color: '#e2e8f0'}}>{pin.name}</strong>
                                                        <div style={{fontSize: '0.8rem', color: '#64748b', marginTop: '2px'}}>
                                                            {pin.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Link to={`/post/${post.id}`} className="btn-read-full">
                                                📖 Przeczytaj pełną relację
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                
                {selectedPostId && (
                     <div style={{textAlign: 'center', marginTop: '20px'}}>
                         <button 
                            className="back-btn"
                            onClick={() => setSelectedPostId(null)}
                         >
                            ← Wróć do listy map
                         </button>
                     </div>
                )}
            </>
        )}
      </div>
      <div className="map-area">
        <MapContainer center={[52.0, 19.0]} zoom={4} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
          <MapClickHandler />
          
          <MapUpdater activePost={selectedPost} allPosts={mapPosts} />

          {selectedPostId ? (
              selectedPost && selectedPost.pins.map(pin => (
                  <Marker 
                    key={pin.id} 
                    position={[parseFloat(pin.lat), parseFloat(pin.lng)]}
                    icon={createColoredSvgIcon(pin.color || "#3b82f6")}
                  >
                      <Popup>
                          <strong>{pin.name}</strong><br/>
                          {pin.description}
                      </Popup>
                  </Marker>
              ))
          ) : (
              mapPosts.map(post => {
                const coords = getMainCoords(post);
                if(!coords) return null;
                return (
                    <Marker 
                        key={post.id} 
                        position={coords}
                        icon={createColoredSvgIcon(user ? "#3b82f6" : "#ef4444")}
                        eventHandlers={{
                            click: () => setSelectedPostId(post.id)
                        }}
                    >
                        <Popup>
                            <strong>{post.title}</strong>
                            <p style={{margin:0, fontSize:'0.8rem'}}>Kliknij, by zobaczyć trasę</p>
                        </Popup>
                    </Marker>
                )
              })
          )}
        </MapContainer>
      </div>
    </div>
  );
}
