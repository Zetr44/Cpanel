const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const db = new sqlite3.Database(path.join(__dirname, "database.db"));

// Halaman Login
app.get("/", (req, res) => {
    res.render("login");
});

// Proses Login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
        if (user) {
            res.redirect(`/dashboard?role=${user.role}`);
        } else {
            res.send("Login gagal!");
        }
    });
});

// Halaman Dashboard
app.get("/dashboard", (req, res) => {
    const { role } = req.query;
    res.render("dashboard", { role });
});

// Halaman Pengaturan (Hanya untuk Creator)
app.get("/settings", (req, res) => {
    const { role } = req.query;
    if (role !== "Creator") return res.send("Akses ditolak!");

    db.get("SELECT * FROM config WHERE id = 1", (err, config) => {
        res.render("settings", { config });
    });
});

// Perbarui Konfigurasi (Creator Only)
app.post("/update-config", (req, res) => {
    const { domain, ptla, ptlc, role } = req.body;
    if (role !== "Creator") return res.send("Akses ditolak!");

    db.run("UPDATE config SET domain = ?, ptla = ?, ptlc = ? WHERE id = 1", [domain, ptla, ptlc], () => {
        res.send("Konfigurasi diperbarui!");
    });
});

// Tambah User (Creator Only)
app.post("/add-user", (req, res) => {
    const { username, password, role, creatorRole } = req.body;
    if (creatorRole !== "Creator") return res.send("Akses ditolak!");

    db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, password, role], (err) => {
        if (err) return res.send("Gagal menambahkan user!");
        res.send("User berhasil ditambahkan!");
    });
});

app.listen(3000, () => console.log("Server berjalan di http://localhost:3000"));
