// Application de démonstration : to-do list connectée à Supabase.
// Stack : HTML/CSS/JS pur, sans build. Le client Supabase est chargé
// depuis un CDN (ESM), donc aucune installation n'est nécessaire.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const TABLE = "todos";

// --- Éléments du DOM ---
const form = document.getElementById("form-ajout");
const champ = document.getElementById("champ-tache");
const bouton = form.querySelector(".ajout__bouton");
const liste = document.getElementById("liste-taches");
const etat = document.getElementById("message-etat");

// --- Initialisation du client Supabase ---
let supabase = null;

function configManquante() {
  return (
    !SUPABASE_URL ||
    !SUPABASE_ANON_KEY ||
    SUPABASE_URL.includes("VOTRE-PROJET") ||
    SUPABASE_ANON_KEY.includes("VOTRE_CLE")
  );
}

function afficherEtat(message, erreur = false) {
  etat.textContent = message;
  etat.classList.toggle("etat--erreur", erreur);
}

// --- Lecture : charger toutes les tâches ---
async function chargerTaches() {
  afficherEtat("Chargement…");
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    afficherEtat("Erreur de chargement : " + error.message, true);
    return;
  }
  afficherEtat(`${data.length} tâche(s)`);
  rendreListe(data);
}

// --- Création : ajouter une tâche ---
async function ajouterTache(texte) {
  bouton.disabled = true;
  const { error } = await supabase.from(TABLE).insert({ task: texte });
  bouton.disabled = false;

  if (error) {
    afficherEtat("Erreur à l'ajout : " + error.message, true);
    return;
  }
  champ.value = "";
  await chargerTaches();
}

// --- Mise à jour : cocher / décocher une tâche ---
async function basculerTache(id, faite) {
  const { error } = await supabase
    .from(TABLE)
    .update({ is_complete: faite })
    .eq("id", id);

  if (error) {
    afficherEtat("Erreur de mise à jour : " + error.message, true);
    return;
  }
  await chargerTaches();
}

// --- Suppression : retirer une tâche ---
async function supprimerTache(id) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (error) {
    afficherEtat("Erreur de suppression : " + error.message, true);
    return;
  }
  await chargerTaches();
}

// --- Affichage de la liste ---
function rendreListe(taches) {
  liste.innerHTML = "";

  if (taches.length === 0) {
    const vide = document.createElement("li");
    vide.className = "liste__vide";
    vide.textContent = "Aucune tâche pour l'instant.";
    liste.appendChild(vide);
    return;
  }

  for (const tache of taches) {
    const item = document.createElement("li");
    item.className = "liste__item";
    if (tache.is_complete) item.classList.add("liste__item--faite");

    const case_ = document.createElement("input");
    case_.type = "checkbox";
    case_.className = "liste__case";
    case_.checked = tache.is_complete;
    case_.addEventListener("change", () =>
      basculerTache(tache.id, case_.checked)
    );

    const texte = document.createElement("span");
    texte.className = "liste__texte";
    texte.textContent = tache.task;

    const supprimer = document.createElement("button");
    supprimer.className = "liste__supprimer";
    supprimer.type = "button";
    supprimer.textContent = "×";
    supprimer.title = "Supprimer";
    supprimer.addEventListener("click", () => supprimerTache(tache.id));

    item.append(case_, texte, supprimer);
    liste.appendChild(item);
  }
}

// --- Branchement du formulaire ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const texte = champ.value.trim();
  if (texte) ajouterTache(texte);
});

// --- Démarrage ---
if (configManquante()) {
  afficherEtat(
    "Configuration Supabase manquante : renseigne config.js (URL + clé anon).",
    true
  );
  bouton.disabled = true;
} else {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  chargerTaches();
}
