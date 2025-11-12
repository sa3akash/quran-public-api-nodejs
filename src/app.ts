import express from 'express';
import "dotenv/config"
import { config } from './config';
import { mainRouter } from './routes';
import { globalErrorHandler } from 'error-express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routus
mainRouter(app);

app.use(globalErrorHandler);

app.listen(config.PORT, () => {
    console.log(`Server is running on port http://localhost:${config.PORT}`);
});