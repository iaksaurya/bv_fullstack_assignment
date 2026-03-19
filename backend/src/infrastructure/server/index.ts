import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});