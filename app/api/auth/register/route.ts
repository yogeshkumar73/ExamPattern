import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { mockUsers } from "@/lib/mockDb";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Please provide all required fields" }, { status: 400 });
    }

    try {
      await dbConnect();
      
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json({ message: "User already exists" }, { status: 400 });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
      });

      return NextResponse.json({ message: "User created successfully (MDB)", userId: user._id }, { status: 201 });
    } catch (dbErr) {
      console.warn("MongoDB connection failed during register, falling back to hybrid mock DB:", dbErr);
      
      // Fallback: Hybrid Mock Database
      const existingMock = mockUsers.find(u => u.email === email);
      if (existingMock) {
        return NextResponse.json({ message: "User already exists (Mock)" }, { status: 400 });
      }

      const mockId = `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      // In mock DB, we just simulate password storage safely
      mockUsers.push({
        _id: mockId,
        name,
        email,
        phone: phone || "",
        status: "Active",
        isLabApproved: false, // Requires Admin approval
        points: 0,
        rank: "Bronze",
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ message: "User created successfully (Hybrid Mock)", userId: mockId }, { status: 201 });
    }

  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
