"use client";

import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";

interface ArticlePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ArticleManager() {
    const [articles, setArticles] = useState<article[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyPending, setOnlyPending] = useState(false);
    const [pagination, setPagination] = useState<ArticlePagination | null>(null);
    const [page, setPage] = useState(1);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                publishedOnly: "false", // Admin voit tous les articles
            });

            const res = await fetch(`/api/articles?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                let filteredArticles = data.data.articles;
                // Filtrer côté client pour "non générés"
                if (onlyPending) {
                    filteredArticles = filteredArticles.filter((a: article) => !a.isGenerated);
                }
                setArticles(filteredArticles);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch articles", error);
        } finally {
            setLoading(false);
        }
    }, [page, onlyPending]);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/sync", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                alert(`Sync réussie : ${data.data.new} nouveaux articles, ${data.data.updated} mis à jour.`);
                fetchArticles();
            } else {
                alert("Erreur sync: " + data.error);
            }
        } catch (error) {
            console.error("Sync failed", error);
            alert("Erreur réseau lors de la synchro");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (articleId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/articles/${articleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !currentStatus })
            });
            const data = await res.json();
            if (data.success) {
                setArticles(prev => prev.map(a => a.id === articleId ? { ...a, published: !currentStatus } : a));
            } else {
                alert("Erreur: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        }
    };



    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Gestion des Articles</h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleSync}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                    >
                        {loading ? 'Chargement...' : 'Synchroniser RSS'}
                    </button>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={onlyPending}
                            onChange={(e) => {
                                setOnlyPending(e.target.checked);
                                setPage(1);
                            }}
                            className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        <span className="text-gray-700">Non générés uniquement</span>
                    </label>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">Chargement...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publication</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {articles.map((article) => (
                                <tr key={article.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={article.title}>
                                            <a href={`/admin/articles/${article.id}`} className="hover:text-blue-600 hover:underline">
                                                {article.title}
                                            </a>
                                        </div>
                                        <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
                                            Voir source
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                            {article.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(article.pubDate || article.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {article.isGenerated ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Généré
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                En attente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleTogglePublish(article.id, article.published)}
                                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors cursor-pointer ${article.published
                                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                            title={article.published ? "Dépublier" : "Publier"}
                                        >
                                            {article.published ? '✓ Publié' : '○ Non publié'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <a
                                            href={`/admin/articles/${article.id}`}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded"
                                        >
                                            Gérer
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && (
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded text-sm text-black disabled:text-gray-400"
                    >
                        Précédent
                    </button>
                    <span className="text-sm text-gray-700">
                        Page {pagination.page} sur {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="px-4 py-2 border rounded text-sm text-black disabled:text-gray-400"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
