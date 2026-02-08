# Smart Truck Manager API Documentation

All API endpoints are prefixed with `/api`. Most endpoints require a Bearer Token in the `Authorization` header.

## Authentication Routes

### 1. Send OTP
- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "method": "email"
  }
  ```
- **Response**: `200 OK`
  ```json
  { "message": "OTP sent successfully", "email": "user@example.com" }
  ```

### 2. Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "full_name": "John Doe",
    "mobile": "1234567890"
  }
  ```
- **Response**: `201 Created`
  ```json
  { "message": "Registration successful...", "email": "user@example.com" }
  ```

### 3. Verify OTP / Login (OTP)
- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "JWT_TOKEN",
    "user": { ...profileDetails }
  }
  ```

### 4. Login (Password)
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

---

## Profile Routes (Auth Required)

### 1. Get Profile
- **URL**: `/api/auth/profile`
- **Method**: `GET`

### 2. Update Profile
- **URL**: `/api/auth/profile`
- **Method**: `PATCH`
- **Body**: `full_name`, `mobile`, `mobile_secondary`, `country_code` (optional fields)

---

## Truck Routes (Auth Required)

### 1. List My Trucks
- **URL**: `/api/trucks`
- **Method**: `GET`

### 2. Add Truck
- **URL**: `/api/trucks`
- **Method**: `POST`
- **Body**: `{ "truck_number": "MH12-1234", "model": "Tata Prima" }`

---

## Trip Routes (Auth Required)

### 1. List Trips
- **URL**: `/api/trips`
- **Method**: `GET`

### 2. Add Trip
- **URL**: `/api/trips`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "truck_id": "UUID",
    "trip_date": "YYYY-MM-DD",
    "supplier": "Name",
    "client": "Name",
    "location": "Site Name",
    "material": "Sand",
    "material_price": 5000,
    "trips_count": 1,
    "total_order_value": 5000,
    "profit": 1000,
    "total_expense": 4000,
    "remark": "Extra info",
    "payment_status": "pending | received"
  }
  ```

### 3. Update Trip
- **URL**: `/api/trips/:id`
- **Method**: `PATCH`
- **Body**: Partial trip object.

---

## Master Data Routes

### 1. Suppliers
- `GET /api/suppliers`
- `POST /api/suppliers` (Body: `name`, `address`, `mobile`)
- `PATCH /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### 2. Materials
- `GET /api/materials`
- `POST /api/materials` (Body: `name`)
- `PATCH /api/materials/:id`
- `DELETE /api/materials/:id`

### 3. Petrol Pumps
- `GET /api/petrol-pumps`
- `POST /api/petrol-pumps` (Body: `name`, `location`)
- `DELETE /api/petrol-pumps/:id`

---

## Driver Routes

- `GET /api/drivers`
- `POST /api/drivers`
- `PATCH /api/drivers/:id`
- `DELETE /api/drivers/:id`
- **Body (POST/PATCH)**: `name`, `license_number`, `photo_url`, `aadhar_url`, `mobiles[]`, `blood_group`, `salary`, `advance`, `assigned_truck_id`

---

## Expense & Payment Routes

### 1. Payments
- `GET /api/payments`
- `POST /api/payments` (Body: `trip_id`, `amount`, `payment_date`, `mode`)

### 2. Fuel Expenses
- `GET /api/fuel-expenses`
- `POST /api/fuel-expenses` (Body: `truck_id`, `pump_id`, `expense_date`, `amount`, `liters`, `filled_by`, `driver_id`, `receipt_url`)

### 3. General Expenses
- `GET /api/expenses`
- `POST /api/expenses` (Body: `truck_id`, `amount`, `category`, `description`, `expense_date`)
