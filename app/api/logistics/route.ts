import { NextResponse } from "next/server";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

async function fetchOverpass(query: string) {
  const servers = [
    "https://overpass-api.de/api/interpreter?data=",
    "https://overpass.kumi.systems/api/interpreter?data=",
  ];

  for (const base of servers) {
    try {
      const res = await fetch(base + encodeURIComponent(query), {
        next: { revalidate: 0 },
      });
      if (!res.ok) continue;
      return await res.json();
    } catch {}
  }

  throw new Error("Overpass failed");
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

// scoring helper
function scoreFromCount(count: number, thresholds: number[]) {
  // thresholds like [1,3,6,10] => increases score as count increases
  let score = 0;
  if (count >= thresholds[0]) score = 25;
  if (count >= thresholds[1]) score = 50;
  if (count >= thresholds[2]) score = 75;
  if (count >= thresholds[3]) score = 100;
  return score;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing lat/lng" },
        { status: 400 }
      );
    }

    // radius for logistics check (meters)
    const radius = 2500;

    // --- Overpass queries ---
    // ROAD ACCESS signals:
    // - major roads: motorway/trunk/primary/secondary
    // - parking
    // - fuel stations
    const roadQuery = `
      [out:json][timeout:25];
      (
        way(around:${radius},${lat},${lng})["highway"~"motorway|trunk|primary|secondary"];
        node(around:${radius},${lat},${lng})["amenity"="parking"];
        node(around:${radius},${lat},${lng})["amenity"="fuel"];
      );
      out body 1500;
    `;

    // TRANSPORT signals:
    // - bus stops
    // - railway stations
    // - subway/metro stations (OSM uses railway=station + station=subway sometimes)
    // - airports (aeroway=aerodrome)
    const transportQuery = `
      [out:json][timeout:25];
      (
        node(around:${radius},${lat},${lng})["highway"="bus_stop"];
        node(around:${radius},${lat},${lng})["public_transport"="stop_position"];
        node(around:${radius},${lat},${lng})["railway"="station"];
        node(around:${radius},${lat},${lng})["station"="subway"];
        node(around:${radius},${lat},${lng})["aeroway"="aerodrome"];
      );
      out body 1500;
    `;

    // LOGISTICS signals:
    // - warehouses
    // - courier services
    // - post office
    const logisticsQuery = `
      [out:json][timeout:25];
      (
        node(around:${radius},${lat},${lng})["building"="warehouse"];
        way(around:${radius},${lat},${lng})["building"="warehouse"];
        node(around:${radius},${lat},${lng})["amenity"="post_office"];
        node(around:${radius},${lat},${lng})["office"="courier"];
      );
      out body 1500;
    `;

    const roadData = await fetchOverpass(roadQuery);
    const transportData = await fetchOverpass(transportQuery);
    const logisticsData = await fetchOverpass(logisticsQuery);

    const roadElements: OverpassElement[] = roadData.elements || [];
    const transportElements: OverpassElement[] = transportData.elements || [];
    const logisticsElements: OverpassElement[] = logisticsData.elements || [];

    // --- Count stuff ---
    let majorRoadWays = 0;
    let parkingCount = 0;
    let fuelCount = 0;

    for (const el of roadElements) {
      const tags = el.tags || {};
      if (el.type === "way" && tags.highway) majorRoadWays++;
      if (el.type === "node" && tags.amenity === "parking") parkingCount++;
      if (el.type === "node" && tags.amenity === "fuel") fuelCount++;
    }

    let busStops = 0;
    let railwayStations = 0;
    let metroStations = 0;
    let airports = 0;

    for (const el of transportElements) {
      const tags = el.tags || {};
      if (tags.highway === "bus_stop") busStops++;
      if (tags.railway === "station") railwayStations++;
      if (tags.station === "subway") metroStations++;
      if (tags.aeroway === "aerodrome") airports++;
    }

    let warehouses = 0;
    let courier = 0;
    let postOffice = 0;

    for (const el of logisticsElements) {
      const tags = el.tags || {};
      if (tags.building === "warehouse") warehouses++;
      if (tags.office === "courier") courier++;
      if (tags.amenity === "post_office") postOffice++;
    }

    // --- Scoring logic ---
    // Road score based on:
    // major roads presence + parking + fuel
    const majorRoadScore = scoreFromCount(majorRoadWays, [1, 3, 6, 10]);
    const parkingScore = scoreFromCount(parkingCount, [1, 3, 6, 10]);
    const fuelScore = scoreFromCount(fuelCount, [1, 2, 4, 7]);

    const roadScore = clamp(
      Math.round(majorRoadScore * 0.55 + parkingScore * 0.25 + fuelScore * 0.2)
    );

    // Transportation score based on:
    // bus stops + stations + metro + airports
    const busScore = scoreFromCount(busStops, [5, 15, 30, 60]);
    const railScore = scoreFromCount(railwayStations, [1, 2, 4, 7]);
    const metroScore = scoreFromCount(metroStations, [1, 2, 4, 7]);
    const airportScore = airports > 0 ? 100 : 0;

    const transportScore = clamp(
      Math.round(
        busScore * 0.45 +
          railScore * 0.25 +
          metroScore * 0.2 +
          airportScore * 0.1
      )
    );

    // Logistics score based on:
    // warehouse + courier + post office
    const warehouseScore = scoreFromCount(warehouses, [1, 2, 4, 7]);
    const courierScore = scoreFromCount(courier, [1, 2, 4, 7]);
    const postScore = scoreFromCount(postOffice, [1, 2, 4, 7]);

    const logisticsScore = clamp(
      Math.round(warehouseScore * 0.5 + courierScore * 0.3 + postScore * 0.2)
    );

    // summary
    const summary = `Roads: ${majorRoadWays} | Bus: ${busStops} | Rail: ${railwayStations} | Metro: ${metroStations} | Warehouses: ${warehouses}`;

    return NextResponse.json({
      radiusUsed: radius,

      // MAIN OUTPUT YOU WANT
      roadScore,
      transportScore,

      // EXTRA (optional)
      logisticsScore,
      summary,

      counts: {
        majorRoadWays,
        parkingCount,
        fuelCount,
        busStops,
        railwayStations,
        metroStations,
        airports,
        warehouses,
        courier,
        postOffice,
      },
    });
  } catch (err: any) {
    console.error("LOGISTICS API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to compute logistics", details: String(err?.message) },
      { status: 500 }
    );
  }
}
