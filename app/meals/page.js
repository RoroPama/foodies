import Link from "next/link";
import classes from "./page.module.css";
import MealsWithSearch from "../components/search-bar/search-bar";
import { getMeals } from "@/lib/meals"; // ✅ Utiliser directement la fonction lib
import { Suspense } from "react";
import LoadingOut from "../components/meals/loading-out";

export const dynamic = "force-dynamic";

// ✅ Fonction corrigée - utilise directement getMeals() au lieu de l'API
async function fetchMeals() {
  try {
    // Utiliser directement la fonction getMeals qui gère déjà les cas d'erreur
    const meals = await getMeals();
    console.log(meals.length);
    return meals || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des repas:", error);
    // Retourner un tableau vide pour éviter l'échec du build
    return [];
  }
}

export default async function MealPage() {
  const meals = await fetchMeals();

  return (
    <>
      <header className={classes.header}>
        <h1>
          Des plats délicieux créés{" "}
          <span className={classes.highlight}>par vous</span>
        </h1>
        <p>
          Choisissez votre recette préférée et cuisinez-la vous-même, c&apos;est
          facile et amusant
        </p>
        <p className={classes.cta}>
          <Link href="/meals/share">Partagez votre recette préférée</Link>
        </p>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<LoadingOut />}>
          <MealsWithSearch meals={meals} />
        </Suspense>
      </main>
    </>
  );
}

// Métadonnées pour le SEO
export const metadata = {
  title: "Tous les repas - Foodies",
  description:
    "Découvrez tous les délicieux repas partagés par notre communauté.",
};
