/**
 * Integration Test Suite for Smart Lab RAG
 * Run: npm run test:integration or node scripts/test-integration.js
 */

const axios = require("axios");

const API_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logWarning(message) {
  log(`⚠️  ${message}`, "yellow");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "blue");
}

async function testEndpointHealth() {
  logInfo("Testing endpoint health...");
  try {
    const response = await axios.get(`${API_URL}/api/ai/content-generation`);
    if (response.status === 200 && response.data.success) {
      logSuccess("Content Generation API is healthy");
      return true;
    } else {
      logError("Endpoint returned unexpected response");
      return false;
    }
  } catch (error) {
    logError(`Failed to connect to API: ${error.message}`);
    return false;
  }
}

async function testGenerateQuestions() {
  logInfo("Testing question generation...");
  try {
    const response = await axios.post(`${API_URL}/api/ai/content-generation`, {
      action: "generate-questions",
      topic: "Basic Algorithms",
      difficulty: "Easy",
      category: "Data Structures",
      count: 1,
    });

    if (response.status === 200 && response.data.success) {
      const questions = response.data.data.questions;
      if (questions && questions.length > 0) {
        logSuccess("Question generation working");
        logInfo(`Generated question: "${questions[0].title}"`);
        return true;
      } else {
        logError("No questions generated");
        return false;
      }
    } else {
      logError("Question generation failed");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 500 && error.message.includes("OPEN_ROUTER_API_KEY")) {
      logWarning("Open Router API key not configured (expected if not set up yet)");
      logInfo("To enable this test: Set OPEN_ROUTER_API_KEY in .env.local");
      return true; // Not a failure, just not configured
    }
    logError(`Question generation error: ${error.message}`);
    return false;
  }
}

async function testContentSafety() {
  logInfo("Testing content safety check...");
  try {
    const response = await axios.post(`${API_URL}/api/ai/content-generation`, {
      action: "check-safety",
      text: "This is a safe educational question about programming.",
      context: "Educational",
    });

    if (response.status === 200 && response.data.success) {
      const safety = response.data.data;
      logSuccess("Content safety check working");
      logInfo(`Safety Score: ${safety.score.toFixed(2)}, Safe: ${safety.isSafe}`);
      return true;
    } else {
      logError("Content safety check failed");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 500 && error.message.includes("OPEN_ROUTER_API_KEY")) {
      logWarning("Open Router API key not configured");
      return true;
    }
    logError(`Content safety error: ${error.message}`);
    return false;
  }
}

async function testRAGQuestions() {
  logInfo("Testing RAG-enhanced question generation...");
  try {
    const response = await axios.post(`${API_URL}/api/ai/content-generation`, {
      action: "rag-questions",
      topic: "Binary Search Trees",
      difficulty: "Medium",
      category: "Data Structures",
      contextDocuments: [
        "A binary search tree (BST) is a node-based binary tree data structure with the property that the value in each node must be greater than (or equal to) any value stored in the left sub-tree, and less than (or equal to) any value stored in the right sub-tree.",
      ],
    });

    if (response.status === 200 && response.data.success) {
      const questions = response.data.data.questions;
      logSuccess("RAG question generation working");
      logInfo(`Generated ${questions.length} question(s) with context`);
      return true;
    } else {
      logError("RAG question generation failed");
      return false;
    }
  } catch (error) {
    if (error.response?.status === 500 && error.message.includes("OPEN_ROUTER_API_KEY")) {
      logWarning("Open Router API key not configured");
      return true;
    }
    logError(`RAG generation error: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log("\n🧪 Smart Lab RAG Integration Tests", "blue");
  log("==================================\n", "blue");

  const tests = [
    { name: "Endpoint Health", fn: testEndpointHealth },
    { name: "Question Generation", fn: testGenerateQuestions },
    { name: "Content Safety", fn: testContentSafety },
    { name: "RAG Questions", fn: testRAGQuestions },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    log(`\nRunning: ${test.name}...`, "gray");
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  log("\n==================================", "blue");
  log(`Test Results: ${passed} passed, ${failed} failed`, "blue");

  if (failed === 0) {
    logSuccess("All tests passed! 🎉");
  } else if (failed <= tests.length / 2) {
    logWarning("Some tests need attention");
  } else {
    logError("Most tests failed. Check your setup.");
  }

  log("==================================\n", "blue");

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  logError(`Test suite error: ${error.message}`);
  process.exit(1);
});
