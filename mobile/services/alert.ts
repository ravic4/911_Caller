import { getCurrentLocation } from "./location";
import { BACKEND_URL } from "../constants";

export async function sendSilentAlert(message?: string) {
  const location = await getCurrentLocation();

  const res = await fetch(`${BACKEND_URL}/api/alert/silent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, message }),
  });

  return res.json();
}

export async function fetchAgentToken(userProfile?: object) {
  const res = await fetch(`${BACKEND_URL}/api/agent/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userProfile }),
  });
  return res.json(); // { token, agentId }
}
