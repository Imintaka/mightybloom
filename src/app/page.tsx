import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export default function TodayPage() {
  return (
    <Container>
      <Card>
        <h1 className="text-2xl font-semibold text-rose-800">Сегодня</h1>
        <p className="mt-2 text-sm text-rose-700/80">
          Основа Stage 0 готова. Можно переходить к реализации блоков MVP для экрана Сегодня.
        </p>
      </Card>
    </Container>
  );
}
