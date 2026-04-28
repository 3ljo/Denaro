import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8 safe-top safe-bottom">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-neutral-600">
          The link is invalid, expired, or already used.
        </p>
        {reason && (
          <p className="break-words text-xs text-neutral-500">Details: {reason}</p>
        )}
        <div className="space-y-1 pt-2">
          <Link
            href="/login"
            className="block py-2 text-sm font-medium text-neutral-900 hover:underline"
          >
            Back to sign in
          </Link>
          <Link
            href="/forgot-password"
            className="block py-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    </main>
  )
}
