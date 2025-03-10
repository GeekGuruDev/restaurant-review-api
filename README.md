# Restaurant Review API

This is a RESTful API for managing restaurants, reviews, cuisines, and locations. It's built using Node.js, Express.js, and MongoDB with Mongoose.

[![Node.js](https://img.shields.io/badge/Node.js-%3E=20.0.0-green.svg)](https://nodejs.org/)

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the API](#running-the-api)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Restaurants](#restaurants)
  - [Reviews](#reviews)
  - [Cuisines](#cuisines)
  - [Locations](#locations)
- [Data Models](#data-models)
  - [User](#user)
  - [Restaurant](#restaurant)
  - [Review](#review)
  - [Cuisine](#cuisine)
  - [Location](#location)
- [Authentication and Authorization](#authentication-and-authorization)
- [Error Handling](#error-handling)

## Introduction

This API provides a platform for users to discover and review restaurants. It allows users to register, log in, browse restaurants, write reviews, and for restaurant owners (and admins) to manage restaurant information. Admins also have access to manage cuisines and locations.

## Features

- User authentication and authorization (JWT).
- CRUD operations for restaurants, reviews, cuisines, and locations.
- Data validation and error handling.
- Populated data in responses (e.g., reviews include user and restaurant details).
- Slug generation for restaurants.
- Average rating calculation for restaurants.
- Preventing duplicate reviews per user per restaurant.
- Location and Cuisine Management for admins.

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- npm or yarn
- MongoDB Atlas account and cluster

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/GeekGuruDev/restaurant-review-api.git
    ```

2.  Navigate to the project directory:

    ```bash
    cd restaurant-review-api
    ```

3.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

### Configuration

1.  Create a `.env` file in the root directory and add your environment variables (see `.env example` for reference):

    #### .env example

    ```
    MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
    ACCESS_TOKEN_SECRET=your_access_token_secret
    REFRESH_TOKEN_SECRET=your_refresh_token_secret
    RESET_TOKEN_SECRET=your_reset_token_secret
    ACCESS_TOKEN_EXPIRATION=15m
    REFRESH_TOKEN_EXPIRATION=7d
    EMAIL_USERNAME=your_email_username
    EMAIL_PASSWORD=your_email_password
    EMAIL_HOST=smtp.example.com
    EMAIL_PORT=587
    EMAIL_FROM=noreply@example.com
    PORT=3000
    ```

    - `MONGODB_URI`: Your MongoDB Atlas connection string (obtain this from your Atlas cluster).
    - `ACCESS_TOKEN_SECRET`: A secret key used to sign access JWTs.
    - `REFRESH_TOKEN_SECRET`: A secret key used to sign refresh JWTs.
    - `RESET_TOKEN_SECRET`: A secret key used to sign password reset JWTs.
    - `ACCESS_TOKEN_EXPIRATION`: The expiration time for access tokens (e.g., `15m` for 15 minutes, `1h` for 1 hour, `7d` for 7 days).
    - `REFRESH_TOKEN_EXPIRATION`: The expiration time for refresh tokens (e.g., `7d` for 7 days, `30d` for 30 days).
    - `EMAIL_USERNAME`: The username for your email service.
    - `EMAIL_PASSWORD`: The password for your email service.
    - `EMAIL_HOST`: The host of your SMTP email server (e.g., `smtp.gmail.com`, `smtp.example.com`).
    - `EMAIL_PORT`: The port of your SMTP email server (e.g., `587` for TLS, `465` for SSL).
    - `EMAIL_FROM`: The "from" address for emails sent by the API.
    - `PORT`: The port on which the API will run.

### Running the API

```bash
npm start
# or
yarn start
```

The API will be running on the specified port (default: 3000).

## API Endpoints

### Authentication

- **`POST /users/register`**: Register a new user.

  - Request Body: `{ username, email, password, bio?, profilePicture? }`
  - Response: `{ status: "success", accessToken: "...", data: { user } }`
  - Status Code: `201 Created`
  - Example Request:
    ```json
    {
      "username": "newUser",
      "email": "user@example.com",
      "password": "securePassword"
    }
    ```
  - Example Response:

    ```json
    {
      "status": "success",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "data": {
        "_id": "...",
        "username": "newUser",
        "email": "user@example.com",
        "role": "user",
        "bio": null,
        "profilePicture": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

- **`POST /users/login`**: Login a user (returns a JWT).

  - Request Body: `{ email, password }`
  - Response: `{ status: "success", accessToken: "...", data: { user } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "email": "user@example.com", "password": "securePassword" }
    ```
  - Example Response:

    ```json
    {
      "status": "success",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "data": {
        "_id": "...",
        "username": "...",
        "email": "user@example.com",
        "role": "...",
        "bio": "...",
        "profilePicture": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

- **`POST /users/refresh-token`**: Refresh an access token.

  - Request: The refresh token is sent in an HTTP-only cookie named `refreshToken`.
  - Response: `{ status: "success", accessToken: "..." }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJfaWQiOiIuLi4iLCJpYXQiOjE2OTg3NjU2MzUsImV4cCI6MTY5ODc2OTIzNX0...."
    }
    ```

- **`POST /users/forgot-password`**: Initiate password reset.

  - Request Body: `{ email }`
  - Response: `{ status: "success", message: "Password reset email sent." }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "email": "user@example.com" }
    ```
  - Example Response:
    ```json
    { "status": "success", "message": "Password reset email sent." }
    ```
  - Note: This endpoint sends an email with a link containing the reset token as a URL parameter.

- **`PATCH /users/reset-password/:resetToken`**: Reset password.

  - Request: The reset token is sent as a URL parameter.
  - Request Body: `{ password }`
  - Response: `{ status: "success", accessToken: "...", data: { user } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "password": "newSecurePassword" }
    ```
  - Example Response:

    ```json
    {
      "status": "success",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "data": {
        "_id": "...",
        "username": "...",
        "email": "...",
        "role": "...",
        "bio": "...",
        "profilePicture": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

### Users

- **`GET /users/me`**: Get the currently authenticated user's profile.
  - Response: `{ status: "success", data: { user } }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "username": "newUser",
        "email": "user@example.com",
        "role": "user",
        "bio": null,
        "profilePicture": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /users/me`**: Update the currently authenticated user's profile.
  - Request Body: `{ username?, email?, bio?, profilePicture? }` (Password updates are not allowed via this endpoint. Use `/users/me/password` to update the password.)
  - Response: `{ status: "success", data: { user } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "username": "updatedUser", "bio": "Updated bio" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "username": "updatedUser",
        "email": "user@example.com",
        "role": "user",
        "bio": "Updated bio",
        "profilePicture": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /users/me/password`**: Update the currently authenticated user's password.

  - Request Body: `{ currentPassword, newPassword }`
  - Response: `{ status: "success", accessToken: "...", data: { user } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "currentPassword": "oldPassword", "newPassword": "newSecurePassword" }
    ```
  - Example Response:

    ```json
    {
      "status": "success",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "data": {
        "_id": "...",
        "username": "...",
        "email": "user@example.com",
        "role": "...",
        "bio": "...",
        "profilePicture": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

- **`DELETE /users/me`**: Delete the currently authenticated user's account.

  - Response: `{ status: "success", data: null }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

- **`GET /users`**: Get a list of all users (admin only).

  - Response: `{ status: "success", data: [users] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "user": {
            "_id": "...",
            "username": "newUser",
            "email": "user@example.com",
            "role": "user",
            "bio": null,
            "profilePicture": null,
            "createdAt": "...",
            "updatedAt": "..."
          }
        }
      ]
    }
    ```

- **`GET /users/:id`**: Get details of a specific user (admin only).

  - Response: `{ status: "success", data: { user } }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "username": "newUser",
        "email": "user@example.com",
        "role": "user",
        "bio": null,
        "profilePicture": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

- **`PATCH /users`**: Update a specific user (admin only).

  - Request Body: `{ username?, email?, bio?, profilePicture? }` (Password updates are not allowed)
  - Response: `{ status: "success", data: { user } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "username": "updatedUser", "bio": "Updated bio" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "username": "updatedUser",
        "email": "user@example.com",
        "role": "user",
        "bio": "Updated bio",
        "profilePicture": null,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```

- **`DELETE /users`**: Delete a specific user (admin only)..
  - Response: `{ status: "success", data: null }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

### Restaurants

- **`GET /restaurants`**: Get a list of restaurants.
  - Response: `{ status: "success", data: [restaurants] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "name": "Luigi's Pizzeria",
          "description": "...",
          "address": "...",
          "location": "...",
          "cuisine": "...",
          "priceRange": "$$",
          "images": [],
          "slug": "luigis-pizzeria",
          "owner": "...",
          "menu": [],
          "averageRating": 0,
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```
- **`GET /restaurants/:id`**: Get details of a specific restaurant.
  - Response: `{ status: "success", data: { restaurant } }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "name": "Luigi's Pizzeria",
        "description": "...",
        "address": "...",
        "location": "...",
        "cuisine": "...",
        "priceRange": "$$",
        "images": [],
        "slug": "luigis-pizzeria",
        "owner": "...",
        "menu": [],
        "averageRating": 0,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`POST /restaurants`**: Create a new restaurant (owner/admin only).
  - Request Body: `{ name, description, address, location, cuisine, priceRange, images?, menu?, owner? }`
  - Response: `{ status: "success", data: { restaurant } }`
  - Example Request:
    ```json
    {
      "name": "New Restaurant",
      "description": "...",
      "address": "...",
      "location": "...",
      "cuisine": "...",
      "priceRange": "$$"
    }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "name": "New Restaurant",
        "description": "...",
        "address": "...",
        "location": "...",
        "cuisine": "...",
        "priceRange": "$$",
        "images": [],
        "slug": "new-restaurant",
        "owner": "...",
        "menu": [],
        "averageRating": 0,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /restaurants/:id`**: Update a restaurant (owner/admin only).
  - Request Body: `{ name?, description?, address?, location?, cuisine?, priceRange?, images?, menu? }`
  - Response: `{ status: "success", data: { restaurant } }`
  - Example Request:
    ```json
    { "name": "Updated Restaurant", "description": "Updated description" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "name": "Updated Restaurant",
        "description": "Updated description",
        "address": "...",
        "location": "...",
        "cuisine": "...",
        "priceRange": "$$",
        "images": [],
        "slug": "updated-restaurant",
        "owner": "...",
        "menu": [],
        "averageRating": 0,
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`DELETE /restaurants/:id`**: Delete a restaurant (owner/admin only).
  - Response: `{ status: "success", data: null }`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

### Reviews

- **`GET /reviews`**: Get a list of reviews.
  - Response: `{ status: "success", data: [reviews] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "reviewer": "...",
          "restaurant": "...",
          "rating": 4,
          "comment": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```
- **`GET /restaurants/:id/reviews`**: Get reviews for a specific restaurant.
  - Response: `{ status: "success", data: [reviews] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "reviewer": "...",
          "restaurant": "...",
          "rating": 5,
          "comment": "...",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```
- **`POST /reviews`**: Create a new review (authenticated user only).
  - Request Body: `{ restaurant, rating, comment }`
  - Response: `{ status: "success", data: { review } }`
  - Status Code: `201 Created`
  - Example Request:
    ```json
    { "restaurant": "...", "rating": 4, "comment": "Great food!" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "reviewer": "...",
        "restaurant": "...",
        "rating": 4,
        "comment": "Great food!",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /reviews/:id`**: Update a review (user who wrote the review or admin only).
  - Request Body: `{ rating?, comment? }`
  - Response: `{ status: "success", data: { review } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "rating": 5, "comment": "Even better than before!" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "reviewer": "...",
        "restaurant": "...",
        "rating": 5,
        "comment": "Even better than before!",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`DELETE /reviews/:id`**: Delete a review (user who wrote the review or admin only).
  - Response: `{ status: "success", data: null }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

### Cuisines

- **`GET /cuisines`**: Get a list of cuisines.
  - Response: `{ status: "success", data: [cuisines] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "name": "Italian",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```
- **`POST /cuisines`**: Create a new cuisine (admin only).
  - Request Body: `{ name }`
  - Response: `{ status: "success", data: { cuisine } }`
  - Status Code: `201 Created`
  - Example Request:
    ```json
    { "name": "Mexican" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "name": "Mexican",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /cuisines/:id`**: Update a cuisine (admin only).
  - Request Body: `{ name }`
  - Response: `{ status: "success", data: { cuisine } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "name": "Indian" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "name": "Indian",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`DELETE /cuisines/:id`**: Delete a cuisine (admin only).
  - Response: `{ status: "success", data: null }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

### Locations

- **`GET /locations`**: Get a list of locations.
  - Response: `{ status: "success", data: [locations] }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": [
        {
          "_id": "...",
          "city": "New York",
          "state": "NY",
          "country": "USA",
          "createdAt": "...",
          "updatedAt": "..."
        }
      ]
    }
    ```
- **`GET /locations/:id`**: Get a specific location.
  - Response: `{ status: "success", data: { location } }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "city": "Los Angeles",
        "state": "CA",
        "country": "USA",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`POST /locations`**: Create a new location (admin only).
  - Request Body: `{ city, state?, country }`
  - Response: `{ status: "success", data: { location } }`
  - Status Code: `201 Created`
  - Example Request:
    ```json
    { "city": "Chicago", "state": "IL", "country": "USA" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "city": "Chicago",
        "state": "IL",
        "country": "USA",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`PATCH /locations/:id`**: Update a location (admin only).
  - Request Body: `{ city?, state?, country? }`
  - Response: `{ status: "success", data: { location } }`
  - Status Code: `200 OK`
  - Example Request:
    ```json
    { "city": "Houston", "state": "TX" }
    ```
  - Example Response:
    ```json
    {
      "status": "success",
      "data": {
        "_id": "...",
        "city": "Houston",
        "state": "TX",
        "country": "USA",
        "createdAt": "...",
        "updatedAt": "..."
      }
    }
    ```
- **`DELETE /locations/:id`**: Delete a location (admin only).
  - Response: `{ status: "success", data: null }`
  - Status Code: `200 OK`
  - Example Response:
    ```json
    { "status": "success", "data": null }
    ```

## Data Models

### User

```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // Hashed
  role: String, // "user", "owner", "admin"
  bio: String?,
  profilePicture: String?,
  refreshTokens: [String],
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**

- `_id`: `ObjectId` - Unique identifier for the user.
- `username`: `String` - User's chosen username.
- `email`: `String` - User's email address.
- `password`: `String` - Hashed password for secure storage.
- `role`: `String` - User's role ("user", "owner", or "admin").
- `bio`: `String` (optional) - User's biography.
- `profilePicture`: `String` (optional) - URL to the user's profile picture.
- `refreshTokens`: `[String]` - Array of refresh tokens for authentication.
- `createdAt`: `Date` - Timestamp of user creation.
- `updatedAt`: `Date` - Timestamp of last user update.

### Restaurant

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  address: String,
  location: ObjectId, // Reference to Location
  cuisine: ObjectId, // Reference to Cuisine
  priceRange: String, // "$", "$$", "$$$"
  averageRating: Number,
  images: [String],
  slug: String,
  owner: ObjectId, // Reference to User (owner)
  menu: [Object], // Array of menu items
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**

- `_id`: `ObjectId` - Unique identifier for the restaurant.
- `name`: `String` - Restaurant name.
- `description`: `String` - Restaurant description.
- `address`: `String` - Restaurant address.
- `location`: `ObjectId` - Reference to the `Location` document.
- `cuisine`: `ObjectId` - Reference to the `Cuisine` document.
- `priceRange`: `String` - Price range of the restaurant ("$", "$$", or "$$$").
- `averageRating`: `Number` - Average rating of the restaurant (calculated from reviews).
- `images`: `[String]` - Array of URLs to restaurant images.
- `slug`: `String` - URL-friendly slug for the restaurant.
- `owner`: `ObjectId` - Reference to the `User` document (the restaurant owner).
- `menu`: `[Object]` - Array of menu items (objects with name, description, price, etc.).
- `createdAt`: `Date` - Timestamp of restaurant creation.
- `updatedAt`: `Date` - Timestamp of last restaurant update.

### Review

```javascript
{
  _id: ObjectId,
  reviewer: ObjectId, // Reference to User
  restaurant: ObjectId, // Reference to Restaurant
  rating: Number, // 1-5
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**

- `_id`: `ObjectId` - Unique identifier for the review.
- `reviewer`: `ObjectId` - Reference to the `User` document (the reviewer).
- `restaurant`: `ObjectId` - Reference to the `Restaurant` document.
- `rating`: `Number` - Review rating (1-5).
- `comment`: `String` - Review comment.
- `createdAt`: `Date` - Timestamp of review creation.
- `updatedAt`: `Date` - Timestamp of last review update.

### Cuisine

```javascript
{
  _id: ObjectId,
  name: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**

- `_id`: `ObjectId` - Unique identifier for the cuisine.
- `name`: `String` - Cuisine name (e.g., "Italian", "Mexican").
- `createdAt`: `Date` - Timestamp of cuisine creation.
- `updatedAt`: `Date` - Timestamp of last cuisine update.

### Location

```javascript
{
  _id: ObjectId,
  city: String,
  state: String?,
  country: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Fields:**

- `_id`: `ObjectId` - Unique identifier for the location.
- `city`: `String` - City name.
- `state`: `String` (optional) - State name.
- `country`: `String` - Country name.
- `createdAt`: `Date` - Timestamp of location creation.
- `updatedAt`: `Date` - Timestamp of last location update.

## Authentication and Authorization

This API utilizes JSON Web Tokens (JWT) for authentication and authorization.

### Authentication

- **User Registration:** Users can register using the `/users/register` endpoint. Upon successful registration, users can then log in.
- **User Login:** Users can log in using the `/users/login` endpoint by providing their email and password. A JWT access token is returned upon successful login.
- **Token Refresh:** Access tokens have a limited lifespan. To obtain a new access token without requiring the user to log in again, a refresh token is used via the `/users/refresh-token` endpoint. The refresh token is stored in an HTTP-only cookie for increased security.
- **Password Reset:**
  - Users can initiate a password reset by using the `/users/forgot-password` endpoint and providing their email address. A password reset link containing a unique reset token is sent to the user's email.
  - Users can reset their password by using the `/users/reset-password/:resetToken` endpoint and providing the reset token (from the email link) and a new password. A new access token is returned upon successful password reset.
- **Password Update:** Authenticated Users can change their password using the `/users/me/password` endpoint, by providing their current password and the new Password. A new access token is returned upon successful password change.

### Authorization

- **Role-Based Access Control (RBAC):** The API uses RBAC to control access to certain endpoints. Users are assigned roles (e.g., "user", "owner", "admin"), and these roles determine their permissions.
- **Protected Endpoints:** Certain endpoints, such as those for creating or updating restaurants, reviews, cuisines, and locations, require authentication and specific roles.
- **Token Verification:** All protected endpoints verify the presence and validity of the JWT access token in the `Authorization` header. If the token is invalid or expired, the request is rejected.
- **Owner Authorization:** Restaurant owner actions are authorized by comparing the user ID in the JWT to the restaurant's `owner` field.
- **Admin Authorization:** Administrative actions (e.g., creating/updating cuisines and locations) are restricted to users with the "admin" role.
- **Review Authorization:** Users can only update or delete reviews that they created, or if they have the admin role.

## Error Handling

This API implements comprehensive error handling to provide informative responses to client requests.

### Standard Error Responses

The API uses a consistent error response format:

```json
{
  "status": "error",
  "message": "A descriptive error message."
}
```

- `status`: Always "error" for error responses.
- `message`: A human-readable message explaining the cause of the error.

### HTTP Status Codes

The API uses standard HTTP status codes to indicate the nature of errors:

- **`400 Bad Request`**: Indicates that the server could not understand the request due to invalid syntax. This is often used for data validation errors.
- **`401 Unauthorized`**: Indicates that the request requires user authentication. This is returned when a user tries to access a protected resource without a valid access token.
- **`403 Forbidden`**: Indicates that the server understood the request but refuses to authorize it. This is returned when a user tries to access a resource they do not have permission to access (e.g., an admin-only endpoint).
- **`404 Not Found`**: Indicates that the requested resource could not be found.
- **`409 Conflict`**: Indicates that the request could not be completed due to a conflict with the current state of the target resource. This is often used for duplicate resource creation attempts (e.g., duplicate reviews).
- **`500 Internal Server Error`**: Indicates that the server encountered an unexpected condition that prevented it from fulfilling the request. This should be used for unexpected errors or exceptions.

### Specific Error Scenarios

- **Authentication Errors:**
  - Invalid credentials during login (`401`).
  - Expired or invalid access token (`401`).
  - Missing refresh token (`401`).
  - Invalid reset token (`400`).
- **Validation Errors:**
  - Missing required fields in request body (`400`).
  - Invalid data types or formats (`400`).
  - Password validation failures (`400`).
- **Authorization Errors:**
  - Attempt to access admin-only endpoints without admin role (`403`).
  - Attempt to update or delete a restaurant without being the owner or admin (`403`).
  - Attempt to update or delete a review without being the author or admin (`403`).
- **Resource Errors:**
  - Restaurant, review, cuisine, or location not found (`404`).
  - Duplicate review creation (`409`).
- **Server Errors:**
  - Database connection errors (`500`).
  - Unhandled exceptions (`500`).

### Error Logging

The API logs all server errors to assist in debugging and monitoring.
