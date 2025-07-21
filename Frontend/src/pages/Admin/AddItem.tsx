import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { MenuItem } from "@/types";

interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

const AddItem = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [itemData, setItemData] = useState<Omit<MenuItem, "_id" | "rating">>({
    name: "",
    description: "",
    price: 0,
    category: "veg",
    subCategory: "",
    image: "",
    preparationTime: 15,
    isAvailable: true,
    ingredients: [],
    nutritionInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
    allergens: [],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    spiceLevel: "mild",
    dailySpecial: { isSpecial: false, day: "sunday", specialPrice: 0 },
    tags: [],
  });

  const mutation = useMutation({
    mutationFn: (newItem: typeof itemData) => api.post("/menu", newItem),
    onSuccess: () => {
      toast.success("Menu item added successfully!");
      queryClient.invalidateQueries({ queryKey: ["fullMenu"] });
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      navigate("/admin/manage-menu");
    },
    onError: (error: any) => {
      const errorMessages = error.response?.data?.errors;
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        toast.error(errorMessages[0]);
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to add item. Please check the fields."
        );
      }
    },
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{
    data: MenuCategory[];
  }>({
    queryKey: ["menuCategoriesAdmin"],
    queryFn: () => api.get("/categories").then((res) => res.data),
  });

  const menuCategories = categoriesData?.data || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" ? (value === "" ? "" : parseFloat(value)) : value;
    setItemData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !itemData.name ||
      !itemData.subCategory ||
      itemData.price <= 0 ||
      !itemData.image ||
      itemData.preparationTime <= 0
    ) {
      toast.error("Please fill out all required fields with valid values.");
      return;
    }
    mutation.mutate(itemData);
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Add New Menu Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Chicken Momo"
                value={itemData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A short, tasty description of the dish."
                value={itemData.description}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NRs)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="e.g., 250"
                  value={itemData.price || ""}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationTime">Preparation Time (mins)</Label>
                <Input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  placeholder="e.g., 20"
                  value={itemData.preparationTime || ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                placeholder="https://example.com/image.jpg"
                value={itemData.image}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category (Food Type)</Label>
                <Select
                  onValueChange={(v) => handleSelectChange("category", v)}
                  value={itemData.category}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">Veg</SelectItem>
                    <SelectItem value="non-veg">Non-Veg</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sub-Category (Menu Section)</Label>
                <Select
                  onValueChange={(v) => handleSelectChange("subCategory", v)}
                  value={itemData.subCategory}
                  required
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingCategories
                          ? "Loading..."
                          : "Select a menu section"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      menuCategories.map((cat) => (
                        <SelectItem key={cat._id} value={cat.slug}>
                          {cat.name} ({cat.icon})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full text-lg h-12"
            >
              {mutation.isPending ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                "Add Item to Menu"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddItem;
