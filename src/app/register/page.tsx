'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { RainEffect } from '@/components/RainEffect';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { register } = useAuthStore();
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Şifreler uyuşmuyor!');
      return;
    }
    const result = register({ email, firstName, lastName });
    if (result.success) {
      router.push('/'); // Redirect to main app on successful registration
    } else {
      alert(result.message);
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
            <div className="flex gap-4">
              <div className="space-y-2 w-1/2">
                <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                  İsim
                </label>
                <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2 w-1/2">
                <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                  Soyisim
                </label>
                <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
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
              />
            </div>
            <Button type="submit" className="w-full">
              Kayıt Ol
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