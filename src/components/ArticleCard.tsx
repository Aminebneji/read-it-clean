import { article } from "@/types/article.types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/utils/sanitize.utils";

interface ArticleCardProps {
    article: article;
    index?: number;
}

export default function ArticleCard({ article, index = 0 }: ArticleCardProps) {
    const formattedDate = new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    // Determine card size 
    const isLarge = index % 5 === 0;

    return (
        <div
            className={cn(
                "h-full animate-fade-in-up hover-lift",
                isLarge ? "md:col-span-2 md:row-span-1" : "col-span-1"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Link href={`/articles/${article.id}`} className="block h-full group pt-20 pl-8">

                <Card className="relative overflow-visible border-none bg-card/60 backdrop-blur-sm hover:bg-card/90 transition-all duration-500 h-full flex flex-col shadow-sm group-hover:shadow-2xl rounded-[2rem]">
                    {article.image && (
                        <div
                            className="absolute -top-16 -left-8 w-44 h-72 md:w-52 md:h-80 z-10 shadow-2xl rounded-3xl overflow-hidden border-2 border-background pointer-events-none"
                            style={{
                                maskImage: 'var(--image-mask)',
                                WebkitMaskImage: 'var(--image-mask)'
                            }}
                        >
                            <Image
                                src={article.image}
                                alt={article.title}
                                fill
                                className="object-cover dark:blur-[0.5px] transition-transform duration-700 ease-out group-hover:scale-110"
                            />
                            {/* soft sur les bords - adouci en light mode */}
                            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card/40 via-card/10 to-transparent dark:from-card/80 dark:via-card/20 dark:to-transparent z-20" />
                        </div>
                    )}

                    <CardHeader className={`p-8 ${article.image ? 'pl-40 md:pl-52' : ''} pb-2 relative z-20`}>
                        <div className={`flex ${isLarge ? 'items-center gap-3' : 'flex-col gap-1.5'}`}>
                            <Badge
                                variant="outline"
                                className={`text-[10px] uppercase tracking-[0.1em] font-bold border-none px-2.5 py-1 w-fit ${article.category === 'Classic'
                                    ? 'text-amber-500 bg-amber-500/10'
                                    : 'text-blue-500 bg-blue-500/10'
                                    }`}
                            >
                                {article.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">{formattedDate}</span>
                        </div>
                    </CardHeader>

                    <CardContent className={`p-8 ${article.image ? 'pt-8 md:pt-14' : 'pt-0'} flex-1 flex flex-col relative z-20`}>
                        <h2 className={`font-black text-card-foreground mb-6 group-hover:text-primary transition-colors leading-tight ${isLarge ? 'text-3xl md:text-5xl' : 'text-xl md:text-3xl'}`}>
                            {article.title}
                        </h2>
                        {article.description && (
                            <div
                                className="text-muted-foreground/70 text-sm md:text-base line-clamp-3 font-medium leading-relaxed mb-6 prose dark:prose-invert prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.description) }}
                                suppressHydrationWarning
                            />
                        )}

                        <div className="mt-auto flex items-center justify-between">
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary/60 group-hover:text-primary transition-all">
                                Lire l&apos;article complet →
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}

