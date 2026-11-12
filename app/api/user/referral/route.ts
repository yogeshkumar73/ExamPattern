import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { mockUsers } from "@/lib/mockDb";

const BASE_INVITE_URL = "https://exampattern.netlify.app";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || searchParams.get("id");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "userId or email is required." },
        { status: 400 }
      );
    }

    try {
      await dbConnect();
      let query: any = {};
      if (userId && userId.length === 24 && /^[0-9a-fA-F]{24}$/.test(userId)) {
        query._id = userId;
      } else if (userId) {
        query.$or = [{ customId: userId }, { referralCode: userId.toUpperCase() }];
      } else if (email) {
        query.email = email.toLowerCase().trim();
      }

      let user = await User.findOne(query);

      if (!user && email) {
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }

      if (user) {
        // Ensure user has a referralCode
        if (!user.referralCode) {
          user.referralCode = `TEAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          await user.save();
        }

        // Fetch recent students who joined with this user's code
        const referredStudents = await User.find({ referredBy: user.referralCode })
          .select("name photoUrl arenaRank createdAt coins")
          .limit(10)
          .sort({ createdAt: -1 });

        return NextResponse.json({
          success: true,
          referralCode: user.referralCode,
          teamCode: user.referralCode,
          inviteLink: `${BASE_INVITE_URL}/?ref=${user.referralCode}`,
          coins: user.coins || 0,
          referralCount: user.referralCount || referredStudents.length || 0,
          referralEarnings: user.referralEarnings || (user.referralCount || 0) * 200,
          coinsPerInvite: 200,
          welcomeBonus: 100,
          referredStudents: referredStudents.map((s: any) => ({
            name: s.name,
            photoUrl: s.photoUrl || "",
            arenaRank: s.arenaRank || "Bronze",
            joinedAt: s.createdAt,
          })),
        });
      }
    } catch (dbErr) {
      console.warn("MongoDB query failed, falling back to Mock DB:", dbErr);
    }

    // Mock DB Fallback
    const mockUser = mockUsers.find(
      (u) =>
        (userId && (u._id === userId || u.referralCode === userId)) ||
        (email && u.email.toLowerCase() === email.toLowerCase())
    );

    if (mockUser) {
      if (!mockUser.referralCode) {
        mockUser.referralCode = `TEAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }
      return NextResponse.json({
        success: true,
        referralCode: mockUser.referralCode,
        teamCode: mockUser.referralCode,
        inviteLink: `${BASE_INVITE_URL}/?ref=${mockUser.referralCode}`,
        coins: mockUser.coins || 0,
        referralCount: mockUser.referralCount || 0,
        referralEarnings: mockUser.referralEarnings || 0,
        coinsPerInvite: 200,
        welcomeBonus: 100,
        referredStudents: [],
      });
    }

    // Fallback if user record not yet created in DB
    const fallbackCode = `TEAM-${(userId || "STUDENT").substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    return NextResponse.json({
      success: true,
      referralCode: fallbackCode,
      teamCode: fallbackCode,
      inviteLink: `${BASE_INVITE_URL}/?ref=${fallbackCode}`,
      coins: 0,
      referralCount: 0,
      referralEarnings: 0,
      coinsPerInvite: 200,
      welcomeBonus: 100,
      referredStudents: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve referral data." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, inviteCode, userId } = body;

    const code = (inviteCode || "").trim().toUpperCase();

    // 1. Verify / Validate an invite code before joining
    if (action === "validate") {
      if (!code) {
        return NextResponse.json({ success: false, error: "Please enter an invite code." }, { status: 400 });
      }

      try {
        await dbConnect();
        const referrer = await User.findOne({
          $or: [
            { referralCode: code },
            { customId: code },
            ...(code.length === 24 && /^[0-9a-fA-F]{24}$/.test(code) ? [{ _id: code }] : []),
          ],
        }).select("name referralCode arenaRank photoUrl");

        if (referrer) {
          return NextResponse.json({
            success: true,
            valid: true,
            referrer: {
              name: referrer.name,
              code: referrer.referralCode,
              arenaRank: referrer.arenaRank,
              photoUrl: referrer.photoUrl,
            },
            message: `Valid Team Code! Join to unlock +100 welcome coins.`,
          });
        }
      } catch (_) {}

      const mockReferrer = mockUsers.find((u) => u.referralCode === code || u._id === code);
      if (mockReferrer) {
        return NextResponse.json({
          success: true,
          valid: true,
          referrer: {
            name: mockReferrer.name,
            code: mockReferrer.referralCode,
          },
          message: `Valid Team Code! Join to unlock +100 welcome coins.`,
        });
      }

      return NextResponse.json({
        success: false,
        valid: false,
        error: "Invalid or expired team invite code.",
      });
    }

    // 2. Redeem invite code for existing user who hasn't redeemed one yet
    if (action === "redeem") {
      if (!code || !userId) {
        return NextResponse.json({ success: false, error: "userId and inviteCode are required." }, { status: 400 });
      }

      try {
        await dbConnect();
        const currentUser = await User.findById(userId);
        if (!currentUser) {
          return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        if (currentUser.referredBy) {
          return NextResponse.json({ success: false, error: "You have already redeemed a team invite code." }, { status: 400 });
        }

        if (currentUser.referralCode === code) {
          return NextResponse.json({ success: false, error: "You cannot use your own invite code." }, { status: 400 });
        }

        const referrer = await User.findOne({ referralCode: code });
        if (!referrer) {
          return NextResponse.json({ success: false, error: "Invite code not found." }, { status: 404 });
        }

        // Credit referrer 200 coins
        referrer.coins = (referrer.coins || 0) + 200;
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        referrer.referralEarnings = (referrer.referralEarnings || 0) + 200;
        await referrer.save();

        // Credit current user 100 coins welcome bonus
        currentUser.referredBy = code;
        currentUser.coins = (currentUser.coins || 0) + 100;
        await currentUser.save();

        // Send notification to referrer
        try {
          await Notification.create({
            userId: String(referrer._id),
            recipientEmail: referrer.email,
            recipientName: referrer.name,
            title: "🎉 +200 Coins Earned! Team Invite",
            message: `${currentUser.name} redeemed your team invite code (${code})! +200 coins credited to your account.`,
            category: "system",
            priority: "high",
          });
        } catch (_) {}

        return NextResponse.json({
          success: true,
          message: "Team invite code redeemed successfully! You earned +100 coins and your teammate earned +200 coins.",
          coins: currentUser.coins,
          referralCode: currentUser.referralCode,
        });
      } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to process request." }, { status: 500 });
  }
}
