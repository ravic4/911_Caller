import { parse } from "csv-parse/sync";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadContacts() {
  const raw = readFileSync(join(__dirname, "../contacts.csv"), "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true }).sort(
    (a, b) => Number(a.priority) - Number(b.priority)
  );
}

// Build a context string injected into the ElevenLabs agent so it knows
// the user's emergency contacts, medical notes, and preferred language.
export function buildAgentContext(contacts, userProfile) {
  const contactList = contacts
    .map((c) => `${c.name} (${c.relationship}): ${c.phone}`)
    .join(", ");

  return [
    `USER EMERGENCY PROFILE:`,
    userProfile?.name ? `Name: ${userProfile.name}` : null,
    userProfile?.medicalNotes ? `Medical: ${userProfile.medicalNotes}` : null,
    userProfile?.language ? `Preferred language: ${userProfile.language}` : null,
    `Emergency contacts: ${contactList}`,
    `ROLE: You are a 911 relay agent. Speak calmly and clearly. When the user is in danger, gather their location and situation, relay it to the operator, and keep the user calm. Translate between the user and the operator as needed.`,
  ]
    .filter(Boolean)
    .join("\n");
}
