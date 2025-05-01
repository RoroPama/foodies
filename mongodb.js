import { MongoClient, GridFSBucket } from "mongodb";
import { Readable } from "node:stream";

// Options de connexion améliorées pour résoudre les problèmes SSL
const options = {
  ssl: true,
  tls: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Augmenté pour une meilleure stabilité
  retryWrites: true,
  retryReads: true,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
};

// Chaine de connexion depuis les variables d'environnement
export const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("La variable d'environnement MONGODB_URI n'est pas définie");
}

// Cache pour la connexion MongoDB
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // Vérifier si nous sommes en phase de build
  if (process.env.NEXT_PHASE === "phase-production-build") {
    console.log("Phase de build détectée, retourne une connexion simulée");
    return {
      isMockConnection: true,
      client: null,
      db: null,
    };
  }

  // Réutiliser la connexion si elle existe déjà
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Créer une nouvelle connexion avec les options optimisées
    const client = await MongoClient.connect(uri, options);
    const db = client.db("default");

    // Mettre en cache la connexion
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Erreur de connexion MongoDB:", error);

    // Pour le processus de build, retourner une connexion simulée
    if (
      process.env.NEXT_PHASE === "phase-production-build" ||
      process.env.NODE_ENV === "production"
    ) {
      return {
        isMockConnection: true,
        client: null,
        db: null,
      };
    }

    throw error;
  }
}

// Fonction pour stocker une image dans GridFS
export async function storeImageInGridFS(
  db,
  imageBuffer,
  filename,
  contentType
) {
  // Vérifier si c'est une connexion simulée (pendant le build)
  if (!db) {
    console.log("Connexion simulée, retourne un ID fictif pour GridFS");
    return "mock-file-id-" + Date.now();
  }

  return new Promise((resolve, reject) => {
    const bucket = new GridFSBucket(db);

    // Créer un stream lisible à partir du buffer
    const readableStream = new Readable();
    readableStream._read = () => {}; // Implémentation requise pour le Readable stream
    readableStream.push(imageBuffer);
    readableStream.push(null);

    // Créer un stream d'upload vers GridFS avec des métadonnées supplémentaires
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
      metadata: {
        uploadDate: new Date(),
        source: "application-upload",
      },
    });

    // Gérer les événements
    uploadStream.on("error", (err) => {
      console.error("Erreur lors de l'upload vers GridFS:", err);
      reject(err);
    });

    uploadStream.on("finish", function () {
      console.log(`Fichier ${filename} uploadé avec succès, ID:`, this.id);
      resolve(this.id); // 'this' fait référence à uploadStream
    });

    // Pipe le stream de lecture vers le stream d'upload
    readableStream.pipe(uploadStream);
  });
}

// Fonction pour récupérer une image depuis GridFS
export async function getImageFromGridFS(db, fileId) {
  // Vérifier si c'est une connexion simulée (pendant le build)
  if (!db) {
    console.log("Connexion simulée, impossible de récupérer l'image");
    return null;
  }

  return new Promise((resolve, reject) => {
    const bucket = new GridFSBucket(db);

    // Rechercher le fichier dans GridFS
    const chunks = [];

    const downloadStream = bucket.openDownloadStream(fileId);

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
}

// Fonction pour obtenir des données simulées pendant le build
export function getMockData(collection) {
  // Retourne des données simulées selon la collection demandée
  if (collection === "meals") {
    return [
      {
        _id: "1",
        name: "Plat de données simulées 1",
        description: "Créé pendant le build",
      },
      {
        _id: "2",
        name: "Plat de données simulées 2",
        description: "Créé pendant le build",
      },
    ];
  }

  return [];
}
