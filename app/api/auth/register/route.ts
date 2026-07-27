import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

const EMAIL_REGEX =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

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
    } = body;

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

    // Email validation
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        {
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Phone validation
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        {
          message: "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

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

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,

        role: "student",
        status: "Active",

        isLabApproved: true,
        profileComplete: false,

        // Future email verification
        emailVerified: false,

        arenaApprovalStatus: "pending",
        arenaAccessRequestedAt: new Date(),
        arenaApprovalReason: "",
        arenaApprovedBy: "",
        arenaApprovedAt: null,
        arenaRejectedAt: null,
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Registration successful. Please complete your profile.",
          userId: user._id,
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

      mockUsers.push({
        _id: mockId,
        name,
        email,
        phone,

        status: "Active",
        role: "student",

        points: 0,
        rank: "Bronze",

        isLabApproved: true,
        profileComplete: false,

        emailVerified: false,

        arenaApprovalStatus: "pending",
        arenaAccessRequestedAt:
          new Date().toISOString(),
        arenaApprovalReason: "",
        arenaApprovedBy: "",
        arenaApprovedAt: null,
        arenaRejectedAt: null,

        createdAt: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: true,
          message:
            "Registration successful. Please complete your profile.",
          userId: mockId,
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