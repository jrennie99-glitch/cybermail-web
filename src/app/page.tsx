import { redirect } from "next/navigation";

// app.cybrmail.net root → straight to the email client.
// The marketing site lives at cybrmail.net.
export default function RootPage() {
  redirect("/app");
}
