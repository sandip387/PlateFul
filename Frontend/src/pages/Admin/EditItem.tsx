import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { MenuItem } from "@/types";

type EditableMenuItem = Omit<
  MenuItem,
  "_id" | "rating" | "createdAt" | "updatedAt" | "createdBy"
>;
interface MenuCategory {
  _id: string;
  name: string;
  slug: string;
  icon: string;
}

const EditItem = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [itemData, setItemData] = useState<Partial<EditableMenuItem>>({});

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
    mutationFn: (updatedItem: Partial<EditableMenuItem>) =>
      api.put(`/menu/${itemId}`, updatedItem),
    onSuccess: () => {
      toast.success("Item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["fullMenu"] });
      queryClient.invalidateQueries({ queryKey: ["menuItem", itemId] });
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      navigate("/admin/manage-menu");
    },
    onError: (error: any) => {
      const errorMessages = error.response?.data?.errors;
      if (Array.isArray(errorMessages) && errorMessages.length > 0) {
        toast.error(errorMessages[0]);
      } else {
        toast.error(error.response?.data?.message || "Failed to update item.");
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
    const processedValue = type === "number" ? parseFloat(value) || 0 : value;
    setItemData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleSelectChange = (
    name: "category" | "subCategory",
    value: string
  ) => {
    setItemData((prev) => ({ ...prev, [name]: value }));
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
      <Card>
        <CardHeader>
          <CardTitle>Edit Menu Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={itemData.price || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparationTime">Preparation Time (mins)</Label>
                <Input
                  id="preparationTime"
                  name="preparationTime"
                  type="number"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default EditItem;
