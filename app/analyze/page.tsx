"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Recommendation = { name: string; reason: string; score: number };

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; text: string };

function clamp100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function formatRadius(r: number) {
  if (r === 500) return "0.5 km";
  if (r === 1000) return "1 km";
  if (r === 2000) return "2 km";
  if (r === 3000) return "3 km";
  return `${r}m`;
}

export default function AnalyzePage() {
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(1000);

  const [placesCount, setPlacesCount] = useState<number | null>(null);
  const [topCategories, setTopCategories] = useState<[string, number][]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [logistics, setLogistics] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  // ---------------- DUMMY CHATBOT ----------------
  const [chatOpen, setChatOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        "Hey sree 👋\n\nAsk me:\n• Gym vs Cafe\n• Restaurant vs Cafe\n• Compare location A vs location B\n• Best business here",
    },
  ]);

  const densityLabel = useMemo(() => {
    if (placesCount === null) return "—";
    if (placesCount < 120) return "Low";
    if (placesCount < 350) return "Medium";
    return "High";
  }, [placesCount]);

  const topOpportunity = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return null;
    return recommendations[0];
  }, [recommendations]);

  // --------- Trends Data ---------
  const categoryChartData = useMemo(() => {
    if (!topCategories || topCategories.length === 0) return [];
    return topCategories.map(([name, count]) => ({
      name: name.replaceAll("_", " "),
      count,
    }));
  }, [topCategories]);

  const opportunityChartData = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return [];
    return recommendations.map((r) => ({
      name: r.name,
      score: r.score,
    }));
  }, [recommendations]);

  // ---------------- Dummy bot reply rules ----------------
  const getBotReply = (question: string) => {
    const q = question.toLowerCase();

    // Compare Location A vs Location B
    if (q.includes("compare") && q.includes("location")) {
      return `
📍 Location Comparison (Demo)

Location A:
• Higher business density
• Better transport access
• More competition

Location B:
• Lower competition
• Higher business gap
• Better chance for new business

Final: Location B is better for launching a new business.
`;
    }

    // Gym vs Cafe
    if (q.includes("gym") && q.includes("cafe")) {
      return `
🏋️ Gym vs ☕ Cafe

Gym:
• High gap score
• Low supply → strong opportunity
• Works well in medium/high density areas

Cafe:
• Moderate competition
• Needs strong branding & differentiation
• Faster initial cashflow

Final: Gym is the safer long-term opportunity here.
`;
    }

    // Restaurant vs Cafe
    if (q.includes("restaurant") && q.includes("cafe")) {
      return `
🍽️ Restaurant vs ☕ Cafe

Restaurant:
• Usually high competition
• Higher operational complexity

Cafe:
• Easier to start
• More branding-based opportunity

Final: Cafe is the better option in this area.
`;
    }

    // Best business here
    if (
      q.includes("best business") ||
      q.includes("best opportunity") ||
      q.includes("what should i start") ||
      q.includes("what business should i start")
    ) {
      const best = recommendations?.[0]?.name;
      const score = recommendations?.[0]?.score;

      if (best) {
        return `
✅ Best Business Recommendation (Based on Scan)

Top opportunity: ${best}
Gap Score: ${score}/100

Final: Start "${best}" in this area.
`;
      }

      return `
✅ Best Business Recommendation

Run analysis first, then I can recommend the best business based on gap score.
`;
    }

    // Generic area question
    if (q.includes("is this area good")) {
      return `
📊 Area Insight (Demo)

• Road connectivity: decent
• Business density: ${densityLabel}
• Opportunity depends on low-supply categories

Final: Area is suitable for small to mid-scale businesses.
`;
    }

    // Fallback
    return `
🤖 I can answer only supported comparisons.

Try:
• Gym vs Cafe
• Restaurant vs Cafe
• Compare location A vs location B
• Best business here
`;
  };

  const sendChat = async () => {
  const msg = chatInput.trim();
  if (!msg) return;

  setChatInput("");

  const userMessage: ChatMessage = { role: "user", text: msg };

  // 1) rule-based reply first
  const ruleReply = getBotReply(msg);

  // If ruleReply is fallback message → call LLM
  const isFallback =
    ruleReply.includes("I can help only with comparisons") ||
    ruleReply.includes("Try asking:");

  setChatMessages((prev) => [...prev, userMessage]);

  if (!isFallback) {
    setChatMessages((prev) => [...prev, { role: "assistant", text: ruleReply }]);
    return;
  }

  // 2) LLM reply
  setChatMessages((prev) => [
    ...prev,
    { role: "assistant", text: "Thinking..." },
  ]);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });

    const data = await res.json();

    setChatMessages((prev) => {
      // remove last "Thinking..."
      const updated = [...prev];
      updated.pop();
      return [...updated, { role: "assistant", text: data.reply || "No reply" }];
    });
  } catch (e) {
    setChatMessages((prev) => {
      const updated = [...prev];
      updated.pop();
      return [
        ...updated,
        {
          role: "assistant",
          text: "⚠️ LLM failed. Try again later.",
        },
      ];
    });
  }
};

  // ---------------- Main Analysis ----------------
  const handleAnalyze = async () => {
    try {
      setLoading(true);

      setPlacesCount(null);
      setTopCategories([]);
      setRecommendations([]);
      setPlaces([]);
      setLogistics(null);

      if (!location.trim()) {
        alert("Enter a location");
        return;
      }

      // 1) Geocode (your existing API route)
      const geoRes = await fetch(
        `/api/geocode?address=${encodeURIComponent(location)}`
      );

      if (!geoRes.ok) {
        const errText = await geoRes.text();
        console.log("Geocode error response:", errText);
        alert("Geocode failed. Check console.");
        return;
      }

      const geoData = await geoRes.json();

      if (!geoData.results || geoData.results.length === 0) {
        alert("Location not found");
        return;
      }

      const { lat, lng } = geoData.results[0].geometry.location;

      // 2) Logistics (optional)
      try {
        const logRes = await fetch(`/api/logistics?lat=${lat}&lng=${lng}`);
        if (logRes.ok) {
          const logData = await logRes.json();
          setLogistics(logData);
        }
      } catch {}

      // 3) Overpass Query
      const query =
        `[out:json][timeout:25];(` +
        `node(around:${radius},${lat},${lng})["amenity"];` +
        `node(around:${radius},${lat},${lng})["shop"];` +
        `);out body 1200;`;

      const servers = [
        "https://overpass-api.de/api/interpreter?data=",
        "https://overpass.kumi.systems/api/interpreter?data=",
      ];

      let overpassData: any = null;

      for (const base of servers) {
        try {
          const res = await fetch(base + encodeURIComponent(query));
          if (!res.ok) continue;
          overpassData = await res.json();
          break;
        } catch {}
      }

      if (!overpassData || !overpassData.elements) {
        throw new Error("Overpass failed");
      }

      const elements = overpassData.elements;
      setPlacesCount(elements.length);

      // 4) Count categories
      const counts: Record<string, number> = {};

      for (const el of elements) {
        const tags = el.tags || {};
        const key =
          tags.amenity ||
          tags.shop ||
          tags.tourism ||
          tags.leisure ||
          "other";

        counts[key] = (counts[key] || 0) + 1;
      }

      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

      setTopCategories(sorted);

      // 5) Business Gap Suggestions
      const needList = [
        { key: "pharmacy", label: "Pharmacy", ideal: 8 },
        { key: "hospital", label: "Clinic / Hospital", ideal: 3 },
        { key: "cafe", label: "Cafe", ideal: 12 },
        { key: "restaurant", label: "Restaurant", ideal: 15 },
        { key: "fast_food", label: "Fast Food Outlet", ideal: 10 },
        { key: "gym", label: "Gym / Fitness Center", ideal: 4 },
        { key: "supermarket", label: "Supermarket", ideal: 6 },
        { key: "bank", label: "Bank / ATM", ideal: 6 },
        { key: "school", label: "Tuition / Coaching Center", ideal: 4 },
      ];

      const total = elements.length;
      const densityFactor = Math.max(0.6, Math.min(2.0, total / 500));

      const recs: Recommendation[] = needList.map((item) => {
        const existing = counts[item.key] || 0;
        const dynamicIdeal = Math.max(1, Math.round(item.ideal * densityFactor));
        const gap = Math.max(dynamicIdeal - existing, 0);
        const score = clamp100(Math.round((gap / dynamicIdeal) * 100));

        let reasonText = "";
        if (gap === 0) {
          reasonText = "Already well served in this area (high competition).";
        } else if (score >= 70) {
          reasonText = "High demand + low supply → strong opportunity to start.";
        } else if (score >= 40) {
          reasonText = "Moderate gap → could work with good differentiation.";
        } else {
          reasonText = "Small gap → only worth it if you have a unique angle.";
        }

        return {
          name: item.label,
          score,
          reason: `${reasonText} (Existing: ${existing})`,
        };
      });

      const topRecs = recs
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setRecommendations(topRecs);

      // sample raw elements
      setPlaces(elements.slice(0, 10));
    } catch (err) {
      console.error(err);
      alert("Something went wrong while analyzing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen text-white bg-transparent overflow-hidden">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-black opacity-100" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.06),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.05),transparent_45%)]" />

      <div className="relative flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-[260px] min-h-screen border-r border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="w-full p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center">
                ⚡
              </div>
              <div>
                <div className="font-semibold leading-tight">
                  Business Gap Finder
                </div>
                <div className="text-xs text-white/50">Command Center</div>
              </div>
            </div>

            <nav className="mt-6 space-y-2">
              <div className="px-3 py-2 rounded-xl bg-white/10 border border-white/10">
                <div className="text-sm font-medium">Command Center</div>
              </div>

              <Link
                href="/"
                className="block px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition"
              >
                ← Back to Home
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          {/* Top bar */}
          <div className="px-6 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-white/50">Mission Control</div>
                <h1 className="text-2xl md:text-3xl font-semibold mt-1">
                  Business Gap Dashboard
                </h1>
                <p className="text-sm text-white/50 mt-1">
                  Scan an area → detect underserved categories → recommend actions
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/"
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm"
                >
                  ← Home
                </Link>
              </div>
            </div>

            {/* KPI Row */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Places Scanned</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                    {loading ? "live" : "ready"}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {placesCount ?? "—"}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {radius}m radius
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Radius</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    config
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatRadius(radius)}
                </div>
                <div className="text-xs text-white/40 mt-1">search scope</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Area Density</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    heuristic
                  </span>
                </div>
                <div className="mt-2 text-2xl font-semibold">{densityLabel}</div>
                <div className="text-xs text-white/40 mt-1">
                  based on scanned places
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/50">Top Opportunity</div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                    {topOpportunity ? `${topOpportunity.score}/100` : "—"}
                  </span>
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {topOpportunity ? topOpportunity.name : "—"}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  highest gap score
                </div>
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="px-6 pb-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Trends */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Trends</div>
                    <div className="text-xs text-white/50 mt-1">
                      Live insights from scanned OSM data
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    Live
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="font-medium">Category Distribution</div>
                    <div className="text-xs text-white/50 mt-1">
                      Top 8 categories
                    </div>

                    <div className="mt-4 h-[220px]">
                      {categoryChartData.length === 0 ? (
                        <div className="h-full grid place-items-center text-sm text-white/40">
                          Run analysis to generate trends
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={categoryChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.15}
                            />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="font-medium">Opportunity Scores</div>
                    <div className="text-xs text-white/50 mt-1">
                      Top 5 business gaps
                    </div>

                    <div className="mt-4 h-[220px]">
                      {opportunityChartData.length === 0 ? (
                        <div className="h-full grid place-items-center text-sm text-white/40">
                          Run analysis to generate opportunities
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={opportunityChartData}>
                            <CartesianGrid
                              strokeDasharray="3 3"
                              opacity={0.15}
                            />
                            <XAxis dataKey="name" hide />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Business Gap Suggestions</div>
                    <div className="text-xs text-white/50 mt-1">
                      Top 5 underserved categories based on gap score
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    Top 5
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {recommendations.length === 0 ? (
                    <div className="text-sm text-white/40">
                      Run analysis to get recommendations
                    </div>
                  ) : (
                    recommendations.map((r) => (
                      <div
                        key={r.name}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-xs text-white/50 mt-1">
                              {r.reason}
                            </div>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                            {r.score}/100
                          </span>
                        </div>

                        <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400/70"
                            style={{ width: `${r.score}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Raw Results */}
              {places.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="font-semibold">Sample Raw Results</div>
                  <div className="text-xs text-white/50 mt-1">
                    Debug view (first 10 from Overpass)
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {places.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="text-xs text-white/50">
                          {p.tags?.amenity || p.tags?.shop || "unknown"}
                        </div>
                        <div className="text-sm mt-1 text-white/80">
                          lat: {p.lat}, lon: {p.lon}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="space-y-5">
              {/* Analyze */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Analyze Area</div>
                    <div className="text-xs text-white/50 mt-1">
                      Enter location + radius. We scan nearby categories using OSM.
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/20">
                    {loading ? "Active" : "Ready"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-xs text-white/60 mb-2">Location</div>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Example: Madhapur, Hyderabad"
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/60 mb-2">Radius</div>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-black/30 outline-none focus:ring-2 focus:ring-white/20"
                    >
                      <option value={500}>500 m</option>
                      <option value={1000}>1 km</option>
                      <option value={2000}>2 km</option>
                      <option value={3000}>3 km</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition disabled:opacity-50"
                  >
                    {loading ? "Running..." : "Run Analysis"}
                  </button>
                </div>
              </div>

              {/* Top Categories */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Top Categories</div>
                    <div className="text-xs text-white/50 mt-1">
                      Most common categories in the selected radius
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    Top 8
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {topCategories.length === 0 ? (
                    <div className="text-sm text-white/40">
                      Run analysis to see categories
                    </div>
                  ) : (
                    topCategories.map(([name, count]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {name.replaceAll("_", " ")}
                          </div>
                          <div className="text-xs text-white/40">
                            Existing supply
                          </div>
                        </div>
                        <div className="text-sm text-white/70">
                          {count}{" "}
                          <span className="text-xs text-white/40">spots</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Logistics */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">Logistics</div>
                    <div className="text-xs text-white/50 mt-1">
                      Road access + transportation facilities (score out of 100)
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60 border border-white/10">
                    Beta
                  </span>
                </div>

                <div className="mt-4">
                  {!logistics ? (
                    <div className="text-sm text-white/40">
                      Run analysis to load logistics
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-white/70">🛣️ Road Access</span>
                        <span className="font-semibold">
                          {logistics.roadScore ?? "—"}/100
                        </span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-white/70">🚇 Transportation</span>
                        <span className="font-semibold">
                          {logistics.transitScore ?? "—"}/100
                        </span>
                      </div>

                      {logistics.summary && (
                        <div className="text-xs text-white/50 mt-2">
                          {logistics.summary}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CHATBOT (Dummy) */}
        <div className="fixed bottom-5 right-5 w-[360px] max-w-[92vw] z-50">
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="font-semibold">Compare Bot</div>
                <div className="text-xs text-white/50">
                  Dummy assistant (fixed Q&A)
                </div>
              </div>

              <button
                onClick={() => setChatOpen((v) => !v)}
                className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                {chatOpen ? "Hide" : "Open"}
              </button>
            </div>

            {chatOpen && (
              <>
                <div className="h-[320px] overflow-y-auto px-4 py-3 space-y-3">
                  {chatMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl px-3 py-2 text-sm border ${
                        m.role === "user"
                          ? "bg-white/10 border-white/10 ml-10"
                          : "bg-black/20 border-white/10 mr-10"
                      }`}
                    >
                      <div className="whitespace-pre-line text-white/90">
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 p-3">
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder='Try: "Gym vs Cafe"'
                      className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-black/30 outline-none focus:ring-2 focus:ring-white/20 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") sendChat();
                      }}
                    />
                    <button
                      onClick={sendChat}
                      className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition text-sm"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
