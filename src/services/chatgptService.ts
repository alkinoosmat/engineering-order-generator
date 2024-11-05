import axios from 'axios';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export async function sendToChatGPT(
	prompt: string,
	pdfText: string,
): Promise<string> {
	const response = await axios.post(
		OPENAI_API_URL,
		{
			model: 'gpt-4',
			messages: [
				{ role: 'system', content: prompt },
				{ role: 'user', content: pdfText },
			],
		},
		{
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				'Content-Type': 'application/json',
			},
		},
	);

	return response.data.choices[0].message.content;
}
