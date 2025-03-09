// src/app/page.js
import { redirect } from "next/navigation";

export default function Home() {
  // Redirect to the dashboard page
  redirect("/dashboard");
}
