"use client";

import dynamic from "next/dynamic";

const MonthScreen = dynamic(() => import("@/components/month/MonthScreen").then((module) => module.MonthScreen), {
  ssr: false,
});

export default function MonthPage() {
  return <MonthScreen />;
}
