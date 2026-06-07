import { type NextRequest, NextResponse } from "next/server"
import Tesseract from "tesseract.js"
import { PDFParse } from "pdf-parse"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // =========================
    // TEXT FILES
    // =========================
    if (file.type === "text/plain") {
      const text = await file.text();

      return NextResponse.json({
        success: true,
        fileName: file.name,
        text,
      });
    }

    // =========================
    // IMAGE OCR
    // =========================
    if (file.type.startsWith("image/")) {
      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      const result = await Tesseract.recognize(
        buffer,
        "eng"
      );

      return NextResponse.json({
        success: true,
        fileName: file.name,
        text: result.data.text,
      });
    }

    // =========================
    // PDF EXTRACTION
    // =========================
    if (file.type === "application/pdf") {
      const buffer = Buffer.from(
        await file.arrayBuffer()
      );

      const pdfParser = new PDFParse({ data: buffer });
      const data = await pdfParser.getText();

      return NextResponse.json({
        success: true,
        fileName: file.name,
        text: data.text,
      });
    }

    return NextResponse.json(
      {
        error: `Unsupported file type: ${file.type}`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "[EXTRACT_TEXT_ERROR]",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to extract text",
      },
      { status: 500 }
    );
  }
}