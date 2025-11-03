import type { RestaurantParam } from "./navigation/types";

export const restaurants: RestaurantParam[] = [
  {
    id: "r1",
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.6,
    etaMinutes: 20,
    priceLevel: "$$",
    location: "Downtown Raleigh"
  },
  {
    id: "r2",
    name: "Sushi Go",
    cuisine: "Japanese",
    rating: 4.8,
    etaMinutes: 25,
    priceLevel: "$$",
    location: "Hillsborough St"
  },
  {
    id: "r3",
    name: "Taco Hub",
    cuisine: "Mexican",
    rating: 4.3,
    etaMinutes: 18,
    priceLevel: "$",
    location: "Mission Valley"
  }
];
