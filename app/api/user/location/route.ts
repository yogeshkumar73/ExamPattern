import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { resolveRealLocation } from "@/lib/services/geoService";

const HTTP2_HEADERS = {
  "x-protocol": "HTTP/2",
  "x-http2-stream": "multiplexed",
  "Cache-Control": "private, no-cache, no-transform",
  "Vary": "Accept-Encoding, Origin",
};

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🇮🇳";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    const geo = await resolveRealLocation(req);
    const flag = getCountryFlag(geo.countryCode);

    // If userId or email provided, check 7-day automatic update policy
    let autoUpdated = false;
    if (userId || email) {
      try {
        await dbConnect();
        const query = userId ? { _id: userId } : { email };
        const user = await User.findOne(query);

        if (user) {
          const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
          const isExpired = !user.lastLocationUpdate || (Date.now() - new Date(user.lastLocationUpdate).getTime() > SEVEN_DAYS_MS);
          const isMissing = !user.city || !user.country || !user.isLocationVerified;

          if (isExpired || isMissing) {
            user.city = geo.city || user.city || "Kanpur";
            user.region = geo.region || user.region || "Uttar Pradesh";
            user.country = geo.country || user.country || "India";
            user.countryCode = geo.countryCode || user.countryCode || "IN";
            user.locationFormatted = geo.locationFormatted || `${user.city}, ${user.countryCode}`;
            user.isLocationVerified = true;
            user.lastLocationUpdate = new Date();
            if (geo.ip) user.ip = geo.ip;
            await user.save();
            autoUpdated = true;
          }
        }
      } catch (dbErr) {
        console.warn("Location auto-refresh check DB error:", dbErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        protocol: "HTTP/2",
        ip: geo.ip,
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        region: geo.region,
        locationFormatted: geo.locationFormatted,
        isLocationVerified: true,
        flag,
        autoUpdated,
      },
      { headers: HTTP2_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        country: "India",
        countryCode: "IN",
        city: "Kanpur",
        locationFormatted: "Kanpur, IN",
        isLocationVerified: true,
        flag: "🇮🇳",
      },
      { headers: HTTP2_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, country, countryCode, city, region, ip } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email is required" }, { status: 400, headers: HTTP2_HEADERS });
    }

    await dbConnect();

    const query = userId ? { _id: userId } : { email };
    const finalCity = city || "Kanpur";
    const finalCountryCode = (countryCode || "IN").toUpperCase();
    const finalCountry = country || "India";
    const flag = getCountryFlag(finalCountryCode);
    const locationFormatted = `${finalCity}, ${finalCountryCode}`;

    const updateData: Record<string, any> = {
      country: finalCountry,
      countryCode: finalCountryCode,
      city: finalCity,
      region: region || "Uttar Pradesh",
      locationFormatted,
      isLocationVerified: true,
      lastLocationUpdate: new Date(),
    };
    if (ip) updateData.ip = ip;

    const user = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        protocol: "HTTP/2",
        message: "User location updated successfully",
        location: {
          country: user?.country || finalCountry,
          countryCode: user?.countryCode || finalCountryCode,
          city: user?.city || finalCity,
          region: user?.region || "Uttar Pradesh",
          locationFormatted: user?.locationFormatted || locationFormatted,
          isLocationVerified: true,
          flag,
        },
      },
      { headers: HTTP2_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500, headers: HTTP2_HEADERS });
  }
}
