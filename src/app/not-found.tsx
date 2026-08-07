import { HttpStatusPage } from "@/components/errors/HttpStatusPage";

export default function NotFound() {
  return <HttpStatusPage code={404} />;
}
