"use client";

import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Loader as Loader2 } from "@/components/Icons";
import WowheadGenerationModal from "@/components/admin/WowheadGenerationModal";
import AdminArticleTable from "@/components/admin/AdminArticleTable";
import PaginationControls from "@/components/ui/pagination-controls";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ArticlePagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export default function ArticleManager() {
    const [articles, setArticles] = useState<article[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<ArticlePagination | null>(null);
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bunchOfArticleDeletion, setBunchOfArticleDeletion] = useState(false);
    const [pinnedFirst, setPinnedFirst] = useState(false);

    // Filters
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("all");
    const [generationFilter, setGenerationFilter] = useState("all");

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                publishedOnly: "false",
                pinnedFirst: pinnedFirst.toString(),
                category: categoryFilter !== "All" ? categoryFilter : "",
                published: statusFilter === "published" ? "true" : (statusFilter === "unpublished" ? "false" : ""),
                isGenerated: generationFilter === "generated" ? "true" : (generationFilter === "not-generated" ? "false" : ""),
            });

            const res = await fetch(`/api/articles?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                setArticles(data.data.articles);
                setPagination(data.data.pagination);
                setSelectedIds(new Set());
            }
        } catch (error) {
            console.error("Error fetching articles:", error);
        } finally {
            setLoading(false);
        }
    }, [page, categoryFilter, statusFilter, generationFilter, pinnedFirst]);

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
            console.error("Error syncing articles:", error);
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
                setArticles(prev => prev.map(a => String(a.id) === String(articleId) ? { ...a, published: !currentStatus } : a));
            } else {
            }
        } catch (error) {
            console.error("Error toggling publish status:", error);
            alert("Erreur réseau");
        }
    };

    const handleTogglePin = async (articleId: string, currentStatus: boolean) => {
        // Validation check avant le pinning
        if (!currentStatus) {
            const article = articles.find(article => article.id.toString() === articleId);

            // Check si c'est généré
            if (article && !article.isGenerated) {
                alert("Impossible d'épingler un article qui n'est pas encore généré par l'IA.");
                return;
            }

            // Check la limit d'articles pinned (4)
            const pinnedCount = articles.filter(a => a.pinned).length;
            if (pinnedCount >= 4) {
                alert("Limite atteinte : Vous ne pouvez pas épingler plus de 4 articles à la fois.");
                return;
            }
        }

        // front update sans avoir besoin d'avoir la réponse du serveur donc de request
        const previousArticles = articles;
        setArticles(prev => prev.map(a => String(a.id) === String(articleId) ? { ...a, pinned: !currentStatus } : a));

        try {
            const res = await fetch(`/api/articles/${articleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: !currentStatus })
            });
            const data = await res.json();

            if (!data.success) {
                setArticles(previousArticles);
                alert("Erreur: " + data.error);
            }
        } catch (error) {
            setArticles(previousArticles);
            console.error("Error toggling pin status:", error);
            alert("Erreur réseau");
        }
    };

    const handleDelete = async (articleId: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

        try {
            const res = await fetch(`/api/articles/${articleId}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                alert("Article supprimé avec succès");
                fetchArticles();
            } else {
                alert("Erreur lors de la suppression: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting article:", error);
            alert("Erreur réseau");
        }
    };

    const handleBunchOfArticleDeletion = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.size} articles ?`)) return;

        setBunchOfArticleDeletion(true);
        try {
            const res = await fetch("/api/admin/articles/bulk", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            const data = await res.json();
            if (data.success) {
                alert("Articles supprimés avec succès");
                fetchArticles();
                setSelectedIds(new Set());
            } else {
                alert("Erreur lors de la suppression groupée: " + data.error);
            }
        } catch (error) {
            console.error("Error deleting articles:", error);
            alert("Erreur réseau");
        } finally {
            setBunchOfArticleDeletion(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === articles.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(articles.map(a => a.id.toString())));
        }
    };

    const toggleSelectArticle = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Gestion des Articles</h2>
                    <p className="text-sm text-muted-foreground">Gérez et publiez vos articles synchronisés</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Category Filter */}
                    <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[110px] h-9">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Toutes</SelectItem>
                            <SelectItem value="Classic">Classic</SelectItem>
                            <SelectItem value="Retail">Retail</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Published Status Filter */}
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[125px] h-9">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous (Statut)</SelectItem>
                            <SelectItem value="published">Publiés</SelectItem>
                            <SelectItem value="unpublished">Non publiés</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Generation Status Filter */}
                    <Select value={generationFilter} onValueChange={(v) => { setGenerationFilter(v); setPage(1); }}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="Génération" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes (IA)</SelectItem>
                            <SelectItem value="generated">Générés</SelectItem>
                            <SelectItem value="not-generated">En attente</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2 mr-2">
                        <Switch
                            id="pinned-first"
                            checked={pinnedFirst}
                            onCheckedChange={(checked) => {
                                setPinnedFirst(checked);
                                setPage(1);
                            }}
                        />
                        <label htmlFor="pinned-first" className="text-sm font-medium leading-none cursor-pointer">
                            Épinglés
                        </label>
                    </div>

                    <Button
                        onClick={handleSync}
                        disabled={loading}
                        className="gap-2 h-9"
                        variant="outline"
                    >
                        Sync RSS
                    </Button>

                    <WowheadGenerationModal onArticleGenerated={fetchArticles} />
                </div>
            </div>

            {/* Bunch of Article Deletion Bar */}
            {selectedIds.size > 0 && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-primary">
                            {selectedIds.size} article(s) sélectionné(s)
                        </span>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBunchOfArticleDeletion}
                        disabled={bunchOfArticleDeletion}
                        className="gap-2"
                    >
                        {bunchOfArticleDeletion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Supprimer la sélection
                    </Button>
                </div>
            )}

            <AdminArticleTable
                articles={articles}
                loading={loading}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelectArticle}
                onToggleSelectAll={toggleSelectAll}
                onTogglePin={handleTogglePin}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDelete}
            />

            <div className="mt-8">
                <PaginationControls
                    currentPage={page}
                    totalPages={pagination?.totalPages || 1}
                    onPageChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                />
            </div>
        </div>
    );
}
