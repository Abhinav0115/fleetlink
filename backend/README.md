# FleetLink Backend

A robust Node.js REST API for fleet management system built with Express.js, MongoDB, and comprehensive testing suite.

## 🚀 Features

### 🚛 Vehicle Management API

-   **CRUD Operations**: Create, read, update, delete vehicles
-   **Availability Checking**: Real-time vehicle availability based on bookings
-   **Capacity Filtering**: Filter vehicles by minimum capacity requirements
-   **Conflict Detection**: Automatic booking conflict validation
-   **Cascading Deletes**: Remove associated bookings when vehicle is deleted

### 📅 Booking Management API

-   **Smart Scheduling**: Automatic conflict detection and prevention
-   **Duration Calculation**: Automatic ride duration estimation using pincode difference
-   **Time Validation**: Comprehensive start/end time validation
-   **Populated Responses**: Vehicle details included in booking responses
-   **Status Tracking**: Real-time booking status management

### 🛡️ Technical Features

-   **RESTful API**: Clean, consistent API design
-   **MongoDB Integration**: Mongoose ODM with schema validation
-   **Comprehensive Testing**: 12+ test cases covering all scenarios
-   **Error Handling**: Robust error responses with detailed messages
-   **Environment Configuration**: Flexible environment-based setup
-   **Request Logging**: Morgan middleware for request tracking
-   **CORS Support**: Cross-origin resource sharing enabled

## 📁 Project Structure

```
├── config/
│   └── db.js                    # MongoDB connection configuration
├── controllers/
│   ├── vehicleController.js     # Vehicle business logic
│   └── bookingController.js     # Booking business logic
├── models/
│   ├── Vehicle.js               # Vehicle MongoDB schema
│   └── Booking.js               # Booking MongoDB schema
├── routes/
│   ├── vehicles.js              # Vehicle API routes
│   └── bookings.js              # Booking API routes
├── tests/
│   ├── vehicle.test.js          # Vehicle API tests
│   └── booking.test.js          # Booking API tests
├── .env                         # Environment variables
├── .env.test                    # Test environment variables
├── app.js                       # Express app configuration
└── package.json                 # Dependencies and scripts
```

## 🛠️ Quick Start

### Prerequisites

-   **Node.js** 18+
-   **MongoDB** 5.0+ (running locally or remote URI)
-   **npm** or **yarn** package manager

### Installation

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Configure environment:**

    ```bash
    # Create .env file with:
    MONGO_URI=mongodb://localhost:27017/fleetlink
    PORT=5000
    ```

3. **Start MongoDB:**

    ```bash
    # For local MongoDB
    mongod
    ```

4. **Run the server:**

    ```bash
    # Development with auto-reload
    npm run dev

    # Production
    npm start
    ```

5. **Verify installation:**
    ```
    GET http://localhost:5000/api
    Response: {"message": "API is running"}
    ```

### Testing

```bash
# Run all tests
npm test

# Tests include:
# - Vehicle CRUD operations
# - Booking conflict detection
# - Error handling scenarios
# - Data validation
```

## 🔌 API Documentation

### Base URL

```
http://localhost:5000/api
```

### 🚛 Vehicle Endpoints

#### Get All Vehicles

```http
GET /vehicles
```

**Response:**

```json
[
    {
        "_id": "64a1b2c3d4e5f6789012345",
        "name": "Truck A",
        "capacityKg": 1000,
        "tyres": 6,
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z"
    }
]
```

#### Create Vehicle

```http
POST /vehicles
Content-Type: application/json

{
  "name": "Truck B",
  "capacityKg": 1500,
  "tyres": 8
}
```

#### Get Available Vehicles

```http
GET /vehicles/available?capacityRequired=500&fromPincode=110001&toPincode=110020&startTime=2023-10-27T10:00:00Z
```

#### Delete Vehicle

```http
DELETE /vehicles/:id
```

**Note:** Automatically deletes associated bookings

### 📅 Booking Endpoints

#### Get All Bookings

```http
GET /bookings
```

**Response:** (with populated vehicle data)

```json
[
    {
        "_id": "64a1b2c3d4e5f6789012346",
        "vehicleId": {
            "_id": "64a1b2c3d4e5f6789012345",
            "name": "Truck A",
            "capacityKg": 1000,
            "tyres": 6
        },
        "fromPincode": "110001",
        "toPincode": "110020",
        "startTime": "2023-10-27T10:00:00.000Z",
        "endTime": "2023-10-27T12:00:00.000Z",
        "customerId": "customer123",
        "estimatedRideDurationHours": 2
    }
]
```

#### Create Booking

```http
POST /bookings
Content-Type: application/json

{
  "vehicleId": "64a1b2c3d4e5f6789012345",
  "fromPincode": "110001",
  "toPincode": "110020",
  "startTime": "2023-10-27T10:00:00Z",
  "customerId": "customer123"
}
```

#### Delete Booking

```http
DELETE /bookings/:id
```

## 🏗️ Database Schema

### Vehicle Model

```javascript
{
  name: { type: String, required: true },
  capacityKg: { type: Number, required: true, min: 1 },
  tyres: { type: Number, required: true, min: 2 },
  timestamps: true
}
```

### Booking Model

```javascript
{
  vehicleId: { type: ObjectId, ref: "Vehicle", required: true },
  fromPincode: { type: String, required: true },
  toPincode: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  customerId: { type: String, required: true },
  estimatedRideDurationHours: { type: Number },
  timestamps: true
}
```

**Indexes:**

-   `{ vehicleId: 1, startTime: 1, endTime: 1 }` - Optimized conflict detection

## 🧠 Business Logic

### Ride Duration Calculation

```javascript
// Automatic calculation based on pincode difference
const estimatedRideDurationHours =
    Math.abs(parseInt(toPincode) - parseInt(fromPincode)) % 24;
const endTime = new Date(
    startTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000
);
```

### Conflict Detection

```javascript
// Prevents overlapping bookings for same vehicle
const conflict = await Booking.findOne({
    vehicleId: vehicleId,
    $or: [
        {
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        },
    ],
});
```

### Availability Algorithm

-   Filters vehicles by minimum capacity requirement
-   Checks for time-based booking conflicts
-   Returns available vehicles with estimated duration

## 🧪 Testing

The backend includes comprehensive test coverage:

### Test Categories

-   **Unit Tests**: Individual function testing
-   **Integration Tests**: API endpoint testing
-   **Error Handling**: Invalid input scenarios
-   **Business Logic**: Conflict detection and validation

### Test Structure

```bash
tests/
├── vehicle.test.js      # Vehicle API tests
│   ├── GET /vehicles
│   ├── POST /vehicles
│   ├── GET /vehicles/available
│   └── DELETE /vehicles
└── booking.test.js      # Booking API tests
    ├── GET /bookings
    ├── POST /bookings
    ├── DELETE /bookings
    └── Conflict detection
```

### Running Tests

```bash
# Run all tests with coverage
npm test

# Test environment uses separate database
# Configured in .env.test file
```

## 🛡️ Error Handling

### Standardized Error Responses

```json
{
    "error": "Validation failed",
    "details": "Name (string), capacityKg (number), and tyres (number) are required."
}
```

### HTTP Status Codes

-   `200` - Success
-   `201` - Created
-   `400` - Bad Request (validation errors)
-   `404` - Not Found
-   `409` - Conflict (booking conflicts)
-   `500` - Server Error

## 🌐 Environment Configuration

### Development (.env)

```env
MONGO_URI=mongodb://localhost:27017/fleetlink
PORT=5000
```

### Testing (.env.test)

```env
MONGO_URI=mongodb://localhost:27017/fleetlink-test
PORT=5001
```

### Production

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/fleetlink
PORT=5000
```

## 📜 Available Scripts

```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
npm test         # Run comprehensive test suite
```

## 🛠️ Technologies Used

-   **Node.js** - Runtime environment
-   **Express.js 4.18** - Web framework
-   **MongoDB** - NoSQL database
-   **Mongoose 7.0** - MongoDB ODM
-   **Jest 29** - Testing framework
-   **Supertest** - API testing
-   **Morgan** - Request logging
-   **CORS** - Cross-origin support
-   **dotenv** - Environment management

## 🚀 Deployment

### Production Checklist

-   [ ] Set production MongoDB URI
-   [ ] Configure environment variables
-   [ ] Enable MongoDB authentication
-   [ ] Set up proper logging
-   [ ] Configure reverse proxy (nginx)
-   [ ] Enable HTTPS
-   [ ] Set up monitoring

### Docker Support (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 API Integration

This backend is designed to work seamlessly with the FleetLink React frontend. The API provides:

-   **RESTful endpoints** for all operations
-   **Populated responses** with related data
-   **Comprehensive validation** and error handling
-   **Real-time conflict detection** for bookings
-   **Optimized queries** for performance

## 📝 Development Notes

-   Follow RESTful API conventions
-   Maintain comprehensive test coverage
-   Use proper HTTP status codes
-   Implement proper error handling
-   Validate all input data
-   Use MongoDB indexes for performance
-   Document API changes in this README
