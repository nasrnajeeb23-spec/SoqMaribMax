import { Notification, Message, Product } from '../types';

type RealtimeEvent = 
  | { type: 'notification', payload: Notification }
  | { type: 'chat_message', payload: Message }
  | { type: 'auction_bid', payload: { productId: string, product: Product } }
  | { type: 'user-typing-start', payload: { conversationId: string, userId: string } }
  | { type: 'user-typing-stop', payload: { conversationId: string, userId: string } };

// Using BroadcastChannel API to simulate real-time communication between open tabs/windows of the same origin.
// In a real application, this would be replaced with a WebSocket connection.
const channel = new BroadcastChannel('souqmarib_realtime');

export const realtimeService = {
  /**
   * Posts an event (notification or message) to all listening contexts.
   * @param event The event object to send.
   */
  postEvent: (event: RealtimeEvent) => {
    channel.postMessage(event);
  },

  /**
   * Subscribes to new events broadcasted on the channel.
   * @param callback The function to execute when a new event is received.
   */
  onEvent: (callback: (event: RealtimeEvent) => void) => {
    channel.onmessage = (event) => {
      // We can add validation here to ensure event.data is a valid RealtimeEvent
      callback(event.data as RealtimeEvent);
    };
  },

  /**
   * Closes the channel. Should be called on cleanup if necessary.
   */
  close: () => {
    channel.close();
  }
};
