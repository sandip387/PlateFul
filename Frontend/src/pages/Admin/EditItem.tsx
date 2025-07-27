import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { TagInput } from "@/components/ui/tag-input";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { MenuItem } from "@/types";

interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
}
const ALLERGEN_OPTIONS = [
  "nuts",
  "dairy",
  "eggs",
  "gluten",
  "soy",
  "shellfish",
];

const EditItem = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [itemData, setItemData] = useState<Partial<MenuItem>>({});

  const { data, isLoading, isError } = useQuery<{ data: MenuItem }>({
    queryKey: ["menuItem", itemId],
    queryFn: () => api.get(`/menu/${itemId}`).then((res) => res.data),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (data?.data) {
      setItemData(data.data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (updatedItem: Partial<MenuItem>) =>
      api.put(`/menu/${itemId}`, updatedItem),
    onSuccess: () => {
      toast.success("Item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminAllMenuItems"] });
      queryClient.invalidateQueries({ queryKey: ["menuItem", itemId] });
      navigate("/admin/manage-menu");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update item.");
    },
  });

  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery<{
    data: MenuCategory[];
  }>({
    queryKey: ["menuCategoriesAdmin"],
    queryFn: () => api.get("/categories").then((res) => res.data),
  });
  const menuCategories = categoriesData?.data || [];

  const handleDailySpecialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setItemData((prev) => ({
      ...prev,
      dailySpecial: {
        ...prev.dailySpecial,
        [name]: type === "number" ? parseFloat(value) || 0 : value,
      },
    }));
  };

  const handleIsSpecialToggle = (checked: boolean) => {
    setItemData((prev) => ({
      ...prev,
      dailySpecial: {
        ...prev.dailySpecial,
        isSpecial: checked,
      },
    }));
  };

  const handleDaySelectChange = (day: string) => {
    setItemData((prev) => ({
      ...prev,
      dailySpecial: {
        ...prev.dailySpecial,
        day: day,
      },
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setItemData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    name: "ingredients" | "tags" | "allergens",
    value: string[]
  ) => {
    setItemData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAllergenChange = (allergen: string, checked: boolean) => {
    const currentAllergens = itemData.allergens || [];
    const newAllergens = checked
      ? [...currentAllergens, allergen]
      : currentAllergens.filter((a) => a !== allergen);
    handleArrayChange("allergens", newAllergens);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(itemData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 max-w-2xl space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (isError)
    return (
      <div className="text-center text-destructive p-12">
        Failed to load item data.
      </div>
    );

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            {/* ... Basic fields ... */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                name="name"
                value={itemData.name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={itemData.description || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (NRs)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  value={itemData.price || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationTime">Prep Time (mins)</Label>
                <Input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
                  min="1"
                  value={itemData.preparationTime || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={itemData.image || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
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
                    {/* <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Menu Section</Label>
                <Select
                  onValueChange={(v) => handleSelectChange("subCategory", v)}
                  value={itemData.subCategory}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingCategories ? "Loading..." : "Select..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {menuCategories.map((cat) => (
                      <SelectItem key={cat._id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredients</Label>
              <TagInput
                value={itemData.ingredients || []}
                onChange={(newIngredients) =>
                  handleArrayChange("ingredients", newIngredients)
                }
                placeholder="Add ingredient and press Enter"
              />
            </div>

            <div className="space-y-2">
              <Label>Allergens</Label>
              <div className="grid grid-cols-3 gap-4 rounded-lg border p-4">
                {ALLERGEN_OPTIONS.map((allergen) => (
                  <div key={allergen} className="flex items-center space-x-2">
                    <Checkbox
                      id={`allergen-${allergen}`}
                      checked={itemData.allergens?.includes(allergen)}
                      onCheckedChange={(checked) =>
                        handleAllergenChange(allergen, !!checked)
                      }
                    />
                    <label
                      htmlFor={`allergen-${allergen}`}
                      className="text-sm font-medium capitalize"
                    >
                      {allergen}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="w-full text-lg h-12"
            >
              {updateMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" /> Daily Special Settings
            </CardTitle>
            <CardDescription>
              Feature this item on a specific day of the week at a special
              price.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="isSpecial"
                checked={itemData.dailySpecial?.isSpecial || false}
                onCheckedChange={handleIsSpecialToggle}
              />
              <Label htmlFor="isSpecial">Mark as Daily Special</Label>
            </div>

            {/* These fields only show if the item is marked as special */}
            {itemData.dailySpecial?.isSpecial && (
              <div className="grid grid-cols-2 gap-4 pt-4 border-t animate-fade-in">
                <div className="space-y-2">
                  <Label>Day of the Week</Label>
                  <Select
                    value={itemData.dailySpecial?.day || "monday"}
                    onValueChange={handleDaySelectChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "sunday",
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                      ].map((day) => (
                        <SelectItem
                          key={day}
                          value={day}
                          className="capitalize"
                        >
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialPrice">Special Price (NRs)</Label>
                  <Input
                    id="specialPrice"
                    name="specialPrice"
                    type="number"
                    min="0"
                    value={itemData.dailySpecial?.specialPrice || ""}
                    onChange={handleDailySpecialChange}
                    placeholder={`Regular: ${itemData.price}`}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full text-lg h-12"
        >
          {updateMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
};

export default EditItem;
