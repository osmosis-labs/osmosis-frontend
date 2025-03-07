import { toBase64 } from "@cosmjs/encoding";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Dec } from "@osmosis-labs/unit";
import {
  deserializeWebRTCMessage,
  MobileSessionEncryptedDataSchema,
  serializeWebRTCMessage,
  STUN_SERVER,
} from "@osmosis-labs/utils";
import { isNumeric } from "@osmosis-labs/utils";
import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { InputBox } from "~/components/input";
import { QRCode } from "~/components/qrcode";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { Skeleton } from "~/components/ui/skeleton";
import { useCreateMobileSession } from "~/hooks/mutations/mobile-session/use-create-mobile-session";
import { useStore } from "~/stores";
import { encryptAES } from "~/utils/encryption";
import { addCommasToNumber, removeCommasFromNumber } from "~/utils/number";
import { api } from "~/utils/trpc";

interface CustomRTCPeerConnection extends RTCPeerConnection {
  dataChannel?: RTCDataChannel;
}

export function CreateMobileSession() {
  const [sessionToken, setSessionToken] = useState<string>("");
  const [qrValue, setQrValue] = useState<string>("");
  const [pc, setPc] = useState<CustomRTCPeerConnection | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lossProtectionAmount, setLossProtectionAmount] = useState("0");
  const [verificationState, setVerificationState] = useState<{
    code: string | null;
    secret: string | null;
    deviceBrand: string | null;
    deviceModel: string | null;
    error: boolean;
    verified: boolean;
  }>({
    code: null,
    secret: null,
    deviceBrand: null,
    deviceModel: null,
    error: false,
    verified: false,
  });

  const { accountStore, chainStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const { data: userAssetsTotal, isLoading: isLoadingUserAssetsTotal } =
    api.edge.assets.getUserAssetsTotal.useQuery(
      {
        userOsmoAddress: account?.address as string,
      },
      {
        enabled: Boolean(account) && Boolean(account?.address),
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const createOfferMutation = api.edge.webRTC.createOffer.useMutation();
  const postCandidateMutation = api.edge.webRTC.postCandidate.useMutation();
  const storeMetadataMutation =
    api.edge.mobileSession.storeMetadata.useMutation();
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
          } = await createMobileSessionMutation.mutateAsync({
            allowedAmount:
              lossProtectionAmount !== "" ? lossProtectionAmount : "0",
          });

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

          // Store session metadata if we have device type
          if (verificationState.deviceBrand && verificationState.deviceModel) {
            try {
              await storeMetadataMutation.mutateAsync({
                accountAddress: address,
                authenticatorId,
                deviceBrand: verificationState.deviceBrand,
                deviceModel: verificationState.deviceModel,
              });
            } catch (error) {
              console.error("Failed to store session metadata:", error);
            }
          }

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
            deviceBrand: data.deviceBrand || null,
            deviceModel: data.deviceModel || null,
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
        setVerificationState({
          code: null,
          secret: null,
          deviceBrand: null,
          deviceModel: null,
          error: false,
          verified: false,
        });
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

  const handleShareOfBalanceClick = (percentage: number) => {
    if (!userAssetsTotal) return;

    const amount = userAssetsTotal.value
      .mul(new Dec(percentage).quo(new Dec(100)))
      .toString();

    setLossProtectionAmount(amount.split(" ")[0].replace("$", ""));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {!isReady && (
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg w-full">
          <p className="text-center text-osmoverse-100 font-medium">
            Generating QR Code...
          </p>
          <Skeleton className="w-[240px] h-[240px] rounded-lg" />
        </div>
      )}
      {isReady && !isConnected && (
        <div className="flex flex-col items-center gap-5 w-full">
          <div className="rounded-lg w-full">
            <p className="text-center text-osmoverse-100 mb-4 leading-relaxed">
              Download the Osmosis app on your mobile device
              <br />
              and scan this QR Code to connect.
            </p>
            <div className="bg-white-full w-fit rounded-lg p-3 mx-auto shadow-lg">
              <QRCode value={qrValue} size={240} />
            </div>
          </div>

          <div className="text-sm text-osmoverse-300 max-w-xs text-center">
            Scanning this QR code will establish a secure connection between
            your mobile device and this browser.
          </div>

          <Disclosure>
            {({ open }) => (
              <div className="w-full max-w-md">
                <DisclosureButton className="flex w-full justify-between rounded-lg bg-osmoverse-800 px-4 py-2 text-left text-sm font-medium text-osmoverse-100 hover:bg-osmoverse-700 focus:outline-none focus-visible:ring focus-visible:ring-wosmongton-500 focus-visible:ring-opacity-75">
                  <span>Loss Protection Settings</span>
                  <svg
                    className={`${
                      open ? "rotate-180 transform" : ""
                    } h-5 w-5 text-osmoverse-300`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </DisclosureButton>
                <DisclosurePanel className="px-4 pt-4 pb-2 text-sm text-osmoverse-300">
                  <div className="flex flex-col gap-4">
                    <p className="text-osmoverse-200">
                      Set a maximum amount that can be lost in a transaction.
                      This helps protect your assets from significant losses.
                    </p>
                    <div className="flex flex-col gap-2">
                      <label className="text-osmoverse-100 font-medium">
                        Maximum Loss Amount (USD)
                      </label>
                      <InputBox
                        rightEntry
                        currentValue={`$${addCommasToNumber(
                          lossProtectionAmount
                        )}`}
                        onInput={(nextValue) => {
                          const parsedValue = removeCommasFromNumber(
                            nextValue
                          ).replace("$", "");
                          if (!isNumeric(parsedValue) && parsedValue !== "")
                            return;
                          setLossProtectionAmount(parsedValue);
                        }}
                        onBlur={() => {
                          if (lossProtectionAmount === "") {
                            setLossProtectionAmount("0");
                          }
                        }}
                        trailingSymbol={
                          <span className="ml-2 text-body1 font-body1 text-osmoverse-300">
                            USD
                          </span>
                        }
                      />

                      <div className="mt-2">
                        <p className="mb-2 text-osmoverse-200">
                          Share of balance:
                        </p>
                        <ul className="flex w-full gap-x-2">
                          {[5, 10, 20].map((percentage) => (
                            <li
                              key={percentage}
                              className={classNames(
                                "flex h-8 w-full cursor-pointer items-center justify-center rounded-lg bg-osmoverse-700 hover:bg-osmoverse-600",
                                {
                                  "border-2 border-wosmongton-200":
                                    userAssetsTotal &&
                                    lossProtectionAmount ===
                                      userAssetsTotal.value
                                        .mul(
                                          new Dec(percentage).quo(new Dec(100))
                                        )
                                        .toString()
                                        .split(" ")[0]
                                        .replace("$", ""),
                                }
                              )}
                              onClick={() =>
                                handleShareOfBalanceClick(percentage)
                              }
                            >
                              <button>{`${percentage}%`}</button>
                            </li>
                          ))}
                        </ul>

                        {userAssetsTotal && (
                          <p className="mt-2 text-xs text-osmoverse-400">
                            Your total balance:{" "}
                            {userAssetsTotal.value.toString()}
                          </p>
                        )}
                        {isLoadingUserAssetsTotal && (
                          <Skeleton className="mt-2 h-4 w-32" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-osmoverse-400">
                      Setting this to 0 means no loss protection will be
                      applied.
                    </p>
                  </div>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        </div>
      )}
      {isConnected &&
        !verificationState.verified &&
        !createMobileSessionMutation.isLoading && (
          <div className="flex flex-col items-center gap-5 bg-osmoverse-825 p-6 rounded-lg w-full">
            <p className="text-center font-medium">
              Enter the 6-digit code shown on your mobile device:
            </p>
            <InputPin onComplete={handleVerificationCode} />
            {verificationState.error && (
              <p className="text-rust-300 text-sm font-medium">
                Invalid code. Please try again.
              </p>
            )}
          </div>
        )}
      {createMobileSessionMutation.isLoading && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-lg w-full">
          <p className="text-bullish-400 font-medium">
            Signing mobile creation transaction...
          </p>
          <Skeleton className="w-32 h-6 rounded-md" />
        </div>
      )}
      {verificationState.verified && (
        <div className="flex flex-col items-center gap-3 p-6 rounded-lg w-full">
          <div className="bg-bullish-400/20 p-3 rounded-full">
            <svg
              className="h-8 w-8 text-bullish-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-bullish-400 font-medium text-center">
            Mobile wallet successfully created!
          </p>
          <div className="text-sm text-osmoverse-300 text-center">
            <p>You can now use your mobile device to approve transactions.</p>
            {verificationState.deviceBrand && verificationState.deviceModel && (
              <p className="mt-2">
                Device:{" "}
                {`${verificationState.deviceBrand} ${verificationState.deviceModel}`}
              </p>
            )}
          </div>
        </div>
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
      className="gap-2"
    >
      <InputOTPGroup className="gap-2">
        <InputOTPSlot
          index={0}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
        <InputOTPSlot
          index={1}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
        <InputOTPSlot
          index={2}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup className="gap-2">
        <InputOTPSlot
          index={3}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
        <InputOTPSlot
          index={4}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
        <InputOTPSlot
          index={5}
          className="h-12 w-12 rounded-md border-osmoverse-700 bg-osmoverse-900 text-white-full"
        />
      </InputOTPGroup>
    </InputOTP>
  );
};
