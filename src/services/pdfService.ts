import fs from 'fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFileSync } from 'fs';
import pdfParse from 'pdf-parse';

export async function parsePDF(filePath: string): Promise<string> {
	const fileData = readFileSync(filePath);
	const pdfData = await pdfParse(fileData);
	return pdfData.text;
}

export async function createResponsePDF(text: string): Promise<Buffer> {
	const pdfDoc = await PDFDocument.create();
	let page = pdfDoc.addPage([600, 800]); // Set page dimensions (A4)

	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
	const fontSize = 12;
	const headerFontSize = 16;
	const margin = 50;
	let yPosition = 750; // Start near the top of the page

	// Helper function to wrap text to fit within a specific width
	function wrapText(text: string, maxWidth: number) {
		const lines: string[] = [];
		let line = '';
		const words = text.split(' ');
		for (const word of words) {
			const testLine = line + word + ' ';
			const lineWidth = font.widthOfTextAtSize(testLine, fontSize);
			if (lineWidth > maxWidth && line.length > 0) {
				lines.push(line.trim());
				line = word + ' ';
			} else {
				line = testLine;
			}
		}
		lines.push(line.trim()); // Push the final line
		return lines;
	}

	// Helper function to wrap header text to fit within a specific width
	function wrapHeaderText(text: string, maxWidth: number) {
		const lines: string[] = [];
		let line = '';
		const words = text.split(' ');
		for (const word of words) {
			const testLine = line + word + ' ';
			const lineWidth = font.widthOfTextAtSize(testLine, headerFontSize);
			if (lineWidth > maxWidth && line.length > 0) {
				lines.push(line.trim());
				line = word + ' ';
			} else {
				line = testLine;
			}
		}
		lines.push(line.trim()); // Push the final line
		return lines;
	}

	// Define function to add a section header
	function addHeader(text: string) {
		const lines = wrapHeaderText(text, page.getWidth() - 2 * margin);
		for (const line of lines) {
			page.drawText(line, {
				x: margin,
				y: yPosition,
				size: headerFontSize,
				font,
				color: rgb(0, 0, 0.6), // Dark blue for headers
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
	function addBodyText(text: string) {
		const lines = text.split('\n'); // Split text by newlines for line-by-line handling
		for (const line of lines) {
			const isBullet = line.trim().startsWith('-'); // Check if line starts with a bullet
			const bulletIndent = isBullet ? margin + 15 : margin; // Indent bullets slightly

			const wrappedLines = wrapText(
				line,
				page.getWidth() - bulletIndent - margin,
			);
			for (const wrappedLine of wrappedLines) {
				page.drawText(wrappedLine, {
					x: bulletIndent,
					y: yPosition,
					size: fontSize,
					font,
					color: rgb(0, 0, 0),
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

	return Buffer.from(await pdfDoc.save());
}
