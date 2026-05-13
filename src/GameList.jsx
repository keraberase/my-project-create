import { useState, useEffect } from "react";
import GameCard from "./GameCard";
import AddGameForm from "./AddGameForm";
 
export default function GameList({ authToken, onStatsUpdate }) {
    const [games, setGames]       = useState([]);
    const [currentPage, setPage]  = useState(1);
    const [pagination, setPag]    = useState({});
    const [statusFilter, setStatus] = useState("");
    const [searchFilter, setSearch] = useState("");
    const [sortBy, setSort]       = useState("added_at");
 
    useEffect(() => { loadGames(); }, [currentPage, statusFilter, searchFilter, sortBy]);
 
    async function loadGames() {
        let url = `/games?page=${currentPage}&limit=9`;
        if (statusFilter) url += `&status=${statusFilter}`;
        if (searchFilter) url += `&search=${encodeURIComponent(searchFilter)}`;
        if (sortBy)       url += `&sort_by=${sortBy}`;
 
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setGames(data.games);
        setPag(data.pagination);
        onStatsUpdate(data.stats);
    }
 
    async function handleComplete(id) {
        await fetch(`/games/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
            body: JSON.stringify({ status: "completed" }),
        });
        loadGames();
    }
 
    async function handleDelete(id) {
        await fetch(`/games/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
        });
        loadGames();
    }
 
    function handleEdit(id) {

        window.openEditModal(id);
    }
 
    return (
        <>
        /* form add */
            <AddGameForm authToken={authToken} onGameAdded={loadGames} />
 
            /* Filters */
            <div className="filters">
                <input
                    placeholder="SEARCH GAMES..."
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
                <select onChange={e => { setStatus(e.target.value); setPage(1); }}>
                    <option value="">ALL STATUS</option>
                    <option value="planned">PLANNED</option>
                    <option value="playing">PLAYING</option>
                    <option value="completed">COMPLETED</option>
                    <option value="dropped">DROPPED</option>
                </select>
                <select onChange={e => { setSort(e.target.value); setPage(1); }}>
                    <option value="added_at">SORT BY DATE</option>
                    <option value="title">SORT BY TITLE</option>
                    <option value="rating">SORT BY RATING</option>
                    <option value="hours">SORT BY HOURS</option>
                </select>
            </div>
 
            /* Game List */
            <ul className="game-list">
                {games.length === 0 ? (
                    <div className="empty">NO GAMES YET<br /><span>[ START YOUR BACKLOG ]</span></div>
                ) : (
                    games.map(game => (
                        <GameCard
                            key={game.id}
                            game={game}
                            onComplete={handleComplete}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </ul>
 
            /* Pagination */
            {pagination.pages > 1 && (
                <div className="pagination">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            style={p === currentPage ? { background: "#ff00ff", borderColor: "#ff00ff" } : {}}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}