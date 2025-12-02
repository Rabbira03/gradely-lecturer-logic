import express from 'express';
const app = express();
const PORT = 3001;
app.get('/', (req, res) => res.send('Hello'));
app.listen(PORT, () => console.log(`Simple server running on ${PORT}`));
