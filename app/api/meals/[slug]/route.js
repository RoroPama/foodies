import { NextResponse } from "next/server";
import { connectToDatabase, getMockData } from "@/mongodb";
import { serializeMeal } from "@/lib/meals";

export async function GET(request, { params }) {
  // ✅ Attendre la résolution de params avant d'accéder à ses propriétés
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Vérifier que le slug existe
  if (!slug) {
    return NextResponse.json({ error: "Slug manquant" }, { status: 400 });
  }

  const { client, db, isMockConnection } = await connectToDatabase();

  try {
    // Si nous sommes en phase de build, retourner des données simulées
    if (isMockConnection) {
      console.log(
        "Connexion simulée, utilisation de données de repas simulées"
      );
      const mockMeals = getMockData("meals");
      const mockMeal =
        mockMeals.find((meal) => meal.slug === slug) || mockMeals[0];
      return NextResponse.json(serializeMeal(mockMeal));
    }

    // Vérifier que db existe
    if (!db) {
      console.error(
        "Base de données non disponible dans GET /api/meals/[slug]"
      );
      return NextResponse.json(
        { error: "Base de données non disponible" },
        { status: 500 }
      );
    }

    const meal = await db.collection("meals").findOne({ slug: slug });

    if (!meal) {
      return NextResponse.json(
        { error: `Repas avec slug '${slug}' non trouvé` },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeMeal(meal));
  } catch (e) {
    console.error(
      `Erreur lors de la récupération du repas avec slug ${slug}:`,
      e
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération du repas" },
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
}
