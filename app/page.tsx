import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gray-900 text-white font-bold">
              B
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">
                Business Gap Finder
              </p>
              <p className="text-xs text-gray-500 leading-none mt-1">
                Find underserved business opportunities
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/demo"
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              View Demo
            </Link>
            <Link
              href="/analyze"
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Start Analysis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
              ⚡ Powered by OpenStreetMap + smart gap scoring
            </p>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              Discover what businesses your area is missing.
            </h1>

            <p className="mt-4 text-base text-gray-600 md:text-lg">
              Enter any location, scan nearby categories, and get data-driven
              suggestions for business opportunities with a confidence score.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/analyze"
                className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Start Analysis →
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                View Demo
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Step 1</p>
                <p className="mt-1 text-sm font-semibold">Choose Location</p>
                <p className="mt-1 text-xs text-gray-600">
                  Any city / locality / area name
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Step 2</p>
                <p className="mt-1 text-sm font-semibold">Scan Categories</p>
                <p className="mt-1 text-xs text-gray-600">
                  Restaurants, gyms, clinics, etc.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <p className="text-xs text-gray-500">Step 3</p>
                <p className="mt-1 text-sm font-semibold">Get Suggestions</p>
                <p className="mt-1 text-xs text-gray-600">
                  Gap score + reasoning
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6 shadow-sm">
            <p className="text-sm font-semibold">Example Preview</p>
            <p className="mt-1 text-sm text-gray-600">
              Here’s how results look after analysis:
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pharmacy</p>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    92/100
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  High demand + low supply → strong opportunity to start.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Gym / Fitness Center</p>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    76/100
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Moderate gap → could work with good differentiation.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Cafe</p>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    48/100
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-600">
                  Small gap → only worth it if you have a unique angle.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-4">
              <p className="text-xs text-gray-500">Note</p>
              <p className="mt-1 text-sm text-gray-700">
                This is a prototype UI — next we’ll add agentic decisions,
                simulations and approval checkpoints for your hackathon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Business Gap Finder</p>
          <p>Built for hackathon • Clean UI inspired by Google/Meta</p>
        </div>
      </footer>
    </main>
  );
}
