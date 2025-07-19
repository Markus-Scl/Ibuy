# 🛒 iBuy

<div align="center">

![iBuy Logo](https://via.placeholder.com/120x120/4F46E5/FFFFFF?text=iBuy)

**A modern, simplified eBay-style marketplace**

_Built with Go and React for seamless auction experiences_

[![Go Version](https://img.shields.io/badge/Go-1.19+-00ADD8?style=for-the-badge&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20+-2496ED?style=for-the-badge&logo=docker)](https://docker.com/)

</div>

---

## 🌟 Overview

iBuy is a full-stack marketplace application that brings the excitement of online auctions to life. Built with modern technologies and best practices, it's perfect for learning full-stack development or as a foundation for your next e-commerce project.

### ✨ Key Features

-   🏷️ **Product Listings** - Create and browse items with detailed descriptions
-   💰 **Auction System** - Real-time bidding functionality
-   👤 **User Authentication** - Secure login and registration
-   📱 **Responsive Design** - Works seamlessly on all devices
-   🔒 **JWT Security** - Protected API endpoints
-   🐳 **Dockerized** - Easy deployment and development setup

---

---

## 🚀 Tech Stack

<table>
<tr>
<td align="center"><strong>Frontend</strong></td>
<td align="center"><strong>Backend</strong></td>
<td align="center"><strong>Database</strong></td>
<td align="center"><strong>DevOps</strong></td>
</tr>
<tr>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" width="40" height="40"/><br/>
  <strong>React 18</strong><br/>
  <em>Vite bundler</em>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/go/go-original.svg" width="40" height="40"/><br/>
  <strong>Go 1.19+</strong><br/>
  <em>Gin framework</em>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" width="40" height="40"/><br/>
  <strong>PostgreSQL 14</strong><br/>
  <em>Relational database</em>
</td>
<td align="center">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" width="40" height="40"/><br/>
  <strong>Docker</strong><br/>
  <em>Containerization</em>
</td>
</tr>
</table>

---

## 📋 Prerequisites

Before diving in, make sure you have these tools installed:

| Tool                                               | Version | Purpose                       |
| -------------------------------------------------- | ------- | ----------------------------- |
| [Go](https://go.dev/doc/install)                   | 1.19+   | Backend development           |
| [Node.js](https://nodejs.org/)                     | 16+     | Frontend development          |
| [Docker](https://docs.docker.com/get-docker/)      | 20+     | Database containerization     |
| [Docker Compose](https://docs.docker.com/compose/) | 2+      | Multi-container orchestration |

---

## 🛠️ Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Markus-Scl/Ibuy.git
cd ibuy
```

### 2️⃣ Environment Configuration

<details>
<summary><strong>📱 Client Configuration</strong></summary>

Create `client/.env`:

```env
VITE_SERVER_API=http://localhost:3000/
```

</details>

<details>
<summary><strong>🖥️ Server Configuration</strong></summary>

Create `server/.env`:

```env
# JWT Secrets
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here

# Database Configuration
DB_USER=user
DB_PASSWORD=password
DB_NAME=myapp
DB_HOST=localhost
DB_PORT=5432

# Server Configuration
SERVER_PORT=3000
```

</details>

### 3️⃣ Launch Database

```bash
cd db
docker compose up -d
```

> 💡 **Tip**: Use `docker compose logs -f` to monitor database startup

### 4️⃣ Start Backend Server

```bash
cd ../server
go mod tidy    # Install dependencies
go run .       # Start the server
```

### 5️⃣ Launch Frontend

```bash
cd ../client
npm install    # Install dependencies
npm run dev    # Start development server
```

---

## 🌐 Access Points

<div align="center">

| Service         | URL                                            | Description         |
| --------------- | ---------------------------------------------- | ------------------- |
| **Frontend**    | [http://localhost:5173](http://localhost:5173) | React application   |
| **Backend API** | [http://localhost:3000](http://localhost:3000) | Go REST API         |
| **Database**    | `localhost:5432`                               | PostgreSQL instance |

</div>

---

---

## 🔧 Development Scripts

### Frontend Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Commands

```bash
go run .         # Start development server
go build         # Build binary
go test ./...    # Run tests
go mod tidy      # Clean up dependencies
```

---

## 🐳 Docker Development

For a fully containerized development experience:

```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## 🐞 Troubleshooting

<details>
<summary><strong>🚨 Common Issues & Solutions</strong></summary>

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

### Database Connection Issues

```bash
# Check if PostgreSQL container is running
docker ps

# Reset database
docker-compose down -v
docker-compose up -d
```

### Go Dependencies

```bash
# Clear module cache
go clean -modcache
go mod download
go mod tidy
```

### Node.js Issues

```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

</details>

---

## 🚀 Deployment

<details>
<summary><strong>🌍 Production Deployment Options</strong></summary>

### Option 1: Docker Compose

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Cloud Platforms

-   **Frontend**: Vercel, Netlify, or AWS S3
-   **Backend**: Railway, Heroku, or AWS EC2
-   **Database**: AWS RDS, Google Cloud SQL, or Supabase

</details>

---

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License - Feel free to use, modify, and distribute! 🎉
```

---

## 🙏 Acknowledgments

-   Built with ❤️ using modern web technologies
-   Inspired by the simplicity of eBay's auction model
-   Thanks to the Go and React communities for excellent documentation

---

<div align="center">

**⭐ Star this repo if you find it useful!**

[Report Bug](https://github.com/your-username/ibuy/issues) · [Request Feature](https://github.com/your-username/ibuy/issues) · [Ask Question](https://github.com/your-username/ibuy/discussions)

---

</div>
