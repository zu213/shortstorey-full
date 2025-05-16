# 🏠 "Short storey" - backend

Backend for a future short story sharing platform.

This project uses Prisma to set up a database that supports a **rating system**. In this system, a user's credibility depends on the ratings given to their stories. However, the ratings that users give are also weighted by their own credibility score. New users are assigned the database's average credibility rating.


## Running Locally

### Prerequisites

- Node.js (npm package manager)

### Execution

1. Install dependencies:
   ```sh
   npm install
   ```
2. Set up the database:
   ```sh
   npm run prisma-setup
   ```
3. Start the server:
   ```sh
   npm start
   ```

This ensures that the backend is correctly set up and ready for use.

