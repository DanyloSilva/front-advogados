"use client";

import { useState } from "react";
import PaymentCheckout from "@/components/PaymentCheckout";
import { Button } from "@/components/ui/button";

export default function CheckoutDemoPage() {
  const [open, setOpen] = useState(false)
  return (
    <div className="container mx-auto p-6">
      <Button onClick={()=>setOpen(true)}>Abrir Checkout (demo)</Button>
      <PaymentCheckout open={open} onOpenChange={setOpen} amount={499.9} onSuccess={()=>{ /* handled in modal */ }} />
    </div>
  )
}

