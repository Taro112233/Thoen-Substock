// app/auth/login/page.tsx
import { Suspense } from "react";
import LoginForm from "@/app/auth/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ระบบจัดการสต็อกยา",
  description: "เข้าสู่ระบบจัดการสต็อกยาโรงพยาบาล",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardContent className="p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        {/* Form Fields Skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Checkbox Skeleton */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          {/* Submit Button Skeleton */}
          <Skeleton className="h-11 w-full" />
          
          {/* Links Skeleton */}
          <div className="text-center space-y-2">
            <Skeleton className="h-4 w-40 mx-auto" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}