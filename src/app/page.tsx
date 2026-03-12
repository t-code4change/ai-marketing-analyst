import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function RootPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("session");

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
