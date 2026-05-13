import { useState, useMemo } from "react";
 
function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
 
export default function AddGameForm({ authToken, onGameAdded }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [preview, setPreview] = useState(null);
 
    const [title, setTitle]       = useState("");
    const [platform, setPlatform] = useState("");
    const [status, setStatus]     = useState("planned");
    const [rating, setRating]     = useState("");
    const [hours, setHours]       = useState("0");
    const [tags, setTags]         = useState("");
    const [coverUrl, setCoverUrl] = useState("");
    const [loading, setLoading]   = useState(false);
 
    // IGDB and debounce
    const searchIGDB = useMemo(
        () => debounce(async (query) => {
            if (!query || query.length < 2) { setShowResults(false); return; }
            try {
                const res = await fetch(`/api/search-games?query=${encodeURIComponent(query)}`);
                const games = await res.json();
                setSearchResults(games);
                setShowResults(true);
            } catch (e) {
                console.error(e);
            }
        }, 500),
        []
    );
 
    function handleSearchInput(e) {
        setSearchQuery(e.target.value);
        searchIGDB(e.target.value);
    }
 
    function selectGame(game) {
        const platforms = game.platforms ? game.platforms.map((p) => p.name) : [];
        setTitle(game.name);
        setPlatform(platforms.join(", "));
        setCoverUrl(game.cover || "");
        setSearchQuery(game.name);
        setShowResults(false);
        setPreview({
            title: game.name,
            cover: game.cover || "",
            platforms,
        });
    }
 
    function clearForm() {
        setSearchQuery(""); setTitle(""); setPlatform("");
        setStatus("planned"); setRating(""); setHours("0");
        setTags(""); setCoverUrl(""); setPreview(null);
        setShowResults(false);
    }
 
    async function handleAdd() {
        if (!title.trim()) { alert("Enter a game title!"); return; }
        if (rating && (Number(rating) < 1 || Number(rating) > 5)) {
            alert("Rating must be 1-5"); return;
        }
        setLoading(true);
        try {
            const res = await fetch("/games", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify({
                    title: title.trim(),
                    platform,
                    status,
                    rating: rating ? parseInt(rating) : null,
                    hours: parseFloat(hours) || 0,
                    tags,
                    cover_url: coverUrl,
                }),
            });
            if (res.ok) {
                clearForm();
                onGameAdded();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } finally {
            setLoading(false);
        }
    }
 
    return (
        <div className="form-card">
            {/* IGDB Search */}
            <div className="search-section">
                <input
                    value={searchQuery}
                    onChange={handleSearchInput}
                    placeholder="🔍 SEARCH GAME ON IGDB..."
                    autoComplete="off"
                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {showResults && searchResults.length > 0 && (
                    <div className="search-results" style={{ display: "block" }}>
                        {searchResults.map((game, i) => {
                            const year = game.first_release_date
                                ? new Date(game.first_release_date * 1000).getFullYear()
                                : "";
                            const stars = game.rating
                                ? `⭐ ${(game.rating / 10).toFixed(1)}`
                                : "";
                            return (
                                <div
                                    key={i}
                                    className="search-result-item"
                                    onMouseDown={() => selectGame(game)}
                                >
                                    {game.cover ? (
                                        <img src={game.cover} className="search-result-cover" alt="" />
                                    ) : (
                                        <div className="search-result-cover" style={{ width: 40, height: 53, background: "#222", display: "flex", alignItems: "center", justifyContent: "center" }}>🎮</div>
                                    )}
                                    <div className="search-result-info">
                                        <div className="search-result-title">{game.name}</div>
                                        <div className="search-result-meta">{year} {stars}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
 
            /* Preview */
            {preview && (
                <div className="selected-preview" style={{ display: "flex" }}>
                    {preview.cover && <img src={preview.cover} alt="" />}
                    <div>
                        <strong>{preview.title}</strong>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                            {preview.platforms.map((p) => (
                                <span key={p} className="platform-tag">{p}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
 
            /* Form Fields */
            <div className="input-row">
                <input value={title}    onChange={e=>setTitle(e.target.value)}    placeholder="GAME TITLE *" />
                <input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="PLATFORM" />
                <select value={status}  onChange={e=>setStatus(e.target.value)}>
                    <option value="planned">PLANNED</option>
                    <option value="playing">PLAYING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="dropped">DROPPED</option>
                </select>
            </div>
 
            <div className="input-row">
                <input value={rating} onChange={e=>setRating(e.target.value)} placeholder="RATING 1-5" type="number" min="1" max="5" />
                <input value={hours}  onChange={e=>setHours(e.target.value)}  placeholder="HOURS PLAYED" type="number" step="0.5" />
                <input value={tags}   onChange={e=>setTags(e.target.value)}   placeholder="TAGS (RPG, ACTION)" />
            </div>
 
            <button className="btn-add" onClick={handleAdd} disabled={loading}>
                {loading ? "ADDING..." : "▶ ADD GAME"}
            </button>
        </div>
    );
}