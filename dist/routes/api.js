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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfService_1 = require("../services/pdfService");
const chatgptService_1 = require("../services/chatgptService");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
// Ensure generated directory exists
const generatedDir = path_1.default.join(__dirname, '..', 'generated');
if (!fs_1.default.existsSync(generatedDir)) {
    fs_1.default.mkdirSync(generatedDir);
}
router.post('/generate-engineering-order', upload.single('pdf'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // Step 1: Extract text from PDF
        const pdfText = yield (0, pdfService_1.parsePDF)(req.file.path);
        // Step 2: Send extracted text to ChatGPT
        const prompt = 'Create an engineering order based on this service bulletin in a formal EO format';
        const chatGPTResponse = yield (0, chatgptService_1.sendToChatGPT)(prompt, pdfText);
        // Step 3: Generate a response PDF with ChatGPT's answer
        const responsePdfBuffer = yield (0, pdfService_1.createResponsePDF)(chatGPTResponse);
        // Save the PDF to a file and return the download link
        const outputFilePath = path_1.default.join(generatedDir, 'engineering_order.pdf');
        fs_1.default.writeFileSync(outputFilePath, responsePdfBuffer);
        // Respond with a link to download the PDF
        const downloadUrl = `${req.protocol}://${req.get('host')}/api/download?file=engineering_order.pdf`;
        res.json({ downloadUrl });
    }
    catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Download route to serve generated files
router.get('/download', (req, res) => {
    const file = req.query.file;
    const filePath = path_1.default.join(generatedDir, file);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }
    res.download(filePath, file, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error downloading file');
        }
    });
});
exports.default = router;
