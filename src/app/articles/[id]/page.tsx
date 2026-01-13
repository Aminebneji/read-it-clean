import { getArticleById } from "@/services/article.service";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/mode-toggle";

interface ArticlePageProps {
    params: Promise<{ id: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
    const { id } = await params;

    let article;
    try {
        article = await getArticleById(id);
    } catch (error) {
        notFound();
    }

    const formattedDate = new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
            {/* Navigation Header */}
            <nav className="bg-card/80 backdrop-blur-md sticky top-0 z-50 border-b border-border">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Button variant="ghost" asChild className="group">
                        <Link href="/" className="flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-medium">Retour</span>
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Lecture Article
                        </div>
                        <ModeToggle />
                    </div>
                </div>
            </nav>

            <article className="max-w-4xl mx-auto mt-8 px-4 sm:px-6">
                {/* Hero Section */}
                <div className="relative h-[250px] md:h-[400px] w-full rounded-2xl overflow-hidden shadow-xl mb-8 group">
                    {article.image ? (
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                            <span className="text-primary-foreground text-4xl font-bold opacity-20 uppercase tracking-tighter">Read It Clean</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Badge
                                variant={article.category === 'Classic' ? 'outline' : 'default'}
                                className={article.category === 'Classic' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : ''}
                            >
                                {article.category || 'Blizzard'}
                            </Badge>
                            <span className="text-white/80 text-sm font-medium">{formattedDate}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                            {article.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-card rounded-3xl shadow-sm border border-border p-8 md:p-12 transition-colors duration-300">
                    <div className="max-w-none text-card-foreground leading-relaxed">
                        {article.generatedText ? (
                            <div
                                className="whitespace-pre-wrap space-y-4 text-lg md:text-xl font-medium antialiased text-foreground/90"
                                dangerouslySetInnerHTML={{ __html: article.generatedText.replace(/\n\n/g, '<br /><br />') }}
                            />
                        ) : article.description ? (
                            <div
                                className="whitespace-pre-wrap space-y-4 text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: article.description }}
                            />
                        ) : (
                            <p className="italic text-muted-foreground">Aucun contenu disponible pour cet article.</p>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <ExternalLink className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground uppercase tracking-wider">Source Originale</p>
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline transition-colors text-sm break-all"
                                >
                                    Consulter sur WowHead
                                </a>
                            </div>
                        </div>

                        <Button size="lg" asChild>
                            <Link href="/">
                                Retour à la Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </article>
        </div>
    );
}
