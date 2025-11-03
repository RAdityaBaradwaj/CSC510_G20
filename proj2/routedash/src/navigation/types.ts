export type RestaurantParam = {
  id: string;
  name: string;
  cuisine?: string;
  rating?: number;
  etaMinutes?: number;
  priceLevel?: string;
  location?: string;
};

export type MenuItemParam = {
  id: string;
  name: string;
  price: number;
  desc?: string;
};

export type RootStackParamList = {
  Login: undefined;
  Planner: undefined;
  Restaurants: undefined;
  Menu: { restaurant: RestaurantParam };
  Checkout: { cart: MenuItemParam[]; restaurant: RestaurantParam };
  OrderStatus: { restaurant: RestaurantParam };
};
