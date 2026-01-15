"use client";

import { useState, useEffect, useCallback } from "react";
import { article } from "@/types/article.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCcw as RefreshCw, ExternalLink, Cog as Settings, Star, Trash2, Loader as Loader2 } from "@/components/Icons";
import Link from "next/link";

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
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bunchOfArticleDeletion, setBunchOfArticleDeletion] = useState(false);

    const fetchArticles = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                publishedOnly: "false",
            });

            const res = await fetch(`/api/articles?${queryParams}`);
            const data = await res.json();

            if (data.success) {
                let fetchedArticles = data.data.articles;
                if (onlyPending) {
                    fetchedArticles = fetchedArticles.filter((article: article) => !article.isGenerated);
                }
                setArticles(fetchedArticles);
                setPagination(data.data.pagination);
                setSelectedIds(new Set());
            }
        } catch (error) {
            // Silently fail or handled by UI
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
            alert("Erreur réseau");
        }
    };

    const handleTogglePin = async (articleId: string, currentStatus: boolean) => {
        // Validation check avant le pinning
        if (!currentStatus) {
            const article = articles.find(a => a.id === articleId);

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
                // Revert if server returns error
                setArticles(previousArticles);
                alert("Erreur: " + data.error);
            }
        } catch (error) {
            // Revert on network error
            setArticles(previousArticles);
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
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2 mr-2">
                        <Switch
                            id="pending-only"
                            checked={onlyPending}
                            onCheckedChange={(checked) => {
                                setOnlyPending(checked);
                                setPage(1);
                            }}
                        />
                        <label htmlFor="pending-only" className="text-sm font-medium leading-none cursor-pointer">
                            Non générés
                        </label>
                    </div>
                    <Button
                        onClick={handleSync}
                        disabled={loading}
                        className="gap-2"
                        variant="outline"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Sync RSS
                    </Button>
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

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={articles.length > 0 && selectedIds.size === articles.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead className="min-w-[300px]">Titre</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Publié</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                        <p className="text-muted-foreground">Chargement des articles...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : articles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-20 text-muted-foreground italic">
                                    Aucun article trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            articles.map((article) => (
                                <TableRow key={article.id} className={selectedIds.has(article.id.toString()) ? "bg-primary/5" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.has(article.id.toString())}
                                            onCheckedChange={() => toggleSelectArticle(article.id.toString())}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 transition-colors duration-200 ${article.pinned ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-foreground"}`}
                                            onClick={() => handleTogglePin(article.id.toString(), article.pinned)}
                                        >
                                            <Star className={`h-4 w-4 transition-transform duration-200 ${article.pinned ? "fill-current scale-110" : "scale-100"}`} />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <Link
                                                href={`/admin/articles/${article.id}`}
                                                className="font-medium hover:text-primary transition-colors line-clamp-1"
                                            >
                                                {article.title}
                                            </Link>
                                            <a
                                                href={article.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 uppercase tracking-tight"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Source Originale
                                            </a>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">{article.category}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(article.pubDate || article.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={article.isGenerated ? "success" : "warning"} className="text-[10px] py-0 h-5">
                                            {article.isGenerated ? 'Généré' : 'À faire'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={article.published}
                                            onCheckedChange={() => handleTogglePublish(article.id.toString(), article.published)}
                                            className="scale-75"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild className="h-8">
                                            <Link href={`/admin/articles/${article.id}`}>
                                                <Settings className="w-3.5 h-3.5 mr-1.5" />
                                                Gérer
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
                        <div className="text-xs text-muted-foreground">
                            Article {((page - 1) * 20) + 1} à {Math.min(page * 20, pagination.total)} sur {pagination.total}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPage(p => Math.max(1, p - 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === 1}
                                className="h-8"
                            >
                                Précédent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setPage(p => Math.min(pagination.totalPages, p + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={page === pagination.totalPages}
                                className="h-8"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
