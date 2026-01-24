import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen p-6 text-white">
      <div className="max-w-5xl mx-auto">
        <Link href="/analyze" className="text-sm text-white/60 hover:text-white underline">
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-semibold mt-4">Demo Video 🎥</h1>
        <p className="text-white/60 mt-2">
          Here is the full working demo of Business Gap Finder.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="aspect-video w-full">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/f5KH6M4pmTs"
              title="Business Gap Finder Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-4">
          <a
            href="https://youtu.be/f5KH6M4pmTs"
            target="_blank"
            rel="noreferrer"
            className="inline-block px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition"
          >
            Open on YouTube ↗
          </a>
        </div>
      </div>
    </main>
  );
}
