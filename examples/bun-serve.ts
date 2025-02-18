// Import burger
import { Burger } from "../src/index";

// Create a new burger instance
const burger = new Burger({
  port: 4000,
});

// Start the server
burger.serve();
