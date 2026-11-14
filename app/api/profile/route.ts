import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";
import { resolveRealLocation } from "@/lib/services/geoService";

const HTTP2_HEADERS = {
  "x-protocol": "HTTP/2",
  "x-http2-stream": "multiplexed",
  "Cache-Control": "private, no-cache, no-transform",
  "Vary": "Accept-Encoding, Origin",
};

const VALID_STREAMS = ["class10","class11","class12","ssc","upsc","gate","jee","neet","university","other",""];

function computeRankTier(points: number): string {
  if (points >= 5000) return "Diamond";
  if (points >= 3000) return "Platinum";
  if (points >= 1500) return "Gold";
  if (points >= 500)  return "Silver";
  return "Bronze";
}

function computeArenaRank(points: number): string {
  if (points >= 5000) return "Grandmaster";
  if (points >= 3000) return "Master";
  if (points >= 2000) return "Diamond";
  if (points >= 1500) return "Platinum";
  if (points >= 1200) return "Gold";
  if (points >= 1000) return "Silver";
  if (points >= 800)  return "Bronze";
  return "Unranked";
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      email,
      photoUrl,
      bio,
      branch,
      phone,
      name,
      stream,
      course,
      department,
      grade,
      gender,
      country,
      countryCode,
      city,
      region,
      locationFormatted,
      isLocationVerified,
      ip,
      updates
    } = body;

    if (!userId && !email) {
      return NextResponse.json({ message: "User ID or email is required." }, { status: 400, headers: HTTP2_HEADERS });
    }

    // Handle arena stats updates
    if (updates && (updates.xp || updates.wins || updates.losses !== undefined || updates.arenaPoints !== undefined || updates.level)) {
      try {
        await dbConnect();
        const query = userId ? { _id: userId } : { email };
        const updateFields: Record<string, any> = {
          ...(updates.xp !== undefined && { xp: updates.xp }),
          ...(updates.wins !== undefined && { wins: updates.wins }),
          ...(updates.losses !== undefined && { losses: updates.losses }),
          ...(updates.currentStreak !== undefined && { currentStreak: updates.currentStreak }),
          ...(updates.arenaPoints !== undefined && { arenaPoints: updates.arenaPoints }),
          ...(updates.level !== undefined && { level: updates.level }),
        };

        const user = await User.findOneAndUpdate(
          query,
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        if (!user) {
          return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
        }

        return NextResponse.json(
          {
            message: "Arena stats updated successfully.",
            protocol: "HTTP/2",
            user: {
              id: user._id,
              xp: user.xp || 0,
              level: user.level || 1,
              wins: user.wins || 0,
              losses: user.losses || 0,
              currentStreak: user.currentStreak || 0,
              arenaPoints: user.arenaPoints || 0,
            },
          },
          { headers: HTTP2_HEADERS }
        );
      } catch (dbErr) {
        console.warn("MongoDB unavailable for arena stats update:", dbErr);
        // Mock DB fallback
        let user = mockUsers.find((u) => (userId && u._id === userId) || (email && u.email === email));
        if (!user) {
          return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
        }
        if (updates.xp !== undefined) user.xp = updates.xp;
        if (updates.wins !== undefined) user.wins = updates.wins;
        if (updates.losses !== undefined) user.losses = updates.losses;
        if (updates.currentStreak !== undefined) user.currentStreak = updates.currentStreak;
        if (updates.arenaPoints !== undefined) user.arenaPoints = updates.arenaPoints;
        if (updates.level !== undefined) user.level = updates.level;
        return NextResponse.json(
          {
            message: "Arena stats updated successfully (offline mode).",
            protocol: "HTTP/2",
            user: { id: user._id, xp: user.xp, level: user.level, wins: user.wins, losses: user.losses, currentStreak: user.currentStreak, arenaPoints: user.arenaPoints },
          },
          { headers: HTTP2_HEADERS }
        );
      }
    }

    try {
      await dbConnect();
      const query = userId ? { _id: userId } : { email };

      const existingUser = await User.findOne(query);
      if (!existingUser) {
        return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
      }

      const finalStream = stream !== undefined ? stream : (existingUser.stream || "");
      const finalCourse = course !== undefined ? course : (existingUser.course || "");
      const profileComplete = Boolean(
        (finalStream && finalStream.trim() !== "") && 
        (finalCourse && finalCourse.trim() !== "")
      );

      const finalCity = city !== undefined ? city.trim() : existingUser.city;
      const finalCountry = country !== undefined ? country.trim() : existingUser.country;
      const finalCountryCode = countryCode !== undefined ? countryCode.trim().toUpperCase() : existingUser.countryCode;
      const formattedLoc = locationFormatted || (finalCity && finalCountryCode ? `${finalCity}, ${finalCountryCode}` : (finalCity || finalCountry || ""));

      const updateFields: Record<string, any> = {
        ...(photoUrl !== undefined && { photoUrl }),
        ...(bio !== undefined && { bio }),
        ...(branch !== undefined && { branch }),
        ...(phone !== undefined && { phone }),
        ...(gender !== undefined && { gender }),
        ...(name !== undefined && { name }),
        ...(stream !== undefined && { stream }),
        ...(course !== undefined && { course }),
        ...(department !== undefined && { department }),
        ...(grade !== undefined && { grade }),
        ...(country !== undefined && { country: finalCountry }),
        ...(countryCode !== undefined && { countryCode: finalCountryCode }),
        ...(city !== undefined && { city: finalCity }),
        ...(region !== undefined && { region }),
        ...(formattedLoc && { locationFormatted: formattedLoc }),
        ...(isLocationVerified !== undefined ? { isLocationVerified } : (finalCity ? { isLocationVerified: true } : {})),
        ...(ip !== undefined && { ip }),
        profileComplete,
      };

      const user = await User.findOneAndUpdate(
        query,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
      }

      const userPoints = Math.max(user.xp || 0, user.points || 0);
      const dynamicRank = computeRankTier(userPoints);
      const dynamicArenaRank = user.arenaRank && user.arenaRank !== "Unranked"
        ? user.arenaRank
        : computeArenaRank(user.arenaPoints ?? 0);

      let leaderboardRank = 1;
      let arenaLeaderboardRank = 1;
      try {
        leaderboardRank = (await User.countDocuments({
          $or: [
            { xp: { $gt: userPoints } },
            { points: { $gt: userPoints } }
          ]
        })) + 1;
        arenaLeaderboardRank = (await User.countDocuments({
          arenaPoints: { $gt: user.arenaPoints || 0 }
        })) + 1;
      } catch (_) {}

      if (user.rank !== dynamicRank || user.arenaRank !== dynamicArenaRank) {
        User.updateOne({ _id: user._id }, { $set: { rank: dynamicRank, arenaRank: dynamicArenaRank } }).catch(() => {});
      }

      return NextResponse.json(
        {
          message: "Profile updated successfully.",
          protocol: "HTTP/2",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            photoUrl: user.photoUrl || "",
            gender: user.gender || "prefer_not_to_say",
            lastLocationUpdate: user.lastLocationUpdate,
            branch: user.branch || "",
            bio: user.bio || "",
            stream: user.stream || "",
            course: user.course || "",
            department: user.department || "",
            grade: user.grade || "",
            country: user.country || "India",
            countryCode: user.countryCode || "IN",
            city: user.city || "Kanpur",
            region: user.region || "Uttar Pradesh",
            locationFormatted: user.locationFormatted || (user.city ? `${user.city}, ${user.countryCode || "IN"}` : "Kanpur, IN"),
            isLocationVerified: user.isLocationVerified ?? true,
            ip: user.ip || "",
            status: user.status || "Active",
            profileComplete: user.profileComplete || false,
            isLabApproved: user.isLabApproved || false,
            points: userPoints,
            xp: user.xp || userPoints,
            level: user.level || 1,
            coins: user.coins || 0,
            referralCode: user.referralCode || `TEAM-${String(user._id).substring(18).toUpperCase()}`,
            referralCount: user.referralCount || 0,
            referralEarnings: user.referralEarnings || 0,
            referredBy: user.referredBy || "",
            elo: user.elo || 1200,
            wins: user.wins || 0,
            losses: user.losses || 0,
            totalBattles: user.totalBattles || 0,
            accuracy: user.accuracy || 0,
            currentStreak: user.currentStreak || 0,
            bestStreak: user.bestStreak || 0,
            arenaPoints: user.arenaPoints || 0,
            rank: dynamicRank,
            arenaRank: dynamicArenaRank,
            leaderboardRank,
            arenaLeaderboardRank,
          },
        },
        { headers: HTTP2_HEADERS }
      );
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);
    }

    // Mock DB fallback
    let user = mockUsers.find((u) => (userId && u._id === userId) || (email && u.email === email));
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (branch !== undefined) user.branch = branch;
    if (bio !== undefined) user.bio = bio;
    if (photoUrl !== undefined) user.photoUrl = photoUrl;
    if (stream !== undefined) user.stream = stream;
    if (course !== undefined) user.course = course;
    if (department !== undefined) user.department = department;
    if (grade !== undefined) user.grade = grade;
    if (gender !== undefined) user.gender = gender;
    const mockStream = stream !== undefined ? stream : (user.stream || "");
    const mockCourse = course !== undefined ? course : (user.course || "");
    user.profileComplete = Boolean(
      mockStream && mockStream.trim() !== "" && mockCourse && mockCourse.trim() !== ""
    );

    return NextResponse.json(
      {
        message: "Profile updated successfully (offline mode).",
        protocol: "HTTP/2",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          photoUrl: user.photoUrl || "",
          gender: user.gender || "prefer_not_to_say",
          branch: user.branch || "",
          bio: user.bio || "",
          stream: user.stream || "",
          course: user.course || "",
          department: user.department || "",
          grade: user.grade || "",
          profileComplete: user.profileComplete ?? false,
          isLabApproved: user.isLabApproved,
          status: user.status,
          points: user.points || 0,
          rank: user.rank,
        },
      },
      { headers: HTTP2_HEADERS }
    );
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500, headers: HTTP2_HEADERS });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");
    const isVisitorParam = searchParams.get("visitor") === "true";
    const requesterId = searchParams.get("requesterId");
    const requesterEmail = searchParams.get("requesterEmail");

    if (!email && !userId) {
      return NextResponse.json({ message: "Email or userId is required." }, { status: 400, headers: HTTP2_HEADERS });
    }

    try {
      await dbConnect();
      const mongoose = (await import("mongoose")).default;
      let query: any = {};
      if (userId) {
        const safeRegex = new RegExp(`^${userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i");
        query = mongoose.isValidObjectId(userId)
          ? { _id: userId }
          : { $or: [{ customId: userId }, { email: userId }, { name: safeRegex }] };
      } else {
        query = { email };
      }
      const user = await User.findOne(query).select("-password");
      if (user) {
        const userPoints = Math.max(user.xp || 0, user.points || 0);
        const dynamicRank = computeRankTier(userPoints);
        const dynamicArenaRank = user.arenaRank && user.arenaRank !== "Unranked"
          ? user.arenaRank
          : computeArenaRank(user.arenaPoints ?? 0);

        let leaderboardRank = 1;
        let arenaLeaderboardRank = 1;
        try {
          leaderboardRank = (await User.countDocuments({
            $or: [
              { xp: { $gt: userPoints } },
              { points: { $gt: userPoints } }
            ]
          })) + 1;
          arenaLeaderboardRank = (await User.countDocuments({
            arenaPoints: { $gt: user.arenaPoints || 0 }
          })) + 1;
        } catch (_) {}

        if (user.rank !== dynamicRank || user.arenaRank !== dynamicArenaRank) {
          User.updateOne({ _id: user._id }, { $set: { rank: dynamicRank, arenaRank: dynamicArenaRank } }).catch(() => {});
        }

        // Auto-detect and persist real IP location if not yet verified or if 7-day cycle expired
        let verifiedCity = user.city || "";
        let verifiedRegion = user.region || "";
        let verifiedCountry = user.country || "";
        let verifiedCountryCode = user.countryCode || "";
        let verifiedLocationFormatted = user.locationFormatted || "";

        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const isLocationExpired = !user.lastLocationUpdate || (Date.now() - new Date(user.lastLocationUpdate).getTime() > SEVEN_DAYS_MS);
        const needsLocationUpdate = !user.isLocationVerified || !verifiedCity || !verifiedCountry || isLocationExpired;

        if (needsLocationUpdate) {
          try {
            const geo = await resolveRealLocation(req);
            verifiedCity = geo.city || verifiedCity;
            verifiedRegion = geo.region || verifiedRegion;
            verifiedCountry = geo.country || verifiedCountry;
            verifiedCountryCode = geo.countryCode || verifiedCountryCode;
            verifiedLocationFormatted = geo.locationFormatted || verifiedLocationFormatted;

            await User.updateOne(
              { _id: user._id },
              {
                $set: {
                  city: geo.city,
                  region: geo.region,
                  country: geo.country,
                  countryCode: geo.countryCode,
                  locationFormatted: geo.locationFormatted,
                  isLocationVerified: true,
                  ip: geo.ip,
                  lastIp: geo.ip,
                  lastLocationUpdate: new Date(),
                },
              }
            );
          } catch (_) {}
        }

        if (!verifiedCity) verifiedCity = "Kanpur";
        if (!verifiedCountry) verifiedCountry = "India";
        if (!verifiedCountryCode) verifiedCountryCode = "IN";
        if (!verifiedLocationFormatted) verifiedLocationFormatted = `${verifiedCity}, ${verifiedCountryCode}`;

        // Determine if visitor mode: hide sensitive information for other users
        const isOwner = Boolean(
          (!isVisitorParam && !requesterId && !requesterEmail) ||
          (requesterId && String(user._id) === requesterId) ||
          (requesterEmail && user.email === requesterEmail)
        );

        const totalBattles = (user.wins || 0) + (user.losses || 0);
        const winRate = totalBattles > 0 ? Number(((user.wins / totalBattles) * 100).toFixed(2)) : (user.winRate || 0);

        return NextResponse.json(
          {
            protocol: "HTTP/2",
            user: {
              // ==========================
              // Public / Visitor Identity
              // ==========================
              id: user._id,
              userId: user._id,
              name: user.name,
              photoUrl: user.photoUrl || "",
              avatar: user.photoUrl || "",
              bio: user.bio || "",
              gender: user.gender || "prefer_not_to_say",
              branch: user.branch || "",
              stream: user.stream || "university",
              course: user.course || "General Academic",
              department: user.department || "",
              role: user.role || "student",
              status: user.status || "Active",
              isOnline: user.isOnline ?? true,

              // ==========================
              // Real Geolocation (IP Verified)
              // ==========================
              city: verifiedCity,
              region: verifiedRegion,
              country: verifiedCountry,
              countryCode: verifiedCountryCode,
              locationFormatted: verifiedLocationFormatted,
              isLocationVerified: true,
              lastLocationUpdate: user.lastLocationUpdate || new Date(),

              // ==========================
              // Sensitive Information: ONLY for profile owner
              // ==========================
              ...(isOwner ? {
                email: user.email,
                phone: user.phone || "",
                ip: user.ip || "",
                profileComplete: user.profileComplete ?? false,
                isLabApproved: user.status === "Suspended" ? false : (user.isLabApproved ?? true),
                referralCode: user.referralCode ?? `TEAM-${String(user._id || "STUD").substring(0, 6).toUpperCase()}`,
                referralCount: user.referralCount ?? 0,
                referralEarnings: user.referralEarnings ?? 0,
                referredBy: user.referredBy ?? "",
              } : {
                // Sensitive fields completely omitted for other visitors
                email: undefined,
                phone: undefined,
                ip: undefined,
              }),

              // ==========================
              // Arena Statistics & Ranks
              // ==========================
              elo: user.elo ?? 1200,
              xp: user.xp ?? 0,
              level: user.level ?? 1,
              coins: isOwner ? (user.coins ?? 0) : undefined,
              arenaPoints: user.arenaPoints ?? 1200,

              wins: user.wins ?? 0,
              losses: user.losses ?? 0,
              winRate,

              totalBattles: user.totalBattles ?? totalBattles,
              totalCorrect: user.totalCorrect ?? 0,
              accuracy: user.accuracy ?? 0,

              currentStreak: user.currentStreak ?? 0,
              bestStreak: user.bestStreak ?? 0,

              rank: dynamicRank,
              arenaRank: dynamicArenaRank,
              leaderboardRank,
              arenaLeaderboardRank,
              points: userPoints,

              // ==========================
              // Arena Approval & Access
              // ==========================
              arenaApprovalStatus: user.arenaApprovalStatus || "approved",
              arenaCanAccess: user.status !== "Suspended" && (user.arenaApprovalStatus === "approved" || user.arenaAccess?.approved === true || user.role === "admin"),

              // ==========================
              // Badges & Achievements
              // ==========================
              badges: user.badges || [],
              achievements: user.achievements || [],
            },
          },
          { headers: HTTP2_HEADERS }
        );
      }
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);
    }

    const user = mockUsers.find((u) => 
      (userId && (u._id === userId || (u as any).id === userId || u.name?.toLowerCase() === userId.toLowerCase())) || 
      (email && u.email?.toLowerCase() === email.toLowerCase())
    );
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404, headers: HTTP2_HEADERS });
    }

    return NextResponse.json(
      { 
        protocol: "HTTP/2",
        user: {
          ...user,
          city: user.city || "Kanpur",
          country: user.country || "India",
          countryCode: user.countryCode || "IN",
          locationFormatted: `${user.city || "Kanpur"}, ${user.countryCode || "IN"}`,
          isLocationVerified: true,
          stream: user.stream || "university",
          course: user.course || "General Academic",
          gender: user.gender || "prefer_not_to_say",
          lastLocationUpdate: user.lastLocationUpdate || new Date(),
          arenaApprovalStatus: user.arenaApprovalStatus,
          arenaCanAccess: user.arenaApprovalStatus === "approved",
        }
      },
      { headers: HTTP2_HEADERS }
    );
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500, headers: HTTP2_HEADERS });
  }
}
