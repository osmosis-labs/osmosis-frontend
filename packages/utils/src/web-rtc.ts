/**
 * STUN server configuration for WebRTC peer connections.
 * Enables NAT traversal and peer discovery through Google's public STUN server.
 * This allows peers behind different networks/firewalls to establish direct connections.
 * The server runs on Google's infrastructure at stun.l.google.com:19302
 */
export const STUN_SERVER = { urls: "stun:stun.l.google.com:19302" };
