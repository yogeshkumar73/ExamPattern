import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌍";
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

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip") || req.headers.get("cf-connecting-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function GET(req: NextRequest) {
  try {
    const clientIp = extractClientIp(req);
    
    // Check edge platform geo headers first (Netlify / Vercel / Cloudflare)
    const headerCountry = req.headers.get("x-country") || 
                          req.headers.get("cf-ipcountry") || 
                          req.headers.get("x-vercel-ip-country");
    const headerCity = req.headers.get("x-city") || 
                       req.headers.get("x-vercel-ip-city");

    let country = headerCountry || "";
    let countryCode = headerCountry || "";
    let city = headerCity || "";
    let region = "";

    // If edge headers not present or local, query free geolocation API
    if (!country || clientIp === "127.0.0.1" || clientIp === "::1") {
      try {
        const geoRes = await fetch("https://ipapi.co/json/", {
          headers: { "User-Agent": "AuraStudyAI/1.0" },
          signal: AbortSignal.timeout(3500),
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          country = geoData.country_name || country || "India";
          countryCode = geoData.country_code || countryCode || "IN";
          city = geoData.city || city || "New Delhi";
          region = geoData.region || "";
        }
      } catch {
        // Fallback to secondary geo service or standard defaults
        try {
          const fallbackRes = await fetch("https://freeipapi.com/api/json", {
            signal: AbortSignal.timeout(3000),
          });
          if (fallbackRes.ok) {
            const fb = await fallbackRes.json();
            country = fb.countryName || country || "India";
            countryCode = fb.countryCode || countryCode || "IN";
            city = fb.cityName || city || "";
          }
        } catch {
          if (!country) {
            country = "India";
            countryCode = "IN";
            city = "Delhi";
          }
        }
      }
    }

    const flag = getCountryFlag(countryCode);

    return NextResponse.json({
      success: true,
      ip: clientIp,
      country,
      countryCode,
      city,
      region,
      flag,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      country: "India",
      countryCode: "IN",
      city: "Delhi",
      flag: "🇮🇳",
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, country, countryCode, city, ip } = body;

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email is required" }, { status: 400 });
    }

    await dbConnect();

    const query = userId ? { _id: userId } : { email };
    const flag = getCountryFlag(countryCode || "");

    const updateData: Record<string, any> = {};
    if (country) updateData.country = country;
    if (countryCode) updateData.countryCode = countryCode;
    if (city) updateData.city = city;
    if (ip) updateData.ip = ip;

    const user = await User.findOneAndUpdate(
      query,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "User location updated successfully",
      location: {
        country: user?.country || country || "India",
        countryCode: user?.countryCode || countryCode || "IN",
        city: user?.city || city || "",
        flag,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
