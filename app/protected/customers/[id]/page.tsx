import { createClient } from "@/utils/supabase/server"
import { guardRoute, getUserPermissions } from "@/utils/permissions"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tables } from "@/utils/supabase/supabase"
import Link from "next/link"

type CustomerUserWithRelations = {
    customer_id: string
    customer_org: Tables<'customer_org'>
    user_profile: Tables<'user_profile'>
}

export default async function CustomerDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    await guardRoute('customer.details.view')

    // Get permissions for conditional rendering
    const permissions = await getUserPermissions()
    const canViewContext = permissions.includes('customer.context.view')
    const canViewOrgDetails = permissions.includes('org.details.view')

    // Fetch user data with customer org and profile
    const supabase = await createClient()
    
    // First get the customer_user entry
    const { data: customerUser, error: customerUserError } = await supabase
        .from('customer_user')
        .select(`
            customer_id,
            customer_org (
                id,
                name
            ),
            user_profile (
                id,
                name,
                email,
                location,
                created_at
            )
        `)
        .eq('user_id', id)
        .single() as { data: CustomerUserWithRelations | null, error: any }

    if (customerUserError || !customerUser) {
        return (
            <div className="container mx-auto py-6">
                <div className="p-4 border rounded-lg bg-destructive/10 text-destructive">
                    Customer not found
                </div>
            </div>
        )
    }

    // Fetch user's tickets if we have permission
    let tickets: Tables<'ticket'>[] | null = null
    if (canViewContext) {
        const { data: userTickets, error: ticketsError } = await supabase
            .from('ticket')
            .select('*')
            .eq('created_by', id)
            .order('created_at', { ascending: false })

        if (!ticketsError) {
            tickets = userTickets
        }
    }

    const { user_profile: profile, customer_org: org } = customerUser

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header section */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">{profile.name || 'Unnamed User'}</h1>
                <h2 className="text-xl text-muted-foreground">
                    Member of {org.name || 'Unnamed Organization'}
                </h2>
            </div>

            {/* Three column layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left column - Customer Details */}
                <div className="col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Details</CardTitle>
                        </CardHeader>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium">Email</span>
                                <span className="text-sm text-muted-foreground">{profile.email}</span>
                            </div>
                            {profile.location && (
                                <div className="flex flex-col space-y-1">
                                    <span className="text-sm font-medium">Location</span>
                                    <span className="text-sm text-muted-foreground">{profile.location}</span>
                                </div>
                            )}
                            <div className="flex flex-col space-y-1">
                                <span className="text-sm font-medium">Member since</span>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(profile.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Center column - Ticket History */}
                <div className="col-span-6">
                    {canViewContext ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Ticket History</CardTitle>
                            </CardHeader>
                            <ScrollArea className="h-[400px] p-6">
                                {tickets && tickets.length > 0 ? (
                                    <div className="space-y-4">
                                        {tickets.map((ticket) => (
                                            <div key={ticket.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Link 
                                                        href={`/protected/tickets/${ticket.id}`}
                                                        className="font-medium hover:underline flex-grow"
                                                    >
                                                        {ticket.title}
                                                    </Link>
                                                    {ticket.type && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {ticket.type}
                                                        </span>
                                                    )}
                                                    <span className="text-sm text-muted-foreground">
                                                        {ticket.STATE}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Created: {new Date(ticket.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground">
                                        No tickets found
                                    </div>
                                )}
                            </ScrollArea>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="text-center text-muted-foreground">
                                    You don't have permission to view ticket history
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </div>

                {/* Right column - Organization Details */}
                <div className="col-span-3">
                    {canViewOrgDetails ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>Organization Details</CardTitle>
                            </CardHeader>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="text-center text-muted-foreground">
                                    You don't have permission to view organization details
                                </div>
                            </CardHeader>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
} 