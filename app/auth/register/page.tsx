// app/auth/register/page.tsx
import { Suspense } from "react";
import RegisterForm from "@/app/auth/components/RegisterForm";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิก | ระบบจัดการสต็อกยา",
  description: "สมัครสมาชิกเพื่อเข้าใช้งานระบบจัดการสต็อกยาโรงพยาบาล",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<RegisterFormSkeleton />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

function RegisterFormSkeleton() {
  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardContent className="p-8 space-y-6">
        {/* Header Skeleton */}
        <div className="text-center space-y-2">
          <Skeleton className="h-16 w-16 mx-auto rounded-full" />
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        {/* Form Fields Skeleton */}
        <div className="space-y-5">
          {/* Hospital Selection Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Username Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Email Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Password Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Confirm Password Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Submit Button Skeleton */}
          <div className="pt-2">
            <Skeleton className="h-11 w-full" />
          </div>
          
          {/* Login Link Skeleton */}
          <div className="text-center pt-4">
            <Skeleton className="h-4 w-40 mx-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}