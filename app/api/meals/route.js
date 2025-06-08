import { NextResponse } from "next/server";
import slugify from "slugify";
import xss from "xss";
import { connectToDatabase, storeImageInGridFS, getMockData } from "@/mongodb";
import { serializeMeal } from "@/lib/meals";

// GET - Récupérer tous les repas
export async function GET(request) {
  // Cette route ne devrait pas avoir de params car elle récupère tous les repas
  // Si vous voulez filtrer, utilisez les query parameters
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || null;

  const { client, db, isMockConnection } = await connectToDatabase();

  try {
    if (!db) {
      throw new Error("Base de données non disponible");
    }

    // Si nous sommes en phase de build, retourner des données simulées
    if (isMockConnection) {
      console.log(
        "Connexion simulée, utilisation de données de repas simulées"
      );
      const mockMeals = getMockData("meals");
      return NextResponse.json(mockMeals.map(serializeMeal));
    }

    const meals = await db.collection("meals").find({}).toArray();
    return NextResponse.json(meals.map(serializeMeal));
  } catch (error) {
    console.error("Erreur lors de la récupération des repas:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  } finally {
    if (client && !isMockConnection) {
      await client.close().catch((err) => {
        console.error("Erreur à la fermeture du client MongoDB :", err);
      });
    }
  }
}

// POST - Créer un nouveau repas
export async function POST(request) {
  try {
    const formData = await request.formData();

    // Récupérer les données du formulaire
    const title = formData.get("title");
    const summary = formData.get("summary");
    const instructions = formData.get("instructions");
    const creator = formData.get("creator") || "Anonymous";
    const creator_email = formData.get("creator_email") || "";
    const image = formData.get("image");

    // Vérification des données requises
    if (!title || !image) {
      return NextResponse.json(
        { error: "Titre et image sont requis" },
        { status: 400 }
      );
    }

    const meal = {
      title,
      summary,
      instructions: xss(instructions || ""),
      creator,
      creator_email,
      image,
    };

    const { client, db, isMockConnection } = await connectToDatabase();

    try {
      // Si nous sommes en phase de build, retourner un objet simulé
      if (isMockConnection) {
        console.log("Connexion simulée, simulation de sauvegarde de repas");
        const mockResponse = {
          ...meal,
          id: "mock-meal-id-" + Date.now(),
          slug: slugify(meal.title, { lower: true }),
          image: {
            id: "mock-image-id-" + Date.now(),
            filename: `${slugify(meal.title, { lower: true })}.jpg`,
            contentType: "image/jpeg",
          },
          createdAt: new Date(),
        };
        return NextResponse.json(mockResponse, { status: 201 });
      }

      // Vérifier que db existe
      if (!db) {
        throw new Error("Base de données non disponible");
      }

      // Générer le slug à partir du titre
      const slug = slugify(meal.title, { lower: true });

      // Traitement de l'image
      const extension = image.name.split(".").pop();
      const fileName = `${slug}.${extension}`;
      const contentType = image.type || `image/${extension}`;

      // Convertir l'image en buffer
      const imageBuffer = Buffer.from(await image.arrayBuffer());

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
        summary: meal.summary || "",
        instructions: meal.instructions,
        image: {
          id: imageId.toString(),
          filename: fileName,
          contentType: contentType,
        },
        slug: slug,
        createdAt: new Date(),
      });

      // Retourner le repas avec l'ID généré par MongoDB
      const createdMeal = {
        id: result.insertedId.toString(),
        ...meal,
        slug,
        image: {
          id: imageId.toString(),
          filename: fileName,
          contentType: contentType,
        },
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json(createdMeal, { status: 201 });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du repas :", error);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du repas" },
        { status: 500 }
      );
    } finally {
      // Fermer la connexion si elle existe et n'est pas mise en cache
      if (client && !isMockConnection) {
        await client.close().catch((err) => {
          console.error("Erreur lors de la fermeture du client MongoDB:", err);
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors du traitement de la requête :", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement de la requête" },
      { status: 500 }
    );
  }
}
