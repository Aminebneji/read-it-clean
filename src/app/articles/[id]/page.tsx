import { getArticleById, getSimilarArticles } from "@/services/article.service";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "@/components/Icons";
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
    } catch {
        notFound();
    }

    const formattedDate = new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const similarArticles = await getSimilarArticles(article.id, article.category, article.title);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
            <nav className="fixed top-0 left-0 right-0 z-[60] py-4 bg-background/0 backdrop-blur-none transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 transition-transform group-hover:scale-110">
                            <Image
                                src="/RICLOGO.png"
                                alt="Read It Clean Logo"
                                fill
                                className="rounded-full opacity-90 dark:opacity-80 drop-shadow-2xl saturate-[1.2] brightness-[0.9] dark:brightness-100 dark:saturate-100 object-contain"
                                priority
                            />
                        </div>
                    </Link>
                    <ModeToggle />
                </div>
            </nav>

            <section className="relative h-[60vh] md:h-[75vh] w-full overflow-hidden">
                {article.image ? (
                    <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-primary/10 text-9xl font-black uppercase tracking-tighter select-none">Read It Clean</span>
                    </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                <div className="absolute inset-0 bg-black/20 z-0" />

                <div className="absolute inset-0 z-20 flex flex-col justify-end pb-32 md:pb-48 px-4">
                    <div className="max-w-4xl mx-auto w-full text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                            <Badge
                                variant="outline"
                                className={`text-[10px] md:text-xs uppercase tracking-[0.2em] font-black border-none px-4 py-1.5 ${article.category === 'Classic'
                                    ? 'text-amber-500 bg-amber-500/20'
                                    : 'text-blue-500 bg-blue-500/20'
                                    }`}
                            >
                                {article.category}
                            </Badge>
                            <span className="text-foreground/60 text-xs font-bold uppercase tracking-widest">{formattedDate}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight drop-shadow-2xl">
                            {article.title}
                        </h1>
                    </div>
                </div>
            </section>

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 sm:px-6 -mt-4 md:-mt-3 relative z-30">
                <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-border/50 p-8 md:p-16 transition-all duration-500 hover:bg-card/90">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {article.generatedText ? (
                            <div
                                className="prose prose-xl md:prose-2xl dark:prose-invert max-w-none antialiased text-foreground/90 leading-relaxed font-serif prose-headings:font-sans prose-headings:font-black prose-img:rounded-2xl prose-img:shadow-xl prose-a:text-primary"
                                dangerouslySetInnerHTML={{ __html: article.generatedText }}
                            />
                        ) : article.description ? (
                            <div
                                className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: article.description }}
                            />
                        ) : (
                            <p className="italic text-muted-foreground text-center py-20 grayscale opacity-50">Aucun contenu disponible pour cet article.</p>
                        )}
                    </div>

                    <div className="mt-20 pt-12 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6 group">
                            <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                                <ExternalLink className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Source Originale</p>
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:text-primary/80 transition-all font-bold text-lg border-b-2 border-primary/20 hover:border-primary"
                                >
                                    Lire sur WowHead
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Similar Articles */}
            {similarArticles.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                    <div className="flex flex-col items-center mb-12">
                        <Badge variant="outline" className="mb-4 text-[10px] uppercase tracking-[0.3em] font-black py-1.5 px-4 bg-primary/5 border-none">À lire ensuite</Badge>
                        <h2 className="text-3xl md:text-5xl font-black text-center leading-tight">Articles Similaires</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {similarArticles.map((item) => (
                            <Link key={item.id} href={`/articles/${item.id}`} className="group flex flex-col h-full bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/40 overflow-hidden hover:bg-card/60 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                                <div className="relative h-48 w-full overflow-hidden">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-primary/5" />
                                    )}
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <Badge variant="outline" className={`text-[9px] uppercase tracking-widest font-black border-none px-2 py-0.5 w-fit mb-4 ${item.category === 'Classic' ? 'text-amber-500 bg-amber-500/10' : 'text-blue-500 bg-blue-500/10'}`}>
                                        {item.category}
                                    </Badge>
                                    <h3 className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="mt-auto pt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Lire l&apos;article →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}


