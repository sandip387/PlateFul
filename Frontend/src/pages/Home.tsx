import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Heart,
  Clock,
  Star,
  Utensils,
  Shield,
  Truck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { MenuItem } from "@/types";
import { MenuItemCard } from "@/components/MenuItemCard";
const Home = () => {
  const { data, isLoading, isError } = useQuery<{
    success: boolean;
    data: { recommendations: MenuItem[] };
  }>({
    queryKey: ["popularItems"],
    queryFn: () =>
      api.get("/recommendations/popular?limit=3").then((res) => res.data),
  });

  const popularDishes = data?.data?.recommendations || [];

  const features = [
    {
      icon: Heart,
      title: "Made with Love",
      description:
        "Every dish is prepared with care and passion by home cooks in your community",
    },
    {
      icon: Clock,
      title: "Fresh & Fast",
      description:
        "Daily prepared meals delivered fresh to your doorstep within hours",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description:
        "All our home cooks are verified and follow strict hygiene standards",
    },
    {
      icon: Truck,
      title: "Reliable Delivery",
      description: "Safe and timely delivery with real-time tracking",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero">
        <div className="container mx-auto px-4 text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            A Plateful of <span className="text-primary">Home</span>
            <br />
            in Every Bite
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover authentic homemade meals crafted by passionate home cooks
            in your neighborhood. Fresh, delicious, and made with love.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button
                size="lg"
                className="gradient-primary border-0 shadow-warm text-lg px-8 py-3"
              >
                Order Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 hover-lift"
              >
                View Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Plateful?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We connect you with talented home cooks who pour their heart into
              every dish
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="food-card text-center p-6">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Dishes
            </h2>
            <p className="text-muted-foreground text-lg">
              Customer favorites made fresh daily
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            {isError && (
              <p className="col-span-3 text-center text-destructive">
                Could not load popular dishes.
              </p>
            )}
            {popularDishes.map((dish) => (
              <MenuItemCard key={dish._id} item={dish} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <Button size="lg" variant="outline" className="hover-lift">
                View All Dishes <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Utensils className="h-16 w-16 text-primary-foreground mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready to Taste Home?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Join thousands of food lovers who have discovered the joy of
              authentic homemade meals. Order now and experience the difference.
            </p>
            <Link to="/shop">
              <Button size="lg" variant="secondary" className="shadow-warm">
                Start Ordering Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
