"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle } from "lucide-react"

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
      formData.append('access_key', '74dd1247-0aec-492d-9ae2-5c880628132d') // Replace with your Web3Forms access key
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
      formData.append('access_key', '74dd1247-0aec-492d-9ae2-5c880628132d') // Replace with your Web3Forms access key
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Order Details</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              Please review your order details below
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Customer Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span>
                  <span className="ml-2">{customerInfo.name}</span>
                </div>
                <div>
                  <span className="font-medium">Mobile:</span>
                  <span className="ml-2">{customerInfo.mobile}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Address:</span>
                  <span className="ml-2">{customerInfo.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {orderSummary.split('\n').map((line, index) => (
                  <div key={index} className="text-sm">
                    {line}
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Payment Instructions</h3>
              <div className="flex justify-center">
                <Image
                  src="/qr-code.jpg"
                  alt="Payment QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg border border-gray-200"
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Scan the QR code above to make the payment
                </p>
                <p className="text-sm text-gray-600">
                  After completing the payment, click the button below
                </p>
              </div>
            </div>

            <Button 
              onClick={handleConfirmPayment} 
              disabled={isPaymentConfirmed}
              className="w-full"
            >
              {isPaymentConfirmed ? (
                <span className="flex items-center gap-2">
                  Payment Confirmed <CheckCircle className="h-4 w-4" />
                </span>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

