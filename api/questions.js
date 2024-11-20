const { Pool } = require("pg");
const fetch = require("node-fetch");

const pool = new Pool({
  connectionString:
    "postgres://imrgdavu:Aqu4syzrpkJ0F56PQUe4tzCuGObMVlOk@manny.db.elephantsql.com/imrgdavu", // Ganti dengan URL koneksi Anda
});

// Ganti dengan token bot Telegram dan chat ID Anda berikut ini
const TELEGRAM_BOT_TOKEN = "7756972324:AAHzn5JS-1W2xZvwNsKITUz7DxNcbYWXR1g"; // Ganti dengan token bot Anda
const TELEGRAM_CHAT_ID = "5460230196"; // Ganti dengan ID chat Anda

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const result = await pool.query(
        "SELECT * FROM questions ORDER BY id DESC"
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else if (req.method === "POST") {
    const { name, question } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO questions (name, question) VALUES ($1, $2) RETURNING *",
        [name, question]
      );

      // Kirim pesan ke Telegram
      const messageText = `Nama: ${name}\nPertanyaan: ${question}`;
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: messageText,
        }),
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
