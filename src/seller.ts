import express from "ultimate-express";
import { paymentMiddleware, Network } from "x402-express";
// import { facilitator } from "@coinbase/x402"; // For mainnet
import dotenv from "dotenv";
import { address } from "@solana/kit";
dotenv.config();

const app = express();

app.use(
  paymentMiddleware(
    address(""), // your receiving wallet address
    {
      // Route configurations for protected endpoints
      "GET /weather": {
        // USDC amount in dollars
        price: "0.01",
        network: "solana-devnet", // for mainnet, see Running on Mainnet section
        // Optional: Add metadata for better discovery in x402 Bazaar
        config: {
          description: "Get current weather data for any location",
          inputSchema: {
            queryParams: {
              location: "string",
            },
          },
          outputSchema: {
            type: "object",
            properties: {
              weather: { type: "string" },
              temperature: { type: "number" },
            },
          },
        },
      },
    },
    {
      url: "https://x402.org/facilitator", // for testnet
    }
  )
);

// Implement your route
app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:4021`);
});
