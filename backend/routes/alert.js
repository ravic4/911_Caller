import { Router } from "express";
import { loadContacts } from "../services/csv.js";
import { sendSilentAlert } from "../services/sms.js";

const router = Router();

// POST /api/alert/silent
// Body: { location: { lat, lng }, message?: string, contacts?: string[] }
// Sends SMS to all (or specified) emergency contacts immediately.
router.post("/silent", async (req, res) => {
  try {
    const { location, message, contacts: contactFilter } = req.body;
    let contacts = loadContacts();

    if (contactFilter?.length) {
      contacts = contacts.filter((c) => contactFilter.includes(c.name));
    }

    if (!contacts.length) {
      return res.status(400).json({ error: "No contacts configured." });
    }

    const results = await sendSilentAlert(contacts, location, message);
    res.json({ sent: results });
  } catch (err) {
    console.error("Silent alert error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
