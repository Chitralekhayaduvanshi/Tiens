"use server"

import { Resend } from "resend"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface CustomerInfo {
  name: string
  mobile: string
  address: string
}

export async function sendOrderConfirmation(customerInfo: CustomerInfo, orderSummary: string, totalPrice: number) {
  if (!resend) {
    console.error("Resend API key is not set. Email sending is disabled.")
    return { success: false, error: "Email sending is not configured" }
  }

  const emailContent = `
    <h1>Order Confirmation</h1>
    <h2>Customer Information:</h2>
    <p>Name: ${customerInfo.name}</p>
    <p>Mobile: ${customerInfo.mobile}</p>
    <p>Address: ${customerInfo.address}</p>
    
    <h2>Order Summary:</h2>
    <pre>${orderSummary}</pre>
    <p><strong>Total: ₹${totalPrice.toFixed(2)}</strong></p>
  `

  try {
    await resend.emails.send({
      from: "Tiens Store <tienswomen@gmail.com>",
      to: "tienswomen@gmail.com", // Replace with the actual email where you want to receive order confirmations
      subject: "New Order Confirmation",
      html: emailContent,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return { success: false, error: "Failed to send order confirmation email" }
  }
}

