// app/dashboard/components/LogoutButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButtonClient() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout} 
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <LogOut className="h-4 w-4 mr-1" />
      ออกจากระบบ
    </Button>  
  );
}