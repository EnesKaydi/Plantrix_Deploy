'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { RainEffect } from '@/components/RainEffect';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, quickLogin } = useAuthStore();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      router.push('/');
    } else {
      alert(result.message);
    }
  };

  const handleQuickLogin = () => {
    quickLogin();
    router.push('/');
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel: Image */}
      <div className="hidden lg:block lg:w-2/3 auth-image-panel" />

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/3 flex items-center justify-center p-8 bg-background relative overflow-hidden">
        <RainEffect />
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold plantrix-title w-fit mx-auto">PLANTRİX</h1>
            <p className="mt-2 text-muted-foreground">Hesabınıza giriş yapın</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta
              </label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@plantrix.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Şifre
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Giriş Yap
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Veya
              </span>
            </div>
          </div>
          <Button variant="secondary" className="w-full" onClick={handleQuickLogin}>
            Hızlı Giriş (Geliştirici)
          </Button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Kayıt Olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 