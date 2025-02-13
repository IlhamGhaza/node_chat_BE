# Node.js Chat Backend

This is a Node.js backend for a chat application, built using **Express.js** for server-side logic and **Socket.io** for real-time communication.

## Table of Contents

- [Node.js Chat Backend](#nodejs-chat-backend)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Usage](#usage)
    - [Register](#register)
  - [API Documentation](#api-documentation)
  - [Docker Setup](#docker-setup)
  - [Contributing](#contributing)
  - [License](#license)
  - [Contact](#contact)
  - [Acknowledgments](#acknowledgments)
    - [Note:](#note)

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (version 14 or higher)
- **PostgreSQL** (version 14 or higher)

## Installation

Follow these steps to set up the project on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/IlhamGhaza/node-chat-be.git
   ```

2. **Install the required dependencies:**

   ```bash
   npm install
   ```

3. **Create a `/src/models/db.ts` file** in the root directory and add the following variables to configure the database:

   ```bash
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=yourusername
   DB_PASSWORD=yourpassword
   DB_NAME=chatdb
   ```

4. **Create the database schema**:
   - Copy the command from the `init.sql` file and run it in your terminal to set up the database schema.

5. **Run the server:**
   ```bash
   npm start
   ```

## Configuration

You can customize the host and port for your application by editing the `index.ts` file. Look for the following lines:

```typescript
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 6000;
```

- To change the values, set the `HOST` and `PORT` environment variables in your `.env` file.

## Usage

The application provides the following endpoints:

### Register

To register a new user, send a `POST` request to the `/register` endpoint with the following JSON body:

```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "password123"
}
```

## API Documentation

The API documentation is provided using Postman for easy exploration and testing of the API endpoints.

You can find the Postman collection in the postman folder in the project directory.

How to use the Postman Collection

1. Open **Postman**.
2. Click on the **Import** button (top left).
3. Select the **Postman Collection** file from the `postman` folder.
4. Once imported, you can view and interact with all the available API endpoints.

---

## Docker Setup

You can run the application using **Docker** for easier deployment. To do so, follow these steps:

1. Ensure you have Docker installed on your system.
2. **Build the Docker image:**

   ```bash
   docker build -t node-chat-be:latest .
   ```

3. Run the command `docker-compose up` to start the Docker container.
4. Access the container using the command `docker exec -it node-chat-be bash`.
5. Edit the `.env` file using the command `vim .env` to configure the application.
6. Restart the container using the command `docker-compose restart` after editing the `.env` file.

<!-- **Run the Docker container:**

   ```bash
   docker run -p 6000:6000 node-chat-be 
   ``` -->

This will start the application on port `6000`.

note :

- change the port number to your desired port. Example: `-p 8000:6000` = `localhost:8000`
- Make sure to configure the values in the `.env` file before running the application.

---

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and submit a pull request.

## License

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC_BY--NC_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International Public License (CC BY-NC 4.0)**. </br>

See the LICENSE file for more information.

## Contact

If you have any questions or suggestions, feel free to contact us at [email](mailto:cb7ezeur@selenakuyang.anonaddy.com).

---

## Acknowledgments

This project uses the following dependencies:

- **Express.js** – Minimal and flexible Node.js web application framework
- **Socket.io** – Library for real-time web applications
- **PostgreSQL** – Open-source relational database
- **Docker** – Platform for developing, shipping, and running applications

This project is maintained by **Ilham Ghaza**.

---

### Note:

- Make sure to replace `yourusername` and `yourpassword` in the `/src/models/db.ts` file with your own PostgreSQL credentials.
