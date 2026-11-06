import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { afterAll, afterEach, beforeAll, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-dindin-security",
    firestore: {
      rules: readFileSync("src/infrastructure/firebase/firestore.rules", "utf8"),
    },
    storage: {
      rules: readFileSync("src/infrastructure/firebase/storage.rules", "utf8"),
    },
  });
});

afterEach(async () => {
  if (!testEnv) return;
  await testEnv.clearFirestore();
  await testEnv.clearStorage();
});

afterAll(async () => {
  await testEnv?.cleanup();
});

const verifiedUser = (uid: string) =>
  testEnv.authenticatedContext(uid, {
    email: `${uid}@example.test`,
    email_verified: true,
  });

describe("Firestore security rules", () => {
  it("allows verified owners and denies cross-user writes", async () => {
    const user = verifiedUser("user-a");
    await assertSucceeds(
      setDoc(doc(user.firestore(), "categories/category-a"), {
        userId: "user-a",
        name: "Comida",
        createdAt: new Date().toISOString(),
      }),
    );

    await assertFails(
      setDoc(doc(user.firestore(), "categories/category-b"), {
        userId: "user-b",
        name: "Comida",
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it("requires verified email for financial data writes", async () => {
    const unverified = testEnv.authenticatedContext("user-a", {
      email: "user-a@example.test",
      email_verified: false,
    });

    await assertFails(
      setDoc(doc(unverified.firestore(), "savingsGoals/goal-a"), {
        userId: "user-a",
        title: "Reserva",
        currentValueInCents: 0,
        targetValueInCents: 1000,
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it("allows a user to create only their own profile with a server timestamp", async () => {
    const user = verifiedUser("user-a");
    await assertSucceeds(
      setDoc(doc(user.firestore(), "users/user-a"), {
        uid: "user-a",
        email: "user-a@example.test",
        fullName: "User A",
        birthday: "",
        createdAt: serverTimestamp(),
      }),
    );

    await assertFails(
      updateDoc(doc(user.firestore(), "users/user-a"), {
        email: "other@example.test",
      }),
    );
  });

  it("rejects unknown fields and out-of-range transaction values", async () => {
    const user = verifiedUser("user-a");
    await assertFails(
      setDoc(doc(user.firestore(), "transactions/extra-field"), {
        userId: "user-a",
        valueInCents: 500,
        transactionType: "outcome",
        createdAt: new Date().toISOString(),
        privileged: true,
      }),
    );

    await assertFails(
      setDoc(doc(user.firestore(), "transactions/large-value"), {
        userId: "user-a",
        valueInCents: 1000000000001,
        transactionType: "outcome",
        createdAt: new Date().toISOString(),
      }),
    );
  });

  it("preserves immutable ownership and timestamps", async () => {
    const user = verifiedUser("user-a");
    await assertSucceeds(
      setDoc(doc(user.firestore(), "savingsGoals/goal-a"), {
        userId: "user-a",
        title: "Reserva",
        currentValueInCents: 0,
        targetValueInCents: 1000,
        createdAt: "2026-11-01T00:00:00.000Z",
      }),
    );
    await assertFails(
      updateDoc(doc(user.firestore(), "savingsGoals/goal-a"), {
        userId: "user-b",
      }),
    );
    await assertFails(
      updateDoc(doc(user.firestore(), "savingsGoals/goal-a"), {
        createdAt: "2026-11-02T00:00:00.000Z",
      }),
    );
  });

  it("allows bounded owner queries only", async () => {
    const user = verifiedUser("user-a");
    await assertSucceeds(
      getDocs(
        query(
          collection(user.firestore(), "categories"),
          where("userId", "==", "user-a"),
          limit(100),
        ),
      ),
    );
    await assertFails(
      getDocs(
        query(
          collection(user.firestore(), "categories"),
          where("userId", "==", "user-a"),
          limit(101),
        ),
      ),
    );
  });
});

describe("Storage security rules", () => {
  it("allows a small owned JPEG and rejects SVG and oversized files", async () => {
    const user = verifiedUser("user-a");
    const storage = user.storage();

    await assertSucceeds(
      uploadBytes(
        ref(storage, "receipts/user-a/1730000000000-abcd1234.jpg"),
        new Uint8Array([1, 2, 3]),
        { contentType: "image/jpeg" },
      ),
    );
    await assertFails(
      uploadBytes(
        ref(storage, "receipts/user-a/1730000000000-abcd1234.svg"),
        new Uint8Array([1, 2, 3]),
        { contentType: "image/svg+xml" },
      ),
    );
    await assertFails(
      uploadBytes(
        ref(storage, "receipts/user-a/1730000000000-abcd1234.png"),
        new Uint8Array(5 * 1024 * 1024 + 1),
        { contentType: "image/png" },
      ),
    );
  });
});
