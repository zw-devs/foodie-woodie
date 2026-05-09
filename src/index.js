import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Foodie Woodie Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
