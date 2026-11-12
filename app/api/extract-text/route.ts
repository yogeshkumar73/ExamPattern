import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 30

// Pure JS stream text extractor as zero-dependency fallback for PDFs
function extractTextFromRawPdfBuffer(buffer: Buffer): string {
  try {
    const raw = buffer.toString("binary");
    const textPieces: string[] = [];

    // Extract text between BT (Begin Text) and ET (End Text) blocks
    const btRegex = /BT[\s\S]*?ET/g;
    const matches = raw.match(btRegex);

    if (matches && matches.length > 0) {
      for (const block of matches) {
        // Match string literals: (text) Tj or [(text)] TJ
        const strRegex = /\(([^)]+)\)\s*(?:Tj|'|")/g;
        let match;
        while ((match = strRegex.exec(block)) !== null) {
          textPieces.push(match[1]);
        }

        // Match hex strings: <48656c6c6f> Tj
        const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g;
        while ((match = hexRegex.exec(block)) !== null) {
          const hex = match[1];
          let str = "";
          for (let i = 0; i < hex.length; i += 2) {
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
          }
          textPieces.push(str);
        }
      }
    }

    // If text was found in uncompressed streams
    if (textPieces.length > 0) {
      return textPieces.join(" ").replace(/\\([()\\])/g, "$1").trim();
    }

    // Simple ASCII word scanner as final fallback
    const printable = raw.replace(/[^\x20-\x7E\r\n\t]/g, " ");
    const words = printable
      .split(/\s+/)
      .filter((w) => w.length > 3 && !w.startsWith("/") && !w.includes("obj") && !w.includes("endobj"));

    if (words.length > 15) {
      return words.join(" ").slice(0, 50000);
    }
  } catch (_) {}

  return "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Security check 1: Enforce maximum file size (15MB) to prevent Denial of Service
    const MAX_ALLOWED_FILE_BYTES = 15 * 1024 * 1024;
    if (file.size > MAX_ALLOWED_FILE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum permitted size of 15 MB." },
        { status: 413 }
      );
    }

    // Security check 2: Prevent dangerous binary executables and scripts
    const rawFileName = file.name || "";
    const sanitizedFileName = rawFileName.replace(/[/\\]/g, "").replace(/\.\./g, "");
    const fileName = sanitizedFileName.toLowerCase();
    const fileType = (file.type || "").toLowerCase();

    if (/\.(exe|bat|cmd|sh|ps1|vbs|dll|so|msi|scr|jar|com)$/i.test(fileName)) {
      return NextResponse.json(
        { error: "Executable and script files are strictly blocked for security." },
        { status: 400 }
      );
    }

    // ==========================================
    // 1. TEXT, MARKDOWN, CODE & DATA FILES
    // ==========================================
    if (
      fileType.startsWith("text/") ||
      fileType.includes("json") ||
      fileType.includes("csv") ||
      fileType === "" ||
      fileType === "application/octet-stream" ||
      /\.(txt|md|markdown|csv|json|rtf|log|tex|py|js|ts|java|c|cpp|html|xml|yaml|yml)$/i.test(fileName)
    ) {
      try {
        const text = await file.text();
        if (text && text.trim().length > 0) {
          return NextResponse.json({
            success: true,
            fileName: file.name,
            text,
          });
        }
      } catch (_) {}
    }

    // ==========================================
    // 2. PDF EXTRACTION (Serverless-Optimized)
    // ==========================================
    if (fileType === "application/pdf" || fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Attempt A: unpdf (Serverless-native, zero native binaries)
      try {
        const { getDocumentProxy, extractText } = await import("unpdf");
        const uint8Array = new Uint8Array(buffer);
        const pdf = await getDocumentProxy(uint8Array);
        const result = await extractText(pdf, { mergePages: true });

        if (result?.text && result.text.trim().length > 0) {
          return NextResponse.json({
            success: true,
            fileName: file.name,
            text: result.text.trim(),
          });
        }
      } catch (unpdfError) {
        console.warn("[unpdf serverless warning, trying secondary fallback]:", unpdfError);
      }

      // Attempt B: pdf-parse (dynamic import)
      try {
        const pdfParseModule = await import("pdf-parse");
        const PDFParseClass = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default || pdfParseModule;

        if (typeof PDFParseClass === "function") {
          const pdfParser = new PDFParseClass({ data: buffer });
          const data = await pdfParser.getText();
          try {
            await (pdfParser as any).destroy?.();
          } catch {}

          if (data?.text && data.text.trim().length > 0) {
            return NextResponse.json({
              success: true,
              fileName: file.name,
              text: data.text.trim(),
            });
          }
        }
      } catch (pdfParseError) {
        console.warn("[pdf-parse warning, trying raw stream extractor]:", pdfParseError);
      }

      // Attempt C: Pure JS raw stream parser (always succeeds even if PDF worker is unavailable)
      const rawText = extractTextFromRawPdfBuffer(buffer);
      if (rawText && rawText.length > 50) {
        return NextResponse.json({
          success: true,
          fileName: file.name,
          text: rawText,
        });
      }

      // Attempt D: Fallback to text reader
      try {
        const textFallback = await file.text();
        if (textFallback && textFallback.trim().length > 20) {
          return NextResponse.json({
            success: true,
            fileName: file.name,
            text: textFallback,
          });
        }
      } catch (_) {}

      return NextResponse.json({
        success: false,
        error: "Unable to extract readable text from this PDF. Please copy and paste the syllabus text directly, or try another PDF/text file.",
      }, { status: 422 });
    }

    // ==========================================
    // 3. IMAGE OCR
    // ==========================================
    if (fileType.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif)$/i.test(fileName)) {
      try {
        const Tesseract = (await import("tesseract.js")).default;
        const buffer = Buffer.from(await file.arrayBuffer());
        const result = await Tesseract.recognize(buffer, "eng");

        if (result?.data?.text && result.data.text.trim().length > 0) {
          return NextResponse.json({
            success: true,
            fileName: file.name,
            text: result.data.text,
          });
        }
      } catch (ocrErr) {
        console.warn("[Tesseract OCR Error]:", ocrErr);
        return NextResponse.json({
          success: false,
          error: "Image OCR is currently unavailable on serverless. Please paste syllabus text or upload a PDF/text file.",
        }, { status: 422 });
      }
    }

    // ==========================================
    // 4. UNIVERSAL FALLBACK
    // ==========================================
    try {
      const text = await file.text();
      if (text && text.trim().length > 0) {
        return NextResponse.json({
          success: true,
          fileName: file.name,
          text,
        });
      }
    } catch {}

    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF, TXT, or Markdown document.`,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[EXTRACT_TEXT_ERROR]", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to extract text from document.",
      },
      { status: 500 }
    );
  }
}
