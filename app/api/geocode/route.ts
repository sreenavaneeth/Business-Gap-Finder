import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "address is required" },
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

    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    const geoData = await geoRes.json();

    return NextResponse.json(geoData);
  } catch (err: any) {
    return NextResponse.json(
      { error: "Something went wrong", details: err.message },
      { status: 500 }
    );
  }
}
