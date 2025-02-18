// Import burger
import { Burger, setDir } from "../../src/index";

// Create a new burger instance
const burger = new Burger({
  port: 4000,
  apiDir: setDir(__dirname, "api"),
});

// Start the server
burger.serve();
