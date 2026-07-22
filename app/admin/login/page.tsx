import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { from } = await searchParams;
  const fromValue = Array.isArray(from) ? from[0] : from;
  return <LoginForm from={fromValue} />;
}
