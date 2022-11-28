import express, { Router } from 'express';
import initializers from '../warehouse/initializers';

// Declare a router variable with type Router
// We assign it the Express Router function
const router: Router = express.Router();

// We tell the router to use the initializers middleware for all requests
// These initializers should run before each request makes it to its endpoint
router.use(Object.values(initializers));

// Export the router to be used in src/server/index.ts
export default router;
