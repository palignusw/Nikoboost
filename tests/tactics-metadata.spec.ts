import { test, expect } from "@playwright/test";
import { tacticsDungeons } from "../src/data/tactics-catalog";
import { generateMetadata } from "../src/app/tactics/[dungeon]/[boss]/page";

test("published boss metadata names the encounter, dungeon and Mythic+", async () => {
  for (const dungeon of tacticsDungeons) {
    for (const boss of dungeon.bosses) {
      const metadata = await generateMetadata({params: Promise.resolve({dungeon: dungeon.id, boss: boss.id})});
      expect(metadata.title).toBe(`${boss.name} Mythic+ Guide | ${dungeon.name}`);
      expect(metadata.description).toContain(`${boss.name} Mythic+ tactics in ${dungeon.name}`);
      expect(metadata.alternates?.canonical).toContain(`/tactics/${dungeon.id}/${boss.id}`);
    }
  }
});
