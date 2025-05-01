import slugify from "slugify";
import xss from "xss";

import { ObjectId } from "mongodb";
import { connectToDatabase, storeImageInGridFS } from "@/mongodb";

function serializeMeal(meal) {
  return {
    id: meal._id.toString(),
    title: meal.title,
    summary: meal.summary,
    instructions: meal.instructions,
    slug: meal.slug,
    creator: meal.creator,
    creator_email: meal.creator_email,
    createdAt: meal.createdAt?.toISOString?.() || null,
    image: meal.image
      ? {
          id: meal.image._id?.toString?.() || meal.image.id?.toString?.(),
          filename: meal.image.filename,
          contentType: meal.image.contentType,
        }
      : null,
  };
}
export async function getMeals() {
  const { client, db } = await connectToDatabase();
  try {
    const meals = await db.collection("meals").find().toArray();
    return meals.map((meal) => serializeMeal(meal));
  } catch (e) {
    console.error("Erreur lors de la récupération du repas :", e);
  } finally {
    // Fermer la connexion
    await client.close();
  }
}

export async function getMeal(slug) {
  const { client, db } = await connectToDatabase();
  try {
    const meal = await db.collection("meals").findOne({ slug: slug });
    return serializeMeal(meal);
  } catch (e) {
    console.error("Erreur lors de la récupération du repas :", e);
  } finally {
    await client.close();
  }
}

// Fonction pour récupérer une image depuis GridFS
export async function getMealImage(imageId) {
  const { client, db } = await connectToDatabase();
  try {
    const file = await db
      .collection("fs.files")
      .findOne({ _id: new ObjectId(imageId) });

    if (!file) {
      throw new Error("Image non trouvée");
    }

    return file;
  } catch (e) {
    console.error("Erreur lors de la récupération du repas :", e);
  } finally {
    await client.close();
  }
}

export async function saveMeal(meal) {
  const { client, db } = await connectToDatabase();
  try {
    // Générer le slug à partir du titre
    meal.slug = slugify(meal.title, { lower: true });

    // Assainir les instructions
    meal.instructions = xss(meal.instructions);

    // Traitement de l'image
    const extension = meal.image.name.split(".").pop();
    const fileName = `${meal.slug}.${extension}`;
    const contentType = meal.image.type || `image/${extension}`;

    // Convertir l'image en buffer
    const imageBuffer = Buffer.from(await meal.image.arrayBuffer());

    // Stocker l'image dans GridFS et obtenir son ID
    const imageId = await storeImageInGridFS(
      db,
      imageBuffer,
      fileName,
      contentType
    );

    // Insérer dans la collection MongoDB
    const result = await db.collection("meals").insertOne({
      creator: meal.creator,
      creator_email: meal.creator_email,
      title: meal.title,
      summary: meal.summary,
      instructions: meal.instructions,
      image: {
        id: imageId.toString(),
        filename: fileName,
        contentType: contentType,
      },
      slug: meal.slug,
      createdAt: new Date(),
    });

    // Retourner le repas avec l'ID généré par MongoDB
    return {
      ...meal,
      _id: result.insertedId,
      image: {
        id: imageId.toString(),
        filename: fileName,
        contentType: contentType,
      },
    };
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du repas :", error);
    throw error;
  } finally {
    // Fermer la connexion
    await client.close();
  }
}
