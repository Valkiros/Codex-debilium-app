# Guide de Mise à Jour Automatique - Codex debilium

Ce guide explique comment publier une nouvelle version de "Codex debilium" pour que les joueurs reçoivent la mise à jour automatiquement.

## 1. Génération des Clés (À faire UNE SEULE fois)

Les clés sont déjà générées. Si tu dois en regénérer :

```bash
npm run tauri signer generate -- -w ~/.tauri/codex.key
```

- **Clé publique** : déjà dans `tauri.conf.json` sous `updater.pubkey`
- **Clé privée** : fichier `tauri.key` à la racine du projet (ignoré par git)

## 2. Publier une Mise à Jour

### Étape 1 : Changer la version
Ouvrir `src-tauri/tauri.conf.json` et augmenter le numéro de version.
*Exemple : passer de `0.1.11` à `0.2.0`.*

### Étape 2 : Construire l'application
Lancer le script de build signé :
```powershell
powershell -ExecutionPolicy Bypass -File .\build_signed.ps1
```
Cela va :
1. Lire la clé privée depuis `tauri.key`
2. Construire l'application
3. Signer l'installateur
4. Générer les fichiers dans `src-tauri/target/release/bundle/nsis/`

### Étape 3 : Créer une Release sur GitHub
1. Aller sur [github.com/Valkiros/Codex-debilium-app/releases](https://github.com/Valkiros/Codex-debilium-app/releases) → "Draft a new release"
2. **Tag version** : mettre le même numéro avec un `v` devant (ex: `v0.2.0`)
3. **Titre** : "Mise à jour v0.2.0"
4. **Description** : lister les changements
5. **Glisser-déposer** les fichiers depuis `src-tauri/target/release/bundle/nsis/` :
    - `Codex debilium_X.X.X_x64-setup.exe`
    - `Codex debilium_X.X.X_x64-setup.nsis.zip`
    - `Codex debilium_X.X.X_x64-setup.nsis.zip.sig`
    - `latest.json`

### Étape 4 : Publier
Cliquer sur "Publish release".
Au prochain lancement, les joueurs verront la notification de mise à jour.

## 3. Rappels importants

- **Ne jamais** commiter `tauri.key` (il est dans `.gitignore`)
- **Toujours** bumper la version dans `tauri.conf.json` AVANT de build
- Le fichier `latest.json` est généré automatiquement par le build
- L'app vérifie les mises à jour au démarrage depuis `github.com/Valkiros/Codex-debilium-app/releases/latest/download/latest.json`
