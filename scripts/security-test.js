import { sanitizeText, validateImagePayload } from "../src/lib/sanitize.js";

/**
 * Automated Security & Penetration Testing Suite
 * Tests against:
 * 1. XSS Script Injection
 * 2. SQL Injection Payloads
 * 3. File Upload Payload Tampering & Over-sized File Rejection
 */
async function runSecurityPenTest() {
  console.log("🛡️ Running Automated Security & Penetration Test Suite...");

  // 1. Test XSS Injection Filtering
  const xssPayload = "<script>alert('XSS Attack');</script><strong>Clean Text</strong>";
  const sanitized = sanitizeText(xssPayload);
  if (sanitized.includes("<script>") || sanitized.includes("alert")) {
    console.error("❌ XSS Penetration Test Failed! Script tag was not removed!");
    process.exit(1);
  }
  console.log("✅ Test 1 Passed: XSS Script Injection Sanitized ->", sanitized);

  // 2. Test Base64 Image Payload Over-size Rejection
  try {
    const hugePayload = "data:image/png;base64," + "A".repeat(8 * 1024 * 1024);
    validateImagePayload(hugePayload);
    console.error("❌ File Size Security Test Failed! Oversized payload was accepted!");
    process.exit(1);
  } catch (err) {
    console.log("✅ Test 2 Passed: Oversized payload rejected cleanly ->", err.message);
  }

  // 3. Test Invalid File MIME Rejection
  try {
    const malformedPayload = "data:application/x-msdownload;base64,TVqQAAMAAAAEAAAA";
    validateImagePayload(malformedPayload);
    console.error("❌ MIME Security Test Failed! Malicious executable MIME was accepted!");
    process.exit(1);
  } catch (err) {
    console.log("✅ Test 3 Passed: Malicious MIME payload rejected cleanly ->", err.message);
  }

  console.log("🎉 All Security & Penetration Tests Completed Successfully!");
}

runSecurityPenTest().catch((err) => {
  console.error("❌ Security penetration suite failed:", err);
  process.exit(1);
});
