import { uri } from "@/mongodb";
import { MongoClient, ObjectId, GridFSBucket } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  const { params } = context;
  const id = params.id;

  if (!id) {
    return new NextResponse("ID d'image manquant", { status: 400 });
  }

  const client = await MongoClient.connect(uri);
  const db = client.db("default");

  try {
    // Créer un bucket GridFS
    const bucket = new GridFSBucket(db);

    // Récupérer les métadonnées du fichier
    const file = await db
      .collection("fs.files")
      .findOne({ _id: new ObjectId(id) });

    if (!file) {
      return new NextResponse("Image non trouvée", { status: 404 });
    }

    // Récupérer les chunks de l'image
    const chunks = [];
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }

    // Concaténer tous les chunks pour former le buffer complet
    const buffer = Buffer.concat(chunks);

    // Retourner l'image avec les headers appropriés
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.contentType || "image/jpeg",
        "Content-Length": file.length.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    return new NextResponse("Erreur serveur", { status: 500 });
  } finally {
    await client.close();
  }
}
