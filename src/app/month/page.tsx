import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function MonthPage() {
  return (
    <Container>
      <Card>
        <h1 className="text-2xl font-semibold text-rose-800">Месяц</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          Заглушка для месячного трекера сна и редактирования дня.
        </p>
      </Card>
    </Container>
  );
}
