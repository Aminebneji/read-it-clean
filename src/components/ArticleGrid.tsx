import { article } from "@/types/article.types";
import ArticleCard from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "./Icons";

interface ArticleGridProps {
    articles: article[];
    loading?: boolean;
}

export default function ArticleGrid({ articles, loading }: ArticleGridProps) {
    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (articles.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <Newspaper className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">Essayez de modifier vos filtres de recherche</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                    <ArticleCard key={article.id} article={article} index={index} />
                ))}
            </div>
        </div>
    );
}
