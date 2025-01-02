import { STUN_SERVER } from "@osmosis-labs/utils";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { QRCode } from "~/components/qrcode";
import { api } from "~/utils/trpc";

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

  /**
   * Helper function to create a peer connection, generate a new offer,
   * and post it to the server.
   */
  const generateOffer = useCallback(async () => {
    // Generate new session token
    const token = uuidv4();
    setSessionToken(token);

    // Create new PeerConnection
    const peer = new RTCPeerConnection({ iceServers: [STUN_SERVER] });

    // Create data channel if you want
    const dc = peer.createDataChannel("keyTransferChannel");
    dc.onopen = () => {
      console.log("[Desktop] Data channel open, can send data now.");
    };
    dc.onmessage = (e) => {
      console.log("[Desktop] Received from phone:", e.data);
    };

    // ICE candidate handling
    peer.onicecandidate = async (event) => {
      if (event.candidate && token) {
        // Send candidate to server
        await postCandidateMutation.mutateAsync({
          sessionToken: token,
          candidate: JSON.stringify(event.candidate),
        });
      }
    };

    // Create local offer, store on the server, and generate QR
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    await createOfferMutation.mutateAsync({
      sessionToken: token,
      offerSDP: offer.sdp ?? "",
    });

    const payload = {
      sessionToken: token,
    };
    setQrValue(JSON.stringify(payload));
    setIsReady(true);
    setPc(peer);
  }, [createOfferMutation, postCandidateMutation]);

  /**
   * On mount, generate the initial offer.
   */
  useEffect(() => {
    generateOffer().catch((err) => {
      console.error("Failed to generate initial offer:", err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * If we have an answer from the fetchAnswer query, set it as remote description.
   */
  useEffect(() => {
    const answerSDP = fetchAnswerQuery.data?.answerSDP;
    if (answerSDP && pc) {
      console.log("[Desktop] Setting remote description with answerSDP...");
      pc.setRemoteDescription({ type: "answer", sdp: answerSDP });
    }
  }, [fetchAnswerQuery.data, pc]);

  /**
   * If we have ICE candidates from the server, add them.
   */
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

  /**
   * Set a timer to regenerate the offer if still no answer after 5 minutes
   * (300000 ms). If the user never scanned the QR code or the phone didn't
   * respond, this re-creates a fresh session.
   */
  useEffect(() => {
    // Only start timer if we actually have a sessionToken generated
    if (!sessionToken) return;

    const timerId = setTimeout(async () => {
      // If we still have no answer at this point, regenerate
      if (!fetchAnswerQuery.data?.answerSDP) {
        console.log("[Desktop] Offer expired. Regenerating new offer...");
        // Close old peer if it exists
        if (pc) {
          pc.close();
          setPc(null);
        }
        setSessionToken("");
        setIsReady(false);
        // Generate a fresh offer
        await generateOffer();
      }
    }, 5 * 60 * 1000);

    return () => {
      clearTimeout(timerId);
    };
  }, [sessionToken, fetchAnswerQuery.data, pc, generateOffer]);

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
