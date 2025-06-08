const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export const API_URL = isLocalhost
  ? "http://localhost:5000/api"
  : "https://minjen.betjehuda.hu/api";
