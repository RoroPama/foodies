"use server";

const sql = require("better-sqlite3");
const db = sql("meals.db");

const platsExemples = [
  // Conserver certains plats existants mais traduits
  {
    title: "Burger au Fromage Juteux",
    slug: "burger-au-fromage-juteux",
    image: "/images/burger.jpg",
    summary:
      "Un burger appétissant avec un steak de bœuf juteux et du fromage fondu, servi dans un pain moelleux.",
    instructions: `
      1. Préparer le steak :
         Mélanger 200g de bœuf haché avec du sel et du poivre. Former un steak.

      2. Cuire le steak :
         Chauffer une poêle avec un peu d'huile. Cuire le steak pendant 2-3 minutes de chaque côté, jusqu'à ce qu'il soit doré.

      3. Assembler le burger :
         Faire griller les deux moitiés du pain. Placer la laitue et la tomate sur la moitié inférieure. Ajouter le steak cuit et recouvrir d'une tranche de fromage.

      4. Servir :
         Compléter l'assemblage avec la moitié supérieure du pain et servir chaud.
    `,
    creator: "Jean Dupont",
    creator_email: "jeandupont@exemple.com",
  },
  {
    title: "Pizza Authentique",
    slug: "pizza-authentique",
    image: "/images/pizza.jpg",
    summary:
      "Pizza pétrie à la main avec une sauce tomate acidulée, des garnitures fraîches et du fromage fondu.",
    instructions: `
      1. Préparer la pâte :
         Pétrir la pâte à pizza et la laisser lever jusqu'à ce qu'elle double de volume.

      2. Façonner et ajouter les garnitures :
         Étaler la pâte, répartir la sauce tomate, ajouter vos garnitures préférées et le fromage.

      3. Cuire la pizza :
         Cuire dans un four préchauffé à 220°C pendant environ 15-20 minutes.

      4. Servir :
         Couper en tranches et déguster avec un peu de feuilles de basilic.
    `,
    creator: "Mario Rossi",
    creator_email: "mariorossi@exemple.com",
  },

  // Plats congolais (déjà en français)
  {
    title: "Poulet à la Moambé",
    slug: "poulet-a-la-moambe",
    image: "/images/moambe.jpg",
    summary:
      "Un délicieux ragoût congolais à base de poulet mijoté dans une sauce crémeuse de noix de palme.",
    instructions: `
      1. Préparer le poulet :
         Couper le poulet en morceaux et assaisonner avec du sel, du poivre et de l'ail.

      2. Faire revenir le poulet :
         Dans une grande casserole, faire revenir le poulet avec de l'huile jusqu'à ce qu'il soit doré.

      3. Préparer la sauce :
         Ajouter l'oignon émincé, puis la pâte de moambé (ou crème de noix de palme). Mélanger et laisser mijoter.

      4. Cuisson finale :
         Ajouter un peu d'eau si nécessaire, couvrir et laisser mijoter à feu doux pendant environ 45 minutes.

      5. Servir :
         Servir chaud avec du fufu de manioc ou du riz.
    `,
    creator: "Rolic PAMA",
    creator_email: "rolic@exemple.com",
  },

  {
    title: "Pondu (Feuilles de Manioc)",
    slug: "pondu-feuilles-de-manioc",
    image: "/images/pondu.jpg",
    summary:
      "Un délicieux plat de feuilles de manioc pilées et mijotées avec de l'huile de palme et des épices.",
    instructions: `
      1. Préparer les feuilles :
         Laver soigneusement les feuilles de manioc et les piler dans un mortier ou les hacher finement.

      2. Faire bouillir :
         Mettre les feuilles dans une casserole d'eau bouillante et cuire pendant environ 30 minutes pour réduire l'amertume.

      3. Préparer la sauce :
         Dans une autre casserole, faire revenir l'oignon et l'ail dans de l'huile de palme.

      4. Combiner :
         Égoutter les feuilles et les ajouter dans la casserole avec l'oignon. Ajouter du sel, du bouillon en cube et du piment.

      5. Mijoter :
         Laisser mijoter à feu doux pendant 20-30 minutes en remuant occasionnellement.

      6. Servir :
         Accompagner de fufu, de riz ou de chikwangue.
    `,
    creator: "Rolic PAMA",
    creator_email: "rolic@exemple.com",
  },
  {
    title: "Macaroni au Fromage Classique",
    slug: "macaroni-au-fromage-classique",
    image: "/images/macncheese.jpg",
    summary:
      "Macaroni crémeux et fromage, un classique réconfortant qui plaît toujours à tout le monde.",
    instructions: `
     1. Cuire les macaronis :
        Faire bouillir les macaronis selon les instructions du paquet jusqu'à ce qu'ils soient al dente.

     2. Préparer la sauce au fromage :
        Dans une casserole, faire fondre du beurre, ajouter de la farine et incorporer progressivement du lait en fouettant jusqu'à épaississement. Incorporer le fromage râpé jusqu'à ce qu'il soit fondu.

     3. Combiner :
        Mélanger la sauce au fromage avec les macaronis égouttés.

     4. Cuire au four :
        Transférer dans un plat allant au four, saupoudrer de chapelure et cuire jusqu'à ce que le dessus soit doré.

     5. Servir :
        Servir chaud, garni de persil si désiré.
   `,
    creator: "Laura Dupuis",
    creator_email: "lauradupuis@exemple.com",
  },
  {
    title: "Curry Épicé",
    slug: "curry-epice",
    image: "/images/curry.jpg",
    summary:
      "Un curry riche et épicé, infusé d'épices exotiques et de lait de coco crémeux.",
    instructions: `
     1. Couper les légumes :
        Couper les légumes de votre choix en morceaux de taille moyenne.

     2. Faire sauter les légumes :
        Dans une poêle avec de l'huile, faire sauter les légumes jusqu'à ce qu'ils commencent à ramollir.

     3. Ajouter la pâte de curry :
        Incorporer 2 cuillères à soupe de pâte de curry et cuire pendant une minute supplémentaire.

     4. Mijoter avec du lait de coco :
        Verser 500ml de lait de coco et porter à ébullition. Laisser mijoter pendant environ 15 minutes.

     5. Servir :
        Déguster ce curry crémeux avec du riz ou du pain.
   `,
    creator: "Maxime Noir",
    creator_email: "maxime@exemple.com",
  },
];

db.prepare(
  `
   CREATE TABLE IF NOT EXISTS meals (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       slug TEXT NOT NULL UNIQUE,
       title TEXT NOT NULL,
       image TEXT NOT NULL,
       summary TEXT NOT NULL,
       instructions TEXT NOT NULL,
       creator TEXT NOT NULL,
       creator_email TEXT NOT NULL
    )
`
).run();

async function initialiserDonnees() {
  const stmt = db.prepare(`
      INSERT INTO meals VALUES (
         null,
         @slug,
         @title,
         @image,
         @summary,
         @instructions,
         @creator,
         @creator_email
      )
   `);

  for (const repas of platsExemples) {
    stmt.run(repas);
  }
}

initialiserDonnees();
