import Link from "next/link"

export default function DataPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-2xl rounded-3xl border border-muted-foreground/10 bg-white/90 p-10 shadow-2xl">
        <h1 className="text-4xl font-black mb-6">Data Page</h1>
        <p className="text-base text-muted-foreground mb-6">
          This route was missing in the app, which caused the 404 error for <code className="rounded bg-slate-100 px-2 py-1">/data</code>.
        </p>
        <p className="text-base text-muted-foreground mb-8">
          You can safely return to the homepage or continue using the application from the navigation menu.
        </p>
        <Link href="/" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90">
          Back to Home
        </Link>
      </div>
    </main>
  )
}
