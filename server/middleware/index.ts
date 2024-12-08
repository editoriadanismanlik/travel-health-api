import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import WebSocketService from './services/websocket';

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on('upgrade', (request, socket, head) => {
  WebSocketService.handleUpgrade(request, socket, head);
});
