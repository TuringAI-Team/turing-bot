const supabase = require("./supabase");
const ms = require("ms");

async function getUser(discordUser) {
  let { data: users, error } = await supabase
    .from("users")
    .select("*")

    // Filters
    .eq("id", discordUser.id);
  if (error) {
    return { error: error.message };
  }
  if (users[0]) {
    return users[0];
  } else {
    const { data, error } = await supabase.from("users").insert([
      {
        id: discordUser.id,
        credits: 5,
        created_at: new Date(),
      },
    ]);
    if (error) {
      return { error: error.message };
    }
    return {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      credits: 5,
      created_at: new Date(),
    };
  }
}
async function updateCredits(id, credits) {
  const { data, error } = await supabase
    .from("users")
    .update({ credits: credits })
    .eq("id", id);
  if (error) {
    return { error: error.message };
  }
}
async function getLastClaim(id, type) {
  let { data: claims, error } = await supabase
    .from("claims")
    .select("*")

    // Filters
    .eq("user_id", id)
    .eq("type", type);
  if (error) {
    return { error: error.message };
  }
  if (claims[0]) {
    return new Date(claims[0].created_at);
  } else {
    return ms("25h");
  }
}
async function claimReward(id, type, amount) {
  const { data, error } = await supabase
    .from("claims")
    .insert([{ user_id: id, type: type, credits: amount }]);
  if (error) {
    return { error: error.message };
  }
}

async function getUserRoles(member) {
  var roles = [];
  if (
    member.roles.cache.has("899763684337922088") ||
    member.roles.cache.has("1049309615235547136")
  ) {
    roles.push("booster");
  }
  if (member.roles.cache.has("1047308765218750525")) {
    roles.push("admin");
  }
  if (member.roles.cache.has("1049409194408824902")) {
    roles.push("premium");
  }
  return roles;
}

module.exports = {
  getUser,
  updateCredits,
  claimReward,
  getLastClaim,
  getUserRoles,
};
