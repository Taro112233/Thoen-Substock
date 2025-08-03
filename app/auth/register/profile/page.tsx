// app/auth/register/profile/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ProfileForm from "@/app/auth/components/ProfileForm";
import { getCurrentUser } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  // ตรวจสอบว่า user login แล้วหรือไม่
  if (!user) {
    redirect("/auth/login");
  }
  
  // ถ้าข้อมูลครบแล้ว redirect ไปตามสถานะ
  if (user.isProfileComplete) {
    if (user.status === "PENDING") {
      redirect("/auth/pending-approval");
    } else if (user.status === "ACTIVE") {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg">
        <Suspense fallback={<ProfileFormSkeleton />}>
          <ProfileForm />
        </Suspense>
      </div>
    </div>
  );
}

function ProfileFormSkeleton() {
  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}