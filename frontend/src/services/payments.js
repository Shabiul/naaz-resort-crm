import { api } from './api'

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve()
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay')))
      return
    }
    const s = document.createElement('script')
    s.src = RAZORPAY_SCRIPT
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Razorpay checkout'))
    document.body.appendChild(s)
  })
}

/**
 * Pay (full or partial) for a booking.
 * - mock mode: creates the order then auto-completes it server-side.
 * - live mode: opens the Razorpay checkout, then verifies the signature.
 * Returns the completed payment record, or throws / rejects on failure.
 */
export async function payForBooking({ bookingId, amount, user }) {
  const order = await api.createPaymentOrder(bookingId, amount)

  if (order.mode === 'mock') {
    const res = await api.simulatePayment(order.payment_id, 'success')
    return res.payment
  }

  // Live Razorpay checkout
  await loadRazorpayScript()
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount_minor,
      currency: order.currency,
      name: 'Naaz Resort',
      description: `Booking #${order.booking.id} payment`,
      order_id: order.order_id,
      prefill: { name: user?.full_name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#16a34a' },
      handler: async (response) => {
        try {
          const res = await api.verifyPayment({
            payment_id: order.payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          resolve(res.payment)
        } catch (err) {
          reject(err)
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    })
    rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'Payment failed')))
    rzp.open()
  })
}
