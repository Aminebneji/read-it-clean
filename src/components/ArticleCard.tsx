import { article } from "@/types/article.types";
import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
    article: article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
    const formattedDate = new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Classic':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'Retail':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Link href={`/articles/${article.id}`}>
            <article className="group cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {article.image && (
                    <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                        <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(article.category || 'Blizzard')}`}>
                            {article.category || 'Blizzard'}
                        </span>
                        <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {article.title}
                    </h2>
                    {article.description && (
                        <p className="text-gray-600 text-sm line-clamp-3 flex-1">
                            {article.description}
                        </p>
                    )}
                </div>
            </article>
        </Link>
    );
}
