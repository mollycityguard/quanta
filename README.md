# 🌐 Quanta: Website Monitoring Service
Quanta is a lightweight web service monitoring engine, primarily built for recreational and educational purposes with AI assistance.

---

### Features (Current Backend State)
* **Database Connectivity:** Utilizes **PostgreSQL** via **Sequelize ORM** for persistent storage of configuration and results.
* **Scheduled Monitoring:** Employs **`node-cron`** to run checks at defined intervals, driven by data stored in the `Monitors` table.
* **Asynchronous HTTP Pinging:** Uses **`axios`** to perform pings against configured URLs.
* **Notification System:** Integrates with the **Telegram Bot API** via **`Telegraf.js`**.
* **Logging:** Stores status, status codes, and response times in the `PingResults` table.

---

### Environment variables
```dotenv
DB_NAME=quanta_db
DB_USER=user
DB_PASS=password
DB_HOST=localhost
DB_PORT=5432

EXPRESS_PORT=3000

BOT_NAME="Quanta Monitoring"
BOT_DESCRIPTION="Assistant for monitoring web services"
```

---

## 🤖 AI-Assisted Development

This project was developed primarily for learning and enjoyment, with significant portions of the application logic and architecture defined and refined through collaboration with **AI models** (LLMs).
