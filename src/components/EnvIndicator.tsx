'use client';

import { useEffect, useState } from 'react';

export default function EnvIndicator() {
  const [env, setEnv] = useState<{
    appEnv: string;
    supabaseProject: string;
    isProduction: boolean;
  } | null>(null);

  useEffect(() => {
    // Read from window location and any exposed env vars
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown';

    setEnv({
      appEnv,
      supabaseProject: projectId,
      isProduction: appEnv === 'production',
    });
  }, []);

  // Only show in non-production
  if (!env || env.isProduction) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-yellow-500 text-black text-xs font-bold rounded-lg shadow-lg border-2 border-yellow-600 flex items-center gap-2">
      <span className="inline-block w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
      <span>{env.appEnv.toUpperCase()}</span>
      <span className="opacity-50">•</span>
      <span className="opacity-75">{env.supabaseProject}</span>
    </div>
  );
}
