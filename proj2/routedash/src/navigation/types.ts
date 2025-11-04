export type TripContext = {
  origin: string;
  destination: string;
  pickupEtaMin: number;
};

export type RestaurantSummary = {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

export type MenuSection = {
  id: string;
  title: string;
  items: MenuItem[];
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  priceCents: number;
  isAvailable: boolean;
  tags?: string[];
};

export type CartItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

export type OrderSummary = {
  id: string;
  totalCents: number;
  pickupEtaMin: number;
  items: Array<{ id: string; menuItemId: string; quantity: number; priceCents: number; name?: string }>;
  restaurant: RestaurantSummary;
};

export type RootStackParamList = {
  Login: undefined;
  Planner: undefined;
  Restaurants: { trip: TripContext };
  Menu: { restaurant: RestaurantSummary; trip: TripContext };
  Checkout: { cart: CartItem[]; restaurant: RestaurantSummary; trip: TripContext };
  OrderStatus: { order: OrderSummary };
  MerchantDashboard: undefined;
};
