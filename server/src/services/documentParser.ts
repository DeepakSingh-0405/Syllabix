// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseModule = require('pdf-parse');
const pdfParse = typeof pdfParseModule === 'function' ? pdfParseModule : (pdfParseModule?.default || pdfParseModule);

export interface ParsedChunk {
  chunkIndex: number;
  pageNumber: number;
  textContent: string;
  tokenCount: number;
  sectionTitle: string;
}

export interface ParseResult {
  title: string;
  totalPages: number;
  totalTextLength: number;
  chunks: ParsedChunk[];
}

/**
 * Parses raw document buffer (PDF, plaintext, etc.) and chunks content with sliding window overlap
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  mimeType: string,
  options: { chunkSizeChars?: number; overlapChars?: number } = {}
): Promise<ParseResult> {
  const chunkSize = options.chunkSizeChars || 1800; // ~450 tokens
  const overlap = options.overlapChars || 180;      // ~10% overlap

  let rawText = '';
  let totalPages = 1;

  if (mimeType === 'application/pdf') {
    try {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || '';
      totalPages = pdfData.numpages || 1;
    } catch (err) {
      console.warn('[DocumentParser] PDF parsing failed, extracting as UTF-8 string:', err);
      rawText = buffer.toString('utf-8');
    }
  } else {
    rawText = buffer.toString('utf-8');
  }

  // Clean and normalize text
  const cleanText = rawText.replace(/\r\n/g, '\n').replace(/\t/g, ' ').trim();

  if (!cleanText) {
    return {
      title: 'Empty Document',
      totalPages: 1,
      totalTextLength: 0,
      chunks: [],
    };
  }

  // Split into chunks with sliding overlap
  const chunks: ParsedChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  // Approximate page distribution
  const charsPerPage = Math.max(Math.floor(cleanText.length / Math.max(totalPages, 1)), 1);

  while (startIndex < cleanText.length) {
    const endIndex = Math.min(startIndex + chunkSize, cleanText.length);
    let chunkText = cleanText.substring(startIndex, endIndex).trim();

    if (chunkText.length > 50) { // filter out negligible fragments
      const approxPage = Math.min(Math.floor(startIndex / charsPerPage) + 1, totalPages);

      // Attempt to extract section title from first capitalized line
      const firstLine = chunkText.split('\n')[0]?.trim() || '';
      const sectionTitle = firstLine.length < 80 ? firstLine : `Page ${approxPage} Content`;

      chunks.push({
        chunkIndex,
        pageNumber: approxPage,
        textContent: chunkText,
        tokenCount: Math.ceil(chunkText.length / 4), // standard approximation ~4 chars / token
        sectionTitle,
      });

      chunkIndex++;
    }

    if (endIndex >= cleanText.length) break;
    startIndex += (chunkSize - overlap);
  }

  return {
    title: chunks[0]?.sectionTitle || 'Course Document',
    totalPages,
    totalTextLength: cleanText.length,
    chunks,
  };
}
