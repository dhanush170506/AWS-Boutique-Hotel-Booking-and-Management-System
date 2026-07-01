# Aurelia Boutique Hotel Booking and Management System

A modern boutique hotel booking platform built for a university AWS cloud project. The app uses React, Tailwind CSS, Node.js, Express.js, and mock JSON storage while keeping clear integration points for DynamoDB, S3, Lambda, SNS/SES, and EC2 deployment.

## Features

- Luxury dark, gold, and white hotel UI inspired by premium hospitality brands
- Responsive home, rooms, booking, confirmation, manage booking, about, and contact pages
- Room search and filtering by text, guest capacity, and availability
- Booking form validation with loading and error states
- Unique booking ID generation
- Booking lookup, special request updates, and cancellation
- REST API backed by mock JSON storage
- AWS-ready project structure and environment placeholders

## Project Structure

```text
boutique-hotel-booking/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── services/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── data/
│   └── server.js
└── README.md
```

## REST API

```text
POST   /api/bookings
GET    /api/bookings
GET    /api/bookings/:id
PUT    /api/bookings/:id
DELETE /api/bookings/:id
```

## Local Setup

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

Demo booking ID: `BHB-DEMO2026`

## Environment

Copy `backend/.env.example` to `backend/.env` if you want to customize ports or future AWS values.

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
AWS_REGION=us-east-1
DYNAMODB_BOOKINGS_TABLE=HotelBookings
S3_ASSETS_BUCKET=boutique-hotel-assets
```

For the frontend, set `VITE_API_URL` only if the backend URL changes:

```env
VITE_API_URL=http://localhost:5000/api
```

## AWS Integration Readiness

- **EC2:** Build the React frontend and run the Express API behind Nginx or a process manager.
- **DynamoDB:** Replace `backend/models/BookingStore.js` with DynamoDB CRUD operations.
- **S3:** Move room and hotel image assets to an S3 bucket or CloudFront distribution.
- **Lambda:** Move booking creation and notification workflows into Lambda functions behind API Gateway.
- **SNS/SES:** Trigger booking confirmations after successful booking creation.

## Suggested Presentation Flow

1. Show the premium responsive hotel UI.
2. Create a booking and highlight the generated booking ID.
3. Search for the booking in Manage Booking.
4. Update special requests and cancel a reservation.
5. Explain the backend repository boundary that can be swapped for DynamoDB.
6. Explain how S3, Lambda, SNS/SES, and EC2 fit into the final cloud architecture.
