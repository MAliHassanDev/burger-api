// Import burger
import { Burger } from "../../src/index";
import * as path from "path";

// Create a new burger instance
const burger = new Burger({
  port: 4000,
  apiDir: path.join(__dirname, "api"),
});

// Start the server
burger.serve();
