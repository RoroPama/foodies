import Image from "next/image";
import classes from "./page.module.css";
import { getBaseUrl, getMeal } from "@/lib/meals";
import { notFound } from "next/navigation";

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Details du plat",
  description: "Détails et instructions pour préparer ce plat délicieux",
};

async function fetchMeal(slug) {
  // Utilisation de l'URL absolue pour fonctionner à la fois en développement et en production
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/meals/${slug}`, {
    next: {
      revalidate: 60, // Revalider toutes les 60 secondes
    },
  });

  if (!response.ok) {
    throw new Error("Impossible de récupérer les repas");
  }

  return response.json();
}

export default async function MealDetailsPage({ params }) {
  const resolvedParams = await params;
  console.log(resolvedParams.mealSlug);
  const meal = await fetchMeal(resolvedParams.mealSlug);
  if (!meal) {
    notFound();
  }
  const imageUrl = `/api/images/${meal.image.id}`;

  meal.instructions = meal.instructions.replace(/\n/g, "<br/>");
  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image src={imageUrl} alt={meal.title} fill />
        </div>
        <div className={classes.headerText}>
          <h1>{meal.title}</h1>
          <p className={classes.creator}>
            by <a href={`mailto:${meal.creator_email}`}> {meal.creator}</a>
          </p>
          <p> {meal.creator}</p>
        </div>
      </header>

      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: meal.instructions }}
        ></p>
      </main>
    </>
  );
}
