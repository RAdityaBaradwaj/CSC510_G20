# Installation Guide

## Prerequisites

- Node.js 18+ and npm
- Git

## Installation

```bash
# Clone repository
git clone https://github.com/shubashwetha/CSC510_Group28.git
cd CSC510_Group28/Proj2

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

## Build for Production

```bash
npm run build
```

## Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Environment Variables

Create `.env` file for production:

```
VITE_API_BASE_URL=https://your-api.com
VITE_USE_MOCK_DATA=false
```

For development, mock data is used by default.

## Dependencies

All dependencies are listed in `package.json`:
- React 18
- Vite
- Vitest
- React Router
- React Leaflet
- Firebase
- Axios

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Tests failing?**
```bash
npm test -- --reporter=verbose
```

## Support

See [README.md](./README.md) for more information.
