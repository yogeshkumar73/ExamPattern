import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Paper from "@/models/Paper";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, branch, year, fileUrl, uploadedBy } = body;

    if (!title || !branch || !year || !fileUrl) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const paper = await Paper.create({
      title,
      branch,
      year,
      fileUrl,
      uploadedBy
    });

    return NextResponse.json({ message: "Paper uploaded successfully", paper }, { status: 201 });
  } catch (error: any) {
    console.error("Paper Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");

    let query = {};
    if (branch && branch !== "All") {
      query = { branch };
    }

    const papers = await Paper.find(query).sort({ createdAt: -1 }).populate('uploadedBy', 'name');
    return NextResponse.json({ papers }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Papers Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
