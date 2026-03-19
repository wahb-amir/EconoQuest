/**
 * src/app/setup/page.tsx
 * ──────────────────────
 * Route: /setup
 *
 * Full-page nation selection screen.
 * When a country is chosen, saves it to sessionStorage
 * then pushes to /game.
 */
'use client';

import { useRouter } from 'next/navigation';
import { CountryTemplate } from '@/lib/simulation-engine';
import { CountrySelector } from '@/components/game/CountrySelector';
import { AppShell } from '@/components/appShell';

export default function SetupPage() {
  const router = useRouter();

  const handleSelect = (country: CountryTemplate) => {
    sessionStorage.setItem('eq_country', JSON.stringify(country));
    router.push('/game');
  };

  return (
    <AppShell
      navRight={
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: '1px solid rgba(28,20,9,.22)',
            color: 'rgba(28,20,9,.52)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      }
      step="Step 1 of 1 — Choose Nation"
    >
      <CountrySelector onSelect={handleSelect} />
    </AppShell>
  );
}