export interface User {
  id: string;
  _id: string; 
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: "veg" | "non-veg" | "dessert" | "beverage";
  subCategory: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  ingredients?: string[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
  };
  allergens?: string[];
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spiceLevel?: "mild" | "medium" | "hot" | "extra-hot";
  dailySpecial?: {
    isSpecial?: boolean;
    day?: string;
    specialPrice?: number;
  };
  tags?: string[];
  rating: {
    average: number;
    count: number;
  };
}

export interface MenuCategory {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    description: string;
    order: number;
    items?: MenuItem[]; 
}

export interface CartItem {
  menuItem: MenuItem; 
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string; 
  items: CartItem[];
  updatedAt: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    customer: User;
    items: {
        menuItem: MenuItem;
        name: string;
        price: number;
        quantity: number;
        subtotal: number;
    }[];
    pricing: {
        subtotal: number;
        tax: number;
        deliveryFee: number;
        discount: number;
        total: number;
    };
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'failed';
    paymentMethod: 'esewa' | 'khalti' | 'cod';
    createdAt: string;
    estimatedDeliveryTime: string;
    trackingInfo: any; 
}

export interface ApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}
