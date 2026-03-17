'use client';

import { LandingPage } from '@/components/landing/LandingPage';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/setup');
  };

  return <LandingPage onStart={handleStart} />;
}