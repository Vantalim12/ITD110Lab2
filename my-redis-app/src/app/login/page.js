// src/app/login/page.js
import LoginForm from "../../components/Auth/LoginForm";

export const metadata = {
  title: "Login - Barangay Kabacsanan Information System",
  description:
    "Login to access the Barangay Kabacsanan resident information system",
};

export default function LoginPage() {
  return <LoginForm />;
}
