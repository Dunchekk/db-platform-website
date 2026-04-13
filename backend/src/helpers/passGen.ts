import argon2 from "argon2";

async function main() {
  const hash = await argon2.hash("", {
    type: argon2.argon2id,
  });

  console.log(hash);
}

main();
