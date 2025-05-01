import Link from "next/link";
import classes from "./page.module.css";
import ImageSlideshow from "./components/images/image-slideshow";

export default function Home() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.slideshow}>
          <ImageSlideshow />
        </div>
        <div>
          <div className={classes.hero}>
            <h1>NextLevel Food pour les Gourmets NextLevel</h1>
            <p>Dégustez et partagez des plats du monde entier.</p>
          </div>
          <div className={classes.cta}>
            <Link href="/community">Rejoindre la Communauté</Link>
            <Link href="/meals">Explorer les Plats</Link>
          </div>
        </div>
      </header>
      <main>
        <section className={classes.section}>
          <h2>Comment ça fonctionne</h2>
          <p>
            NextLevel Food est une plateforme permettant aux passionnés de
            cuisine de partager leurs recettes préférées avec le monde entier.
            C&apos;est un lieu pour découvrir de nouveaux plats et pour se
            connecter avec d&apos;autres amateurs de cuisine.
          </p>
          <p>
            NextLevel Food est un endroit pour découvrir de nouveaux plats et
            pour se connecter avec d&apos;autres passionnés de gastronomie.
          </p>
        </section>
        <section className={classes.section}>
          <h2>Pourquoi NextLevel Food ?</h2>
          <p>
            NextLevel Food est une plateforme permettant aux passionnés de
            cuisine de partager leurs recettes préférées avec le monde entier.
            C&apos;est un lieu pour découvrir de nouveaux plats et pour se
            connecter avec d&apos;autres amateurs de cuisine.
          </p>
          <p>
            NextLevel Food est un endroit pour découvrir de nouveaux plats et
            pour se connecter avec d&apos;autres passionnés de gastronomie.
          </p>
        </section>
      </main>
    </>
  );
}
