// src/utils/seed.ts
import { createClient } from "@supabase/supabase-js";
import { meets, markets } from "../data/taperData"; // Relative import
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase URL or Service Key in .env.local");
  process.exit(1);
}

// Create a client with the Service Role Key (Bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Helper to extract "42.80" from "Dressel's 42.80"
 */
function parseTime(label: string): number | null {
  const match = label.match(/(\d{1,2}:)?\d{1,2}\.\d{2}/);
  if (!match) return null;
  
  const timeStr = match[0];
  const parts = timeStr.split(":").map(Number);
  
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]; // Minutes -> Seconds
  }
  return parts[0]; // Seconds
}

async function seed() {
  console.log("🌱 Starting Database Seed...");

  // 1. Seed MEETS
  console.log(`\nProcessing ${meets.length} meets...`);
  for (const meet of meets) {
    const { error } = await supabase.from("meets").upsert({
      id: meet.id,
      name: meet.name,
      category: meet.category,
      league_tag: meet.leagueTag,
      year: meet.year,
      genders: meet.genders,
      lock_time: meet.lockTime || null,
    });

    if (error) console.error(`❌ Failed to seed meet ${meet.id}:`, error.message);
    else console.log(`✅ Seeded meet: ${meet.name}`);
  }

  // 2. Seed MARKETS
  console.log(`\nProcessing ${markets.length} markets...`);
  for (const market of markets) {
    // Attempt to parse the target time automatically
    const targetTime = parseTime(market.timeLabel);
    
    // Check if the market is already "completed" in your static data
    // (Handles both your old data structure and the new one if you updated it)
    const isCompleted = (market as any).completed || false;
    const resultTime = (market as any).actualTime ? parseTime((market as any).actualTime) : null;
    
    const { error } = await supabase.from("markets").upsert({
      id: market.id,
      meet_id: market.meetId,
      gender: market.gender,
      swimmer_name: market.swimmer,
      event_name: market.event,
      time_label: market.timeLabel,
      
      // The Smart Stuff
      target_time: targetTime,
      result_time: resultTime,
      status: isCompleted ? 'settled' : 'open',
      
      // Metadata
      pb: market.pb || null,
      seed: market.seed || null,
      
      // Votes
      votes_over: market.votesOver || 0,
      votes_under: market.votesUnder || 0,
    });

    if (error) console.error(`❌ Failed to seed market ${market.id}:`, error.message);
    else console.log(`✅ Seeded market: ${market.swimmer} - ${market.event}`);
  }

  console.log("\n✨ Seeding Complete!");
}

seed();