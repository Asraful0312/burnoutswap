import { httpRouter } from "convex/server";
import { verifyProof } from "./verify";

const http = httpRouter();

http.route({
  path: "/verify-proof",
  method: "POST",
  handler: verifyProof,
});

// Handle CORS preflight for the verify-proof endpoint
http.route({
  path: "/verify-proof",
  method: "OPTIONS",
  handler: verifyProof,
});

export default http;
