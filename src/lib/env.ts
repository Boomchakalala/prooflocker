/**
 * Environment detection and safety guards
 */

export const ENV = {
  isProduction: process.env.APP_ENV === 'production',
  isDevelopment: process.env.APP_ENV === 'development',
  appEnv: process.env.APP_ENV || 'development',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

/**
 * Guard function: throws error if action attempted in production
 *
 * Usage:
 * ```
 * guardProduction('database reset');
 * // This line will throw if APP_ENV=production
 * ```
 */
export function guardProduction(action: string): void {
  if (ENV.isProduction) {
    throw new Error(
      `🚨 BLOCKED: "${action}" is not allowed in production environment. ` +
      `Current APP_ENV: ${ENV.appEnv}`
    );
  }
}

/**
 * Console log with environment context
 */
export function logWithEnv(message: string, ...args: any[]): void {
  const prefix = ENV.isProduction ? '🔴 PROD' : '🟢 DEV';
  console.log(`[${prefix}] ${message}`, ...args);
}

/**
 * Warn if potentially destructive action
 */
export function warnDestructive(action: string): void {
  if (ENV.isProduction) {
    console.warn(
      `⚠️  PRODUCTION WARNING: About to perform "${action}". ` +
      `Ensure this is intentional.`
    );
  }
}
