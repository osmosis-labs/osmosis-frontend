import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { QRCode } from "~/components/qrcode";
import { api } from "~/utils/trpc";

/**
 * STUN server configuration for WebRTC peer connections.
 * Enables NAT traversal and peer discovery through Google's public STUN server.
 * This allows peers behind different networks/firewalls to establish direct connections.
 * The server runs on Google's infrastructure at stun.l.google.com:19302
 */
const STUN_SERVER = { urls: "stun:stun.l.google.com:19302" };

export default function DesktopPage() {
  const [sessionToken, setSessionToken] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [isReady, setIsReady] = useState(false);

  const createOfferMutation = api.edge.webRTC.createOffer.useMutation();
  const postCandidateMutation = api.edge.webRTC.postCandidate.useMutation();

  // Poll for the answer
  const fetchAnswerQuery = api.edge.webRTC.fetchAnswer.useQuery(
    { sessionToken },
    {
      enabled: !!sessionToken,
      refetchInterval: 3000,
    }
  );

  // Poll for candidates
  const fetchCandidatesQuery = api.edge.webRTC.fetchCandidates.useQuery(
    { sessionToken },
    {
      enabled: !!sessionToken,
      refetchInterval: 3000,
    }
  );

  useEffect(() => {
    // 1. Generate session token
    const token = uuidv4();
    setSessionToken(token);

    // 2. Create RTCPeerConnection
    const peer = new RTCPeerConnection({ iceServers: [STUN_SERVER] });

    // Create data channel if you want
    const dc = peer.createDataChannel("keyTransferChannel");
    dc.onopen = () => {
      console.log("[Desktop] Data channel open, can send data now.");
    };
    dc.onmessage = (e) => {
      console.log("[Desktop] Received from phone:", e.data);
    };

    // 3. ICE candidate handling
    peer.onicecandidate = async (event) => {
      if (event.candidate && sessionToken) {
        // Send candidate to server
        await postCandidateMutation.mutateAsync({
          sessionToken,
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    // 4. Create local offer
    (async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      // Store on the server
      await createOfferMutation.mutateAsync({
        sessionToken: token,
        offerSDP: offer.sdp ?? "",
      });
      // 5. Create QR code with sessionToken + server URL
      const payload = {
        sessionToken: token,
        serverUrl: "https://your-deployed-domain.com/trpc",
        // or wherever your tRPC server is
      };
      setQrValue(JSON.stringify(payload));
      setIsReady(true);
    })();

    setPc(peer);

    // Should only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 6. If we have an answer from fetchAnswer, set remote desc
  useEffect(() => {
    const answerSDP = fetchAnswerQuery.data?.answerSDP;
    if (answerSDP && pc) {
      console.log("[Desktop] Setting remote description with answerSDP...");
      pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
    }
  }, [fetchAnswerQuery.data, pc]);

  // 7. If we have ICE candidates from fetchCandidates, add them
  useEffect(() => {
    const candidateList = fetchCandidatesQuery.data?.candidates ?? [];
    if (candidateList && pc) {
      candidateList.forEach(async (cStr) => {
        try {
          const candidate = new RTCIceCandidate(JSON.parse(cStr));
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.error("Failed to add ICE candidate:", e);
        }
      });
    }
  }, [fetchCandidatesQuery.data, pc]);

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1>Desktop WebRTC Transfer</h1>
      {!isReady && <p>Generating offer...</p>}
      {isReady && (
        <div className="bg-white-full">
          <p>Scan this QR code with your mobile:</p>
          <QRCode value={qrValue} size={180} />
        </div>
      )}
    </div>
  );
}
