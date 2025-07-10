'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RainEffect } from '@/components/RainEffect';
import axios from 'axios'; // axios'u import ediyoruz

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // İsim ve Soyisimi birleştirdik
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Şifreler uyuşmuyor!');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post('/api/auth/register', {
        email,
        name,
        password,
      });
      router.push('/login'); // Kayıt başarılıysa login sayfasına yönlendir
    } catch (err: any) {
      setError(err.response?.data || 'Kayıt sırasında bir hata oluştu.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
            <p className="mt-2 text-muted-foreground">Yeni bir hesap oluşturun</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                İsim Soyisim
              </label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
            </div>
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
            <div className="space-y-2">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-foreground"
              >
                Şifreyi Onayla
              </label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </Button>
          </form>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Zaten bir hesabınız var mı?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Giriş Yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 