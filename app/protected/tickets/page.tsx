import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function TicketsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Tickets</h1>
      <p className="text-muted-foreground">Manage your support tickets here.</p>
    </div>
  );
} 