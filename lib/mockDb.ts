// In-memory global database to fallback when MongoDB/Redis is not whitelisted or offline.
// This allows the Netlify deployment and local demo to run flawlessly without crashes.

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
  createdAt: string;
}

// Persist the in-memory array across Next.js fast-reloads
let globalWithMockDb = global as typeof globalThis & {
  mockUsers: MockUser[];
};

if (!globalWithMockDb.mockUsers) {
  globalWithMockDb.mockUsers = [
    {
      _id: "USR-MOCKSTUDENT1",
      name: "Alice Vance",
      email: "alice@student.ai",
      phone: "+91 98765 43210",
      status: "Active",
      isLabApproved: false,
      points: 150,
      rank: "Bronze",
      branch: "Computer Science",
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
      bio: "Data science enthusiast and competitive programmer.",
      createdAt: new Date().toISOString(),
    }
  ];
}

export const mockUsers = globalWithMockDb.mockUsers;
