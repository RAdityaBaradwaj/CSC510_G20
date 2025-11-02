import type { MenuItemParam } from "./navigation/types";

export const menus: Record<string, MenuItemParam[]> = {
  r1: [
    { id: "m1", name: "Margherita Pizza", price: 12.99, desc: "Fresh mozzarella & basil" },
    { id: "m2", name: "Pepperoni Pizza", price: 13.99, desc: "Classic pepperoni & cheese" }
  ],
  r2: [
    { id: "m3", name: "Salmon Roll", price: 10.5, desc: "Fresh Atlantic salmon" },
    { id: "m4", name: "Tuna Sashimi", price: 14.0, desc: "Premium bluefin slices" }
  ],
  r3: [
    { id: "m5", name: "Chicken Taco", price: 8.99, desc: "Grilled chicken with salsa" },
    { id: "m6", name: "Veggie Burrito", price: 9.49, desc: "Loaded with beans & avocado" }
  ]
};
