import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Loader2,
  Home,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { format } from "date-fns";

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { cart, itemCount, isLoading: isCartLoading } = useCart();

  const now = new Date();
  const defaultDate = format(now, "yyyy-MM-dd");
  const defaultTime = format(new Date(now.getTime() + 60 * 60 * 1000), "HH:mm");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    deliveryInstructions: "",
    scheduledDate: defaultDate,
    scheduledTime: defaultTime,
  });

  const [paymentMethod, setPaymentMethod] = useState("esewa");

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const orderMutation = useMutation({
    mutationFn: (newOrder: any) => api.post("/orders", newOrder),
    onSuccess: (response) => {
      toast.success("Order placed successfully!", {
        description: `Your order number is ${response.data.data.orderNumber}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      navigate("/orders");
    },
    onError: (error: any) => {
      const errorMessages = error.response?.data?.errors;
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        toast.error(errorMessages[0].msg);
      } else {
        toast.error(error.response?.data?.message || "Failed to place order.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || itemCount === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    const orderData = {
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      },
      items: cart.items.map((item) => ({
        menuItem: item.menuItem._id,
        quantity: item.quantity,
      })),
      specialInstructions: formData.deliveryInstructions,
      paymentMethod,
      scheduledFor: {
        date: formData.scheduledDate,
        time: formData.scheduledTime,
      },
    };
    orderMutation.mutate(orderData);
  };

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.13;
  const total = subtotal + deliveryFee + tax;

  if (isCartLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/cart" className="hover-lift mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
            <p className="text-muted-foreground">Complete your order</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Delivery Information */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="firstName"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                    <Input
                      name="lastName"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <Textarea
                    name="address"
                    placeholder="Full Delivery Address (Street, City)"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                  <Textarea
                    name="deliveryInstructions"
                    placeholder="Delivery Instructions (e.g., Leave at door)"
                    value={formData.deliveryInstructions}
                    onChange={handleInputChange}
                  />
                </CardContent>
              </Card>
              {/* Schedule */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Schedule Your Delivery</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="scheduledDate"
                      className="flex items-center"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Date
                    </Label>
                    <Input
                      id="scheduledDate"
                      name="scheduledDate"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      min={defaultDate}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="scheduledTime"
                      className="flex items-center"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Time
                    </Label>
                    <Input
                      id="scheduledTime"
                      name="scheduledTime"
                      type="time"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      type="button"
                      variant={
                        paymentMethod === "esewa" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("esewa")}
                      className="h-16 flex items-center justify-center"
                    >
                      <img
                        src={
                          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fictbyte.com%2Fwp-content%2Fuploads%2F2020%2F04%2Fesewa.jpg&f=1&nofb=1&ipt=b81593e53837a6990fe2465ade0b70627d7ace8326e2784ab7c0f04c2d62c361"
                        }
                        alt="eSewa"
                        className="h-8 object-contain"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant={
                        paymentMethod === "khalti" ? "default" : "outline"
                      }
                      onClick={() => setPaymentMethod("khalti")}
                      className="h-16 flex items-center justify-center"
                    >
                      <img
                        src={
                          "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.VVtFlQALfXztHjSXHmNQFgHaDE%3Fpid%3DApi&f=1&ipt=4c2ecde4d5235321834cd9bff32998452b2a02c6332fe8f802c1aba16eb844d5"
                        }
                        alt="Khalti"
                        className="h-6 object-contain"
                      />
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "cod" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("cod")}
                      className="h-16 flex flex-col gap-1"
                    >
                      <Home className="h-6 w-6" />
                      Cash on Delivery
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-card sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div
                        key={item.menuItem._id}
                        className="flex justify-between items-start"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-1">
                            {item.menuItem.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          NRs {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>NRs {subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Delivery Fee
                        </span>
                        <span>NRs {deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (13%)</span>
                        <span>NRs {tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          NRs {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        NRs {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary border-0 shadow-warm text-lg h-12 py-4"
                    disabled={orderMutation.isPending}
                  >
                    {orderMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        <Lock className="h-5 w-5 mr-2" />
                        Complete Order - NRs {total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
