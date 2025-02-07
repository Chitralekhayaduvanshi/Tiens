"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderSummary(email: string, orderItems: any[], total: number) {
  const orderSummary = orderItems
    .map(
      (item) =>
        `${item.name} - Quantity: ${item.quantity} - Price: $${((item.price * item.quantity) / 100).toFixed(2)}`,
    )
    .join("\n")

  const emailContent = `
    <h1>Order Summary</h1>
    <p>Thank you for your order. Here's a summary of your purchase:</p>
    <pre>${orderSummary}</pre>
    <p><strong>Total: $${(total / 100).toFixed(2)}</strong></p>
    <p>Please complete your payment using the payment image provided on the website.</p>
  `

  try {
    await resend.emails.send({
      from: "Tiens Store <orders@example.com>",
      to: email,
      subject: "Your Tiens Order Summary",
      html: emailContent,
    })
  } catch (error) {
    console.error("Failed to send email:", error)
    throw new Error("Failed to send order summary email")
  }
}

