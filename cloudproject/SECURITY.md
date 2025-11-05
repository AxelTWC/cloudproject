Security and HTTPS
==================

This project includes middleware and configuration guidance to improve security and enable HTTPS.

What's included
- `middleware.ts` — enforces HTTPS redirects (in production) and sets security headers (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Content-Security-Policy).
- Secure cookie defaults — auth/login endpoints set cookies using `HttpOnly` and `Secure` where appropriate (controlled by `NODE_ENV` or `COOKIE_SECURE`).

Environment & deployment
- Use `.env.example` as a template for required environment variables. Do not commit secrets; use your cloud provider's secret manager or environment for production secrets.
- Terminate TLS at the edge (load balancer, CDN, or reverse proxy). Keep certificates out of version control; mount them at runtime.

Local HTTPS
- See `dev-https.md` for tips on generating local certificates (mkcert) and testing HTTPS locally.

Recommended environment variables
- `NODE_ENV=production`
- `JWT_SECRET` — a long random secret managed by your environment/secret manager
- `COOKIE_SECURE=true` — ensures cookies are set with the Secure flag

If you'd like, I can also add an example nginx/Caddy config to the repo to demonstrate how to terminate TLS in a containerized deployment.

How to verify secure (HTTPS) transport
--------------------------------------

1) Browser inspection
	- Open the site in your browser (https://your-domain).
	- Click the lock icon in the address bar to view certificate details and connection information. The browser will show if the connection is secure and which TLS version/cipher suite is used.

2) Command-line checks (PowerShell / Windows)
	- Check headers and TLS info with curl (PowerShell tip: use the included curl):

	  curl -vI https://your-domain

	  Look for `HTTP/2` or `HTTP/1.1 200 OK` and confirm the TLS handshake in the verbose output. You should NOT see a redirect to HTTP and the response should be '200' or other success code.

	- Check certificate expiry and details (openssl can be used from WSL or Git Bash):

	  openssl s_client -connect your-domain:443 -servername your-domain

	  (Inspect the certificate chain and expiry dates.)

3) Automated scanner
	- Use SSL Labs test (https://www.ssllabs.com/ssltest/) to get a detailed report on TLS configuration, supported ciphers, protocols, and vulnerabilities.

4) Verify secure cookies
	- In browser devtools (Application / Storage -> Cookies) check that authentication cookies have the `Secure` and `HttpOnly` flags set and `SameSite` as configured.

5) Logs and proxy headers
	- Ensure your reverse proxy sets `X-Forwarded-Proto: https` so the app knows the original protocol. Check nginx/Caddy logs and access logs to confirm TLS termination.

