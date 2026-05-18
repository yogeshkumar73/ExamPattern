import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { mockUsers } from "@/lib/mockDb";

export async function GET(req: Request) {
  try {
    try {
      await dbConnect();
      const users = await User.find({}).sort({ createdAt: -1 });
      return NextResponse.json({ users }, { status: 200 });
    } catch (dbErr) {
      console.warn("MongoDB connection failed for user list, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database
    return NextResponse.json({ users: mockUsers }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, isLabApproved, status } = await req.json();

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
      await dbConnect();
      const updateData: any = {};
      if (isLabApproved !== undefined) updateData.isLabApproved = isLabApproved;
      if (status !== undefined) updateData.status = status;

      const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
      if (user) {
        return NextResponse.json({ message: "User updated successfully (MDB)", user }, { status: 200 });
      }
    } catch (dbErr) {
      console.warn("MongoDB connection failed for update, falling back to hybrid mock DB:", dbErr);
    }

    // Fallback: Hybrid Mock Database
    const user = mockUsers.find(u => u._id === userId);
    if (!user) {
      return NextResponse.json({ message: "User not found in Mock DB" }, { status: 404 });
    }

    if (isLabApproved !== undefined) user.isLabApproved = isLabApproved;
    if (status !== undefined) user.status = status;

    return NextResponse.json({ message: "User updated successfully (Hybrid Mock)", user }, { status: 200 });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
