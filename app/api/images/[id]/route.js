// app/api/images/[id]/route.js
import { connectToDatabase } from "@/mongodb";
import { ObjectId, GridFSBucket } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // ✅ Await params pour Next.js 15+
  const { id } = await params;

  if (!id) {
    return new NextResponse("ID d'image manquant", { status: 400 });
  }

  try {
    // ✅ Utiliser la fonction connectToDatabase existante
    const { client, db, isMockConnection } = await connectToDatabase();

    if (isMockConnection || !db) {
      // Retourner une image par défaut ou une erreur
      return new NextResponse("Service d'images non disponible", {
        status: 503,
      });
    }

    // Vérifier si l'ID est valide
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (err) {
      return new NextResponse("ID d'image invalide", { status: 400 });
    }

    // Créer un bucket GridFS
    const bucket = new GridFSBucket(db, { bucketName: "fs" });

    // Récupérer les métadonnées du fichier
    const file = await db.collection("fs.files").findOne({ _id: objectId });

    if (!file) {
      return new NextResponse("Image non trouvée", { status: 404 });
    }

    // Récupérer l'image via stream
    const chunks = [];

    return new Promise((resolve, reject) => {
      const downloadStream = bucket.openDownloadStream(objectId);

      downloadStream.on("data", (chunk) => {
        chunks.push(chunk);
      });

      downloadStream.on("error", (error) => {
        console.error("Erreur lors du téléchargement de l'image:", error);
        reject(
          new NextResponse("Erreur lors du téléchargement", { status: 500 })
        );
      });

      downloadStream.on("end", () => {
        const buffer = Buffer.concat(chunks);

        resolve(
          new NextResponse(buffer, {
            headers: {
              "Content-Type": file.contentType || "image/jpeg",
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "public, max-age=86400",
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image:", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  }
}
