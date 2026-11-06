import "dotenv/config";
import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const confirmation = process.argv.find((arg) =>
  arg.startsWith("--confirm-project="),
);

if (!projectId) {
  throw new Error("Informe EXPO_PUBLIC_FIREBASE_PROJECT_ID no arquivo .env.");
}

if (confirmation !== `--confirm-project=${projectId}`) {
  throw new Error(
    `Para ativar TOTP em ${projectId}, execute com --confirm-project=${projectId}.`,
  );
}

initializeApp({
  credential: applicationDefault(),
  projectId,
});

await getAuth().projectConfigManager().updateProjectConfig({
  multiFactorConfig: {
    providerConfigs: [
      {
        state: "ENABLED",
        totpProviderConfig: {
          adjacentIntervals: 1,
        },
      },
    ],
  },
});

console.log(`MFA TOTP habilitado no projeto ${projectId}. Nenhum provedor SMS foi habilitado.`);
