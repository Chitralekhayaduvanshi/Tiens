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
import { Textarea } from "@/components/ui/textarea"

const products = [
  {
    id: "prod_1",
    name: "Tiens Calcium Hydroxymethylbutyrate (HMB)",
    price: 2344,
    image: "/Tiens_Nutrient_Super_Calcium_Powder.jpg",
    description: "High-quality calcium supplement for bone health"
  },
  {
    id: "prod_2",
    name: "Tiens Spirulina",
    price: 2961,
    image: "/Spirulina_capsules_tiens.jpg",
    description: "Natural superfood rich in nutrients and antioxidants"
  },
  {
    id: "prod_3",
    name: "Tiens Revitize Amla and Neem Hair Oil",
    price: 363,
    image: "/Tiens Revitize Amla and Neem Hair Oil.jpg",
    description: "It is a hair oil that can help with hair growth, dandruff, and hair fall. It can also help with hair strengthening, nourishment, and shine. "
  },
  { 
    id: "prod_4", 
    name: "Tiens Sanitary Napkins- Day Use", 
    price: 195, 
    image: "/DAY USE.jpg",
    description: "Comfortable protection for daily use with advanced absorption technology"
  },
  {
    id: "prod_5",
    name: "Tiens Sanitary Napkins- Night Use",
    price: 182,
    image: "/Night use.jpg",
    description: "Extra protection for overnight comfort with extended coverage"
  },
  {
    id: "prod_6",
    name: "Tiens Sanitary Napkins- Panty Liner",
    price: 298,
    image: "/Panty Liner.jpg",
    description: "Light, daily freshness with ultra-thin design"
  }
]

interface CustomerInfo {
  name: string
  mobile: string
  address: string
}

interface Testimonial {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

const DELIVERY_THRESHOLD = 2100
const DELIVERY_CHARGE = 200

const initialTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Nirmala Yadav",
    rating: 5,
    comment: "I've been using Tiens Calcium for 3 months and my bone density has improved significantly. The results are amazing!",
    date: "2024-02-20"
  },
  {
    id: "t2",
    name: "Rajesh Kumar",
    rating: 5,
    comment: "Tiens Spirulina has boosted my immunity and energy levels. I take it daily and feel much healthier now.",
    date: "2024-02-18"
  },
  {
    id: "t3",
    name: "Chitralekha Yaduvanshi",
    rating: 5,
    comment: "The sanitary napkins are super comfortable and eco-friendly. I love that they're chemical-free & Biodegradable!",
    date: "2024-02-15"
  },
  {
    id: "t4",
    name: "Amit Shah",
    rating: 4,
    comment: "Hair oil has worked wonders for my hair fall problem. Seeing visible results in just 2 months.",
    date: "2024-02-12"
  },
  {
    id: "t5",
    name: "Priya Malhotra",
    rating: 5,
    comment: "Quality products at reasonable prices. The delivery was quick and the customer service is excellent!",
    date: "2024-02-10"
  }
]

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
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState<number>(0)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials)

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prev) => ({ ...prev, [productId]: Math.max(0, quantity) }))
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    if (name === 'mobile') {
      // Only allow numbers and limit to 10 digits
      const numbersOnly = value.replace(/\D/g, '').slice(0, 10)
      setCustomerInfo((prev) => ({ ...prev, mobile: numbersOnly }))
    } else {
      setCustomerInfo((prev) => ({ ...prev, [name]: value }))
    }
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
      formData.append('delivery_charge', DELIVERY_CHARGE.toString())
      formData.append('total_price', (total + DELIVERY_CHARGE).toString())

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
      formData.append('delivery_charge', DELIVERY_CHARGE.toString())
      formData.append('total_price', (totalPrice + DELIVERY_CHARGE).toString())
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
        setShowFeedbackDialog(true)
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

  const handleFeedbackSubmit = async () => {
    try {
      const formData = new FormData()
      formData.append('access_key', '74dd1247-0aec-492d-9ae2-5c880628132d')
      formData.append('name', customerInfo.name)
      formData.append('rating', rating.toString())
      formData.append('feedback', feedback)

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        // Add the new testimonial to the list
        const newTestimonial: Testimonial = {
          id: `t${Date.now()}`,
          name: customerInfo.name,
          rating,
          comment: feedback,
          date: new Date().toISOString().split('T')[0]
        }
        setTestimonials(prev => [newTestimonial, ...prev])

        toast({
          title: "Thank You!",
          description: "Your feedback has been submitted successfully.",
        })
        setShowFeedbackDialog(false)
        setIsDialogOpen(false)
      } else {
        throw new Error('Failed to submit feedback')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error submitting your feedback. Please try again.",
        variant: "destructive"
      })
    }
  }

  const totalItems = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0)
  const orderTotal = products.reduce((sum, product) => sum + (quantities[product.id] || 0) * product.price, 0)
  const deliveryCharge = orderTotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE
  const finalTotal = orderTotal + deliveryCharge

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-4xl font-bold text-primary">Tiens Products</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our range of high-quality health and wellness products
        </p>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-green-700 font-medium">
            🚚 Free delivery on orders above ₹{DELIVERY_THRESHOLD.toFixed(2)}!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-bold line-clamp-2">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square relative mb-4 overflow-hidden rounded-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(product.id, Math.max(0, (quantities[product.id] || 0) - 1))}
                    disabled={!quantities[product.id]}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="0"
                    value={quantities[product.id] || 0}
                    onChange={(e) => handleQuantityChange(product.id, Number.parseInt(e.target.value, 10))}
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(product.id, (quantities[product.id] || 0) + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="my-12">
        <h2 className="text-3xl font-bold text-center mb-8">Customer Testimonials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{testimonial.name}</CardTitle>
                    <p className="text-sm text-gray-500">{testimonial.date}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                    {Array.from({ length: 5 - testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-gray-300">★</span>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 italic">"{testimonial.comment}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-2xl">Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleCustomerInfoChange}
                  className="h-11"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-base">Mobile Number</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  value={customerInfo.mobile}
                  onChange={handleCustomerInfoChange}
                  placeholder="Enter 10 digit mobile number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className="h-11"
                  required
                />
                {customerInfo.mobile && customerInfo.mobile.length !== 10 && (
                  <p className="text-sm text-red-500">
                    Please enter a valid 10-digit mobile number
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-base">Delivery Address</Label>
              <Textarea
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter your complete delivery address"
                className="min-h-[100px]"
                required
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span>Total Items:</span>
              <span className="font-semibold">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Subtotal:</span>
              <span className="font-semibold">₹{orderTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Delivery Charge:</span>
              {deliveryCharge === 0 ? (
                <span className="text-green-600 font-medium">FREE</span>
              ) : (
                <span>₹{deliveryCharge.toFixed(2)}</span>
              )}
            </div>
            {orderTotal > 0 && orderTotal < DELIVERY_THRESHOLD && (
              <div className="text-sm text-green-600 text-center">
                Add ₹{(DELIVERY_THRESHOLD - orderTotal).toFixed(2)} more for free delivery!
              </div>
            )}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center text-xl">
                <span>Total Amount:</span>
                <span className="font-bold text-primary">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full h-12 text-lg"
              disabled={
                totalItems === 0 || 
                !customerInfo.name || 
                !customerInfo.mobile || 
                customerInfo.mobile.length !== 10 || 
                !customerInfo.address
              }
            >
              Place Order
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{orderTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Charge:</span>
                    {deliveryCharge === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <span>₹{deliveryCharge.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Payment Instructions</h3>
              <div className="flex justify-center">
                <Image
                  src="/QR_CY.jpeg"
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
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Your Feedback</DialogTitle>
            <DialogDescription className="text-center text-lg mt-2">
              Please share your experience with us
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input
                value={customerInfo.name}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant={rating >= star ? "default" : "outline"}
                    size="icon"
                    onClick={() => setRating(star)}
                    className="w-10 h-10"
                  >
                    ★
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Your Comments</Label>
              <Textarea
                id="feedback"
                placeholder="Tell us about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleFeedbackSubmit}
              className="w-full"
              disabled={!rating || !feedback.trim()}
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

