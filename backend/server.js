const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 4100;

app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500"
  ],
  methods: ["GET", "HEAD"]
}));

app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Preeti Song backend is running" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://127.0.0.1:${PORT}`);
});
