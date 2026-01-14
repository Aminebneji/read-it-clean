import { article } from "@/types/article.types";
import Image from "next/image";
import Link from "next/link";
import { Pin, ChevronLeft } from "./Icons";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PinnedSidebarProps {
    articles: article[];
}

export default function PinnedSidebar({ articles }: PinnedSidebarProps) {
    if (articles.length === 0) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="fixed mr-5 right-0 top-1/4 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-6 rounded-l-lg shadow-lg hover:bg-primary/90 transition-all z-40 flex items-center gap-2"
                >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="text-sm font-medium whitespace-nowrap">
                        Épinglés
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent hideClose className="w-80 sm:w-96 overflow-y-auto bg-card border-l border-border">
                <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center gap-2 text-foreground">
                        <Pin className="w-5 h-5 text-primary" />
                        Articles Épinglés
                    </SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                    {articles.map((article) => (
                        <Link
                            key={article.id}
                            href={`/articles/${article.id}`}
                            className="block group"
                        >
                            <Card className="overflow-hidden border-border bg-card/50 hover:bg-accent transition-colors">
                                {article.image && (
                                    <div className="relative bottom-6 w-full h-52 bg-muted">
                                        <Image
                                            src={article.image}
                                            alt={article.title}
                                            fill
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                )}
                                <CardContent className="p-3">
                                    <h3 className="font-semibold text-sm text-card-foreground group-hover:text-primary line-clamp-2 transition-colors">
                                        {article.title}
                                    </h3>
                                    <span className="text-xs text-muted-foreground mt-1 block">
                                        {new Date(article.pubDate || article.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}
