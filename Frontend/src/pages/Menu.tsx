import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, Star, Utensils, ChefHat, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import TodaysSpecialModal from "@/components/TodaysSpecialModal";
import api from "@/lib/api";
import { MenuItem } from "@/types";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

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
  const [isSpecialModalOpen, setIsSpecialModalOpen] = useState(false);

  const {
    data: categoriesResponse,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["menuWithCategories"],
    queryFn: async () => (await api.get("/categories")).data,
  });

  const menuCategories = categoriesResponse?.data || [];

  useEffect(() => {
    if (menuCategories.length > 0 && !activeCategory) {
      setActiveCategory(menuCategories[0].slug);
    }
  }, [menuCategories, activeCategory]);

  const handleAddToCart = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ menuItemId: item._id, quantity: 1 });
    toast.success(`${item.name} added to cart!`);
  };

  const renderContent = () =>
    menuCategories.map((category) => (
      <TabsContent key={category.slug} value={category.slug} className="mt-8">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center space-x-3">
            <span className="text-4xl">{category.icon}</span>
            <span>{category.name}</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {category.description}
          </p>
        </div>
        {category.items && category.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {category.items.map((item) => (
              <Link
                to={`/item/${item._id}`}
                key={item._id}
                className="block group"
              >
                <Card
                  key={item._id}
                  className="food-card overflow-hidden flex flex-col sm:flex-row"
                >
                  <div className="sm:w-1/3 aspect-video sm:aspect-auto flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="sm:w-2/3 p-4 sm:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <span className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">
                          NRs {item.price}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {item.preparationTime} mins
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                          {item.rating?.average?.toFixed(1) ?? "0.0"} (
                          {item.rating?.count ?? 0})
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => handleAddToCart(e, item)}
                      className="w-full mt-2 sm:mt-0 sm:w-auto sm:self-end bg-secondary hover:bg-secondary/90"
                    >
                      <Utensils className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No items in this category yet.
          </p>
        )}
      </TabsContent>
    ));

  return (
    <>
      <div className="min-h-screen bg-background py-8 animate-fade-in">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Our Homemade Menu
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our collection of dishes made with love by passionate
              home cooks.
            </p>
          </header>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load menu. Please try again later.
              </AlertDescription>
            </Alert>
          ) : menuCategories.length > 0 ? (
            <Tabs
              value={activeCategory}
              onValueChange={setActiveCategory}
              className="w-full"
            >
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <TabsList className="inline-grid w-max grid-flow-col">
                  {menuCategories.map((category) => (
                    <TabsTrigger
                      key={category.slug}
                      value={category.slug}
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <span className="text-lg">{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {renderContent()}
            </Tabs>
          ) : (
            <div className="text-center p-12">
              <p>No menu categories found.</p>
            </div>
          )}

          <section className="mt-20 gradient-hero rounded-lg p-8 md:p-12 text-center">
            <ChefHat className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Chef's Daily Special
            </h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-2xl mx-auto">
              Discover today's hand-picked favorite, available for a limited
              time at a special price.
            </p>
            <Button
              size="lg"
              className="gradient-primary border-0 shadow-warm"
              onClick={() => setIsSpecialModalOpen(true)}
            >
              View Today's Special
            </Button>
          </section>
        </div>
      </div>
      <TodaysSpecialModal
        isOpen={isSpecialModalOpen}
        onClose={() => setIsSpecialModalOpen(false)}
      />
    </>
  );
};

export default Menu;
