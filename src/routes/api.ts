import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { parsePDF, createResponsePDF } from '../services/pdfService';
import { sendToChatGPT } from '../services/chatgptService';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Ensure generated directory exists
const generatedDir = path.join(__dirname, '..', 'generated');
if (!fs.existsSync(generatedDir)) {
	fs.mkdirSync(generatedDir);
}

router.post(
	'/generate-engineering-order',
	upload.single('pdf'),
	async (req: Request, res: Response): Promise<void> => {
		try {
			if (!req.file) {
				res.status(400).json({ error: 'No file uploaded' });
				return;
			}

			// Step 1: Extract text from PDF
			const pdfText = await parsePDF(req.file.path);

			// Step 2: Send extracted text to ChatGPT
			const prompt =
				'Create an engineering order based on this service bulletin in a formal EO format';
			const chatGPTResponse = await sendToChatGPT(prompt, pdfText);

			// Step 3: Generate a response PDF with ChatGPT's answer
			const responsePdfBuffer = await createResponsePDF(chatGPTResponse);

			// Save the PDF to a file and return the download link
			const outputFilePath = path.join(generatedDir, 'engineering_order.pdf');
			fs.writeFileSync(outputFilePath, responsePdfBuffer);

			// Respond with a link to download the PDF
			const downloadUrl = `${req.protocol}://${req.get(
				'host',
			)}/api/download?file=engineering_order.pdf`;
			res.json({ downloadUrl });
		} catch (error) {
			console.error('Error processing request:', error);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	},
);

// Download route to serve generated files
router.get('/download', (req: Request, res: Response) => {
	const file = req.query.file as string;
	const filePath = path.join(generatedDir, file);

	if (!fs.existsSync(filePath)) {
		return res.status(404).send('File not found');
	}

	res.download(filePath, file, (err) => {
		if (err) {
			console.error('Error sending file:', err);
			res.status(500).send('Error downloading file');
		}
	});
});

export default router;
