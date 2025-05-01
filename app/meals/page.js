import Link from "next/link";
import classes from "./page.module.css";

import MealsWithSearch from "../components/search-bar/search-bar";
import { getMeals } from "@/lib/meals";
import { Suspense } from "react";
import LoadingOut from "../components/meals/loading-out";

export default async function MealPage() {
  const fetchedMeals = await getMeals();

  return (
    <>
      <header className={classes.header}>
        <h1>
          Des plats délicieux créés{" "}
          <span className={classes.highlight}>par vous</span>
        </h1>
        <p>
          Choisissez votre recette préférée et cuisinez-la vous-même, c est
          facile et amusant
        </p>
        <p className={classes.cta}>
          <Link href="/meals/share">Partagez votre recette préférée</Link>
        </p>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<LoadingOut />}>
          {<MealsWithSearch meals={fetchedMeals} />}
        </Suspense>
      </main>
    </>
  );
}
