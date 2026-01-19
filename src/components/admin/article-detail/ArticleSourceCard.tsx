import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "@/components/Icons";

interface ArticleSourceCardProps {
    description: string | null;
    link: string;
}

export default function ArticleSourceCard({ description, link }: ArticleSourceCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-xs">Description RSS</Label>
                    <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md line-clamp-6">
                        {description || "Aucune description source."}
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-2" />
                        Lien d&apos;origine (Wowhead)
                    </a>
                </Button>
            </CardContent>
        </Card>
    );
}
