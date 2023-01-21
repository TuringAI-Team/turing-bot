import { EndMethod } from "discord.js-pages";
import supabase from "./supabase.js";
import ms from "ms";

export async function isPremium(id: string) {
  let { data: premium, error } = await supabase
    .from("premium")
    .select("*")

    // Filters
    .eq("id", id);
  if (premium && premium[0]) {
    var now = Date.now();
    if (now >= premium[0].expires_at) {
      const { data, error } = await supabase
        .from("premium")
        .delete()
        .eq("id", id);

      return false;
    }
    return true;
  }
  return false;
}

export async function makeItPremium(id: string, method: string) {
  let { data: premium, error } = await supabase
    .from("premium")
    .select("*")

    // Filters
    .eq("id", id);
  if (premium && premium[0]) {
    await renew(id, method);
  } else {
    await create(id, method);
  }
}

async function renew(id: string, method: string) {
  const { data, error } = await supabase
    .from("premium")
    .update({
      renewed_at: Date.now(),
      method: method,
      expires_at: Date.now() + ms("30d"),
    })
    .eq("id", id);
}

async function create(id: string, method: string) {
  const { data, error } = await supabase.from("premium").insert([
    {
      id: id,
      renewed_at: Date.now(),
      method: method,
      expires_at: Date.now() + ms("30d"),
    },
  ]);
}
