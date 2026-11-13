# Image du frontend Next.js (sortie « standalone » : image légère)
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Contenus éditoriaux : contexte de build « content » (dossier content/ du dépôt,
# déclaré dans docker-compose.yml → additional_contexts).
COPY --from=content . /content
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Adresse de Django vue depuis le serveur Next.js (relais /api, figé au build).
ARG API_INTERNAL_URL=http://backend:8000
# Clé publique reCAPTCHA (figée au build ; vide = protection désactivée).
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    API_INTERNAL_URL=$API_INTERNAL_URL \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    CONTENT_DIR=/content \
    NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    CONTENT_DIR=/app/content \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=content --chown=app:app . ./content
USER app
EXPOSE 3000
CMD ["node", "server.js"]
