import { MongoClient, GridFSBucket } from "mongodb";
import { Readable } from "node:stream";

export const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("La variable d'environnement MONGODB_URI n'est pas définie");
}

export async function connectToDatabase() {
  const client = await MongoClient.connect(uri);
  const db = client.db("default");
  return { client, db };
}

// Fonction pour stocker une image dans GridFS
export async function storeImageInGridFS(
  db,
  imageBuffer,
  filename,
  contentType
) {
  return new Promise((resolve, reject) => {
    const bucket = new GridFSBucket(db);

    // Créer un stream lisible à partir du buffer
    const readableStream = new Readable();
    readableStream._read = () => {}; // Implémentation requise pour le Readable stream
    readableStream.push(imageBuffer);
    readableStream.push(null);

    // Créer un stream d'upload vers GridFS
    const uploadStream = bucket.openUploadStream(filename, {
      contentType: contentType,
    });

    // Gérer les événements
    uploadStream.on("error", reject);
    uploadStream.on("finish", function () {
      resolve(this.id); // 'this' fait référence à uploadStream
    });

    // Pipe le stream de lecture vers le stream d'upload
    readableStream.pipe(uploadStream);
  });
}
