# GoQueue 📨

**GoQueue** is a lightweight distributed message queue system inspired by Kafka and RabbitMQ.  
Built with Go and PostgreSQL, it supports topic-based partitioning, retries, dead-letter queues, and visual insights via a modern frontend.

## 🛠 Features

- ✅ Produce and consume messages via REST API  
- 🧵 Topic + partition-based routing  
- ⏳ Retry logic with configurable attempt limits  
- 💀 Dead-letter queue fallback  
- 📊 Dashboard metrics: pending, acknowledged, failed, dead-lettered  
- ⚙️ Built in idiomatic Go with background workers and graceful shutdown  
- 🖼️ Frontend dashboard (Next.js + Tailwind) with D3.js visualizations (in progress)  

## 📁 Project Structure

```
goqueue/
├── backend/
│   ├── cmd/goqueue/          # Entrypoint: main.go
│   ├── internal/
│   │   ├── api/              # HTTP handlers
│   │   ├── broker/           # Retry worker and queue logic
│   │   ├── producer/         # Message ingestion logic
│   │   ├── consumer/         # Consume/ack logic
│   │   ├── storage/          # Postgres connection
│   │   └── models/           # DB models
│   ├── config/               # .env and config loading
│   ├── go.mod / go.sum
│   └── Dockerfile
├── frontend/                 # Next.js + Tailwind dashboard (WIP)
│   └── ...
├── docker-compose.yml
├── init.sql                 # PostgreSQL schema
├── .env
└── README.md
```

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/goqueue.git
cd goqueue
```

### 2. Set up PostgreSQL (via Docker)

```bash
docker-compose up -d postgres
```

### 3. Initialize the schema

```bash
psql -U goqueue -d goqueue -f init.sql
```

### 4. Run the backend

```bash
cd backend/cmd/goqueue
go run main.go
```

### 5. API Endpoints

- `POST /topics` – Create topic
- `POST /produce` – Produce message
- `GET /consume?topic=...&group=...` – Consume message
- `POST /ack` – Acknowledge message
- `GET /dashboard` – View metrics

## 📦 Example: Produce a Message

```bash
curl -X POST http://localhost:8080/produce \
  -H "Content-Type: application/json" \
  -d '{"topic": "user-events", "payload": {"event": "signup", "user": "alice"}}'
```

## 🧪 Future Improvements

- WebSocket support for real-time queue updates  
- Redis caching layer for faster offset lookups  
- Message TTL + expiration  
- UI-based retry / requeue / purge controls  

## 📄 License

MIT License

## 🙌 Credits

Built by [Siddharth Mishra](https://github.com/SidM81)  
Distributed systems, Go, and low-level enthusiast.
