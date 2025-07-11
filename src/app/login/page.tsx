'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { RainEffect } from '@/components/RainEffect';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { quickLogin } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Giriş bilgileri hatalı veya kullanıcı bulunamadı.');
        setIsLoading(false);
        return;
      }

      router.push('/');
      router.refresh(); // Sunucu tarafındaki veriyi yenilemek için
    } catch (err) {
      setError('Giriş sırasında beklenmedik bir hata oluştu.');
      setIsLoading(false);
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
          <div className="text-center mt-4">
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