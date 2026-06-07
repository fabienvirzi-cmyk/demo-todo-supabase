# demo-todo-supabase

Application de **démonstration** : une to-do list (ajouter / cocher / supprimer)
dont les données sont stockées dans une vraie base de données **Supabase**.

- **Créée le :** 2026-06-07
- **Type :** application web statique (démo / validation de chaîne d'outils)
- **But :** valider de bout en bout la chaîne `création → Git → GitHub → Netlify`,
  avec en plus une base de données distante. Modèle réutilisable pour de vrais projets.

## Stack

- **Front-end :** HTML / CSS / JavaScript pur, **sans build, sans Node.js**.
- **Base de données :** Supabase (PostgreSQL hébergé).
- **Client Supabase :** chargé depuis le CDN `esm.sh` (aucune installation).
- **Hébergement :** Netlify (déploiement d'un dossier statique).

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page |
| `style.css` | Mise en forme |
| `app.js` | Logique : lecture / ajout / mise à jour / suppression dans Supabase |
| `config.js` | URL + clé publique Supabase (à renseigner) |

## Mise en route

### 1. Créer la base Supabase

Sur [supabase.com](https://supabase.com), crée un projet, puis dans **SQL Editor**
exécute :

```sql
create table todos (
  id          bigint generated always as identity primary key,
  task        text not null,
  is_complete boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Sécurité au niveau des lignes (RLS)
alter table todos enable row level security;

-- Démo publique : on autorise l'accès anonyme (lecture + écriture).
-- ATTENTION : ouvert à tous ceux qui ont l'URL de la page. OK pour une démo,
-- à durcir (authentification) pour de vraies données.
create policy "Acces demo public" on todos
  for all to anon
  using (true) with check (true);
```

### 2. Renseigner les clés

Dans **Project Settings > API**, copie *Project URL* et la clé *anon / public*,
puis colle-les dans `config.js`.

### 3. Tester en local

Ouvre `index.html` dans un navigateur. Tu dois pouvoir ajouter, cocher et
supprimer des tâches, et les retrouver après rechargement de la page.

## État

Démo fonctionnelle. Sert de patron pour les futures applications connectées à une base de données.
