// In-memory global database to fallback when MongoDB is offline.
// Allows the app to run without a live MongoDB connection.

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  status: "Active" | "Inactive";
  isLabApproved: boolean;
  points: number;
  rank: "Bronze" | "Silver" | "Gold" | "Platinum";
  branch?: string;
  bio?: string;
  photoUrl?: string;
  stream?: string;
  course?: string;
  department?: string;
  grade?: string;
  role?: "student" | "admin";
  profileComplete?: boolean;
  createdAt: string;
}

export interface MockPaper {
  _id: string;
  title: string;
  description?: string;
  stream: string;
  section?: string;
  branch?: string;
  year: string;
  uploadedBy: string;
  uploadedByName: string;
  fileData?: string;
  fileName?: string;
  fileType?: string;
  downloads: number;
  isApproved: boolean;
  createdAt: string;
}

// Persist the in-memory arrays across Next.js hot-reloads
const g = global as typeof globalThis & {
  mockUsers: MockUser[];
  mockPapers: MockPaper[];
};

if (!g.mockUsers) {
  g.mockUsers = [
    {
      _id: "USR-MOCKSTUDENT1",
      name: "Alice Vance",
      email: "alice@student.ai",
      phone: "+91 98765 43210",
      status: "Active",
      isLabApproved: true,
      points: 150,
      rank: "Bronze",
      branch: "Computer Science",
      stream: "gate",
      course: "B.Tech CSE",
      department: "Engineering",
      grade: "",
      role: "student",
      profileComplete: true,
      bio: "Aspiring software engineer exploring AI and Cloud computing.",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "USR-MOCKSTUDENT2",
      name: "Kabir Sharma",
      email: "kabir@student.ai",
      phone: "+91 99999 88888",
      status: "Active",
      isLabApproved: true,
      points: 540,
      rank: "Gold",
      branch: "Information Technology",
      stream: "ssc",
      course: "SSC CGL",
      department: "Civil Services",
      grade: "",
      role: "student",
      profileComplete: true,
      bio: "Data science enthusiast and competitive programmer.",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "USR-ADMIN",
      name: "Admin",
      email: "admin@aura.ai",
      phone: "+91 00000 00000",
      status: "Active",
      isLabApproved: true,
      points: 9999,
      rank: "Platinum",
      branch: "Administration",
      stream: "other",
      course: "Administration",
      department: "Admin",
      grade: "",
      role: "admin",
      profileComplete: true,
      bio: "Platform administrator.",
      createdAt: new Date().toISOString(),
    },
  ];
}

if (!g.mockPapers) {
  g.mockPapers = [
    {
      _id: "PAPER-001",
      title: "SSC CGL 2023 Previous Year Paper",
      description: "Complete SSC CGL 2023 Tier 1 paper with solutions",
      stream: "ssc",
      section: "SSC",
      branch: "SSC",
      year: "2023",
      uploadedBy: "USR-MOCKSTUDENT2",
      uploadedByName: "Kabir Sharma",
      fileData: "",
      fileName: "SSC_CGL_2023.pdf",
      fileType: "application/pdf",
      downloads: 42,
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "PAPER-002",
      title: "GATE CS 2024 Paper",
      description: "GATE Computer Science 2024 full paper",
      stream: "gate",
      section: "GATE",
      branch: "Computer Science",
      year: "2024",
      uploadedBy: "USR-MOCKSTUDENT1",
      uploadedByName: "Alice Vance",
      fileData: "",
      fileName: "GATE_CS_2024.pdf",
      fileType: "application/pdf",
      downloads: 88,
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
    {
      _id: "PAPER-003",
      title: "Class 10 CBSE Science 2024",
      description: "CBSE Class 10 Science Board Paper March 2024",
      stream: "class10",
      section: "CBSE",
      branch: "Science",
      year: "2024",
      uploadedBy: "USR-ADMIN",
      uploadedByName: "Admin",
      fileData: "",
      fileName: "CBSE_Class10_Science_2024.pdf",
      fileType: "application/pdf",
      downloads: 120,
      isApproved: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

export const mockUsers = g.mockUsers;
export const mockPapers = g.mockPapers;
