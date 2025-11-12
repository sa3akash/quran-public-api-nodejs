import express from "express";
import "dotenv/config";
import { config } from "./config";
import { mainRouter } from "./routes";
import { globalErrorHandler } from "error-express";
import comprassion from "compression";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";

const app = express();

app.use(express.json({ limit: "10MB" }));
app.use(express.urlencoded({ extended: true, limit: "10MB" }));
app.use(comprassion());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: {
      policy: "same-origin",
    },
    crossOriginResourcePolicy: {
      policy: "same-origin",
    },
    dnsPrefetchControl: {
      allow: false,
    },
    frameguard: {
      action: "deny",
    },
    hidePoweredBy: true,
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: {
      permittedPolicies: "none",
    },
    referrerPolicy: {
      policy: "no-referrer",
    },
    xssFilter: true,
  })
);
app.use(
  rateLimit({
    windowMs: 60 * 100,
    limit: 50,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  })
);

// routus
mainRouter(app);

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(globalErrorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port http://localhost:${config.PORT}`);
});
