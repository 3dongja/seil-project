import * as functions from "firebase-functions";

export const nextApp = functions.https.onRequest(async (req, res) => {
  const dev = process.env.NODE_ENV !== "production";
  const next = await import("next"); // ✅ 동적 import로 변경
  const app = next.default({ dev, conf: { distDir: ".next" } });
  const handle = app.getRequestHandler();

  app.prepare().then(() => handle(req, res));
});