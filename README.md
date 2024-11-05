# Engineering Order Generator

This specialized Node.js application uses Express.js to process regulatory bulletins uploaded by users, convert their content into formal engineering orders, and output these as PDFs. The system integrates OpenAI's ChatGPT to intelligently interpret and format the text extracted from PDFs.

## Purpose

The Engineering Order Generator is designed to automate the creation of engineering order documents based on regulatory bulletins. 

## Features

- **PDF Upload Handling**: Uses Multer for robust file upload management.
- **Text Extraction**: Employs PDF parsing to extract text from uploaded documents.
- **Content Generation**: Integrates with OpenAI's ChatGPT to transform bulletin text into formalized engineering content.
- **PDF Creation**: Dynamically generates well-formatted PDF documents of the engineering orders for easy distribution and use.
