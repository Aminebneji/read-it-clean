import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
    category: string;
    sort: string;
    search: string;
    onCategoryChange: (category: string) => void;
    onSortChange: (sort: string) => void;
    onSearchChange: (search: string) => void;
}

export default function FilterBar({
    category,
    sort,
    search,
    onCategoryChange,
    onSortChange,
    onSearchChange,
}: FilterBarProps) {
    return (
        <div className="bg-card border-b border-border sticky top-14 z-40 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="w-full md:w-96">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                type="text"
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Rechercher un article..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Category Filter */}
                        <div className="flex gap-2">
                            {['All', 'Classic', 'Retail'].map((cat) => (
                                <Button
                                    key={cat}
                                    variant={(cat === 'All' && !category) || category === cat ? "default" : "secondary"}
                                    size="sm"
                                    onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
                                    className="font-medium"
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>

                        {/* Sort Filter */}
                        <Select value={sort} onValueChange={onSortChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trier par" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">Plus récent</SelectItem>
                                <SelectItem value="asc">Plus ancien</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    );
}
