
/**
 * Module for recording information about server performance.
 */
export module metrics {
  const MILLIS = 1000;

  // TODO These should be readonly.
  export let total_messages: number = 0;
  export let clients_connected: number = 0;

  export let players: string[] = [];

  let clients_this_activity_block: number = 0;
  let messages_this_activity_block: number = 0;
  
  module timestamps {
    export const start_server: number = Date.now();
    export let start_activity_block: number = start_server;
  }

  export function countClient() {
    clients_connected++;

    clients_this_activity_block = Math.max(
      clients_this_activity_block,
      clients_connected
    );
  }

  export function uncountClient() {
    clients_connected--;
  }

  export function countMessage() {
    total_messages++;
    messages_this_activity_block++;
  }

  /** Standardized server-metrics logging function. */
  function post(msg: string) {
    console.log(`[SERVER] ${msg}`);
  }

  /** Periodical server-metrics posting function. */
  export function logServerMetrics() {
    const now = Date.now();
    const activityBlockTime = (now - timestamps.start_activity_block) / MILLIS;
    const msgPerSecond = messages_this_activity_block / activityBlockTime;

    post(`Served ${messages_this_activity_block} messages (${msgPerSecond.toFixed(2)}ms/s) between ${clients_this_activity_block} sockets.`);
    post(`${total_messages} messages served during uptime.`);

    // Reset activity block
    timestamps.start_activity_block = now;
    clients_this_activity_block = clients_connected;
    messages_this_activity_block = 0;
  }

  export function startAsyncReporting() {
    const interval_minutes = 20;
    post(`Metrics posting active; occurring every ${interval_minutes} minutes.`);

    const interval_millis = interval_minutes * 60 * MILLIS;
    setInterval(logServerMetrics, interval_millis);
  }
}