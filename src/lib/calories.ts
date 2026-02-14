import type { FoodItem, FoodLogByDate } from "@/types/app.types";

export function calculateCaloriesForFoodIds(foodIds: string[], foodItems: FoodItem[]): number {
  const foodMap = new Map(foodItems.map((item) => [item.id, item.kcalPerServing]));

  return foodIds.reduce((sum, foodId) => sum + (foodMap.get(foodId) ?? 0), 0);
}

export function calculateCaloriesForDate(
  dateKey: string,
  foodItems: FoodItem[],
  foodLogByDate: FoodLogByDate,
): number {
  const foodIds = foodLogByDate[dateKey] ?? [];
  return calculateCaloriesForFoodIds(foodIds, foodItems);
}
