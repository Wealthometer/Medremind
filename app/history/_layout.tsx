import React from "react";
import { Stack } from "expo-router";

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: "slide_from_right",
      }}
    />
  );
}
