import React, { Suspense } from "react";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
const Home = React.lazy(() => import("./pages/Home"));
const Shop = React.lazy(() => import("./pages/Shop"));
import Menu from "./pages/Menu";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import OTP from "./pages/OTP";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import AdminRoute from "./components/AdminRoute";
const AdminDashboard = React.lazy(() => import("./pages/Admin/AdminDashboard"));
import AddItem from "./pages/Admin/AddItem";
import ProtectedRoute from "./components/ProtectedRoute";
import OrderHistory from "./pages/OrderHistory";
import ManageOrders from "./pages/Admin/ManageOrders";
import EditItem from "./pages/Admin/EditItem";
import ManageCategories from "./pages/Admin/ManageCategories";
import ManageMenu from "./pages/Admin/ManageMenu";
import Profile from "./pages/Profile";
import ManageCustomers from "./pages/Admin/ManageCustomers";
import ResetPassword from "./pages/ResetPassword";
import ItemDetailPage from "./pages/ItemDetailPage";
import ManageCoupons from "./pages/Admin/ManageCoupons";
import { Loader2 } from "lucide-react";
import OrderDetailPage from "./pages/OrderDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        {/* <Toaster /> */}
        <Sonner />
        <AuthProvider>
          <CartProvider>
            <Navigation />
            <Suspense
              fallback={
                <div className="flex h-screen items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              }
            >
              <main className="page-transition">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/item/:itemId" element={<ItemDetailPage />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/otp" element={<OTP />} />

                  <Route element={<ProtectedRoute />}>
                    <Route path="/profile" element={<Profile />} />{" "}
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route
                      path="/orders/:orderNumber"
                      element={<OrderDetailPage />}
                    />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                  </Route>

                  <Route element={<AdminRoute />}>
                    <Route
                      path="/admin/dashboard"
                      element={<AdminDashboard />}
                    />
                    <Route path="/admin/add-item" element={<AddItem />} />
                    <Route
                      path="/admin/manage-orders"
                      element={<ManageOrders />}
                    />
                    <Route
                      path="/admin/edit-item/:itemId"
                      element={<EditItem />}
                    />
                    <Route path="/admin/manage-menu" element={<ManageMenu />} />
                    <Route
                      path="/admin/manage-customers"
                      element={<ManageCustomers />}
                    />
                    <Route
                      path="/admin/manage-categories"
                      element={<ManageCategories />}
                    />
                    <Route
                      path="/admin/manage-coupons"
                      element={<ManageCoupons />}
                    />{" "}
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
