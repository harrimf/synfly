const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const textract = require('textract');
const lda = require('lda'); // Add this line to import LDA
const app = express();
const port = process.env.PORT || 5000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello, welcome to SynFly!');
});

app.post('/api/upload', upload.array('documents', 10), async (req, res) => {
  try {
    const extractedTexts = await Promise.all(
      req.files.map((file) => extractText(file.path))
    );

    const documents = extractedTexts.flatMap((text) => text.match(/[^\.!\?]+[\.!\?]+/g));
    const result = lda(documents, 2, 10); // Extract 5 topics with 10 terms each
    const keywordsSet = new Set();
    result.forEach((topic) => {
      topic.forEach(({ term }) => {
        keywordsSet.add(term);
      });
    });

    const keywords = Array.from(keywordsSet);


    console.log(extractedTexts);
    res.json({ message: 'Files uploaded and processed successfully', files: req.files, keywords });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error processing files', error: err.message });
  }
});

const extractText = async (filePath) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (err, text) => {
      if (err) {
        reject(err);
      } else {
        resolve(text);
      }
    });
  });
};

// Endpoint for handling search requests and fetching online data
app.get('/api/search', (req, res) => {
  // Handle search requests and fetch online data
});

// Endpoint for generating relevant terms based on the document content
app.get('/api/terms', (req, res) => {
  // Generate relevant terms based on the document content
});

// Endpoint for generating insights
app.post('/api/insights', (req, res) => {
  // Generate insights using LLM API
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});