// src/app/seller/[sellerId]/page.tsx
import { redirect } from "next/navigation"

export default function SellerRedirectPage({ params }: any) {
  redirect(`/seller/${params.sellerId}/chat`)
}
