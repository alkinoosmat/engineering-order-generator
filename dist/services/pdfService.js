"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePDF = parsePDF;
exports.createResponsePDF = createResponsePDF;
const pdf_lib_1 = require("pdf-lib");
const fs_1 = require("fs");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
function parsePDF(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileData = (0, fs_1.readFileSync)(filePath);
        const pdfData = yield (0, pdf_parse_1.default)(fileData);
        return pdfData.text;
    });
}
function createResponsePDF(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const pdfDoc = yield pdf_lib_1.PDFDocument.create();
        let page = pdfDoc.addPage([600, 800]); // Set page dimensions (A4)
        const font = yield pdfDoc.embedFont(pdf_lib_1.StandardFonts.Helvetica);
        const fontSize = 12;
        const headerFontSize = 16;
        const margin = 50;
        let yPosition = 750; // Start near the top of the page
        // Helper function to wrap text to fit within a specific width
        function wrapText(text, maxWidth) {
            const lines = [];
            let line = '';
            const words = text.split(' ');
            for (const word of words) {
                const testLine = line + word + ' ';
                const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
                if (lineWidth > maxWidth && line.length > 0) {
                    lines.push(line.trim());
                    line = word + ' ';
                }
                else {
                    line = testLine;
                }
            }
            lines.push(line.trim()); // Push the final line
            return lines;
        }
        // Helper function to wrap header text to fit within a specific width
        function wrapHeaderText(text, maxWidth) {
            const lines = [];
            let line = '';
            const words = text.split(' ');
            for (const word of words) {
                const testLine = line + word + ' ';
                const lineWidth = font.widthOfTextAtSize(testLine, headerFontSize);
                if (lineWidth > maxWidth && line.length > 0) {
                    lines.push(line.trim());
                    line = word + ' ';
                }
                else {
                    line = testLine;
                }
            }
            lines.push(line.trim()); // Push the final line
            return lines;
        }
        // Define function to add a section header
        function addHeader(text) {
            const lines = wrapHeaderText(text, page.getWidth() - 2 * margin);
            for (const line of lines) {
                page.drawText(line, {
                    x: margin,
                    y: yPosition,
                    size: headerFontSize,
                    font,
                    color: (0, pdf_lib_1.rgb)(0, 0, 0.6), // Dark blue for headers
                });
                yPosition -= headerFontSize + 5; // Adjust space after each line of header
                if (yPosition < margin) {
                    page = pdfDoc.addPage([600, 800]);
                    yPosition = 750; // Reset position for new page
                }
            }
            yPosition -= 10; // Space after the entire header
        }
        // Define function to add body text with bullet point detection
        function addBodyText(text) {
            const lines = text.split('\n'); // Split text by newlines for line-by-line handling
            for (const line of lines) {
                const isBullet = line.trim().startsWith('-'); // Check if line starts with a bullet
                const bulletIndent = isBullet ? margin + 15 : margin; // Indent bullets slightly
                const wrappedLines = wrapText(line, page.getWidth() - bulletIndent - margin);
                for (const wrappedLine of wrappedLines) {
                    page.drawText(wrappedLine, {
                        x: bulletIndent,
                        y: yPosition,
                        size: fontSize,
                        font,
                        color: (0, pdf_lib_1.rgb)(0, 0, 0),
                    });
                    yPosition -= fontSize + 5; // Space between lines
                    // Check for page overflow
                    if (yPosition < margin) {
                        page = pdfDoc.addPage([600, 800]);
                        yPosition = 750; // Reset position for new page
                    }
                }
                yPosition -= fontSize; // Extra space after each bullet item
            }
            yPosition -= fontSize; // Space after body text
        }
        // Parsing and formatting content into structured sections
        const sections = text.split('\n\n'); // Assuming sections are separated by double newlines
        for (const section of sections) {
            const [firstLine, ...rest] = section.split('\n');
            addHeader(firstLine.trim()); // First line as header
            addBodyText(rest.join(' ')); // Rest of the section as body text
        }
        return Buffer.from(yield pdfDoc.save());
    });
}
