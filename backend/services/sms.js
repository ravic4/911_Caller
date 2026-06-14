import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const FROM = process.env.TWILIO_FROM_NUMBER;

export async function sendSilentAlert(contacts, location, message) {
  const mapsLink = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : "Location unavailable";

  const body = message
    ? `ALERT: ${message}\nLocation: ${mapsLink}`
    : `ALERT: I may be in danger. My location: ${mapsLink}`;

  const sends = contacts.map((c) =>
    client.messages
      .create({ body, from: FROM, to: c.phone })
      .then(() => ({ name: c.name, status: "sent" }))
      .catch((err) => ({ name: c.name, status: "failed", error: err.message }))
  );

  return Promise.all(sends);
}
