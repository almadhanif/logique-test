import { redirect } from "next/navigation";

// /admin has no content of its own — send users to the dashboard. This also
// covers the case where the login form redirects back to its `from=/admin`
// param after a successful sign-in, which would otherwise hit a 404.
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
