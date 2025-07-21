import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star, Utensils, ChefHat, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import api from "@/lib/api";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";

interface MenuCategoryWithItems {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  items: MenuItem[];
}

interface ApiResponse {
  success: boolean;
  data: MenuCategoryWithItems[];
}

const Menu = () => {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState("");

  const {
    data: menuCategories,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["menuWithCategories"],
    queryFn: async (): Promise<MenuCategoryWithItems[]> => {
      const response = await api.get<ApiResponse>("/categories");
      return response.data.data; // Directly return the nested array
    },
  });

  if (menuCategories && menuCategories.length > 0 && !activeCategory) {
    setActiveCategory(menuCategories[0].slug);
  }
  const handleAddToCart = (item: MenuItem) => {
    addToCart({ menuItemId: item._id, quantity: 1 });
    toast.success(`${item.name} added to cart!`);
  };

  // if (menuCategories.length > 0 && !activeTab) {
  //   setActiveTab(menuCategories[0].id);
  // }

  // const deleteMutation = useMutation({
  //   mutationFn: (itemId: string) => api.delete(`/menu/${itemId}`),
  //   onSuccess: () => {
  //     toast.success("Item deleted successfully!");
  //     queryClient.invalidateQueries({ queryKey: ["fullMenu"] });
  //     setItemToDelete(null);
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.response?.data?.message || "Failed to delete item.");
  //     setItemToDelete(null);
  //   },
  // });

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    if (isError)
      return (
        <div className="text-center text-destructive p-12">
          Failed to load menu. Please try again.
        </div>
      );
    if (menuCategories.length === 0)
      return (
        <div className="text-center p-12">
          No menu categories found. Please add some in the admin panel.
        </div>
      );

    return menuCategories.map((category) => (
      <TabsContent key={category.slug} value={category.slug}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center space-x-3">
            <span className="text-4xl">{category.icon}</span>
            <span>{category.name}</span>
          </h2>
          <p className="text-muted-foreground">{category.description}</p>
        </div>
        {category.items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {category.items.map((item) => (
              <Card
                key={item._id}
                className="food-card overflow-hidden flex flex-col md:flex-row"
              >
                <div className="md:w-1/3 aspect-square md:aspect-auto">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="md:w-2/3 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <span className="text-2xl font-bold text-primary">
                        NRs {item.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.preparationTime} mins
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                        {item.rating.average} ({item.rating.count})
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full mt-4 bg-secondary hover:bg-secondary/90"
                  >
                    <Utensils className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No items in this category yet.
          </p>
        )}
      </TabsContent>
    ));
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Our Homemade Menu
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our collection of carefully crafted dishes made with love
            by passionate home cooks. Each meal tells a story of tradition,
            flavor, and community.
          </p>
        </div>

        {/* Menu Navigation */}
        {menuCategories.length > 0 && (
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-8">
              {menuCategories.map((category) => (
                <TabsTrigger
                  key={category.slug}
                  value={category.slug}
                  className="flex items-center space-x-2"
                >
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {renderContent()}
          </Tabs>
        )}

        {/* Chef's Special Section */}
        <section className="mt-20 gradient-hero rounded-lg p-8 md:p-12 text-center">
          <ChefHat className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Chef's Daily Special
          </h2>
          <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
            Every day, our featured home chef creates something special just for
            you. Limited quantities available - order early to avoid
            disappointment!
          </p>
          <Button size="lg" className="gradient-primary border-0 shadow-warm">
            View Today's Special
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Menu;
