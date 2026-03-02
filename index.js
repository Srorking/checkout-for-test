import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/", express.static(path.join(__dirname, "public")));

// ---------------------------
// Helpers
// ---------------------------
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function id(prefix) { return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`; }

// ---------------------------
// Health
// ---------------------------
app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

// ---------------------------
// Checkout + Order endpoints (contain keywords: checkout/order/billing/payment/3ds/stripe/paypal)
// ---------------------------

// Create checkout session (checkout)
app.post("/api/checkout/create", async (req, res) => {
  await sleep(250);
  const { planId, email } = req.body || {};
  res.json({
    ok: true,
    checkoutId: id("chk"),
    planId: planId || "basic_monthly",
    email: email || "test@example.com"
  });
});

// Save billing address (billing)
app.post("/api/billing/update", async (req, res) => {
  await sleep(200);
  res.json({ ok: true, billingId: id("bill") });
});

// Create payment intent (stripe/payment)
app.post("/api/stripe/payment_intent", async (req, res) => {
  await sleep(300);
  const { amount } = req.body || {};
  res.json({
    ok: true,
    paymentIntentId: id("pi"),
    amount: amount ?? 1999,
    currency: "USD",
    clientSecret: id("secret") // mock
  });
});

// Pay via PayPal (paypal/payment)
app.post("/api/paypal/payment", async (req, res) => {
  await sleep(350);
  // mock redirect URL
  res.json({ ok: true, paypalApprovalUrl: "/confirm.html?pm=paypal" });
});

// Confirm card payment (payment/order)
app.post("/api/payment/confirm", async (req, res) => {
  await sleep(500);
  // 15% fail
  const ok = Math.random() > 0.15;
  if (!ok) return res.status(402).json({ ok: false, status: "failed", reason: "Card declined (mock)" });

  // 50% require 3DS
  const requires3ds = Math.random() > 0.5;
  res.json({
    ok: true,
    status: requires3ds ? "requires_3ds" : "succeeded",
    next3dsUrl: requires3ds ? "/api/3ds/challenge" : null
  });
});

// 3DS challenge (3ds)
app.post("/api/3ds/challenge", async (req, res) => {
  await sleep(700);
  const ok = Math.random() > 0.1;
  if (!ok) return res.status(401).json({ ok: false, status: "3ds_failed" });
  res.json({ ok: true, status: "3ds_passed" });
});

// Final order confirm (order/confirm)
app.post("/api/order/confirm", async (req, res) => {
  await sleep(250);
  const ok = Math.random() > 0.05;
  if (!ok) return res.status(500).json({ ok: false, status: "order_failed" });
  res.json({ ok: true, status: "order_confirmed", orderId: id("ord") });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅ Running: http://localhost:${PORT}`));
app.post("/api/order/calc", async (req, res) => {
  await sleep(180);
  const { amount } = req.body || {};
  const base = Number(amount ?? 1999);
  const tax = Math.round(base * 0.12);
  const shipping = 499;
  res.json({ tax, shipping, total: base + tax + shipping });
});