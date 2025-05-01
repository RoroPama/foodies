import Link from "next/link";
import Image from "next/image";

import classes from "./meal-item.module.css";

export default function MealItem({ title, slug, image, summary, creator }) {
  const imageUrl = `/api/images/${image.id}`;
  return (
    <article className={classes.meal}>
      <header>
        <div className={classes.image}>
          <Image src={imageUrl} alt={title} fill />
        </div>
        <div className={classes.headerText}>
          <h2>{title}</h2>
          <p> crée par {creator}</p>
        </div>
      </header>
      <div className={classes.content}>
        <p className={classes.summary}>{summary}</p>
        <div className={classes.actions}>
          <Link href={`/meals/${slug}`}>Voir les details</Link>
        </div>
      </div>
    </article>
  );
}
