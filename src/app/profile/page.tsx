'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir automáticamente a la nueva ubicación del Perfil
    router.replace('/dashboard/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Redirigiendo al Perfil...</p>
      </div>
    </div>
  );
}
