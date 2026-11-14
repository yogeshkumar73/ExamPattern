import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const GMAIL_REGEX =
  /^[a-zA-Z0-9](\.?[a-zA-Z0-9_-]+)*@(gmail\.com|googlemail\.com)$/i;

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&^()_\-+=])[A-Za-z\d@$!%*?#&^()_\-+=]{8,}$/;

const PHONE_REGEX = /^[6-9]\d{9}$/;

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(req);

    const rl = checkRateLimit(
      `register:${ip}`,
      5,
      60 * 60 * 1000
    );

    if (!rl.allowed) {
      return NextResponse.json(
        {
          message: `Too many registration attempts. Try again in ${rl.resetIn}s.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    let {
      name,
      email,
      password,
      phone,
      inviteCode,
      referralCode,
      teamCode,
    } = body;

    const rawInviteCode = (inviteCode || referralCode || teamCode || "").trim().toUpperCase();

    name = name?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        {
          message:
            "Name, Email, Password and Phone are required.",
        },
        { status: 400 }
      );
    }

    // Name validation
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        {
          message:
            "Name should be between 2 and 50 characters.",
        },
        { status: 400 }
      );
    }

    // Email / Gmail validation
    if (!EMAIL_REGEX.test(email) || !GMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          message: "Please enter a valid Gmail address (ending in @gmail.com).",
        },
        { status: 400 }
      );
    }

    // Phone validation
    const cleanPhone = phone ? phone.replace(/[\s\-\+]/g, "").replace(/^91/, "") : "";
    if (!PHONE_REGEX.test(cleanPhone)) {
      return NextResponse.json(
        {
          message: "Please enter a valid 10-digit mobile number starting with 6-9.",
        },
        { status: 400 }
      );
    }
    phone = cleanPhone;

    // Password validation
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
        },
        { status: 400 }
      );
    }

    try {
      await dbConnect();

      // Case-insensitive email lookup
      const existingUser = await User.findOne({
        email: email,
      });

      if (existingUser) {
        return NextResponse.json(
          {
            message:
              "An account with this email already exists.",
          },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Handle referral and credit 200 coins to referring user
      let referringUser: any = null;
      let initialCoins = 0;
      let referredByCode = "";

      if (rawInviteCode) {
        try {
          referringUser = await User.findOne({
            $or: [
              { referralCode: rawInviteCode },
              { customId: rawInviteCode },
              ...(rawInviteCode.length === 24 && /^[0-9a-fA-F]{24}$/.test(rawInviteCode) ? [{ _id: rawInviteCode }] : [])
            ]
          });

          if (referringUser) {
            // Credit referring user 200 coins
            referringUser.coins = (referringUser.coins || 0) + 200;
            referringUser.referralCount = (referringUser.referralCount || 0) + 1;
            referringUser.referralEarnings = (referringUser.referralEarnings || 0) + 200;
            await referringUser.save();

            // Notify referring user of +200 coin reward
            try {
              await Notification.create({
                userId: String(referringUser._id),
                recipientEmail: referringUser.email,
                recipientName: referringUser.name,
                title: "🎉 +200 Coins Earned! Team Invite",
                message: `${name} joined Aura Study AI using your team invite code (${rawInviteCode})! +200 coins have been credited to your account.`,
                category: "system",
                priority: "high",
              });
            } catch (notifErr) {
              console.warn("Failed to create referral notification:", notifErr);
            }

            initialCoins = 100; // Welcome reward for the joining student
            referredByCode = referringUser.referralCode || rawInviteCode;
          }
        } catch (refErr) {
          console.warn("Error processing referral credit:", refErr);
        }
      }

      const generatedReferralCode = `TEAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const now = new Date();
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        coins: initialCoins,
        referralCode: generatedReferralCode,
        referredBy: referredByCode,
        referralCount: 0,
        referralEarnings: 0,

        role: "student",
        status: "Active",

        isLabApproved: true,
        profileComplete: false,

        // Future email verification
        emailVerified: false,

        arenaApprovalStatus: "approved",
        arenaAccessRequestedAt: now,
        arenaApprovalReason: "Auto-approved upon registration",
        arenaApprovedBy: "System (Auto-Approved)",
        arenaApprovedAt: now,
        arenaRejectedAt: null,
        arenaAccess: {
          status: "approved",
          approved: true,
          approvedAt: now,
          rejectedAt: null,
          requestedAt: now,
          approvedBy: "System (Auto-Approved)",
          rejectionReason: "",
        },
      });

      return NextResponse.json(
        {
          success: true,
          message:
            initialCoins > 0
              ? `Registration successful! Welcome bonus of 100 coins unlocked via Team Invite code! Your referrer also earned 200 coins.`
              : "Registration successful! Your account and battle arena services are approved and active.",
          userId: user._id,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            coins: user.coins ?? initialCoins,
            referralCode: user.referralCode || generatedReferralCode,
            isLabApproved: user.isLabApproved,
            arenaApprovalStatus: user.arenaApprovalStatus,
          },
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.warn(
        "MongoDB unavailable. Using Mock DB.",
        dbError
      );

      const existingMock = mockUsers.find(
        (u) => u.email.toLowerCase() === email
      );

      if (existingMock) {
        return NextResponse.json(
          {
            message:
              "An account with this email already exists.",
          },
          { status: 409 }
        );
      }

      const mockId = `USR-${Math.random()
        .toString(36)
        .substring(2, 11)
        .toUpperCase()}`;

      // Credit 200 coins to mock referrer if matching
      let mockReferrer = rawInviteCode
        ? mockUsers.find(
            (u) =>
              u.referralCode === rawInviteCode ||
              u._id === rawInviteCode ||
              u.name.toUpperCase() === rawInviteCode
          )
        : null;

      if (mockReferrer) {
        mockReferrer.coins = (mockReferrer.coins || 0) + 200;
        mockReferrer.referralCount = (mockReferrer.referralCount || 0) + 1;
        mockReferrer.referralEarnings = (mockReferrer.referralEarnings || 0) + 200;
      }

      const mockReferralCode = `TEAM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const nowIso = new Date().toISOString();
      mockUsers.push({
        _id: mockId,
        name,
        email,
        phone,
        coins: mockReferrer ? 100 : 0,
        referralCode: mockReferralCode,
        referredBy: mockReferrer ? (mockReferrer.referralCode || rawInviteCode) : "",
        referralCount: 0,
        referralEarnings: 0,

        status: "Active",
        role: "student",

        points: 0,
        rank: "Bronze",

        isLabApproved: true,
        profileComplete: false,

        emailVerified: false,

        arenaApprovalStatus: "approved",
        arenaAccessRequestedAt: nowIso,
        arenaApprovalReason: "Auto-approved upon registration",
        arenaApprovedBy: "System (Auto-Approved)",
        arenaApprovedAt: nowIso,
        arenaRejectedAt: null,
        arenaAccess: {
          status: "approved",
          approved: true,
          approvedAt: nowIso,
          rejectedAt: null,
        },

        createdAt: nowIso,
      });

      return NextResponse.json(
        {
          success: true,
          message:
            mockReferrer
              ? "Registration successful! Welcome bonus of 100 coins unlocked via Team Invite code! Referrer credited with 200 coins."
              : "Registration successful! Your account and battle arena services are approved and active.",
          userId: mockId,
          user: {
            id: mockId,
            name,
            email,
            role: "student",
            status: "Active",
            coins: mockReferrer ? 100 : 0,
            referralCode: mockReferralCode,
            isLabApproved: true,
            arenaApprovalStatus: "approved",
          },
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Registration Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}