import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Paper from "@/models/Paper";
import { mockPapers, mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

// Valid streams
const VALID_STREAMS = ["class10","class11","class12","ssc","upsc","gate","jee","neet","university","other"];

function getSessionUser(req: NextRequest) {
  try {
    const header = req.headers.get("x-session-user");
    if (header) return JSON.parse(decodeURIComponent(header));
  } catch {}
  return null;
}

// GET /api/papers?stream=ssc&section=SSC
export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`papers-get:${ip}`, 60, 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ message: "Rate limit exceeded. Slow down." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") || "";
    const section = searchParams.get("section") || "";

    // Read requesting user from header (set by frontend)
    const sessionUser = getSessionUser(req);
    const isAdmin = sessionUser?.role === "admin";

    try {
      await dbConnect();

      const query: Record<string, any> = { isApproved: true };

      if (!isAdmin && stream) {
        query.stream = stream;
      } else if (stream && stream !== "all") {
        query.stream = stream;
      }

      if (section) query.section = section;

      const papers = await Paper.find(query)
        .sort({ createdAt: -1 })
        .select("-fileData") // Don't send base64 in listing
        .limit(50);

      return NextResponse.json({ papers }, { status: 200 });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock papers:", dbErr);

      let papers = mockPapers.filter((p) => p.isApproved);
      if (!isAdmin && stream) {
        papers = papers.filter((p) => p.stream === stream);
      } else if (stream && stream !== "all") {
        papers = papers.filter((p) => p.stream === stream);
      }
      if (section) papers = papers.filter((p) => p.section === section);

      // Strip fileData from listing
      const stripped = papers.map(({ fileData, ...rest }) => rest);
      return NextResponse.json({ papers: stripped }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Fetch Papers Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/papers  (Upload a paper)
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const sessionUser = getSessionUser(req);

    if (!sessionUser?.id) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    // Rate limit uploads: 3 per user per day
    const rl = checkRateLimit(`upload:${sessionUser.id}`, 3, 24 * 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Upload limit reached (3/day). Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, description, stream, section, branch, year, fileData, fileName, fileType } = body;

    // Validation
    if (!title || !stream || !year) {
      return NextResponse.json({ message: "Title, stream, and year are required." }, { status: 400 });
    }

    if (!VALID_STREAMS.includes(stream)) {
      return NextResponse.json({ message: "Invalid stream." }, { status: 400 });
    }

    const isAdmin = sessionUser.role === "admin";

    // Students can only upload to their own stream
    if (!isAdmin && sessionUser.stream && sessionUser.stream !== stream) {
      return NextResponse.json(
        { message: `You can only upload papers for your stream: ${sessionUser.stream}` },
        { status: 403 }
      );
    }

    try {
      await dbConnect();

      const paper = await Paper.create({
        title,
        description: description || "",
        stream,
        section: section || "Other",
        branch: branch || "",
        year,
        uploadedBy: sessionUser.id,
        uploadedByName: sessionUser.name || "Anonymous",
        fileData: fileData || "",
        fileName: fileName || "paper.pdf",
        fileType: fileType || "application/pdf",
        isApproved: isAdmin ? true : true, // Auto-approve; admin can toggle later
      });

      // Return without fileData
      const { fileData: _fd, ...paperObj } = paper.toObject();
      return NextResponse.json({ message: "Paper uploaded successfully!", paper: paperObj }, { status: 201 });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock papers:", dbErr);

      const mockId = `PAPER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newPaper = {
        _id: mockId,
        title,
        description: description || "",
        stream,
        section: section || "Other",
        branch: branch || "",
        year,
        uploadedBy: sessionUser.id,
        uploadedByName: sessionUser.name || "Anonymous",
        fileData: fileData || "",
        fileName: fileName || "paper.pdf",
        fileType: fileType || "application/pdf",
        downloads: 0,
        isApproved: true,
        createdAt: new Date().toISOString(),
      };
      mockPapers.push(newPaper);

      const { fileData: _fd, ...paperObj } = newPaper;
      return NextResponse.json({ message: "Paper uploaded successfully! (offline mode)", paper: paperObj }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Paper Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
