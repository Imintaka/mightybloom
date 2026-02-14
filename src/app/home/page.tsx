import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function HomeChoresPage() {
  return (
    <Container>
      <Card>
        <h1 className="text-2xl font-semibold text-rose-800">Дом</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          Заглушка для CRUD домашних задач и недельной матрицы.
        </p>
      </Card>
    </Container>
  );
}
