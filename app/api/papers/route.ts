import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Paper from "@/models/Paper";
import { mockPapers, mockUsers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

// Valid streams
const VALID_STREAMS = ["class10","class11","class12","ssc","upsc","gate","jee","neet","university","other","cbse","standard"];

function getSessionUser(req: NextRequest) {
  try {
    const header = req.headers.get("x-session-user");
    if (header) {
      const parsed = JSON.parse(decodeURIComponent(header));
      return parsed?.user || parsed;
    }
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
    const includePending = searchParams.get("includePending") === "true";

    // Read requesting user from header (set by frontend)
    const sessionUser = getSessionUser(req);
    const isAdmin = sessionUser?.role === "admin";

    try {
      await dbConnect();

      const query: Record<string, any> = {};

      if (!isAdmin && !includePending) {
        // Normal users see approved papers OR their own pending uploads
        if (sessionUser?.id) {
          query.$or = [
            { isApproved: true },
            { uploadedBy: sessionUser.id },
            { uploaderId: sessionUser.id }
          ];
        } else {
          query.isApproved = true;
        }
      } else if (includePending && !isAdmin) {
        query.isApproved = true;
      }

      if (section && section !== "all") {
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { section: { $regex: new RegExp(`^${section}$`, 'i') } },
            { examType: { $regex: new RegExp(`^${section}$`, 'i') } },
            { stream: { $regex: new RegExp(section, 'i') } }
          ]
        });
      }

      if (stream && stream !== "all") {
        query.stream = stream;
      }

      const papers = await Paper.find(query)
        .sort({ createdAt: -1 })
        .select("-fileData") // Don't send base64 in listing
        .limit(100);

      return NextResponse.json({ papers }, { status: 200 });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock papers:", dbErr);

      let papers = mockPapers;
      if (!isAdmin && !includePending) {
        papers = papers.filter((p: any) => p.isApproved || (sessionUser?.id && p.uploadedBy === sessionUser.id));
      }

      if (section && section !== "all") {
        const secLower = section.toLowerCase();
        papers = papers.filter((p: any) => 
          (p.section && p.section.toLowerCase() === secLower) ||
          (p.stream && p.stream.toLowerCase().includes(secLower)) ||
          (p.title && p.title.toLowerCase().includes(secLower))
        );
      }

      if (stream && stream !== "all") {
        papers = papers.filter((p: any) => p.stream === stream);
      }

      // Strip fileData from listing
      const stripped = papers.map(({ fileData, ...rest }: any) => rest);
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

    // Allow uploads from authenticated users, or default to student identity
    const uploaderId = sessionUser?.id || `anon-${Date.now()}`;
    const uploaderName = sessionUser?.name || "Student Contributor";
    const isAdmin = sessionUser?.role === "admin";

    // Rate limit uploads: 10 per day
    const rl = checkRateLimit(`upload:${uploaderId}`, 10, 24 * 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Upload limit reached. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, description, stream, section, branch, year, fileData, fileName, fileType, subject } = body;

    // Validation
    if (!title) {
      return NextResponse.json({ message: "Paper title is required." }, { status: 400 });
    }

    const assignedSection = section || "CBSE";
    const assignedStream = (stream || assignedSection || "other").toLowerCase();
    const assignedYear = year ? Number(year) : new Date().getFullYear();

    // Admin uploads are auto-approved. User uploads wait for admin review and approval.
    const isApproved = isAdmin ? true : false;

    try {
      await dbConnect();

      const paper = await Paper.create({
        title,
        description: description || "",
        stream: assignedStream,
        section: assignedSection,
        examType: assignedSection,
        subject: subject || assignedSection,
        branch: branch || "",
        year: assignedYear,
        uploadedBy: uploaderId,
        uploadedByName: uploaderName,
        uploaderId: sessionUser?.id ? sessionUser.id : undefined,
        uploaderName,
        fileData: fileData || "",
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileType: fileType || "application/pdf",
        isApproved,
      });

      // Return without fileData
      const { fileData: _fd, ...paperObj } = paper.toObject();
      return NextResponse.json({ 
        message: isApproved ? "Paper published to Community Archive!" : "Paper submitted successfully! Pending Admin approval.", 
        paper: paperObj 
      }, { status: 201 });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock papers:", dbErr);

      const mockId = `PAPER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newPaper = {
        _id: mockId,
        title,
        description: description || "",
        stream: assignedStream,
        section: assignedSection,
        branch: branch || "",
        year: String(assignedYear),
        uploadedBy: uploaderId,
        uploadedByName: uploaderName,
        fileData: fileData || "",
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileType: fileType || "application/pdf",
        downloads: 0,
        isApproved,
        createdAt: new Date().toISOString(),
      };
      mockPapers.unshift(newPaper);

      const { fileData: _fd, ...paperObj } = newPaper;
      return NextResponse.json({ 
        message: isApproved ? "Paper published to Community Archive!" : "Paper submitted successfully! Pending Admin approval.", 
        paper: paperObj 
      }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Paper Upload Error:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

// PATCH /api/papers (Admin Approve or Reject Paper)
export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = getSessionUser(req);
    const isAdmin = sessionUser?.role === "admin";

    // Check admin authorization or allow if role is admin
    if (!isAdmin) {
      return NextResponse.json({ message: "Admin authorization required to moderate papers." }, { status: 403 });
    }

    const body = await req.json();
    const { paperId, action } = body; // action: 'approve' | 'reject' | 'delete'

    if (!paperId) {
      return NextResponse.json({ message: "paperId is required." }, { status: 400 });
    }

    try {
      await dbConnect();
      if (action === "approve") {
        await Paper.findByIdAndUpdate(paperId, { isApproved: true });
        return NextResponse.json({ message: "Paper approved and published to repository!" });
      } else {
        await Paper.findByIdAndDelete(paperId);
        return NextResponse.json({ message: "Paper rejected and removed." });
      }
    } catch (dbErr) {
      const idx = mockPapers.findIndex((p: any) => p._id === paperId);
      if (idx !== -1) {
        if (action === "approve") {
          mockPapers[idx].isApproved = true;
        } else {
          mockPapers.splice(idx, 1);
        }
      }
      return NextResponse.json({ message: `Paper ${action}d successfully (offline mode).` });
    }
  } catch (err: any) {
    console.error("Paper moderation error:", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
