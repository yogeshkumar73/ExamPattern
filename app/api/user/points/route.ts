import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  try {
    await dbConnect();
    const { userId, pointsDelta } = await req.json();

    if (!userId || pointsDelta === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const newPoints = Math.max(0, user.points + pointsDelta);
    let newRank = "Bronze";
    if (newPoints >= 1000) newRank = "Platinum";
    else if (newPoints >= 500) newRank = "Gold";
    else if (newPoints >= 200) newRank = "Silver";

    user.points = newPoints;
    user.rank = newRank;
    await user.save();

    return NextResponse.json({ message: "Points updated", points: user.points, rank: user.rank }, { status: 200 });
  } catch (error: any) {
    console.error("Points Update Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
