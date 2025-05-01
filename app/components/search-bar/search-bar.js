"use client";

import { useState } from "react";
import MealsGrid from "../meals/meals-grid";
import classes from "./search-bar.module.css";
function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className={classes.searchContainer}>
      <input
        type="text"
        placeholder="Rechercher par nom de plat ou créateur..."
        value={searchTerm}
        onChange={handleSearchChange}
        className={classes.searchInput}
      />
    </div>
  );
}

export default function MealsWithSearch({ meals }) {
  const [filteredMeals, setFilteredMeals] = useState(meals);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredMeals(meals);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = meals.filter(
      (meal) =>
        meal.title.toLowerCase().includes(term) ||
        meal.creator.toLowerCase().includes(term)
    );

    setFilteredMeals(filtered);
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} />
      <MealsGrid meals={filteredMeals} />
    </>
  );
}
