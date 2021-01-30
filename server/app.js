const express = require("express");
const fs = require("fs");
const app = express();
const cors = require("cors");
const thumbsupply = require("thumbsupply");

const PORT = process.env.PORT || 4000;
const videos = [
  {
    id: 1,
    poster: "/video/1/poster",
    duration: "31sec",
    name: "Sample 1",
  },
  {
    id: 2,
    poster: "/video/2/poster",
    duration: "01m 02sec",
    name: "Sample 2",
  },
  {
    id: 3,
    poster: "/video/3/poster",
    duration: "10sec",
    name: "Sample 3",
  },
];

app.get("/video", (req, res) => {
  res.sendFile("assets/1.mp4", { root: __dirname });
});

app.use(cors());
app.get("/videos", (req, res) => res.json(videos));

app.get("/video/:id/poster", (req, res) => {
  res.sendFile(`assets/${req.params.id}.jpeg`, { root: __dirname });
});

app.get("/video/:id/data", (req, res) => {
  const id = parseInt(req.params.id, 10);
  res.json(videos[id]);
});

app.get("/video/:id", (req, res) => {
  const path = `assets/${req.params.id}.mp4`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  console.log(range);
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
