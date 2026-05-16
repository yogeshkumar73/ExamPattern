import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For text files, read directly
    if (file.type === "text/plain") {
      const text = await file.text()
      return NextResponse.json({ text })
    }

    // For images, use OCR (simulated for now)
    if (file.type.startsWith("image/")) {
      // In production, integrate with OCR service like Tesseract.js or cloud OCR
      const simulatedText = `Sample Exam Paper

Subject: Computer Science
Duration: 3 Hours
Total Marks: 100

Section A: Multiple Choice Questions (20 marks)

1. What is the time complexity of binary search?
2. Which data structure uses LIFO principle?
3. What does SQL stand for?

Section B: Short Answer Questions (30 marks)

1. Explain the difference between stack and queue. (5 marks)
2. What is object-oriented programming? List its main principles. (10 marks)
3. Describe the working of a hash table. (8 marks)

Section C: Long Answer Questions (50 marks)

1. Explain various sorting algorithms with examples and time complexity analysis. (15 marks)
2. Discuss database normalization and its different forms. (20 marks)
3. Write a program to implement a binary search tree with insertion and deletion operations. (15 marks)`

      return NextResponse.json({ text: simulatedText })
    }

    // For PDFs, would need PDF parsing library
    if (file.type === "application/pdf") {
      // In production, use pdf-parse or similar library
      const simulatedText = `Advanced Mathematics Exam

Time: 2 Hours
Marks: 80

Part I: Calculus (40 marks)

1. Find the derivative of f(x) = x³ + 2x² - 5x + 3
2. Evaluate the integral ∫(2x + 3)dx
3. Solve the differential equation dy/dx = 2x + 1

Part II: Linear Algebra (40 marks)

1. Find the determinant of the given 3x3 matrix
2. Solve the system of linear equations using matrix method
3. Find eigenvalues and eigenvectors of the matrix`

      return NextResponse.json({ text: simulatedText })
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error in extract-text:", error)
    return NextResponse.json({ error: "Failed to extract text" }, { status: 500 })
  }
}
