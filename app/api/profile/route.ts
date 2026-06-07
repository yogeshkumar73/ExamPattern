import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";

const VALID_STREAMS = ["class10","class11","class12","ssc","upsc","gate","jee","neet","university","other",""];

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, photoUrl, bio, branch, phone, name, stream, course, department, grade, updates } = body;

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

    // Handle standard profile updates
    const profileComplete = !!(stream && stream !== "" && course && course !== "");

    try {
      await dbConnect();
      const query = userId ? { _id: userId } : { email };
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
          role: user.role || "student",
          profileComplete: user.profileComplete || false,
          isLabApproved: user.isLabApproved || false,
          status: user.status || "Active",
          points: user.points || 0,
          rank: user.rank || "Bronze",
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
    user.profileComplete = profileComplete;

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
        role: user.role || "student",
        profileComplete: user.profileComplete ?? false,
        isLabApproved: user.isLabApproved,
        status: user.status,
        points: user.points || 0,
        rank: user.rank || "Bronze",
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

    if (!email) {
      return NextResponse.json({ message: "Email is required." }, { status: 400 });
    }

    try {
      await dbConnect();
      const user = await User.findOne({ email }).select("-password");
      if (user) {
        return NextResponse.json({
          user: {
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
            grade: user.grade || "",
            role: user.role || "student",
            profileComplete: user.profileComplete || false,
            isLabApproved: user.isLabApproved || false,
            status: user.status || "Active",
            points: user.points || 0,
            rank: user.rank || "Bronze",
            // Arena Approval Status
            arenaApprovalStatus: user.arenaApprovalStatus || "pending",
            arenaApprovalReason: user.arenaApprovalReason || "",
            arenaApprovedAt: user.arenaApprovedAt || null,
            arenaRejectedAt: user.arenaRejectedAt || null,
            arenaAccessRequestedAt: user.arenaAccessRequestedAt || null,
            arenaCanAccess: user.arenaApprovalStatus === "approved",
          },
        });
      }
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock DB:", dbErr);
    }

    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ 
      user: {
        ...user,
        arenaApprovalStatus: user.arenaApprovalStatus || "pending",
        arenaApprovalReason: user.arenaApprovalReason || "",
        arenaCanAccess: user.arenaApprovalStatus === "approved",
      }
    });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
