# borderscatholic.co.uk.co.uk 🌐
Website design for [Ss Mary and David's Catholic Parish](https://borderscatholic.co.uk) — built using Angular and Node.js, containerized with Docker.

## 🌱 Features
- Modern Angular frontend
- TypeScript backend (Node.js)
- Built and deployed with GitHub Actions
- Dev and Production branches
- Image hosted on GHCR

## 🚀 Deployment

Images are published to:
- `ghcr.io/m-f-1998/borders-catholic:dev` – Dev (`beta.*`)
- `ghcr.io/m-f-1998/borders-catholic:latest` – Production

## 🐳 Local Development

```bash
./dev.sh # Docker Compose Local Development Server on Port 3000
./deploy.sh ${dev|latest} # Deploy Package (Requires GHCR Access Token)
```
