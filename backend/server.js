const express = require("express");
const cors = require("cors");
const mahasiswa = require("./data/mahasiswa");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("../frontend"));

app.get("/api/mahasiswa", (req, res) => {
  const { nama, jurusan, gugus } = req.query;
  let hasil = [...mahasiswa];
  if (nama) hasil = hasil.filter((m) => m.nama.toLowerCase().includes(nama.toLowerCase()));
  if (jurusan && jurusan !== "semua") hasil = hasil.filter((m) => m.jurusan.toLowerCase() === jurusan.toLowerCase());
  if (gugus && gugus !== "semua") hasil = hasil.filter((m) => m.gugus.toLowerCase() === gugus.toLowerCase());
  res.json({ total: hasil.length, data: hasil });
});

app.get("/api/mahasiswa/:id", (req, res) => {
  const mhs = mahasiswa.find(
    (m) => m.id === parseInt(req.params.id)
  );

  if (!mhs) {
    return res.status(404).json({
      pesan: "Mahasiswa tidak ditemukan"
    });
  }

  res.json(mhs);
});

app.get("/api/jurusan", (req, res) => {
  res.json([...new Set(mahasiswa.map((m) => m.jurusan))]);
});

app.get("/api/gugus", (req, res) => {
  res.json([...new Set(mahasiswa.map((m) => m.gugus))].sort((a, b) => a.localeCompare(b)));
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});