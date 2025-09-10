import React from "react";
import { Stack } from "expo-router";

export default function CalendarLayout() {
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
