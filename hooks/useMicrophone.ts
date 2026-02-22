"use client";
import { useState, useRef, useCallback } from "react";

export type MicPermissionStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "blocked"
  | "not-secure"
  | "unsupported";

interface UseMicrophoneReturn {
  permissionStatus: MicPermissionStatus;
  stream: MediaStream | null;
  errorMessage: string;
  requestMic: () => Promise<MediaStream | null>;
  releaseMic: () => void;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [permissionStatus, setPermissionStatus] =
    useState<MicPermissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const streamRef = useRef<MediaStream | null>(null);

  const releaseMic = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const requestMic = useCallback(async (): Promise<MediaStream | null> => {
    // 1. Check HTTPS (required for getUserMedia on all browsers)
    if (
      typeof window !== "undefined" &&
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost"
    ) {
      setPermissionStatus("not-secure");
      setErrorMessage(
        "마이크 사용을 위해 HTTPS 연결이 필요합니다. 주소가 https://로 시작하는지 확인해 주세요.",
      );
      return null;
    }

    // 2. Check getUserMedia support
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setPermissionStatus("unsupported");
      setErrorMessage(
        "이 브라우저는 마이크를 지원하지 않습니다. Chrome 또는 Safari를 사용해주세요.",
      );
      return null;
    }

    // 3. Optional: Pre-check via permissions API (not supported on all browsers)
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        if (result.state === "denied") {
          setPermissionStatus("blocked");
          setErrorMessage(
            "마이크 권한이 시스템에서 차단되었습니다. 브라우저 설정에서 마이크를 허용해주세요.",
          );
          return null;
        }
      }
    } catch {
      // permissions.query not supported (e.g., Firefox for 'microphone') — skip
    }

    // 4. Request microphone (MUST be within a user gesture on iOS)
    setPermissionStatus("requesting");
    setErrorMessage("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionStatus("granted");

      // 5. Resume AudioContext if suspended (iOS autoplay policy)
      try {
        const testCtx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        if (testCtx.state === "suspended") {
          await testCtx.resume();
        }
        await testCtx.close();
      } catch {
        // AudioContext test failed, non-critical
      }

      return stream;
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setPermissionStatus("denied");
        setErrorMessage(
          "마이크 사용 권한이 거부되었습니다. 브라우저 설정에서 이 사이트의 마이크를 허용해주세요.",
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setPermissionStatus("unsupported");
        setErrorMessage(
          "마이크가 감지되지 않았습니다. 마이크가 연결되어 있는지 확인해주세요.",
        );
      } else if (err.name === "NotReadableError") {
        setPermissionStatus("blocked");
        setErrorMessage(
          "마이크가 다른 앱에서 사용 중이거나, 하드웨어 오류가 발생했습니다.",
        );
      } else {
        setPermissionStatus("blocked");
        setErrorMessage(`마이크 접근 오류: ${err.message || err.name}`);
      }
      return null;
    }
  }, []);

  return {
    permissionStatus,
    stream: streamRef.current,
    errorMessage,
    requestMic,
    releaseMic,
  };
}
