'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { TaskLayout } from '@/components/TaskLayout';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to the login page.
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  // If authenticated, show the main application layout.
  // Otherwise, show a loading/blank screen while redirecting.
  if (!isAuthenticated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        {/* Optional: Add a loading spinner here */}
      </div>
    );
  }

  return <TaskLayout />;
} 