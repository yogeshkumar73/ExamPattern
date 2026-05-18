import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";

export async function PUT(req: Request) {
  try {
    const { userId, email, photoUrl, bio, branch, phone, name } = await req.json();

    if (!userId && !email) {
      return NextResponse.json({ message: "User ID or email is required" }, { status: 400 });
    }

    try {
      await dbConnect();
      const query = userId ? { _id: userId } : { email };
      const user = await User.findOneAndUpdate(
        query,
        { $set: { photoUrl, bio, branch, phone, name, email } },
        { new: true, runValidators: true, upsert: true }
      );
      if (user) {
        return NextResponse.json({ 
          message: "Profile updated successfully (MDB)", 
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            photoUrl: user.photoUrl,
            branch: user.branch,
            bio: user.bio,
            isLabApproved: user.isLabApproved || false,
            status: user.status || "Active"
          }
        }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn("MongoDB connection failed, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database
    let user = mockUsers.find(u => (userId && u._id === userId) || (email && u.email === email));
    
    if (!user) {
      // Create new user in mock DB
      const newMockId = userId || `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      user = {
        _id: newMockId,
        name: name || "New Student",
        email: email || "",
        phone: phone || "",
        status: "Active",
        isLabApproved: false, // Must be approved by admin
        points: 0,
        rank: "Bronze",
        branch: branch || "",
        bio: bio || "",
        photoUrl: photoUrl || "",
        createdAt: new Date().toISOString()
      };
      mockUsers.push(user);
    } else {
      // Update existing mock user
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (branch !== undefined) user.branch = branch;
      if (bio !== undefined) user.bio = bio;
      if (photoUrl !== undefined) user.photoUrl = photoUrl;
    }

    return NextResponse.json({ 
      message: "Profile updated successfully (Hybrid Mock)", 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        photoUrl: user.photoUrl,
        branch: user.branch,
        bio: user.bio,
        isLabApproved: user.isLabApproved,
        status: user.status
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    try {
      await dbConnect();
      const user = await User.findOne({ email }).select("-password");
      if (user) {
        return NextResponse.json({ 
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            branch: user.branch,
            bio: user.bio,
            photoUrl: user.photoUrl,
            isLabApproved: user.isLabApproved || false,
            status: user.status || "Active",
            points: user.points || 0,
            rank: user.rank || "Bronze"
          }
        }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn("MongoDB connection failed, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
