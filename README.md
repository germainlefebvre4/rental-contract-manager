# Rental Contract Manager

## Overview

The Rental Contract Manager is a web application designed to facilitate the management of rental contracts. It allows users to create and manage products available for rent, generate rental contracts, and handle user information efficiently.

## Getting Started

Clone the repository.

```bash
git clone https://github.com/germainlefebvre4/rental-contract-manager
cd rental-contract-manager
```
### Database

Deploy a PostgreSQL database.

```bash
docker compose up -d
```

### Backend

Start the backend server.

```bash
cd backend/
go mod tidy
go run ./main.go
```

### Frontend

Start the frontend application.

```bash
cd frontend/
nvs use
pnpm install
pnpm start
```

## Project Structure

The project is divided into two main parts: the backend and the frontend.

### Backend

The backend is built using Golang and utilizes the Gin framework for routing and GORM for database interactions. The PostgreSQL database is used to store product, contract, and user information.

- **main.go**: Entry point of the backend application.
- **config/**: Contains configuration settings and environment variable loading.
- **models/**: Defines the data models for products, contracts, and users.
- **routes/**: Sets up the application routes.
- **controllers/**: Contains the logic for handling requests related to products, contracts, and users.
- **middlewares/**: Implements middleware for authentication and CORS.
- **utils/**: Provides utility functions for PDF generation and email sending.
- **database/**: Manages the database connection.

### Frontend

The frontend is developed using React and utilizes shadcn-ui for UI components. It provides an administration panel for managing products and contracts, as well as forms for renters to fill out their information.

- **src/components/**: Contains reusable UI components, product management components, contract management components, and form components.
- **src/pages/**: Includes pages for the admin panel, contract management, and renter information.
- **src/services/**: Handles API calls and PDF-related operations.
- **src/utils/**: Provides utility functions for data formatting and validation.
- **src/App.tsx**: Main application component that sets up routing.
- **src/index.tsx**: Entry point for the React application.
- **public/**: Contains the main HTML file and favicon.


## Features

- Create and manage rental products.
- Generate rental contracts as PDFs.
- User input forms for renters.
- Email confirmation upon user submission.
- Admin panel for managing products and contracts.

## Technologies Used

- **Backend**: Golang, Gin, GORM, PostgreSQL
- **Frontend**: React, shadcn-ui, Tailwind CSS

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any changes or improvements.

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details or visit the [Open Source Initiative - Apache 2.0](https://opensource.org/license/apache-2-0) license.

```raw
Copyright 2025 Germain LEFEBVRE

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
