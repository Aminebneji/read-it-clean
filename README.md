ReadItClean 📰✨

Un lecteur de news simplifié et élégant pour la communauté World of Warcraft

![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)

![Prisma](https://img.shields.io/badge/Prisma-6.17-2D3748?style=flat-square&logo=prisma)


🎯 
ReadItClean transforme l'expérience de lecture des actualités Wowhead en offrant une interface épurée et moderne.
À terme, l'application s'étendra à d'autres sources via flux RSS avec un design unifié et des articles enrichis par IA via une data récupéré au préalable.

# Installer les dépendances
npm install

# Configurer la base de données
npx prisma generate
npx prisma db push

# Configurer les variables d'environnement
Voici les variables que vous devez remplir dans votre fichier `.env` :

```bash
ANTHROPIC_API_KEY=your_api_key
DATABASE_URL=your_database_url
RSS_REFRESH_INTERVAL=your_refresh_interval
IAAPI_CONTREXT="Tu es un assistant qui génère des résumés d'articles clairs et concis en français."
CLAUDE_MAX_TOKENS=2048
RSS_REFRESH_INTERVAL=300000
DATABASE_URL=""

```

MADE TO GET SOME FUN /W FRONTEND DEVELOPMENT 🎉