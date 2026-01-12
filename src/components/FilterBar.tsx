"use client";

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
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="w-full md:w-96">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => onSearchChange(event.target.value)}
                                placeholder="Rechercher un article..."
                                className="w-full px-4 py-2 pl-10 pr-4 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Category Filter */}
                        <div className="flex gap-2">
                            {['All', 'Classic', 'Retail'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => onCategoryChange(cat === 'All' ? '' : cat)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${(cat === 'All' && !category) || category === cat
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Sort Filter */}
                        <select
                            value={sort}
                            onChange={(event) => onSortChange(event.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white cursor-pointer font-medium text-sm"
                        >
                            <option value="desc">Plus récent</option>
                            <option value="asc">Plus ancien</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
