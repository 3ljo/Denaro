import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-neutral-600">
          The link is invalid, expired, or already used.
        </p>
        {reason && (
          <p className="text-xs text-neutral-500">Details: {reason}</p>
        )}
        <div className="space-y-2 pt-2">
          <Link
            href="/login"
            className="block text-sm font-medium text-neutral-900 hover:underline"
          >
            Back to sign in
          </Link>
          <Link
            href="/forgot-password"
            className="block text-sm text-neutral-600 hover:text-neutral-900"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    </main>
  )
}
