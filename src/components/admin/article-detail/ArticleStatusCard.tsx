import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle as CheckCircle2 } from "@/components/Icons";

interface ArticleStatusCardProps {
    published: boolean;
    isGenerated: boolean;
}

export default function ArticleStatusCard({ published, isGenerated }: ArticleStatusCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span>Publication</span>
                    </div>
                    <Badge variant={published ? "default" : "outline"}>
                        {published ? "Publié" : "Brouillon"}
                    </Badge>
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <span>IA</span>
                    </div>
                    <Badge variant={isGenerated ? "default" : "outline"}>
                        {isGenerated ? "Généré" : "En attente"}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
