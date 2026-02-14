import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function NutritionPage() {
  return (
    <Container>
      <Card>
        <h1 className="text-2xl font-semibold text-rose-800">Питание</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          Заглушка для CRUD блюд, отметок по дням и суммы калорий.
        </p>
      </Card>
    </Container>
  );
}
