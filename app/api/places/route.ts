import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const location = searchParams.get("location") || "";
    const radius = Number(searchParams.get("radius") || "1000");
    const type = searchParams.get("type") || "restaurant";

    if (!location) {
      return NextResponse.json(
        { error: "location is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Maps API key missing in .env.local" },
        { status: 500 }
      );
    }
console.log("USING KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

    // 1) Geocode (location text -> lat/lng)
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        location
      )}&key=${apiKey}`
    );

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return NextResponse.json(
        { error: "Location not found", geoData },
        { status: 404 }
      );
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // 2) Nearby search
    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`
    );

    const placesData = await placesRes.json();

    return NextResponse.json({
      center: { lat, lng },
      count: placesData.results?.length || 0,
      results: (placesData.results || []).map((p: any) => ({
        name: p.name,
        rating: p.rating ?? null,
        totalRatings: p.user_ratings_total ?? null,
        address: p.vicinity ?? null,
        openNow: p.opening_hours?.open_now ?? null,
        placeId: p.place_id,
        location: p.geometry?.location ?? null,
        icon: p.icon ?? null,
      })),
      raw: placesData,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Something went wrong", details: err.message },
      { status: 500 }
    );
  }
}
