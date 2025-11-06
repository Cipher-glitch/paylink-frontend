import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";

// === YOUR STRIPE TEST KEY ===
const stripePromise = loadStripe("pk_test_51SQNY9IYhuJFmWuRNhTQ2Lq5dRXbeXBzANTy4zu5hoGY9GFAYhbaT563TojXQ1MjRZNWXRBVaZTLzgDRZGxOyQY3004jBxd89O");

export default function Home() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill amount from URL: ?amount=2500
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amt = params.get("amount");
    if (amt && !isNaN(amt)) setAmount(amt);
  }, []);

  const handleSubmit = async () => {
    if (!amount || amount < 1) return alert("Enter valid amount");

    setLoading(true);
    const stripe = await stripePromise;

    // Call your backend (Railway) to create PaymentIntent
    const res = await fetch("https://paylink.up.railway.app/api/create-pi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(parseFloat(amount) * 100) }),
    });

    const { clientSecret, error: backendError } = await res.json();
    if (backendError) {
      alert(backendError);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: window.cardElement,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Payment Successful! 🎉");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 400, margin: "40px auto", padding: 20, border: "1px solid #ddd", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Pay with Card</h2>
      
      <input
        type="number"
        placeholder="Amount in KES"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 12, margin: "12px 0", border: "1px solid #ccc", borderRadius: 8, fontSize: 16 }}
      />

      <div id="card-element" style={{ border: "1px solid #ccc", borderRadius: 8, padding: 12, background: "#fff", margin: "12px 0" }}></div>

      <button
        onClick={handleSubmit}
        disabled={loading || !amount}
        style={{
          width: "100%",
          padding: 14,
          background: loading ? "#999" : "#6366f1",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>

      <p style={{ fontSize: 12, color: "#777", textAlign: "center", marginTop: 20 }}>
        Test cards: 4242 4242 4242 4242<br />
        Any future expiry • Any CVV
      </p>

      {/* Load Stripe.js */}
      <script src="https://js.stripe.com/v3/" async></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const stripe = Stripe('pk_test_51SQNY9IYhuJFmWuRNhTQ2Lq5dRXbeXBzANTy4zu5hoGY9GFAYhbaT563TojXQ1MjRZNWXRBVaZTLzgDRZGxOyQY3004jBxd89O');
            const elements = stripe.elements();
            window.cardElement = elements.create('card', {
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': { color: '#aab7c4' },
                },
              },
            });
            window.cardElement.mount('#card-element');
          `,
        }}
      />
    </div>
  );
}