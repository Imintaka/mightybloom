import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function WorkoutsPage() {
  return (
    <Container>
      <Card>
        <h1 className="text-2xl font-semibold text-rose-800">Тренировки</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          Заглушка для недельных блоков тренировок внутри месяца.
        </p>
      </Card>
    </Container>
  );
}
