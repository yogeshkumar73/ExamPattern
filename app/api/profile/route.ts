import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";

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
    const { userId, email, photoUrl, bio, branch, phone, name, stream, course, department, grade, country, countryCode, city, ip, updates } = body;

    if (!userId && !email) {
      return NextResponse.json({ message: "User ID or email is required." }, { status: 400 });
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
          return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        return NextResponse.json({
          message: "Arena stats updated successfully.",
          user: {
            id: user._id,
            xp: user.xp || 0,
            level: user.level || 1,
            wins: user.wins || 0,
            losses: user.losses || 0,
            currentStreak: user.currentStreak || 0,
            arenaPoints: user.arenaPoints || 0,
          },
        });
      } catch (dbErr) {
        console.warn("MongoDB unavailable for arena stats update:", dbErr);
        // Mock DB fallback
        let user = mockUsers.find((u) => (userId && u._id === userId) || (email && u.email === email));
        if (!user) {
          return NextResponse.json({ message: "User not found." }, { status: 404 });
        }
        if (updates.xp !== undefined) user.xp = updates.xp;
        if (updates.wins !== undefined) user.wins = updates.wins;
        if (updates.losses !== undefined) user.losses = updates.losses;
        if (updates.currentStreak !== undefined) user.currentStreak = updates.currentStreak;
        if (updates.arenaPoints !== undefined) user.arenaPoints = updates.arenaPoints;
        if (updates.level !== undefined) user.level = updates.level;
        return NextResponse.json({
          message: "Arena stats updated successfully (offline mode).",
          user: { id: user._id, xp: user.xp, level: user.level, wins: user.wins, losses: user.losses, currentStreak: user.currentStreak, arenaPoints: user.arenaPoints },
        });
      }
    }

    try {
      await dbConnect();
      const query = userId ? { _id: userId } : { email };

      const existingUser = await User.findOne(query);
      if (!existingUser) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
      }

      const finalStream = stream !== undefined ? stream : (existingUser.stream || "");
      const finalCourse = course !== undefined ? course : (existingUser.course || "");
      const profileComplete = Boolean(
        (finalStream && finalStream.trim() !== "") && 
        (finalCourse && finalCourse.trim() !== "")
      );

      const updateFields: Record<string, any> = {
        ...(photoUrl !== undefined && { photoUrl }),
        ...(bio !== undefined && { bio }),
        ...(branch !== undefined && { branch }),
        ...(phone !== undefined && { phone }),
        ...(name !== undefined && { name }),
        ...(stream !== undefined && { stream }),
        ...(course !== undefined && { course }),
        ...(department !== undefined && { department }),
        ...(grade !== undefined && { grade }),
        ...(country !== undefined && { country }),
        ...(countryCode !== undefined && { countryCode }),
        ...(city !== undefined && { city }),
        ...(ip !== undefined && { ip }),
        profileComplete,
      };

      const user = await User.findOneAndUpdate(
        query,
        { $set: updateFields },
        { new: true, runValidators: true }
      );

      if (!user) {
        return NextResponse.json({ message: "User not found." }, { status: 404 });
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

      return NextResponse.json({
        message: "Profile updated successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          photoUrl: user.photoUrl || "",
          branch: user.branch || "",
          bio: user.bio || "",
          stream: user.stream || "",
          course: user.course || "",
          department: user.department || "",
          grade: user.grade || "",
          country: user.country || "",
          countryCode: user.countryCode || "",
          city: user.city || "",
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
      });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);
    }

    // Mock DB fallback
    let user = mockUsers.find((u) => (userId && u._id === userId) || (email && u.email === email));
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
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
    const mockStream = stream !== undefined ? stream : (user.stream || "");
    const mockCourse = course !== undefined ? course : (user.course || "");
    user.profileComplete = Boolean(
      mockStream && mockStream.trim() !== "" && mockCourse && mockCourse.trim() !== ""
    );

    return NextResponse.json({
      message: "Profile updated successfully (offline mode).",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        photoUrl: user.photoUrl || "",
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
    });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    if (!email && !userId) {
      return NextResponse.json({ message: "Email or userId is required." }, { status: 400 });
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

        return NextResponse.json({
         user: {
  // ==========================
  // Basic Information
  // ==========================
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  branch: user.branch || "",
  bio: user.bio || "",
  photoUrl: user.photoUrl || "",
  stream: user.stream || "",
  course: user.course || "",
  department: user.department || "",
  country: user.country || "India",
  countryCode: user.countryCode || "IN",
  city: user.city || "New Delhi",
  ip: user.ip || "127.0.0.1",
  status: user.status || "Active",

  // ==========================
  // Profile
  // ==========================
  profileComplete: user.profileComplete ?? false,
  isLabApproved: user.status === "Suspended" ? false : (user.isLabApproved ?? true),

  // ==========================
  // Arena Statistics
  // ==========================
  elo: user.elo ?? 1200,
  xp: user.xp ?? 0,
  level: user.level ?? 1,
  coins: user.coins ?? 0,
  referralCode: user.referralCode ?? `TEAM-${String(user._id || "STUD").substring(0, 6).toUpperCase()}`,
  referralCount: user.referralCount ?? 0,
  referralEarnings: user.referralEarnings ?? 0,
  referredBy: user.referredBy ?? "",

  arenaPoints: user.arenaPoints ?? 1200,

  wins: user.wins ?? 0,
  losses: user.losses ?? 0,

  totalBattles: user.totalBattles ?? 0,
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
  // Arena Approval
  // ==========================
  arenaApprovalStatus: user.arenaApprovalStatus || "approved",
  arenaApprovalReason: user.arenaApprovalReason || "",
  arenaApprovedAt: user.arenaApprovedAt || null,
  arenaRejectedAt: user.arenaRejectedAt || null,
  arenaAccessRequestedAt: user.arenaAccessRequestedAt || null,

  arenaAccess: user.arenaAccess || {
    status: user.arenaApprovalStatus || "approved",
    approved: user.status !== "Suspended" && user.arenaApprovalStatus !== "rejected" && user.arenaApprovalStatus !== "suspended",
  },

  arenaCanAccess: user.status !== "Suspended" && (user.arenaApprovalStatus === "approved" || user.arenaAccess?.approved === true || user.role === "admin"),

  // ==========================
  // Badges & Achievements
  // ==========================
  badges: user.badges || [],
  achievements: user.achievements || [],
},
        });
      }
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);
    }

    const user = mockUsers.find((u) => 
      (userId && (u._id === userId || (u as any).id === userId || u.name?.toLowerCase() === userId.toLowerCase())) || 
      (email && u.email?.toLowerCase() === email.toLowerCase())
    );
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        ...user,
        arenaApprovalStatus: user.arenaApprovalStatus,
        arenaApprovalReason: user.arenaApprovalReason,
        arenaCanAccess: user.arenaApprovalStatus === "approved",
      }
    });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
