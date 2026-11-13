# Tampons officiels Krool Holding

`stamp-black.*` et `stamp-blue.*` serviront à la génération des certificats PDF (étape 5).

Ces fichiers ne doivent **jamais** être exposés par une URL publique (ni `frontend/public/`,
ni `MEDIA_ROOT`) : un tampon téléchargeable facilite la falsification de documents.
L'authenticité d'un certificat repose sur son identifiant unique et la page publique
de vérification `/verifier/<code>`, pas sur l'image du tampon.
