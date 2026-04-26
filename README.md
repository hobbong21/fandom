# fandom

Fandom platform — a community web app with user authentication.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the server

```bash
npm start
```

The server runs on port `3000` by default. Set the `PORT` environment variable to override.

### Environment variables

| Variable     | Default               | Description                  |
|--------------|-----------------------|------------------------------|
| `PORT`       | `3000`                | HTTP port                    |
| `JWT_SECRET` | `fandom-secret-key`   | Secret used to sign JWTs. **Change this in production.** |

## API

### Register

```
POST /api/auth/register
Content-Type: application/json

{ "username": "alice", "password": "secret123" }
```

### Login

```
POST /api/auth/login
Content-Type: application/json

{ "username": "alice", "password": "secret123" }
```

Returns a JWT token:

```json
{ "token": "<jwt>" }
```

### Get current user

```
GET /api/auth/me
Authorization: Bearer <token>
```

## Tests

```bash
npm test
```
