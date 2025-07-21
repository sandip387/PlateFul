import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Order {
  _id: string;
  orderNumber: string;
  status: string;
  pricing: {
    total: number;
  };
  items: {
    name: string;
    quantity: number;
  }[];
  createdAt: string;
}

const OrderHistory = () => {
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery<{
    success: boolean;
    data: { orders: Order[] };
  }>({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not found");
      const response = await api.get(`/orders/customer/${user.id}`);
      return response.data;
    },
    enabled: !!user?.id,
  });

  const orders = data?.data?.orders || [];

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
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {(error as Error).message || "Failed to fetch your orders."}
        </AlertDescription>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-semibold">No Orders Found</h2>
        <p className="mt-2 text-muted-foreground">
          You haven't placed any orders yet.
        </p>
        <Button asChild className="mt-6 gradient-primary">
          <Link to="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <Card key={order._id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">
                  Order #{order.orderNumber}
                </CardTitle>
                <CardDescription>
                  Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
                </CardDescription>
              </div>
              <Badge
                variant={getStatusVariant(order.status) as any}
                className="capitalize"
              >
                {order.status.replace("-", " ")}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <p className="text-muted-foreground">
                      {item.name}{" "}
                      <span className="text-foreground">x{item.quantity}</span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold text-lg">
                  NRs {order.pricing.total.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
    
export default OrderHistory;
