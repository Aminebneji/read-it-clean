"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    return (
        <Button
            variant="destructive"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="gap-2"
        >
            <LogOut className="w-4 h-4" />
            Déconnexion
        </Button>
    );
}
