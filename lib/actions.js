"use server";
import { revalidatePath } from "next/cache";
import { saveMeal } from "./meals";
import { redirect } from "next/navigation";
import { Readable } from "stream";

export async function shareMeal(formData) {
  // Validation des entrées
  const name = formData.get("name");
  const email = formData.get("email");
  const title = formData.get("title");
  const summary = formData.get("summary");
  const instructions = formData.get("instructions");
  const image = formData.get("image");

  // Vérifications de base
  const errors = {};

  // Validation du nom (requis, min 3 caractères)
  if (!name || name.trim().length < 3) {
    errors.name = "Le nom doit contenir au moins 3 caractères.";
  }

  // Validation de l'email
  if (!email || !email.includes("@") || !email.includes(".")) {
    errors.email = "Veuillez entrer une adresse email valide.";
  }

  // Validation du titre (requis, min 5 caractères)
  if (!title || title.trim().length < 5) {
    errors.title = "Le titre doit contenir au moins 5 caractères.";
  }

  // Validation du résumé (requis, min 10 caractères)
  if (!summary || summary.trim().length < 10) {
    errors.summary = "Le résumé doit contenir au moins 10 caractères.";
  }

  // Validation des instructions (requis, min 30 caractères)
  if (!instructions || instructions.trim().length < 30) {
    errors.instructions =
      "Les instructions doivent contenir au moins 30 caractères.";
  }

  // Validation de l'image
  if (!image || image.size === 0) {
    errors.image = "Veuillez sélectionner une image.";
  } else {
    // Vérification du type de fichier
    const fileType = image.type;
    if (!fileType.startsWith("image/")) {
      errors.image = "Le fichier doit être une image (JPEG, PNG, etc.).";
    }
  }

  // S'il y a des erreurs, retourner les erreurs
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors: errors,
    };
  }

  // Si tout est valide, continuer avec l'enregistrement
  const mealData = {
    creator: name,
    creator_email: email,
    title: title,
    summary: summary,
    instructions: instructions,
    image: image,
  };

  try {
    await saveMeal(mealData);
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du repas :", error);
    return {
      success: false,
      message: "Une erreur s'est produite. Veuillez réessayer.",
      error: error.message,
    };
  } finally {
    revalidatePath("/meals", "page");
    redirect("/meals");
  }
}
