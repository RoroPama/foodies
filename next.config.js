/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le déploiement sur Vercel
  output: "standalone",

  // Configurations expérimentales
  experimental: {
    // Packages externes pour les composants serveur
    serverComponentsExternalPackages: ["mongodb", "node:stream"],
    // Augmentation de la mémoire allouée pour les opérations de build
    memoryBasedWorkersCount: true,
  },

  // Configuration de l'environnement pour détecter la phase de build
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || "",
  },

  // Augmenter la taille maximale des payloads pour les images
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },

  // Configuration pour les images
  images: {
    domains: ["localhost", "vercel.app"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Optimisations webpack pour la gestion des flux et MongoDB
  webpack: (config, { isServer }) => {
    // Gérer spécifiquement les modules node pour le frontend
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/"),
      };
    }

    // Permettre aux composants serveur d'utiliser des modules node
    if (isServer) {
      config.externals = [...config.externals, "mongodb", "node:stream"];
    }

    return config;
  },
};

module.exports = nextConfig;
