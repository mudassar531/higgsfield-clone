import Studio from "@/components/nova/Studio";
import { getExploreFeed } from "@/lib/feed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const room = await getExploreFeed();
  return <Studio room={room} />;
}
