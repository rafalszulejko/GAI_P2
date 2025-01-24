"use client"

import { createClient } from "@/utils/supabase/client"
import { type Database } from "@/utils/supabase/supabase"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useEffect, useState } from "react"
import Link from "next/link"

type CustomerUser = Database["public"]["Tables"]["customer_user"]["Row"] & {
  customer_org: Database["public"]["Tables"]["customer_org"]["Row"]
  user_profile: Database["public"]["Tables"]["user_profile"]["Row"]
}

interface CustomersListProps {
  canViewDetails: boolean
}

export function CustomersList({ canViewDetails }: CustomersListProps) {
  const [customers, setCustomers] = useState<CustomerUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from("customer_user")
          .select(`
            *,
            customer_org (*),
            user_profile (*)
          `)

        if (error) throw error

        setCustomers(data)
      } catch (e) {
        console.error("Error fetching customers:", e)
        setError("Failed to load customers")
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  if (loading) return <div>Loading customers...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Organization</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={`${customer.customer_id}-${customer.user_id}`}>
              <TableCell>{customer.customer_org.name}</TableCell>
              <TableCell>
                {canViewDetails ? (
                  <Link 
                    href={`/protected/customers/${customer.user_id}`}
                    className="hover:underline"
                  >
                    {customer.user_profile.name}
                  </Link>
                ) : (
                  customer.user_profile.name
                )}
              </TableCell>
              <TableCell>{customer.user_profile.email}</TableCell>
              <TableCell>{customer.user_profile.location}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 