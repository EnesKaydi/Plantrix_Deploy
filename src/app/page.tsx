'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TaskLayout } from '@/components/TaskLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'; // Assuming you have a spinner

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  return <TaskLayout />;
} 