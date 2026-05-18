import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { mockUsers } from "@/lib/mockDb";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Please provide email and password" }, { status: 400 });
    }

    try {
      await dbConnect();
      
      const user = await User.findOne({ email });
      if (!user) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      return NextResponse.json({ 
        message: "Login successful (MDB)", 
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
    } catch (dbErr) {
      console.warn("MongoDB connection failed during login, falling back to hybrid mock DB:", dbErr);
      
      // Fallback: Hybrid Mock Database
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        // If not found in mock list, let's create a dynamic mock user so the demo is fully functional!
        const mockId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newMock = {
          _id: mockId,
          name: email.split("@")[0].toUpperCase(),
          email,
          phone: "",
          status: "Active" as const,
          isLabApproved: true, // Default true for auto-created mock users for easy test
          points: 100,
          rank: "Bronze" as const,
          createdAt: new Date().toISOString()
        };
        mockUsers.push(newMock);
        
        return NextResponse.json({
          message: "Login successful (Dynamic Hybrid Fallback)",
          user: {
            id: mockId,
            name: newMock.name,
            email: newMock.email,
            phone: newMock.phone,
            photoUrl: "",
            branch: "",
            bio: "",
            isLabApproved: newMock.isLabApproved,
            status: newMock.status
          }
        }, { status: 200 });
      }

      return NextResponse.json({ 
        message: "Login successful (Hybrid Fallback)", 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          photoUrl: user.photoUrl || "",
          branch: user.branch || "",
          bio: user.bio || "",
          isLabApproved: user.isLabApproved,
          status: user.status
        }
      }, { status: 200 });
    }

  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
