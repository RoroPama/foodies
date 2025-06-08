import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

let cachedClient = null;
let cachedDb = null;

// Données simulées pour le développement et le build
// const mockData = {
//   meals: [
//     {
//       _id: "mock-1",
//       title: "Burger Juteux",
//       slug: "burger-juteux",
//       image: {
//         id: "mock-image-1",
//         filename: "burger.jpg",
//         contentType: "image/jpeg",
//       },
//       summary: "Un burger délicieux et juteux avec tous les accompagnements.",
//       instructions:
//         "Préparez les ingrédients et assemblez votre burger parfait...",
//       creator: "Chef John",
//       creator_email: "john@example.com",
//       createdAt: new Date("2024-01-01"),
//     },
//     {
//       _id: "mock-2",
//       title: "Curry Épicé",
//       slug: "curry-epice",
//       image: {
//         id: "mock-image-2",
//         filename: "curry.jpg",
//         contentType: "image/jpeg",
//       },
//       summary: "Un curry épicé et savoureux aux légumes frais.",
//       instructions: "Faites revenir les épices et ajoutez les légumes...",
//       creator: "Chef Sarah",
//       creator_email: "sarah@example.com",
//       createdAt: new Date("2024-01-02"),
//     },
//     {
//       _id: "mock-3",
//       title: "Dumplings Maison",
//       slug: "dumplings-maison",
//       image: {
//         id: "mock-image-3",
//         filename: "dumplings.jpg",
//         contentType: "image/jpeg",
//       },
//       summary: "Des dumplings faits maison avec une farce savoureuse.",
//       instructions:
//         "Préparez la pâte et la farce, puis formez les dumplings...",
//       creator: "Chef Li",
//       creator_email: "li@example.com",
//       createdAt: new Date("2024-01-03"),
//     },
//     {
//       _id: "mock-4",
//       title: "Macaroni au Fromage Classique",
//       slug: "macaroni-au-fromage-classique",
//       image: {
//         id: "mock-image-4",
//         filename: "macaroni.jpg",
//         contentType: "image/jpeg",
//       },
//       summary: "Le classique mac and cheese, réconfortant et crémeux.",
//       instructions: "Cuisez les pâtes, préparez la sauce au fromage...",
//       creator: "Chef Marie",
//       creator_email: "marie@example.com",
//       createdAt: new Date("2024-01-04"),
//     },
//   ],
// };

// export function getMockData(collection) {
//   return mockData[collection] || [];
// }

export async function connectToDatabase() {
  // ✅ Détection améliorée de l'environnement de build
  const isBuildTime =
    !uri ||
    (process.env.NODE_ENV === "production" &&
      (process.env.VERCEL_ENV === "build" ||
        process.env.NEXT_PHASE === "phase-production-build"));

  if (isBuildTime) {
    console.log(
      "🔄 Environnement de build détecté - Utilisation des données simulées"
    );
    return {
      client: null,
      db: null,
      isMockConnection: true,
    };
  }

  try {
    // Utiliser le cache si disponible en développement
    if (cachedClient && cachedDb && process.env.NODE_ENV === "development") {
      console.log("📦 Utilisation de la connexion mise en cache");
      return {
        client: cachedClient,
        db: cachedDb,
        isMockConnection: false,
      };
    }

    console.log("🔗 Connexion à MongoDB...");
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    await client.connect();
    const db = client.db(dbName);

    // Test de la connexion
    await db.admin().ping();
    console.log("✅ Connexion MongoDB établie avec succès");

    // Mise en cache pour le développement uniquement
    if (process.env.NODE_ENV === "development") {
      cachedClient = client;
      cachedDb = db;
    }

    return {
      client,
      db,
      isMockConnection: false,
    };
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB:", error);
    console.log("🔄 Basculement vers les données simulées");

    return {
      client: null,
      db: null,
      isMockConnection: true,
    };
  }
}

export async function getImageFromGridFS(db, fileId) {
  // Vérifier si c'est une connexion simulée (pendant le build) ou si db est null
  if (!db) {
    console.log(
      "Connexion simulée ou db null, impossible de récupérer l'image"
    );
    return null;
  }

  try {
    // Convertir l'ID en ObjectId valide
    let objectId;
    try {
      objectId = new ObjectId(fileId);
    } catch (err) {
      console.error(`ID de fichier non valide '${fileId}':`, err);
      return null;
    }

    return new Promise((resolve, reject) => {
      const bucket = new GridFSBucket(db);
      const chunks = [];

      const downloadStream = bucket.openDownloadStream(objectId);

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on("error", (err) => {
        console.error("Erreur lors du téléchargement depuis GridFS:", err);
        reject(err);
      });

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
    });
  } catch (err) {
    console.error("Erreur lors de la récupération depuis GridFS:", err);
    return null;
  }
}
