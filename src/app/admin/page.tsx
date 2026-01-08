import { getServerSession } from "next-auth"
import { authOptions } from "@/config/auth.config"
import { redirect } from "next/navigation"
import ArticleManager from "./ArticleManager"
import LogoutButton from "@/components/admin/LogoutButton"

export default async function AdminPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <LogoutButton />
            </div>
            <p>Welcome, {session.user?.name}!</p>
            <p className="mt-2 text-gray-600 mb-8">You are logged in as an Admin.</p>

            <ArticleManager />
        </div>
    )
}
