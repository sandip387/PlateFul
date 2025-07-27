import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, History, ShoppingBasket } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";
import api from "@/lib/api";
import { useState } from "react";
import ReviewModal from "@/components/ReviewModal";
import { useAuth } from "@/context/AuthContext";

const fetchOrders = async (): Promise<Order[]> => {
  const { data } = await api.get("/orders/my-orders");
  return data.data.orders;
};

const OrderHistory = () => {
  const { user } = useAuth();
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const {
    data: orders,
    isLoading,
    isError,
    error,
  } = useQuery<Order[]>({
    queryKey: ["orders", user?._id],
    queryFn: fetchOrders,
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Loading your order history...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem fetching your order history. Please try again
            later.
            <p className="mt-2 text-xs">{(error as Error).message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto py-20 px-4 text-center">
        <div className="flex flex-col items-center">
          <ShoppingBasket className="h-24 w-24 text-muted-foreground mb-6" />
          <h1 className="text-3xl font-bold text-foreground mb-4">
            No Orders Yet
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Looks like you haven't placed any orders with us. Let's find
            something delicious for you to try!
          </p>
          <Link to="/menu">
            <Button size="lg" className="gradient-primary border-0 shadow-warm">
              Explore the Menu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              My Order History
            </h1>
            <p className="text-muted-foreground">
              View details and leave reviews for your past orders.
            </p>
          </div>

          <div className="space-y-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.orderNumber}
                    </CardTitle>
                    <CardDescription>
                      Placed on{" "}
                      {format(new Date(order.createdAt), "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {order.status.replace("-", " ")}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <p className="text-muted-foreground">
                          {item.name}{" "}
                          <span className="text-foreground">
                            x{item.quantity}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2">
                      <Link to={`/orders/${order.orderNumber}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      {order.status === "delivered" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReviewOrder(order)}
                        >
                          Leave a Review
                        </Button>
                      )}
                    </div>
                    <span className="font-bold text-lg">
                      NRs {order.pricing.total.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <ReviewModal
        isOpen={!!reviewOrder}
        order={reviewOrder}
        onClose={() => setReviewOrder(null)}
      />
    </>
  );
};

export default OrderHistory;
