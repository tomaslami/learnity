import { MercadoPagoConfig } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (!accessToken || accessToken === "TEST-YOUR-ACCESS-TOKEN") {
  console.warn(
    "Mercado Pago access token is not set or is using a placeholder. " +
    "Real payments will not work. Please set MERCADO_PAGO_ACCESS_TOKEN in your environment variables."
  );
}

// Initialize the Mercado Pago client
// The access token is validated by the SDK itself if it's malformed or invalid for API calls.
// Using a placeholder here is fine for setup, but API calls will fail.
const client = new MercadoPagoConfig({ 
  accessToken: accessToken || "TEST-YOUR-ACCESS-TOKEN",
  options: {
    timeout: 5000, // Optional: Set a timeout for requests
    // idempotencyKey: 'YOUR_IDEMPOTENCY_KEY' // Optional: For idempotent requests
  }
});

export default client;
