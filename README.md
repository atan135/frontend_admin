# Vue3 Admin Management System

A modern admin management system built with Vue 3, Ant Design Vue, Axios, and browser-compatible logging.

## Features

- 🚀 **Vue 3** with Composition API
- 🎨 **Ant Design Vue** for beautiful UI components
- 📡 **Axios** for HTTP requests with interceptors
- 📝 **Browser-Compatible Logging** with real-time log viewer
- 🔐 **Authentication** system with JWT
- 👥 **User Management** with CRUD operations
- 📊 **Dashboard** with statistics and activities
- 👤 **Profile Management** with avatar upload
- 📱 **Responsive Design** for mobile and desktop
- 🎯 **TypeScript Ready** (optional)

## Tech Stack

- **Frontend**: Vue 3, Vite, Ant Design Vue
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Logging**: Custom Browser-Compatible Logger
- **Icons**: Ant Design Icons

## Project Structure

```
src/
├── api/                 # API services
│   ├── auth.js         # Authentication API
│   └── user.js         # User management API
├── components/          # Reusable components
├── config/             # Configuration files
├── layouts/            # Layout components
│   └── AdminLayout.vue # Main admin layout
├── router/             # Vue Router configuration
│   └── index.js
├── stores/             # Pinia stores
│   ├── auth.js         # Authentication store
│   └── user.js         # User management store
├── styles/             # Global styles
│   └── global.css
├── utils/              # Utility functions
│   ├── logger.js       # Browser-compatible logger
│   └── request.js      # Axios configuration
├── views/              # Page components
│   ├── Dashboard.vue   # Dashboard page
│   ├── Login.vue       # Login page
│   ├── NotFound.vue    # 404 page
│   ├── Profile.vue     # Profile page
│   └── UserManagement.vue # User management page
├── App.vue             # Root component
└── main.js             # Application entry point
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vue3-admin-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   Create `.env` file (see `CONFIG.md` for details):
   ```env
   VITE_APP_TITLE=Vue3 Admin Management
   VITE_API_BASE_URL=/api
   VITE_APP_VERSION=1.0.0
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## Configuration

### API Configuration

The API base URL can be configured in `src/config/index.js` or via environment variables:

```javascript
export const config = {
  API_BASE_URL: '/api',  // Uses proxy in development
  API_TIMEOUT: 10000,
  // ... other config
}
```

### Development Proxy

The Vite development server includes a proxy configuration that automatically forwards all `/api` requests to `http://localhost:4000`. This eliminates CORS issues during development.

**Proxy Configuration:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000` (your API server)
- All `/api/*` requests are proxied to the backend

### Logging Configuration

The application uses a custom browser-compatible logger in `src/utils/logger.js`. Features include:
- **Console output** with formatted messages
- **In-memory storage** (last 1000 logs)
- **localStorage persistence** (last 100 logs)
- **Real-time log viewer** in the Dashboard
- **Log export** functionality
- **Color-coded log levels** (trace, debug, info, warn, error, fatal)

### Authentication

The authentication system uses JWT tokens stored in localStorage. The token is automatically included in API requests via Axios interceptors.

## API Integration

### Backend Requirements

Your backend should run on **port 4000** and provide the following endpoints:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user info
- `POST /api/auth/refresh` - Refresh token

#### User Management
- `GET /api/users` - Get user list (with pagination, search, filters)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `DELETE /api/users/batch` - Batch delete users

### API Response Format

All API responses should follow this format:

```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

For paginated responses:

```javascript
{
  "success": true,
  "data": {
    "list": [...], // Array of items
    "total": 100,  // Total count
    "page": 1,     // Current page
    "pageSize": 10 // Items per page
  }
}
```

## Features Overview

### Dashboard
- Statistics cards showing key metrics
- Recent activities timeline
- Quick action buttons
- Real-time data refresh

### User Management
- User list with pagination
- Search and filtering capabilities
- Create, edit, and delete users
- Batch operations
- Role and status management

### Profile Management
- View and edit user profile
- Avatar upload functionality
- Password change
- Account information display

### Authentication
- Secure login with validation
- JWT token management
- Automatic token refresh
- Route protection

### Logging
- **Browser-compatible logging** system
- **Real-time log viewer** in Dashboard
- **Multiple log levels** (trace, debug, info, warn, error, fatal)
- **Console and in-memory storage**
- **Request/response logging** via Axios interceptors
- **Log export** and persistence features

## Logging System

The application includes a comprehensive browser-compatible logging system:

### Features
- **Real-time log viewer** in the Dashboard
- **Multiple log levels**: trace, debug, info, warn, error, fatal
- **Formatted console output** with timestamps
- **In-memory storage** (last 1000 logs)
- **localStorage persistence** (last 100 logs)
- **Log export** functionality (JSON format)
- **Color-coded display** in the log viewer

### Usage
```javascript
import { logger, errorLogger } from '@/utils/logger'

// Basic logging
logger.info('User logged in', { userId: 123 })
logger.warn('API response slow', { duration: 5000 })
logger.error('Login failed', { error: 'Invalid credentials' })

// Error logging
errorLogger.error('Database connection failed', { error: err })
```

### Log Viewer
- Access the log viewer in the Dashboard
- Auto-refreshes every 5 seconds
- Export logs as JSON file
- Clear logs functionality
- Color-coded by log level

## Customization

### Adding New Pages

1. Create a new Vue component in `src/views/`
2. Add the route in `src/router/index.js`
3. Add navigation item in `src/layouts/AdminLayout.vue`

### Adding New API Services

1. Create a new file in `src/api/`
2. Use the configured Axios instance from `src/utils/request.js`
3. Follow the existing API response format

### Styling

- Global styles are in `src/styles/global.css`
- Component-specific styles use scoped CSS
- Ant Design theme can be customized

## Development

### Code Style

The project uses ESLint for code linting. Run linting with:

```bash
npm run lint
```

### Project Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **Port already in use**
   - If port 3000 is busy, Vite will automatically use the next available port (3001, 3002, etc.)
   - Check the terminal output for the correct URL

2. **Login not working**
   - This is expected without a backend API
   - The form validation will show errors
   - Check browser console for detailed error messages

3. **Logs not appearing**
   - Ensure you're on the Dashboard page
   - Check the "Application Logs" section at the bottom
   - Click "Refresh" button in the log viewer
   - Check browser console for logs

4. **Styling issues**
   - Clear browser cache and hard refresh (Ctrl+F5)
   - Ensure all dependencies are installed: `npm install`

### Development Tips

- **Hot Reload**: Changes are automatically reflected in the browser
- **Console Logs**: Open browser dev tools to see formatted logs
- **Log Export**: Use the export feature to save logs for debugging
- **Network Tab**: Check API requests in browser dev tools

## Support

For support and questions, please open an issue in the repository.
