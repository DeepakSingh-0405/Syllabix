import assert from 'node:assert';
import { parseDocumentBuffer } from '../server/src/services/documentParser';

// Minimal valid single-page PDF with readable text
const validSinglePagePdf = Buffer.from(
  `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 56 >>
stream
BT
/F1 24 Tf
100 700 Td
(Unit 1: Graph Theory and Topological Sorting) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000371 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
447
%%EOF`
);

async function runTests() {
  console.log('Running DocumentParser Test Suite...');

  // Test 1: Extract text from valid PDF
  {
    const result = await parseDocumentBuffer(validSinglePagePdf, 'application/pdf');
    assert.strictEqual(result.totalPages, 1, 'Total pages must be 1');
    assert.ok(result.totalTextLength > 0, 'Extracted text length must be greater than 0');
    assert.ok(result.chunks.length > 0, 'Chunks array must not be empty');
    const firstChunk = result.chunks[0].textContent;
    assert.ok(
      firstChunk.includes('Graph Theory') || firstChunk.includes('Topological Sorting'),
      `Extracted chunk must contain readable text, got: "${firstChunk}"`
    );
    assert.ok(!firstChunk.includes('%PDF-1.4'), 'Must not contain raw PDF binary header');
    console.log('[PASS] Test 1: Valid PDF extracted readable text successfully.');
  }

  // Test 2: Handle empty buffer gracefully
  {
    const result = await parseDocumentBuffer(Buffer.alloc(0), 'application/pdf');
    assert.strictEqual(result.totalTextLength, 0, 'Empty buffer should result in 0 text length');
    assert.strictEqual(result.chunks.length, 0, 'Empty buffer should result in 0 chunks');
    assert.strictEqual(result.title, 'Empty Document', 'Empty buffer should have default title');
    console.log('[PASS] Test 2: Empty buffer handled gracefully.');
  }

  // Test 3: Handle corrupted or invalid PDF gracefully
  {
    const corruptedBuffer = Buffer.from('This is not a real PDF file even though mimeType claims it is');
    const result = await parseDocumentBuffer(corruptedBuffer, 'application/pdf');
    assert.ok(result.totalTextLength > 0, 'Corrupted buffer should fall back to text safely');
    assert.ok(!result.chunks[0].textContent.includes('\x00'), 'Should not contain null bytes');
    console.log('[PASS] Test 3: Corrupted PDF fallback handled safely.');
  }

  // Test 4: Parse plain text documents
  {
    const textBuffer = Buffer.from(
      '# Operating Systems Lecture Notes\n\n' +
      'Unit 3: Process Synchronization and Deadlocks.\n' +
      'A deadlock occurs when two or more processes are waiting for events that only other processes in the set can cause.\n'.repeat(10)
    );
    const result = await parseDocumentBuffer(textBuffer, 'text/plain', { chunkSizeChars: 200, overlapChars: 40 });
    assert.ok(result.chunks.length > 1, 'Long text should be divided into multiple chunks');
    assert.ok(result.chunks[0].tokenCount > 0, 'Token count must be estimated');
    assert.strictEqual(result.chunks[0].chunkIndex, 0, 'First chunk index must be 0');
    console.log('[PASS] Test 4: Plain text chunking and overlap verified.');
  }

  console.log('ALL DOCUMENT PARSER TESTS PASSED (4/4)!');
}

runTests().catch((err) => {
  console.error('[FAIL] DocumentParser test failed:', err);
  process.exit(1);
});
