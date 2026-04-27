import { db, conversations } from "@workspace/db";
import { sql } from "drizzle-orm";

const SUPPORTED_MODELS = ["gpt-4o-mini", "gpt-4o", "o3-mini"] as const;
const FALLBACK_MODEL = "gpt-4o-mini";

async function main() {
  const unsupported = await db
    .select({ id: conversations.id, model: conversations.model })
    .from(conversations)
    .then((rows) =>
      rows.filter((r) => !(SUPPORTED_MODELS as readonly string[]).includes(r.model)),
    );

  if (unsupported.length === 0) {
    console.log("No conversations with unsupported model values found.");
    return;
  }

  console.log(
    `Normalising ${unsupported.length} conversation(s) with unsupported model values to "${FALLBACK_MODEL}":`,
  );
  for (const row of unsupported) {
    console.log(`  id=${row.id}  model="${row.model}" → "${FALLBACK_MODEL}"`);
  }

  await db.execute(
    sql`UPDATE conversations SET model = ${FALLBACK_MODEL} WHERE model NOT IN (${sql.join(
      SUPPORTED_MODELS.map((m) => sql`${m}`),
      sql`, `,
    )})`,
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
