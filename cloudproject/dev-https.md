Local HTTPS for development (Windows / mkcert)

This project enforces HTTPS headers in production and recommends testing with HTTPS locally when you need to test secure cookies and redirects.

1. Install mkcert (recommended):
   - Windows: follow https://github.com/FiloSottile/mkcert#installation

2. Create a local CA and generate cert for localhost:

   mkcert -install
   mkcert localhost 127.0.0.1 ::1

   This will create cert files like `localhost+2.pem` and `localhost+2-key.pem` in the current directory.

3. Start a local HTTPS reverse proxy that forwards to the Next.js dev server.
   - You can use `ngrok`, `caddy`, or a simple `node`/`express` proxy that uses the generated cert/key.

Example using `http-server` + `mkcert` is out of scope here; for production rely on managed TLS (Cloudflare, load balancer, or your cloud provider) and keep the TLS termination at the edge.

Notes:
- Keep your private keys out of source control. Add certs to `.gitignore` if you generate them locally.
- In Docker, mount certs as volumes and configure your reverse proxy (nginx/caddy) to use them.
