import { article } from "@/types/article.types";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
    article: article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const formattedDate = new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const getBadgeVariant = (category: string) => {
        switch (category) {
            case 'Classic':
                return "warning"; // We might need to define this or use custom colors
            case 'Retail':
                return "default";
            default:
                return "secondary";
        }
    };

    return (
        <Link href={`/articles/${article.id}`} className="block h-full">
            <Card className="overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
                {article.image && (
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                <CardHeader className="p-5 pb-2">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={article.category === 'Classic' ? 'outline' : 'default'}
                            className={article.category === 'Classic' ? 'border-amber-500 text-amber-500' : ''}
                        >
                            {article.category || 'Blizzard'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 flex-1">
                    <h2 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                    </h2>
                    {article.description && (
                        <p className="text-muted-foreground text-sm line-clamp-3">
                            {article.description}
                        </p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
