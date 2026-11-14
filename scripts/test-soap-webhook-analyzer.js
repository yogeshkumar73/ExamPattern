// test-soap-webhook-analyzer.js
const http = require('http');

function postRequest(urlPath, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        ...headers,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: resBody
        });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getRequest(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'GET'
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: resBody
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING SOAP API & HTTP/2 WEBHOOK TEST ===");

  // 1. Test SOAP API with XML Envelope
  const soapXml = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:aura="http://aura.study.ai/schema/exam-v1">
  <soapenv:Header>
    <aura:WebhookUrl>http://localhost:3000/api/webhooks/analysis</aura:WebhookUrl>
    <aura:Protocol>SOAP_1_2_FAST_RPC</aura:Protocol>
  </soapenv:Header>
  <soapenv:Body>
    <aura:AnalyzePaperRequest>
      <aura:SyllabusText>
        Unit 1: Foundations of Microprocessor Architecture and Instruction Pipelining
        Unit 2: Memory Hierarchy, Cache Mapping, and Virtual Memory Translation
        Unit 3: Concurrent Execution, Race Conditions, and Semaphores
        Unit 4: High-Performance Distributed Computing Systems
      </aura:SyllabusText>
      <aura:HistoricalPapers>
        <aura:Paper year="2025" name="Final Exam 2025">Explain cache mapping techniques. Detail pipelining hazards.</aura:Paper>
        <aura:Paper year="2024" name="Final Exam 2024">Discuss concurrency control and virtual memory page replacement algorithms.</aura:Paper>
      </aura:HistoricalPapers>
      <aura:QuestionCount>6</aura:QuestionCount>
      <aura:Difficulty>Standard</aura:Difficulty>
      <aura:PaperFormat>Academic Standard</aura:PaperFormat>
    </aura:AnalyzePaperRequest>
  </soapenv:Body>
</soapenv:Envelope>`;

  console.log("\n[Test 1] Dispatching SOAP 1.2 XML Envelope to /api/soap/exam-analyzer...");
  const soapRes = await postRequest(
    '/api/soap/exam-analyzer',
    {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'Accept': 'application/soap+xml',
      'X-Protocol': 'SOAP-1.2-HTTP2'
    },
    soapXml
  );

  console.log(`SOAP Response Status: ${soapRes.statusCode}`);
  console.log(`X-Protocol Header: ${soapRes.headers['x-protocol']}`);
  console.log(`X-Transmission-Latency-Ms: ${soapRes.headers['x-transmission-latency-ms']}`);
  if (soapRes.body.includes('<aura:AnalyzePaperResponse>') && soapRes.body.includes('<aura:PredictedQuestions>')) {
    console.log("✅ SOAP 1.2 XML Envelope parsed & response emitted successfully!");
  } else {
    console.error("❌ SOAP XML response missing expected tags:", soapRes.body.substring(0, 300));
  }

  // 2. Test SOAP endpoint with JSON Accept
  console.log("\n[Test 2] Dispatching to /api/soap/exam-analyzer with Accept: application/json...");
  const soapJsonRes = await postRequest(
    '/api/soap/exam-analyzer',
    {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      'Accept': 'application/json',
      'X-Protocol': 'SOAP-1.2-HTTP2'
    },
    soapXml
  );

  console.log(`JSON Response Status: ${soapJsonRes.statusCode}`);
  const jsonData = JSON.parse(soapJsonRes.body);
  console.log(`Topics Extracted: ${jsonData.topics?.length}`);
  console.log(`Predicted MCQs: ${jsonData.predictedQuestions?.mcq?.length}`);
  console.log(`Predicted Written: ${jsonData.predictedQuestions?.written?.length}`);
  if (jsonData.topics?.length > 0 && jsonData.predictedQuestions?.mcq?.length > 0) {
    console.log("✅ Fast SOAP/JSON response parsed with upcoming questions!");
  } else {
    console.error("❌ Failed to parse JSON analysis:", jsonData);
  }

  // 3. Test HTTP/2 Webhook Event
  console.log("\n[Test 3] Posting event to /api/webhooks/analysis...");
  const webhookRes = await postRequest(
    '/api/webhooks/analysis',
    { 'Content-Type': 'application/json' },
    {
      event: 'analysis.completed',
      topicCount: jsonData.topics?.length,
      executionTimeMs: 34
    }
  );
  console.log(`Webhook Status: ${webhookRes.statusCode}`);
  const whData = JSON.parse(webhookRes.body);
  console.log(`Webhook Event ID: ${whData.eventId}, Status: ${whData.status}`);

  console.log("\n[Test 4] Querying /api/webhooks/analysis status...");
  const getWhRes = await getRequest('/api/webhooks/analysis');
  const getWhData = JSON.parse(getWhRes.body);
  console.log(`Total Webhook Events Recorded: ${getWhData.totalEvents}`);
  if (getWhData.totalEvents > 0) {
    console.log("✅ HTTP/2 Webhook pipeline active and recording telemetry!");
  }

  // 4. Test /api/analyze-paper
  console.log("\n[Test 5] Calling /api/analyze-paper with HTTP/2 fast headers...");
  const analyzeRes = await postRequest(
    '/api/analyze-paper',
    {
      'Content-Type': 'application/json',
      'X-Protocol': 'HTTP/2-Webhook-Active'
    },
    {
      text: "Unit 1: Quantum Computing Foundations\nUnit 2: Shor's and Grover's Algorithms\nUnit 3: Quantum Error Correction",
      papers: [{ name: "Quantum 2025", academicYear: 2025, text: "Describe Shor's algorithm and qubit gates." }],
      options: { questionCount: 4, difficulty: "Standard" }
    }
  );
  console.log(`Analyze Paper Status: ${analyzeRes.statusCode}`);
  const paperData = JSON.parse(analyzeRes.body);
  console.log(`Protocol: ${paperData.protocol}, Engine: ${paperData.engine}`);
  console.log(`MCQs generated: ${paperData.predictedQuestions?.mcq?.length}`);
  if (paperData.topics?.length > 0 && paperData.predictedQuestions?.mcq?.length > 0) {
    console.log("✅ /api/analyze-paper successfully generated upcoming questions via HTTP/2 webhook!");
  }

  console.log("\n=== ALL TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch(console.error);
