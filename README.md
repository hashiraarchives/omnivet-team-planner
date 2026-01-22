# OmniVet Team Planner

A volunteer scheduling website with avatar customization for the OmniVet team.

## Features

- Master password authentication
- User registration/login with name, phone, and password
- Game-like avatar creator with 200+ unique combinations
- Monthly calendar view showing volunteer avatars
- Time slot scheduling with descriptions
- Admin panel for managing users and schedules

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js + Express
- **Database**: PostgreSQL

## Project Structure

```
OmniVet Team Planner/
├── frontend/
│   ├── index.html          # Master password entry
│   ├── login.html          # Login/Register page
│   ├── avatar.html         # Avatar creator
│   ├── calendar.html       # Main calendar view
│   ├── admin.html          # Admin panel
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js          # API calls
│       ├── auth.js         # Auth utilities
│       ├── avatar.js       # Avatar creator
│       └── calendar.js     # Calendar logic
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── schedules.js
│   │   └── admin.js
│   └── db/
│       └── schema.sql
└── README.md
```

## Passwords

- **Master Password**: `OmniVet0995`
- **Admin Password**: `OmniVet0995!`

## Local Development

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/omnivet
   JWT_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

### Frontend Setup

For local development, you can serve the frontend using any static file server. The API calls will use `http://localhost:3000/api` when running locally.

Option 1 - Use VS Code Live Server extension

Option 2 - Use Python:
```bash
cd frontend
python -m http.server 8080
```

Option 3 - Use Node.js http-server:
```bash
npx http-server frontend -p 8080
```

## Railway Deployment

### 1. Create Railway Project

1. Go to [Railway](https://railway.app) and create a new project
2. Add a PostgreSQL database to your project

### 2. Deploy Backend

1. Connect your GitHub repository or push directly to Railway
2. Set the root directory to `backend`
3. Add environment variables:
   - `DATABASE_URL` (auto-provided by Railway PostgreSQL)
   - `JWT_SECRET` (generate a secure random string)
   - `NODE_ENV=production`

### 3. Deploy Frontend

Option A - Serve from backend:
- The backend serves static files from `../frontend`
- Configure Railway to serve both

Option B - Deploy frontend separately:
- Use Railway's static site deployment
- Update `API_BASE` in `api.js` to point to your backend URL

### 4. Update API URL

In `frontend/js/api.js`, update the API_BASE for production:
```javascript
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://your-backend-url.railway.app/api';
```

## API Endpoints

### Auth
- `POST /api/auth/verify-master` - Verify master password
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id/avatar` - Update avatar

### Schedules
- `GET /api/schedules?month=X&year=Y` - Get schedules for month
- `GET /api/schedules/date/:date` - Get schedules for specific date
- `POST /api/schedules` - Create new schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Admin
- `POST /api/admin/verify` - Verify admin password
- `GET /api/admin/users` - List all users
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/schedules` - List all schedules
- `DELETE /api/admin/schedules/:id` - Delete schedule

## Avatar Customization Options

- **Face Shape**: Round, Oval, Square, Heart (4 options)
- **Skin Tone**: 6 options
- **Hair Style**: Short, Medium, Long, Curly, Wavy, Bun, Ponytail, Bald (8 options)
- **Hair Color**: Black, Brown, Blonde, Red, Gray, Blue, Pink, Purple (8 options)
- **Eyes**: Round, Almond, Cat, Wide, Sleepy, Sparkle (6 options)
- **Eyebrows**: Thin, Thick, Arched, Straight, Expressive (5 options)
- **Mouth**: Smile, Grin, Neutral, Smirk, Open (5 options)
- **Accessories**: None, Glasses, Sunglasses, Hat, Headband, Earrings (6 options)

Total combinations: 4 × 6 × 8 × 8 × 6 × 5 × 5 × 6 = **230,400 unique avatars**
