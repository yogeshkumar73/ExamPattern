import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Paper from "@/models/Paper";
import { mockPapers } from "@/lib/mockDb";
import { checkRateLimit, getClientIp } from "@/lib/ratelimit";

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

// GET /api/papers/[id]/download
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = getClientIp(req);
    const rl = checkRateLimit(`download:${ip}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { message: `Download rate limit exceeded. Try again in ${rl.resetIn}s.` },
        { status: 429 }
      );
    }

    const sessionUser = getSessionUser(req);
    if (!sessionUser?.id) {
      return NextResponse.json({ message: "Authentication required." }, { status: 401 });
    }

    const { id } = await params;

    try {
      await dbConnect();

      const paper = await Paper.findById(id);
      if (!paper) {
        return NextResponse.json({ message: "Paper not found." }, { status: 404 });
      }

      // Community Repository: allow all users to download approved papers freely
      // Increment download count
      await Paper.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

      // Return file data for download
      return NextResponse.json({
        title: paper.title,
        fileName: paper.fileName || `${paper.title.replace(/\s+/g, '_')}.pdf`,
        fileType: paper.fileType || "application/pdf",
        fileData: paper.fileData || "",
      });
    } catch (dbErr) {
      console.warn("MongoDB unavailable, using mock papers:", dbErr);

      const paper = mockPapers.find((p) => p._id === id);
      if (!paper) {
        return NextResponse.json({ message: "Paper not found." }, { status: 404 });
      }

      paper.downloads += 1;

      return NextResponse.json({
        title: paper.title,
        fileName: paper.fileName || `${paper.title.replace(/\s+/g, '_')}.pdf`,
        fileType: paper.fileType || "application/pdf",
        fileData: paper.fileData || "",
      });
    }
  } catch (error: any) {
    console.error("Download Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
