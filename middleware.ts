import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const response = NextResponse.next();
        const { nextUrl } = req;

        // Force HTTPS in production
        if (process.env.NODE_ENV === "production" && nextUrl.protocol === "http:") {
            return NextResponse.redirect(
                `https://${nextUrl.host}${nextUrl.pathname}${nextUrl.search}`,
                301
            );
        }

        // ajout de headers de sécurité
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        response.headers.set(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
        );
        response.headers.set(
            "Strict-Transport-Security",
            "max-age=31536000; includeSubDomains"
        );

        return response;
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
