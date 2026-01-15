"use client";

import { useState, useEffect, use } from "react";
import { article } from "@/types/article.types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Save, Trash2, Wand as Wand2, Undo as Undo2, Pen as Edit3, Globe, Calendar, CheckCircle as CheckCircle2, Clock, RefreshCcw as RefreshCw, ExternalLink } from "@/components/Icons";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";

export default function ArticleDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const [article, setArticle] = useState<article | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: "",
        description: "",
        generatedText: ""
    });
    const [saving, setSaving] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const res = await fetch(`/api/articles/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setArticle(data.data);
                    setEditData({
                        title: data.data.title,
                        description: data.data.description || "",
                        generatedText: data.data.generatedText || ""
                    });
                } else {
                    alert("Erreur: " + data.error);
                }
            } catch (error) {
                console.error("Fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticle();
    }, [params.id]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch(`/api/articles/${params.id}/generate`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.success) {
                const updatedArticle = data.data;
                setArticle(updatedArticle);
                setEditData({
                    title: updatedArticle.title,
                    description: updatedArticle.description || "",
                    generatedText: updatedArticle.generatedText || ""
                });
            } else {
                alert("Erreur génération: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/articles/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData)
            });
            const data = await res.json();
            if (data.success) {
                setArticle(data.data);
                setIsEditing(false);
                alert("Article mis à jour");
            } else {
                alert("Erreur lors de la sauvegarde: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        } finally {
            setSaving(false);
        }
    };

    const handleTogglePublish = async () => {
        if (!article) return;

        try {
            const res = await fetch(`/api/articles/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ published: !article.published })
            });
            const data = await res.json();
            if (data.success) {
                setArticle(data.data);
                alert(data.data.published ? "Article publié avec succès" : "Article dépublié");
            } else {
                alert("Erreur: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) return;

        try {
            const res = await fetch(`/api/articles/${params.id}`, {
                method: "DELETE"
            });
            const data = await res.json();
            if (data.success) {
                alert("Article supprimé");
                router.push("/admin");
            } else {
                alert("Erreur suppression: " + data.error);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-2">
                <Clock className="w-5 h-5 animate-spin text-primary" />
                <span className="text-lg font-medium">Chargement de l&apos;article...</span>
            </div>
        </div>
    );

    if (!article) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Article non trouvé</h1>
            <Button asChild>
                <Link href="/admin">Retour au Dashboard</Link>
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin" className="flex items-center gap-2">
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </Button>
                        <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
                        <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">
                            {article.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={article.published ? "secondary" : "default"}
                            size="sm"
                            onClick={handleTogglePublish}
                        >
                            {article.published ? 'Dépublier' : 'Publier'}
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Image Section */}
                {article.image && (
                    <div className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl group border border-border">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className={
                                        article.category === 'Classic'
                                            ? 'bg-amber-500/20 text-amber-500 border-amber-500/50 backdrop-blur-sm'
                                            : 'bg-blue-500/20 text-blue-500 border-blue-500/50 backdrop-blur-sm'
                                    }
                                >
                                    {article.category}
                                </Badge>
                                <div className="flex items-center gap-1 text-white/80 text-sm">
                                    <Calendar className="w-3 h-3" />
                                    {mounted ? new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR') : "..."}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <CardTitle>Détails de l&apos;article</CardTitle>
                                    <CardDescription>Modifiez les informations de base de l&apos;article</CardDescription>
                                </div>
                                <Button
                                    variant={isEditing ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={() => {
                                        if (isEditing) {
                                            setIsEditing(false);
                                            setEditData({
                                                title: article.title,
                                                description: article.description || "",
                                                generatedText: article.generatedText || ""
                                            });
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                >
                                    {isEditing ? <Undo2 className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                                    {isEditing ? "Annuler" : "Modifier"}
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre</Label>
                                    {isEditing ? (
                                        <Input
                                            id="title"
                                            value={editData.title}
                                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted/50 rounded-lg font-medium border border-border">
                                            {article.title}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (RSS)</Label>
                                    {isEditing ? (
                                        <RichTextEditor
                                            mode="simple"
                                            content={editData.description}
                                            onChange={(content) => setEditData({ ...editData, description: content })}
                                        />
                                    ) : (
                                        <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground border border-border">
                                            {article.description ? (
                                                <div className="prose dark:prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: article.description }} />
                                            ) : (
                                                "Aucune description."
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Texte Généré (Clean)</Label>
                                        <div className="flex gap-2">
                                            {!article.isGenerated && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={handleGenerate}
                                                    disabled={generating}
                                                    className="h-8 text-[11px] px-3"
                                                >
                                                    <Wand2 className="w-3 h-3 mr-1" />
                                                    {generating ? "Génération..." : "Générer"}
                                                </Button>
                                            )}
                                            {article.isGenerated && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={handleGenerate}
                                                    disabled={generating}
                                                    className="h-8 text-[11px] px-3"
                                                >
                                                    <RefreshCw className={`w-3 h-3 mr-1 ${generating ? 'animate-spin' : ''}`} />
                                                    Régénérer
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {isEditing ? (
                                        <RichTextEditor
                                            content={editData.generatedText}
                                            onChange={(content) => setEditData({ ...editData, generatedText: content })}
                                        />
                                    ) : (
                                        <div className="min-h-[200px] p-6 bg-muted/30 rounded-lg border border-border leading-relaxed text-muted-foreground">
                                            {article.generatedText ? (
                                                <div
                                                    className="prose dark:prose-invert max-w-none"
                                                    dangerouslySetInnerHTML={{ __html: article.generatedText }}
                                                />
                                            ) : (
                                                <p className="italic">Le contenu n'a pas encore été généré.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isEditing && (
                                    <Button
                                        className="w-full"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        {saving ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Statut</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="w-4 h-4 text-muted-foreground" />
                                        <span>Publication</span>
                                    </div>
                                    <Badge variant={article.published ? "default" : "outline"}>
                                        {article.published ? "Publié" : "Brouillon"}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                                        <span>IA</span>
                                    </div>
                                    <Badge variant={article.isGenerated ? "default" : "outline"}>
                                        {article.isGenerated ? "Généré" : "En attente"}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Source</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Description RSS</Label>
                                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md line-clamp-6">
                                        {article.description || "Aucune description source."}
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full" asChild>
                                    <a href={article.link} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-3 h-3 mr-2" />
                                        Lien d&apos;origine (Wowhead)
                                    </a>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
