import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware() {
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { nextUrl } = req;

                // Routes publiques (lecture seule)
                if (req.method === "GET" && (
                    nextUrl.pathname.startsWith("/api/articles") &&
                    !nextUrl.pathname.startsWith("/api/admin")
                )) {
                    return true;
                }

                // Routes Admin (requièrent le rôle ADMIN)
                return token?.role === "ADMIN";
            },
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/api/:path*"],
};
