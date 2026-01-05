import { getServerSession } from "next-auth"
import { authOptions } from "@/config/auth.config"
import { redirect } from "next/navigation"
import ArticleManager from "./ArticleManager"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Welcome, {session.user?.name}!</p>
            <p className="mt-2 text-gray-600 mb-8">You are logged in as an Admin.</p>

            <ArticleManager />
        </div>
    )
}
