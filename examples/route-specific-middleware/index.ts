// Import burger
import { Burger, setDir } from "../../src/index";
import { globalMiddleware1 } from "./middleware";

// Create a new burger instance
const burger = new Burger({
  port: 4000,
  apiDir: setDir(__dirname, "api"),
  globalMiddleware: [globalMiddleware1],
});

// Start the server
burger.serve();
