"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

const products = [
  { id: "prod_1", name: "Tiens Sanitary Napkins- Day Use", price: 195, image: "/DAY USE.jpg" },
  {
    id: "prod_2",
    name: "Tiens Sanitary Napkins- Night Use",
    price: 182,
    image: "/Night use.jpg",
  },
  {
    id: "prod_3",
    name: "Tiens Sanitary Napkins- Panty Liner",
    price: 298,
    image: "/Panty Liner.jpg",
  },
]

interface CustomerInfo {
  name: string
  mobile: string
  address: string
}

export default function ProductListing() {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [orderSummary, setOrderSummary] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState(0)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    mobile: "",
    address: "",
  })
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false)

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, quantity) }))
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckout = async () => {
    const orderItems = Object.entries(quantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find((p) => p.id === productId)!
        return {
          name: product.name,
          quantity,
          price: product.price,
        }
      })

    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
    setTotalPrice(total)

    const summary = orderItems
      .map((item) => `${item.name} - Quantity: ${item.quantity} - Price: ₹${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")

    setOrderSummary(summary)
    setIsDialogOpen(true)
    setIsPaymentConfirmed(false)

    // Send order details to Web3Forms
    try {
      const formData = new FormData()
      formData.append('access_key', 'YOUR-WEB3FORMS-ACCESS-KEY') // Replace with your Web3Forms access key
      formData.append('name', customerInfo.name)
      formData.append('mobile', customerInfo.mobile)
      formData.append('address', customerInfo.address)
      formData.append('order_summary', summary)
      formData.append('total_price', total.toString())

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Order Placed",
          description: "Your order has been placed successfully.",
        })
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleConfirmPayment = async () => {
    try {
      const formData = new FormData()
      formData.append('access_key', 'YOUR-WEB3FORMS-ACCESS-KEY') // Replace with your Web3Forms access key
      formData.append('name', customerInfo.name)
      formData.append('mobile', customerInfo.mobile)
      formData.append('address', customerInfo.address)
      formData.append('order_summary', orderSummary)
      formData.append('total_price', totalPrice.toString())
      formData.append('payment_status', 'Confirmed')

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setIsPaymentConfirmed(true)
        toast({
          title: "Payment Confirmed",
          description: "Your payment has been confirmed and the order details have been recorded.",
        })
      } else {
        throw new Error('Failed to confirm payment')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error confirming your payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  const totalItems = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const orderTotal = products.reduce((sum, product) => sum + (quantities[product.id] || 0) * product.price, 0)

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square relative mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <div className="flex items-center space-x-2">
                <Label htmlFor={`quantity-${product.id}`} className="sr-only">
                  Quantity
                </Label>
                <Input
                  id={`quantity-${product.id}`}
                  type="number"
                  min="0"
                  value={quantities[product.id] || 0}
                  onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value, 10))}
                  className="w-20"
                />
                <Button onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) + 1)}>
                  Add to Cart
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={customerInfo.name} onChange={handleCustomerInfoChange} required />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={customerInfo.mobile}
                onChange={handleCustomerInfoChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleCustomerInfoChange}
                required
              />
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="flex justify-between mb-2">
          <span>Total Items:</span>
          <span>{totalItems}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Total Price:</span>
          <span>₹{orderTotal.toFixed(2)}</span>
        </div>
        <Button
          onClick={handleCheckout}
          className="w-full"
          disabled={totalItems === 0 || !customerInfo.name || !customerInfo.mobile || !customerInfo.address}
        >
          Place Order
        </Button>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Order Confirmation</DialogTitle>
            <DialogDescription>
              Your order has been placed successfully. Please complete the payment using the image below.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Customer Information:</h3>
            <p>Name: {customerInfo.name}</p>
            <p>Mobile: {customerInfo.mobile}</p>
            <p>Address: {customerInfo.address}</p>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Order Summary:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {orderSummary}
              {"\n\n"}Total: ₹{totalPrice.toFixed(2)}
            </pre>
          </div>
          <div className="flex justify-center mt-4">
            <Image
              src="/placeholder.svg?height=300&width=300"
              alt="Payment QR Code"
              width={300}
              height={300}
              className="rounded-lg"
            />
          </div>
          <p className="text-center mt-4 text-sm text-gray-500">
            After payment, please click the button below to confirm your payment.
          </p>
          <Button onClick={handleConfirmPayment} className="w-full mt-4" disabled={isPaymentConfirmed}>
            {isPaymentConfirmed ? "Payment Confirmed" : "Confirm Payment"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

