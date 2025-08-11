import * as WebSocket from 'ws';
import * as Express from 'express';
import * as fs from 'fs';

const app: Express.Application = Express();
const port: number = 3000;
const wss: WebSocket.Server = new WebSocket.Server({ port: 8080 });

interface SecurityEvent {
  type: string;
  data: string;
}

class SecurityToolController {
  private securityEvents: SecurityEvent[] = [];

  constructor() {
    this.startServer();
    this.startWebsocketServer();
  }

  private startServer(): void {
    app.use(Express.json());
    app.post('/events', (req: Express.Request, res: Express.Response) => {
      this.handleEvent(req.body);
      res.status(200).send({ message: 'Event received successfully' });
    });
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  }

  private startWebsocketServer(): void {
    wss.on('connection', (ws: WebSocket) => {
      console.log('Client connected');
      ws.on('message', (message: string) => {
        this.handleEvent(JSON.parse(message));
      });
      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }

  private handleEvent(event: SecurityEvent): void {
    this.securityEvents.push(event);
    console.log(`Received event: ${event.type} - ${event.data}`);
    this.broadcastEvent(event);
  }

  private broadcastEvent(event: SecurityEvent): void {
    wss.clients.forEach((client: WebSocket) => {
      client.send(JSON.stringify(event));
    });
  }

  public getSecurityEvents(): SecurityEvent[] {
    return this.securityEvents;
  }
}

const controller: SecurityToolController = new SecurityToolController();

app.get('/events', (req: Express.Request, res: Express.Response) => {
  res.status(200).json(controller.getSecurityEvents());
});

console.log('Security Tool Controller started');