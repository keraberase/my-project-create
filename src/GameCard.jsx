import { useState } from "react";
 
function renderStars(rating) {
    if (!rating) return <span style={{ color: "#333" }}>NOT RATED</span>;
    return Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="12" height="12" style={{ opacity: i < rating ? 1 : 0.1 }}>
            <use href="#star" />
        </svg>
    ));
}
 
export default function GameCard({ game, onComplete, onEdit, onDelete }) {
    const [loading, setLoading] = useState(false);
 
    const platforms = game.platform
        ? game.platform.split(", ").map((p) => (
              <span key={p} className="platform-badge">{p}</span>
          ))
        : <span className="platform-badge">???</span>;
 
    async function handleComplete() {
        setLoading(true);
        await onComplete(game.id);
        setLoading(false);
    }
 
    async function handleDelete() {
        if (!confirm("Delete this game?")) return;
        setLoading(true);
        await onDelete(game.id);
        setLoading(false);
    }
 
    return (
        <li className={`game-item${game.status === "completed" ? " completed" : ""}`}>
            {game.cover_url ? (
                <img
                    src={game.cover_url}
                    className="game-cover-img"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/300x180?text=NO+COVER")}
                    alt={game.title}
                />
            ) : (
                <div className="game-cover-img" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                    🎮
                </div>
            )}
 
            <div className="game-info">
                <div className="game-title">{game.title}</div>
                <div className="game-meta">
                    {platforms}
                    <span className={`status-badge status-${game.status}`}>
                        {game.status.toUpperCase()}
                    </span>
                </div>
                <div className="stars">{renderStars(game.rating)}</div>
                <div className="game-details">
                    <span>⏱️ {game.hours || 0}h</span>
                    {game.added_at && <span>📅 {game.added_at}</span>}
                </div>
                {game.tags && <div className="tags">🏷️ {game.tags}</div>}
            </div>
 
            <div className="game-actions">
                {game.status !== "completed" && (
                    <button className="btn-complete" onClick={handleComplete} disabled={loading}>
                        ✓ COMPLETE
                    </button>
                )}
                <button className="btn-edit" onClick={() => onEdit(game.id)} disabled={loading}>
                    ✎ EDIT
                </button>
                <button className="btn-delete" onClick={handleDelete} disabled={loading}>
                    ✗ DEL
                </button>
            </div>
        </li>
    );
}