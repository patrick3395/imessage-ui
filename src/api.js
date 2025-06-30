import axios from "axios";

// Base URL of your Flask API
export const API_BASE  = import.meta.env.VITE_API_BASE;
const       API_TOKEN = import.meta.env.VITE_API_TOKEN;

/**
 * sendMessage - sends an iMessage via your Flask backend
 * @param {string} to      E.164 phone number (e.g. "+18323198846")
 * @param {string} message The text to send
 */
export function sendMessage(to, message) {
  return axios.post(
    `${API_BASE}/send`,
    { to, message },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );
}
