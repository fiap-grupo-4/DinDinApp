import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();
const userId = process.env.SEED_USER_ID;

if (!userId) {
  throw new Error("Informe SEED_USER_ID.");
}

const userSnapshot = await db.collection("users").doc(userId).get();

if (!userSnapshot.exists) {
  throw new Error(`Usuário ${userId} não encontrado no Firestore.`);
}

const batch = db.batch();

const categories = {
  salary: {
    ref: db.collection("categories").doc(`${userId}_seed_salary`),
    name: "Salário",
  },
  food: {
    ref: db.collection("categories").doc(`${userId}_seed_food`),
    name: "Alimentação",
  },
  transport: {
    ref: db.collection("categories").doc(`${userId}_seed_transport`),
    name: "Transporte",
  },
  housing: {
    ref: db.collection("categories").doc(`${userId}_seed_housing`),
    name: "Moradia",
  },
  leisure: {
    ref: db.collection("categories").doc(`${userId}_seed_leisure`),
    name: "Lazer",
  },
};

const createdAt = new Date().toISOString();

for (const category of Object.values(categories)) {
  batch.set(category.ref, {
    userId,
    name: category.name,
    active: true,
    createdAt,
  });
}

const transactions = [
  {
    id: "salary",
    category: categories.salary,
    valueInCents: 550000,
    transactionType: "income",
    description: "Salário mensal",
    createdAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "rent",
    category: categories.housing,
    valueInCents: 180000,
    transactionType: "outcome",
    description: "Aluguel",
    createdAt: "2026-08-06T12:00:00.000Z",
  },
  {
    id: "supermarket",
    category: categories.food,
    valueInCents: 45890,
    transactionType: "outcome",
    description: "Supermercado",
    createdAt: "2026-08-10T18:30:00.000Z",
  },
  {
    id: "fuel",
    category: categories.transport,
    valueInCents: 25000,
    transactionType: "outcome",
    description: "Combustível",
    createdAt: "2026-08-12T14:00:00.000Z",
  },
  {
    id: "restaurant",
    category: categories.food,
    valueInCents: 8990,
    transactionType: "outcome",
    description: "Restaurante",
    createdAt: "2026-08-15T20:00:00.000Z",
  },
  {
    id: "cinema",
    category: categories.leisure,
    valueInCents: 6400,
    transactionType: "outcome",
    description: "Cinema",
    createdAt: "2026-08-18T19:30:00.000Z",
  },
];

for (const transaction of transactions) {
  const transactionRef = db
    .collection("transactions")
    .doc(`${userId}_seed_${transaction.id}`);

  batch.set(transactionRef, {
    userId,
    categoryId: transaction.category.ref.id,
    valueInCents: transaction.valueInCents,
    transactionType: transaction.transactionType,
    description: transaction.description,
    createdAt: transaction.createdAt,
  });
}

await batch.commit();

console.log(
  `${Object.keys(categories).length} categorias e ${transactions.length} transações criadas.`,
);
