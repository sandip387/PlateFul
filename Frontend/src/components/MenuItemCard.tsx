import { useState } from "react";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { MenuItem } from "@/types";

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ menuItemId: item._id, quantity });
    toast.success(`${quantity} x ${item.name} added to cart!`);
  };

  return (
    <Card className="food-card flex flex-col h-full">
      <div className="aspect-video overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <Badge
            variant={item.category === "veg" ? "secondary" : "default"}
            className="capitalize"
          >
            {item.category}
          </Badge>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{item.rating.average.toFixed(1)}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1 flex-grow">
          {item.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {item.description}
        </p>

        <div className="mt-auto">
          <p className="text-2xl font-bold text-primary mb-4">
            NRs {item.price}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg w-8 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="w-full gradient-primary border-0 shadow-warm"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
