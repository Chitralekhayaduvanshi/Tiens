"use server"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

export async function sendOrderSummary(email: string, orderItems: OrderItem[], total: number) {
  try {
    const formData = new FormData()
    formData.append('access_key', '74dd1247-0aec-492d-9ae2-5c880628132d')
    formData.append('email', email)
    
    const orderSummary = orderItems
      .map(item => 
        `${item.name} - Quantity: ${item.quantity} - Price: ₹${(item.price * item.quantity).toFixed(2)}`
      )
      .join("\n")
    
    formData.append('order_summary', orderSummary)
    formData.append('total', total.toString())

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
   
    const data = await response.json()
    return { success: data.success }
    
  } catch (error) {
    console.error("Failed to send order summary:", error)
    return { success: false }
  }
}

