'use client';

import { Suspense } from 'react';
import NewRunPageInner from './NewRunPageInner';

export default function NewRunPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-base flex items-center justify-center"><p className="text-text-muted text-sm">Loading…</p></div>}>
      <NewRunPageInner />
    </Suspense>
  );
}
