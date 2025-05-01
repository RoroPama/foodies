import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";

export default function MealsGrid({ meals }) {
  if (meals.length === 0) {
    return (
      <div className={classes.noResults}>
        <p>Aucun résultat trouvé. Essayez une autre recherche.</p>
      </div>
    );
  }

  return (
    <ul className={classes.meals}>
      {meals.map((meal) => (
        <li key={meal.slug}>
          <MealItem {...meal} />
        </li>
      ))}
    </ul>
  );
}
