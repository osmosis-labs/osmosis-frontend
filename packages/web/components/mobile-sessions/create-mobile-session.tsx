import { toBase64 } from "@cosmjs/encoding";
import {
  deserializeWebRTCMessage,
  MobileSessionEncryptedDataSchema,
  serializeWebRTCMessage,
  STUN_SERVER,
} from "@osmosis-labs/utils";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { QRCode } from "~/components/qrcode";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { Skeleton } from "~/components/ui/skeleton";
import { useCreateMobileSession } from "~/hooks/mutations/mobile-session/use-create-mobile-session";
import { encryptAES } from "~/utils/encryption";
import { api } from "~/utils/trpc";

interface CustomRTCPeerConnection extends RTCPeerConnection {
  dataChannel?: RTCDataChannel;
}

export function CreateMobileSession() {
  const [sessionToken, setSessionToken] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [pc, setPc] = useState<CustomRTCPeerConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [verificationState, setVerificationState] = useState<{
    code?: string;
    secret?: string;
    error?: boolean;
    verified: boolean;
  }>({ verified: false });

  const createOfferMutation = api.edge.webRTC.createOffer.useMutation();
  const postCandidateMutation = api.edge.webRTC.postCandidate.useMutation();
  const createMobileSessionMutation = useCreateMobileSession();
  const apiUtils = api.useUtils();

  // Poll for the answer
  const fetchAnswerQuery = api.edge.webRTC.fetchAnswer.useQuery(
    { sessionToken },
    {
      enabled: !!sessionToken && !isConnected,
      refetchInterval: 3000,
    }
  );

  // Poll for candidates
  const fetchCandidatesQuery = api.edge.webRTC.fetchCandidates.useQuery(
    { sessionToken },
    {
      enabled: !!sessionToken && !isConnected,
      refetchInterval: 3000,
    }
  );

  const handleVerificationCode = async (pin: string) => {
    if (verificationState.code === pin) {
      // Send success message back to mobile
      if (pc && pc.dataChannel) {
        try {
          pc.dataChannel.send(
            serializeWebRTCMessage({
              type: "starting_verification",
            })
          );
          const {
            address,
            allowedMessages,
            key,
            authenticatorId,
            accountOwnerPublicKey,
            publicKey,
          } = await createMobileSessionMutation.mutateAsync();

          // Encrypt the sensitive data using the secret from mobile
          const validatedData = MobileSessionEncryptedDataSchema.parse({
            address,
            allowedMessages,
            key,
            authenticatorId,
            publicKey,
            accountOwnerPublicKey: toBase64(accountOwnerPublicKey),
          });
          const sensitiveData = JSON.stringify(validatedData);

          const encryptedData = await encryptAES(
            sensitiveData,
            verificationState.secret!
          );

          pc.dataChannel.send(
            serializeWebRTCMessage({
              type: "verification_success",
              encryptedData,
              version: 1,
            })
          );
          apiUtils.local.oneClickTrading.getAuthenticators.invalidate();
          setVerificationState((prev) => ({ ...prev, verified: true }));
        } catch (error) {
          pc.dataChannel.send(
            serializeWebRTCMessage({
              type: "verification_failed",
            })
          );
          setVerificationState((prev) => ({ ...prev, error: true }));
          setTimeout(() => {
            setVerificationState((prev) => ({ ...prev, error: false }));
          }, 2000);
        }
      }
    } else {
      setVerificationState((prev) => ({ ...prev, error: true }));
      setTimeout(() => {
        setVerificationState((prev) => ({ ...prev, error: false }));
      }, 2000);
    }
  };

  /**
   * Helper function to create a peer connection, generate a new offer,
   * and post it to the server.
   */
  const generateOffer = useCallback(async () => {
    // Generate new session token
    const token = uuidv4();
    setSessionToken(token);

    // Create new PeerConnection
    const peer = new RTCPeerConnection({
      iceServers: [STUN_SERVER],
    }) as CustomRTCPeerConnection;

    // Create data channel if you want
    const dc = peer.createDataChannel("keyTransferChannel");
    peer.dataChannel = dc;
    dc.onopen = () => {
      console.log("[Desktop] Data channel open, can send data now.");
    };
    dc.onclose = () => {
      console.log("[Desktop] Data channel closed.");
    };
    dc.onmessage = async (e) => {
      console.log("[Desktop] Received from phone:", e.data);
      try {
        const data = await deserializeWebRTCMessage(e.data);
        if (data.type === "verification") {
          setVerificationState({
            code: data.code,
            secret: data.secret,
            verified: false,
            error: false,
          });
        }
      } catch (err) {
        console.error("Failed to parse message:", err);
      }
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

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "connected") {
        console.log("[Desktop] Connection established.");
        setIsConnected(true);
      } else if (peer.connectionState === "disconnected") {
        console.log("[Desktop] Connection lost.");
        setIsConnected(false);
        setPc(null);
        setSessionToken("");
        setIsReady(false);
        setVerificationState({ verified: false });
        generateOffer().catch((err) => {
          console.error("Failed to generate initial offer:", err);
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
    if (candidateList && pc && fetchAnswerQuery.data?.answerSDP) {
      candidateList.forEach(async (c) => {
        try {
          const candidate = new RTCIceCandidate(c);
          await pc.addIceCandidate(candidate);
        } catch (e) {
          console.error("Failed to add ICE candidate:", e);
        }
      });
    }
  }, [fetchAnswerQuery.data?.answerSDP, fetchCandidatesQuery.data, pc]);

  /**
   * Set a timer to regenerate the offer if still no answer after 5 minutes
   */
  useEffect(() => {
    // Skip timer if connected or no session token
    if (!sessionToken || isConnected) return;

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
  }, [sessionToken, fetchAnswerQuery.data, pc, generateOffer, isConnected]);

  return (
    <div className="flex flex-col items-center gap-4">
      {!isReady && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-osmoverse-100">
            Generating QR Code...
          </p>
          <Skeleton className="w-[240px] h-[240px] rounded-lg" />
        </div>
      )}
      {isReady && !isConnected && (
        <div className="flex flex-col items-center gap-3">
          <p className="text-center text-osmoverse-100">
            Download the Osmosis app on your mobile device,
            <br />
            and scan this QR Code.
          </p>
          <div className="bg-white-full w-fit rounded-lg p-2">
            <QRCode value={qrValue} size={240} />
          </div>
        </div>
      )}
      {isConnected &&
        !verificationState.verified &&
        !createMobileSessionMutation.isLoading && (
          <div className="flex flex-col items-center gap-4">
            <p>Enter the 6-digit code shown on your mobile device:</p>
            <InputPin onComplete={handleVerificationCode} />
            {verificationState.error && (
              <p className="text-missionError">
                Invalid code. Please try again.
              </p>
            )}
          </div>
        )}
      {createMobileSessionMutation.isLoading && (
        <p className="text-success">Signing mobile creation transaction...</p>
      )}
      {verificationState.verified && (
        <p className="text-success">
          Connected and verified with mobile device!
        </p>
      )}
    </div>
  );
}

const InputPin = ({ onComplete }: { onComplete: (pin: string) => void }) => {
  const [pin, setPin] = useState("");
  return (
    <InputOTP
      maxLength={6}
      autoFocus
      value={pin}
      onChange={(value) => {
        setPin(value);
        if (value.length === 6) {
          onComplete(value);
        }
      }}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
};
