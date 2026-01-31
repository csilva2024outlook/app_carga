import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface MessagePayload {
  message: string;
  from: string;
  to: string;
}

interface DriverPositionPayload {
  id_driver: number;
  lat: number;
  lng: number;
}

interface ClientRequestPayload {
  id: number;
  id_client: number;
    id_client_request: number;
  fare_offered: number;
  pickup_lat: number;
  pickup_lng: number;
  destination_lat: number;
  destination_lng: number;
  pickup_description: string;
  destination_description: string;
}

interface DriverOfferPayload {
  id: number;
  id_driver: number;
  id_client_request: number;
  fare_offered: number;
}

interface DriverAssignedPayload {
  id_client_request: number;
  id_driver: number;
  fare_assigned: number;
}

interface TripPositionPayload {
  id_client_request: number;
  id_driver: number;
   id_client: number;
  lat: number;
  lng: number;
}

interface TripStatusPayload {
  id_client_request: number;
    id_client: number;
  status: string;
}

@WebSocketGateway(9092, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('SocketGateway');

  afterInit(server: Server) {
    this.logger.log('Socket.IO Gateway initialized on port 9092');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() payload: MessagePayload,
    @ConnectedSocket() client: Socket,
  ): void {
    this.logger.log(`Message received: ${JSON.stringify(payload)}`);
    
    // Emit back to sender
    client.emit('new_message_response', {
      message: payload.message,
      from: payload.from,
      to: payload.to,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('change_driver_position')
  handleDriverPositionChange(
    @MessageBody() payload: DriverPositionPayload,
  ): void {
    this.logger.log(`Driver position changed: ${JSON.stringify(payload)}`);
    
    // Broadcast to all clients
    this.server.emit('new_driver_position', {
      id_driver: payload.id_driver,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('new_client_request')
  handleNewClientRequest(@MessageBody() payload: ClientRequestPayload): void {
    this.logger.log(`New client request: ${JSON.stringify(payload)}`);
    
    // Broadcast to all drivers
    this.server.emit('created_client_request', {
      id: payload.id,
      id_client_request: payload.id_client_request,
        id_client: payload.id_client,
      fare_offered: payload.fare_offered,
      pickup_lat: payload.pickup_lat,
      pickup_lng: payload.pickup_lng,
      destination_lat: payload.destination_lat,
      destination_lng: payload.destination_lng,
      pickup_description: payload.pickup_description,
      destination_description: payload.destination_description,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('new_driver_offer')
  handleNewDriverOffer(@MessageBody() payload: DriverOfferPayload): void {
    this.logger.log(`New driver offer: ${JSON.stringify(payload)}`);
    
    // Broadcast to all clients
    this.server.emit('created_driver_offer', {
      id: payload.id,
      id_driver: payload.id_driver,
      id_client_request: payload.id_client_request,
      fare_offered: payload.fare_offered,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('register_driver')
registerDriver(
  @MessageBody() payload: { id_driver: number },
  @ConnectedSocket() client: Socket,
): void {
  this.logger.log(`Register driver: ${payload.id_driver} - socket: ${client.id}`);
  client.join(`driver_${payload.id_driver}`);
}
 
  @SubscribeMessage('new_driver_assigned')
  handleDriverAssigned(@MessageBody() payload: DriverAssignedPayload): void {
    this.logger.log(`Driver assigned: ${JSON.stringify(payload)}`);
    
    // Broadcast to all clients
    this.server.to("driver_"+payload.id_driver).emit('created_driver_assigned', {
      id_client_request: payload.id_client_request,
      id_driver: payload.id_driver,
      fare_assigned: payload.fare_assigned,
      timestamp: new Date(),
    });
  }
  @SubscribeMessage('trip_change_driver_position')
  handleTripDriverPositionChange(
    @MessageBody() payload: TripPositionPayload,
  ): void {
    this.logger.log(`Trip driver position changed: ${JSON.stringify(payload)}`,);  
    // Broadcast to all clients
    this.server.to("driver_"+payload.id_client).emit('trip_driver_position_changed', {
      id_client_request: payload.id_client,
      id_driver: payload.id_driver,
      lat: payload.lat,
      lng: payload.lng,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('update_status_trip')
  handleTripStatusUpdate(@MessageBody() payload: TripStatusPayload): void {
    this.logger.log(`Trip status updated: ${JSON.stringify(payload)}`);
    
    // Broadcast to all clients
    this.server.emit(`new_status_trip/${payload.id_client_request}`, {
      id_client_request: payload.id_client_request,
          id_client: payload.id_client,
      status: payload.status,
      timestamp: new Date(),
    });
  }

  // Helper method to emit events from services
  emitEvent(event: string, data: any): void {
    this.server.emit(event, data);
  }
}
