"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { RefreshCcw as RefreshCw, Loader as Loader2 } from "@/components/Icons";

interface WowheadGenerationModalProps {
    onArticleGenerated: () => void;
}

export default function WowheadGenerationModal({ onArticleGenerated }: WowheadGenerationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!url || !url.includes("wowhead.com")) {
            alert("Veuillez entrer une URL Wowhead valide");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch("/api/admin/articles/generate-from-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            const data = await res.json();
            if (data.success) {
                alert("Article généré avec succès !");
                setUrl("");
                setIsOpen(false);
                onArticleGenerated();
            } else {
                alert("Erreur: " + data.error);
            }
        } catch (error) {
            console.error("Error generating from link:", error);
            alert("Erreur réseau");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="default" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Générer depuis Wowhead
                </Button>
            </SheetTrigger>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>Générer depuis Wowhead</SheetTitle>
                    <SheetDescription>
                        Entrez l&apos;URL d&apos;un article Wowhead pour importer et générer automatiquement son contenu.
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="wowhead-url">URL de l&apos;article</Label>
                        <Input
                            id="wowhead-url"
                            placeholder="https://www.wowhead.com/news/article-machin..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isGenerating}
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            Ex: https://www.wowhead.com/news/article-name...
                        </p>
                    </div>
                </div>
                <SheetFooter>
                    <Button
                        className="w-full"
                        onClick={handleGenerate}
                        disabled={isGenerating || !url}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Génération en cours...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Générer l&apos;article
                            </>
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
