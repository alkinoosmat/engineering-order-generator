import express from 'express';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

// Configure environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Start the server
app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
