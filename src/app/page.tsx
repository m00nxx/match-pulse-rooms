import { MatchRoom } from "@/components/match-room";
import { demoMatch } from "@/data/demo-match";

export default function Home() {
  return <MatchRoom match={demoMatch} />;
}
