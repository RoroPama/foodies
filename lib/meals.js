import sql from "better-sqlite3";
import slugify from "slugify";
import xss from "xss";
import fs from "node:fs";

const db = sql("meals.db");

export async function getMeals() {
  return db.prepare("SELECT * FROM meals").all();
}

export function getMeal(slug) {
  return db.prepare("SELECT * FROM meals WHERE slug=?").get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split(".").pop();
  const fileName = `${meal.slug}.${extension}`;

  // Convertir l'image en buffer
  const bufferedImage = await meal.image.arrayBuffer();

  // Utiliser des promesses pour l'écriture de fichier
  await fs.promises.writeFile(
    `public/images/${fileName}`,
    Buffer.from(bufferedImage)
  );

  // Mettre à jour le chemin de l'image
  meal.image = `/images/${fileName}`;

  // Insérer dans la base de données
  db.prepare(
    "INSERT INTO meals (creator, creator_email, title, summary, instructions, image, slug) VALUES (@creator, @creator_email, @title, @summary, @instructions, @image, @slug)"
  ).run(meal);

  return meal;
}
