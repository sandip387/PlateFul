import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface AdminOrder {
  _id: string;
  orderNumber: string;
  customerInfo: {
    firstName: string;
    lastName: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  createdAt: string;
}

const ManageOrders = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery<{
    success: boolean;
    data: { orders: AdminOrder[] };
  }>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      // NOTE: The backend route /api/admin/orders should exist and return all orders.
      const response = await api.get("/admin/orders");
      return response.data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      orderNumber,
      status,
    }: {
      orderNumber: string;
      status: string;
    }) => api.patch(`/orders/${orderNumber}/status`, { status }),
    onSuccess: () => {
      toast.success("Order status updated!");
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update status.");
    },
  });

  const handleStatusChange = (orderNumber: string, newStatus: string) => {
    statusMutation.mutate({ orderNumber, status: newStatus });
  };

  const orderStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "out-for-delivery",
    "delivered",
    "cancelled",
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-10 w-32" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  }
  if (isError) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5}>
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{(error as Error).message}</AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  const orders = data?.data?.orders || [];
  if (orders.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} className="text-center h-24">
            No orders found.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Manage Orders</CardTitle>
          <CardDescription>
            View and update the status of all customer orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell className="font-medium">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>{`${order.customerInfo.firstName} ${order.customerInfo.lastName}`}</TableCell>
                  <TableCell>
                    {format(new Date(order.createdAt), "PPpp")}
                  </TableCell>
                  <TableCell className="text-right">
                    NRs {order.pricing.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Select
                      defaultValue={order.status}
                      onValueChange={(newStatus) =>
                        handleStatusChange(order.orderNumber, newStatus)
                      }
                      disabled={
                        statusMutation.isPending &&
                        statusMutation.variables?.orderNumber ===
                          order.orderNumber
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>
                          <Badge
                            variant={getStatusVariant(order.status) as any}
                            className="capitalize"
                          >
                            {order.status.replace("-", " ")}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {orderStatuses.map((status) => (
                          <SelectItem
                            key={status}
                            value={status}
                            className="capitalize"
                          >
                            {status.replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
export default ManageOrders;
