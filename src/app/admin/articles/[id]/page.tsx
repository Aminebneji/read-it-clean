"use client";

import { useState, useEffect, use } from "react";
import { article } from "@/types/article.types";
import { useRouter } from "next/navigation";

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
    const router = useRouter();

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

    if (loading) return <div className="p-8">Chargement...</div>;
    if (!article) return <div className="p-8">Article non trouvé</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <button
                onClick={() => router.push("/admin")}
                className="mb-4 text-blue-600 hover:underline"
            >
                &larr; Retour à la liste
            </button>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 mr-4">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editData.title}
                                onChange={(event) => setEditData({ ...editData, title: event.target.value })}
                                className="w-full text-2xl font-bold text-black border rounded px-2 py-1 outline-blue-500"
                            />
                        ) : (
                            <h1 className="text-2xl font-bold text-black">{article.title}</h1>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleTogglePublish}
                            className={
                                `px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm ${article.published
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                        >
                            {article.published ? 'Dépublier' : 'Publier'}
                        </button>

                        <span className={`px-3 py-1 rounded-full text-sm font-semibold h-fit ${article.category?.toLowerCase() === 'retail' ? 'bg-blue-100 text-blue-800' :
                            article.category?.toLowerCase() === 'classic' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {article.category}
                        </span>
                    </div>
                </div>



                {article.image && (
                    <div className="mb-6">
                        <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-64 object-cover rounded-lg shadow-sm"
                            onError={(event) => (event.currentTarget.style.display = 'none')}
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <h3 className="font-semibold text-black mb-2">Informations</h3>
                        <p className="font-semibold text-black mb-2"><strong>Date:</strong> {new Date(article.pubDate || article.createdAt).toLocaleString()}</p>
                        <p className="font-semibold text-black mb-2"><strong>Status:</strong> {article.isGenerated ? "Généré" : "En attente"}</p>
                        <p className="mt-2">
                            <a href={article.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                Voir le lien original
                            </a>
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-black mb-2">Description Originale</h3>
                        {isEditing ? (
                            <textarea
                                value={editData.description}
                                onChange={(event) => setEditData({ ...editData, description: event.target.value })}
                                className="w-full h-32 text-sm text-black border rounded p-2 outline-blue-500"
                            />
                        ) : (
                            <div className="bg-gray-50 p-4 rounded text-sm text-black">
                                {article.description || "Aucune description"}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-black">Contenu</h2>
                        {/* generation */}
                        {!article.isGenerated && (
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
                            >
                                {generating ? "Génération en cours..." : "Générer le texte"}
                            </button>
                        )}
                        {article.isGenerated && (
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Régénérer
                            </button>
                        )}
                        {/* edition */}
                        <button
                            onClick={() => {
                                if (isEditing) handleSave();
                                else setIsEditing(true);
                            }}
                            disabled={saving}
                            className={`px-4 py-2 rounded text-white ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-black'}`}
                        >
                            {saving ? "Sauvegarde..." : isEditing ? "Enregistrer" : "Modifier"}
                        </button>

                        {isEditing && (

                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({
                                        title: article.title,
                                        description: article.description || "",
                                        generatedText: article.generatedText || ""
                                    });
                                }}
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-black"
                            >
                                Annuler
                            </button>

                        )}

                    </div>

                    {isEditing ? (
                        <textarea
                            value={editData.generatedText}
                            onChange={(event) => setEditData({ ...editData, generatedText: event.target.value })}
                            className="w-full h-96 text-black border rounded p-6 outline-blue-500 whitespace-pre-wrap"
                            placeholder="Le contenu n'a pas encore été généré..."
                        />
                    ) : (
                        article.generatedText ? (
                            <div className="prose max-w-none text-black p-6 rounded-lg whitespace-pre-wrap">
                                {article.generatedText}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-black rounded-lg italic">
                                Le contenu n&apos;a pas encore été généré.
                            </div>
                        )
                    )}

                </div>

                <div className="border-t mt-8 pt-6 flex justify-end gap-2">
                    <button
                        onClick={handleDelete}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded transition-colors"
                    >
                        Supprimer l&apos;article
                    </button>
                </div>
            </div>
        </div >
    );
}
