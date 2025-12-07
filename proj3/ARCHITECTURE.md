# Architecture Documentation - NeighborhoodPool

## System Overview

NeighborhoodPool is a location-based order management system built with React and designed for scalability. The architecture follows a service-oriented approach with separation of concerns.

## Architecture Principles

### Modularity
- Each feature is self-contained in its own module
- Services are separated by domain (orders, users, locations, pooling, batches, drivers)
- Components are reusable and composable

### Scalability
- API abstraction layer allows easy switching between mock and real APIs

### Testability
- Business logic separated from UI components
- Services are easily mockable
- Comprehensive test coverage (95+ tests)

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│  (React Components - Pages, Components, Hooks)          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Service Layer                          │
│  (API Client, Order Service, Location Service, etc.)   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  Data Models                            │
│  (Order, User, Pool, Driver, Batch)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              External Services                          │
│  (Firebase Auth, OpenWeather API, Future Backend)     │
└─────────────────────────────────────────────────────────┘
```

## Layer Breakdown

### 1. Presentation Layer (UI)

**Location**: `src/components/`, `src/pages/`

**Responsibilities**:
- User interface rendering
- User interaction handling
- State visualization
- Form validation

**Key Components**:
- `nearbyOrdersBoard.jsx` - Main nearby orders feature
- `OrderCard.jsx` - Order display component
- `LocationControls.jsx` - Location input and filters
- `PoolingDashboard.jsx` - Order pooling interface
- `Navbar.jsx` - Navigation component
- `AIChat.jsx` - AI chat assistant for business discovery

**Pages**:
- `Home.jsx` - Landing page
- `BusinessesPage.jsx` - Business browsing and menu
- `CheckoutPage.jsx` - Shopping cart checkout
- `OrdersPage.jsx` - User orders view
- `AdminPage.jsx` - Admin dashboard with batch assignment
- `NearbyOrdersPage.jsx` - Nearby orders view (standalone page)
- `PoolingPage.jsx` - Order pooling view (standalone page)

**Note**: `NearbyOrdersPage` and `PoolingPage` exist as standalone pages but are not currently routed in `App.jsx`. They can be accessed directly or integrated into the main navigation.

### 2. Business Logic Layer

**Location**: `src/services/`, `src/hooks/`

**Responsibilities**:
- Business rule enforcement
- Data transformation
- API communication
- State management

**Services**:
- `orders/orderService.js` - Order CRUD operations
- `pooling/poolingService.js` - Pool management (user-created pools)
- `batches/batchService.js` - Batch management (admin driver assignment)
- `clustering/orderClustering.js` - Order clustering algorithm for batch assignment
- `drivers/driverService.js` - Driver management
- `businesses/businessService.js` - Business and menu management
- `productService.js` - Product catalog (legacy/e-commerce feature)
- `locationService.js` - Location and geocoding
- `api/client.js` - HTTP client wrapper
- `api/endpoints.js` - API endpoint definitions

**Custom Hooks**:
- `useNearbyOrders.js` - Nearby orders management
- `useLocation.js` - Location tracking

### 3. Data Models Layer

**Location**: `src/models/`

**Responsibilities**:
- Data structure definitions
- Validation logic
- Data transformation
- Business rule enforcement at model level

**Models**:
- `Order.js` - Order data model with validation
- `User.js` - User data model with role support
- `Pool.js` - Pool data model (user-created order groups)
- `Batch.js` - Batch data model (admin-assigned order groups)
- `Driver.js` - Driver data model

### 4. Utilities Layer

**Location**: `src/utils/`

**Responsibilities**:
- Common utility functions
- Helper methods
- Analytics tracking
- Distance calculations

**Utilities**:
- `analytics.js` - Performance tracking
- `distanceCalculator.js` - Distance calculations
- `adminAuth.js` - Admin authentication helpers

### 5. Authentication Layer

**Location**: `src/auth/`

**Responsibilities**:
- User authentication
- Authorization checks
- Session management
- Role-based access control

**Components**:
- `AuthContext.jsx` - Authentication context
- `AuthUIContext.jsx` - Auth UI state management
- `RequireAuth.jsx` - Protected route wrapper
- `RequireAdmin.jsx` - Admin-only route wrapper
- `GlobalAuthGate.jsx` - Global auth interceptor
- `adapters/firebaseAdapter.js` - Firebase authentication adapter

### 6. Context Layer

**Location**: `src/contexts/`

**Responsibilities**:
- Global state management
- Cross-component state sharing

**Contexts**:
- `CartContext.jsx` - Shopping cart state management
- `ToastContext.jsx` - Toast notification system

## Application Routes

**Current Routes** (defined in `App.jsx`):
- `/` - Home page
- `/businesses` - Business browsing
- `/checkout` - Shopping cart checkout (protected)
- `/orders` - User orders view (protected)
- `/admin` - Admin dashboard (admin-only)

**Unrouted Pages** (exist but not in main navigation):
- `/nearby-orders` - NearbyOrdersPage (can be added to routes)
- `/pooling` - PoolingPage (can be added to routes)

## Data Flow

### Nearby Orders Flow

```
User Input (Zip Code)
    ↓
LocationControls Component
    ↓
useNearbyOrders Hook
    ↓
locationService.getCoordinatesFromZip()
    ↓
orderService.getNearbyOrders()
    ↓
Order Model (validation)
    ↓
UI Update (Map + List)
```

### Order Pooling Flow

```
User Selects Orders
    ↓
PoolingDashboard Component
    ↓
poolingService.createPool()
    ↓
Route Optimization Algorithm
    ↓
Pool Model (validation)
    ↓
Cost Calculation
    ↓
UI Update (Pool Display)
```

### Batch Assignment Flow (Admin)

```
Admin Clicks Auto-Assign
    ↓
batchService.assignOrdersToDrivers()
    ↓
orderClustering.clusterOrders()
    ↓
driverService.getAllDrivers()
    ↓
orderService.getAllOrders()
    ↓
Batch Model (validation)
    ↓
UI Update (Admin Dashboard)
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Leaflet** - Map integration

### State Management
- **React Context API** - Global state (auth, cart, toast)
- **Custom Hooks** - Local state management

### Backend Integration
- **Firebase** - Authentication
- **Axios** - HTTP client (via API client)
- **OpenWeather API** - Geocoding (via locationService)
- **Future**: RESTful API backend

### Testing
- **Vitest** - Test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM simulation

## Design Patterns

### Service Pattern
All business logic is encapsulated in service objects:
```javascript
// Example: orderService.js
export const orderService = {
  getAllOrders: async () => { ... },
  getOrderById: async (id) => { ... },
  createOrder: async (data) => { ... },
  updateOrder: async (id, data) => { ... }
}
```

### Repository Pattern 
API abstraction allows switching between mock and real data:
```javascript
// api/client.js
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api'
})
```

### Model Pattern
Data models encapsulate validation and business rules:
```javascript
// models/Order.js
class Order {
  constructor(data) {
    this.validate(data)
    // ... assign properties
  }
  validate(data) { ... }
}
```

### Hook Pattern
Custom hooks encapsulate complex state logic:
```javascript
// hooks/useNearbyOrders.js
export function useNearbyOrders(location, radius, status) {
  // ... state management
  return { nearbyOrders, loading, error }
}
```

## Key Features

### 1. Nearby Orders Board
- Location-based order discovery
- Interactive map with Leaflet
- Radius and status filtering
- Real-time order updates

### 2. Order Pooling
- User-created order pools
- Route optimization
- Cost savings calculation
- Pool suggestions

### 3. Batch Assignment (Admin)
- Automated order-to-driver assignment
- Order clustering algorithm
- Route optimization
- Driver management

### 4. Business Browsing
- Business catalog
- Menu browsing
- Shopping cart functionality

### 5. Authentication & Authorization
- Firebase authentication
- Role-based access control (Customer, Driver, Business, Admin)
- Protected routes

## API Structure

### Current (Mock Data)
```
src/services/
├── orders/
│   ├── orderService.js
│   └── mockData.js
├── batches/
│   └── batchService.js
├── pooling/
│   └── poolingService.js
├── drivers/
│   └── driverService.js
├── businesses/
│   └── businessService.js
├── clustering/
│   └── orderClustering.js
├── locationService.js
└── api/
    ├── client.js
    └── endpoints.js
```

## Testing Architecture

### Test Structure
```
Test/
├── services/     # Service layer tests
├── models/       # Model validation tests
├── components/   # Component tests
├── hooks/        # Hook tests
└── features/     # Feature integration tests
```

### Test Coverage
- **95+ test cases** covering:
  - Service layer (CRUD operations)
  - Model validation
  - Component rendering and interaction
  - Hook functionality
  - Utility functions

## Future Enhancements

### Planned Architecture Improvements
1. **State Management**: Add Redux 
2. **Real-time Updates**: WebSocket integration for live updates
3. **Caching Layer**: Add service worker or Redux 
4. **Microservices**: Split into separate services when scaling
5. **API Gateway**: Centralized API management

## Security Considerations

- **Authentication**: Firebase Auth with role-based access
- **Data Validation**: Model-level validation before API calls
- **API Security**: Future: JWT tokens, rate limiting

## Performance Optimization

- **Memoization**: React.memo for expensive components

## Documentation

- **README.md** - Project overview
- **SETUP.md** - Setup instructions
- **INSTALL.md** - Installation guide
- **CONTRIBUTING.md** - Contribution guidelines
- **CHANGELOG.md** - Release history
- **ARCHITECTURE.md** - This file

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0
