import { getArticleById } from "@/services/article.service";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navigation Header */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
                    >
                        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                        </svg>
                        <span className="font-medium">Retour à l'accueil</span>
                    </Link>
                    <div className="hidden sm:block text-sm font-semibold text-gray-400 uppercase tracking-wider">
                        Lecture Article
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
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-red-600 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold opacity-20 uppercase tracking-tighter">Read It Clean</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-xs font-bold px-3 py-1.2 rounded-full border uppercase tracking-wider ${getCategoryColor(article.category || 'Blizzard')}`}>
                                {article.category || 'Blizzard'}
                            </span>
                            <span className="text-white/80 text-sm font-medium">{formattedDate}</span>
                        </div>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                            {article.title}
                        </h1>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                        {article.generatedText ? (
                            <div
                                className="whitespace-pre-wrap space-y-4 text-lg md:text-xl font-medium antialiased"
                                dangerouslySetInnerHTML={{ __html: article.generatedText.replace(/\n\n/g, '<br /><br />') }}
                            />
                        ) : article.description ? (
                            <div
                                className="whitespace-pre-wrap space-y-4"
                                dangerouslySetInnerHTML={{ __html: article.description }}
                            />
                        ) : (
                            <p className="italic text-gray-400">Aucun contenu disponible pour cet article.</p>
                        )}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 1111.445 7.832l-1.555 4.444-1.89-5.11z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">Source Originale</p>
                                <a
                                    href={article.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 transition-colors text-sm break-all"
                                >
                                    Consulter sur WowHead
                                </a>
                            </div>
                        </div>

                        <Link
                            href="/"
                            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-md active:scale-95"
                        >
                            Retour à la Home
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
