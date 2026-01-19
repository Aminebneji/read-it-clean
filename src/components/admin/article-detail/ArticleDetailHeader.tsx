import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2 } from "@/components/Icons";
import Link from "next/link";

interface ArticleDetailHeaderProps {
    title: string;
    published: boolean;
    onTogglePublish: () => void;
    onDelete: () => void;
}

export default function ArticleDetailHeader({
    title,
    published,
    onTogglePublish,
    onDelete
}: ArticleDetailHeaderProps) {
    return (
        <header className="border-b border-border bg-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                            <ChevronLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    </Button>
                    <div className="h-4 w-[1px] bg-border hidden sm:block"></div>
                    <h1 className="text-lg font-bold truncate max-w-[200px] md:max-w-md">
                        {title}
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={published ? "secondary" : "default"}
                        size="sm"
                        onClick={onTogglePublish}
                    >
                        {published ? 'Dépublier' : 'Publier'}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
