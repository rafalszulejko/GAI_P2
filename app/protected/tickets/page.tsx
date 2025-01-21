import { guardRoute } from "@/utils/permissions";

export default async function TicketsPage() {
  // Check permissions before rendering the page
  await guardRoute('ticket.view')

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Tickets</h1>
      <p className="text-muted-foreground">Manage your support tickets here.</p>
    </div>
  );
} 