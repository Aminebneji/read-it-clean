import { getServerSession } from "next-auth"
import { authOptions } from "@/config/auth.config"
import { redirect } from "next/navigation"
import ArticleManager from "./ArticleManager"
import LogoutButton from "@/components/admin/LogoutButton"
import { ModeToggle } from "@/components/mode-toggle"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Dashboard Admin</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground mr-2">
                            {session.user?.name}
                        </span>
                        <ModeToggle />
                        <LogoutButton />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ArticleManager />
            </main>
        </div>
    )
}
