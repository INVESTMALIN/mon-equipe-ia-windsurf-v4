export const config = {
  api: {
    bodyParser: false
  },
  runtime: "nodejs"
}

export default async function handler(req, res) {
  console.log("📩 Webhook hit:", req.method)

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed")
  }

  try {
    // Test simple sans traitement Stripe
    console.log("✅ Webhook accessible - pas de crash")
    return res.status(200).json({ ok: true, message: "Webhook fonctionne" })
  } catch (err) {
    console.error("❌ Crash test:", err)
    return res.status(500).send("Internal Server Error")
  }
}