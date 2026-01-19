"use client";

import { article } from "@/types/article.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, Trash2, Loader as Loader2, Cog as Settings } from "@/components/Icons";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface AdminArticleTableProps {
    articles: article[];
    loading: boolean;
    selectedIds: Set<string>;
    onToggleSelect: (id: string) => void;
    onToggleSelectAll: () => void;
    onTogglePin: (id: string, currentStatus: boolean) => void;
    onTogglePublish: (id: string, currentStatus: boolean) => void;
    onDelete: (id: string) => void;
}

export default function AdminArticleTable({
    articles,
    loading,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
    onTogglePin,
    onTogglePublish,
    onDelete
}: AdminArticleTableProps) {
    return (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[50px]">
                            <Checkbox
                                checked={articles.length > 0 && selectedIds.size === articles.length}
                                onCheckedChange={onToggleSelectAll}
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
                                        onCheckedChange={() => onToggleSelect(article.id.toString())}
                                    />
                                </TableCell>
                                <TableCell>
                                    <button
                                        onClick={() => onTogglePin(article.id.toString(), article.pinned)}
                                        className={`transition-colors duration-200 ${article.pinned ? "text-yellow-500" : "text-muted-foreground/30 hover:text-yellow-500/50"}`}
                                        title={article.pinned ? "Retirer des favoris" : "Épingler en favori"}
                                    >
                                        <Star className="w-4 h-4 fill-current" />
                                    </button>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col max-w-[400px]">
                                        <Link
                                            href={`/admin/articles/${article.id}`}
                                            className="font-medium hover:text-primary transition-colors truncate"
                                        >
                                            {article.title}
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <a
                                                href={article.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-muted-foreground hover:underline flex items-center gap-1"
                                            >
                                                <ExternalLink className="w-2.5 h-2.5" />
                                                Source Originale
                                            </a>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] py-0 h-5 px-2">
                                        {article.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(article.pubDate || article.createdAt).toLocaleDateString("fr-FR")}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={article.isGenerated ? "success" : "warning"}
                                        className="text-[10px] py-0 h-5 px-2"
                                    >
                                        {article.isGenerated ? "Généré" : "A Faire"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Switch
                                        checked={article.published}
                                        onCheckedChange={() => onTogglePublish(article.id.toString(), article.published)}
                                        className="scale-75"
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary">
                                            <Link href={`/admin/articles/${article.id}`}>
                                                <Settings className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(article.id.toString())}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
