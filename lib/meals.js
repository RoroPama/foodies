import slugify from "slugify";
import xss from "xss";
import { ObjectId } from "mongodb";
import { connectToDatabase, storeImageInGridFS, getMockData } from "@/mongodb";

export function getBaseUrl() {
  if (process.env.NODE_ENV === "production") {
    return process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.com";
  } else {
    return "http://localhost:3000";
  }
}

export function serializeMeal(meal) {
  if (!meal) {
    console.log("⚠️ Attention: meal est null ou undefined dans serializeMeal");
    return null;
  }

  return {
    id: meal._id?.toString() || meal.id || "mock-id",
    title: meal.title || "",
    summary: meal.summary || "",
    instructions: meal.instructions || "",
    slug: meal.slug || "",
    creator: meal.creator || "",
    creator_email: meal.creator_email || "",
    createdAt: meal.createdAt?.toISOString?.() || new Date().toISOString(),
    image: meal.image
      ? {
          id:
            meal.image._id?.toString?.() ||
            meal.image.id?.toString?.() ||
            "mock-image-id",
          filename: meal.image.filename || "image.jpg",
          contentType: meal.image.contentType || "image/jpeg",
        }
      : {
          id: "default-image-id",
          filename: "default.jpg",
          contentType: "image/jpeg",
        },
  };
}

export async function getMeals() {
  try {
    console.log("🔍 Récupération des repas...");
    const { client, db, isMockConnection } = await connectToDatabase();

    // Si connexion simulée (build ou erreur de connexion)
    if (isMockConnection) {
      console.log("🎭 Utilisation des données simulées pour les repas");
      return [];
      // const mockMeals = getMockData("meals");
      // return mockMeals.map((meal) => serializeMeal(meal)).filter(Boolean);
    }

    // Base de données réelle
    if (!db) {
      console.warn(
        "⚠️ Base de données non disponible, utilisation des données simulées"
      );
      return [];
      // const mockMeals = getMockData("meals");
      // return mockMeals.map((meal) => serializeMeal(meal)).filter(Boolean);
    }

    const meals = await db.collection("meals").find().toArray();
    console.log(`✅ ${meals.length} coucou`);
    console.log(`✅ ${meals.length} repas récupérés depuis la base de données`);

    const serializedMeals = meals
      .map((meal) => serializeMeal(meal))
      .filter(Boolean);

    return serializedMeals;
  } catch (error) {
    console.error("❌ Erreur dans getMeals:", error);

    // Fallback vers les données simulées
    try {
      console.log(
        "🔄 Tentative d'utilisation des données simulées après erreur"
      );
      const mockMeals = getMockData("meals");
      return mockMeals.map((meal) => serializeMeal(meal)).filter(Boolean);
    } catch (mockError) {
      console.error(
        "❌ Impossible de charger les données simulées:",
        mockError
      );
      return [];
    }
  }
}

export async function getMeal(slug) {
  if (!slug) {
    console.error("❌ Slug manquant dans getMeal");
    return null;
  }

  try {
    const { client, db, isMockConnection } = await connectToDatabase();

    // Si connexion simulée
    if (isMockConnection) {
      console.log(`🎭 Recherche du repas simulé avec slug: ${slug}`);
      const mockMeals = getMockData("meals");
      const meal = mockMeals.find((meal) => meal.slug === slug);
      return meal ? serializeMeal(meal) : null;
    }

    if (!db) {
      console.warn("⚠️ Base de données non disponible pour getMeal");
      const mockMeals = getMockData("meals");
      const meal = mockMeals.find((meal) => meal.slug === slug);
      return meal ? serializeMeal(meal) : null;
    }

    const meal = await db.collection("meals").findOne({ slug });

    if (!meal) {
      console.log(`ℹ️ Repas avec slug '${slug}' non trouvé`);
      return null;
    }

    return serializeMeal(meal);
  } catch (error) {
    console.error(`❌ Erreur dans getMeal pour slug ${slug}:`, error);

    // Fallback vers les données simulées
    try {
      const mockMeals = getMockData("meals");
      const meal = mockMeals.find((meal) => meal.slug === slug);
      return meal ? serializeMeal(meal) : null;
    } catch (mockError) {
      console.error("❌ Impossible de charger le repas simulé:", mockError);
      return null;
    }
  }
}

// Autres fonctions restent inchangées...
export async function getMealImage(imageId) {
  if (!imageId) {
    console.error("❌ ID d'image manquant dans getMealImage");
    return null;
  }

  const { client, db, isMockConnection } = await connectToDatabase();

  try {
    if (isMockConnection) {
      console.log("🎭 Retour d'une image simulée");
      return {
        _id: "mock-image-id",
        filename: "mock-image.jpg",
        contentType: "image/jpeg",
        length: 0,
        chunkSize: 0,
        uploadDate: new Date(),
        metadata: {},
      };
    }

    if (!db) {
      console.error("❌ Base de données non disponible dans getMealImage");
      return null;
    }

    let objectId;
    try {
      objectId = new ObjectId(imageId);
    } catch (err) {
      console.error(`❌ ID d'image '${imageId}' non valide:`, err);
      return null;
    }

    const file = await db.collection("fs.files").findOne({ _id: objectId });

    if (!file) {
      console.log(`ℹ️ Image avec ID '${imageId}' non trouvée`);
      return null;
    }

    return file;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération de l'image avec ID '${imageId}':`,
      error
    );
    return null;
  } finally {
    if (client && !isMockConnection) {
      await client.close().catch((err) => {
        console.error("❌ Erreur lors de la fermeture du client MongoDB:", err);
      });
    }
  }
}

export async function saveMeal(meal) {
  if (!meal || !meal.title || !meal.image) {
    throw new Error("Données de repas incomplètes");
  }

  const { client, db, isMockConnection } = await connectToDatabase();

  try {
    if (isMockConnection) {
      console.log("🎭 Simulation de sauvegarde de repas");
      return {
        ...meal,
        _id: "mock-meal-id-" + Date.now(),
        slug: slugify(meal.title, { lower: true }),
        image: {
          id: "mock-image-id-" + Date.now(),
          filename: `${slugify(meal.title, { lower: true })}.jpg`,
          contentType: "image/jpeg",
        },
        createdAt: new Date(),
      };
    }

    if (!db) {
      throw new Error("Base de données non disponible dans saveMeal");
    }

    meal.slug = slugify(meal.title, { lower: true });
    meal.instructions = xss(meal.instructions || "");

    const extension = meal.image.name.split(".").pop();
    const fileName = `${meal.slug}.${extension}`;
    const contentType = meal.image.type || `image/${extension}`;

    const imageBuffer = Buffer.from(await meal.image.arrayBuffer());
    const imageId = await storeImageInGridFS(
      db,
      imageBuffer,
      fileName,
      contentType
    );

    const result = await db.collection("meals").insertOne({
      creator: meal.creator || "Anonymous",
      creator_email: meal.creator_email || "",
      title: meal.title,
      summary: meal.summary || "",
      instructions: meal.instructions || "",
      image: {
        id: imageId.toString(),
        filename: fileName,
        contentType: contentType,
      },
      slug: meal.slug,
      createdAt: new Date(),
    });

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
    console.error("❌ Erreur lors de l'enregistrement du repas :", error);
    throw error;
  } finally {
    if (client && !isMockConnection) {
      await client.close().catch((err) => {
        console.error("❌ Erreur lors de la fermeture du client MongoDB:", err);
      });
    }
  }
}
