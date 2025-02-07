import ProductListing from "./components/ProductListing"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Tiens Product Store</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <ProductListing />
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">© 2025 Tiens. All rights reserved.</div>
      </footer>
      <Toaster />
    </div>
  )
}

