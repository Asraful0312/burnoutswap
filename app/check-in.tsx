import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { Pedometer } from "expo-sensors";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppBackground, CozyCard, TinyPill } from "@/components/recharge-ui";
import { CHALLENGES } from "@/constants/challenges";
import { palette } from "@/constants/recharge-theme";
import type { ChallengeCompletion } from "@/store/challengeStore";
import { useChallengeStore } from "@/store/challengeStore";
import { usePetStore } from "@/store/petStore";
import { getTodayString, useUserStore } from "@/store/userStore";

const MOODS = [
  { label: "Flat", emoji: "😶" },
  { label: "Foggy", emoji: "😔" },
  { label: "Tender", emoji: "😐" },
  { label: "Steadier", emoji: "🙂" },
  { label: "Proud", emoji: "😊" },
];

function useCountdown(totalSeconds: number, startDone: boolean) {
  const [remaining, setRemaining] = useState(startDone ? 0 : totalSeconds);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(startDone);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => setRunning(false), []);
  const skip = useCallback(() => {
    setRunning(false);
    setDone(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const displayRemaining = done ? 0 : remaining;
  const mm = String(Math.floor(displayRemaining / 60)).padStart(2, "0");
  const ss = String(displayRemaining % 60).padStart(2, "0");
  const progress = done ? 1 : 1 - remaining / totalSeconds;

  return { mm, ss, progress, running, done, start, pause, skip };
}

function TimerProof({
  durationSeconds,
  startDone,
  onDone,
}: {
  durationSeconds: number;
  startDone: boolean;
  onDone: () => void;
}) {
  const { mm, ss, progress, running, done, start, pause, skip } = useCountdown(
    durationSeconds,
    startDone,
  );

  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);

  return (
    <CozyCard style={styles.timerCard}>
      <Text style={styles.sectionTitle}>Timer</Text>
      <View style={styles.timerRingOuter}>
        <View
          style={[
            styles.timerRingFill,
            {
              transform: [{ rotate: `${progress * 360}deg` }],
              opacity: progress > 0 ? 1 : 0,
            },
          ]}
        />
        <View style={styles.timerCenter}>
          <Text style={styles.timerDigits}>
            {mm}:{ss}
          </Text>
          <Text style={styles.timerLabel}>
            {done ? "Done!" : running ? "running" : "paused"}
          </Text>
        </View>
      </View>
      <View style={styles.timerTrack}>
        <View style={[styles.timerFill, { width: `${progress * 100}%` }]} />
      </View>
      {!done ? (
        <View style={styles.timerButtons}>
          {!running ? (
            <Pressable style={styles.timerBtn} onPress={start}>
              <MaterialIcons
                color={palette.paper}
                name="play-arrow"
                size={22}
              />
              <Text style={styles.timerBtnText}>
                {progress === 0 ? "Start" : "Resume"}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.timerBtn, styles.timerBtnPause]}
              onPress={pause}
            >
              <MaterialIcons color={palette.ink} name="pause" size={22} />
              <Text style={[styles.timerBtnText, styles.timerBtnTextPause]}>
                Pause
              </Text>
            </Pressable>
          )}
          <Pressable style={styles.timerSkip} onPress={skip}>
            <Text style={styles.timerSkipText}>Skip timer</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.timerDoneBadge}>
          <MaterialIcons color={palette.paper} name="check" size={18} />
          <Text style={styles.timerDoneText}>Timer complete</Text>
        </View>
      )}
    </CozyCard>
  );
}

// ─── Camera ───────────────────────────────────────────────────────────────────

async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Camera permission needed",
      "Allow camera access in Settings to take proof photos.",
    );
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: false,
  });
  return result.canceled ? null : result.assets[0].uri;
}

function PhotoProof({
  isBeforeAfter,
  defaultBeforeUri,
  defaultAfterUri,
  onPhotosReady,
}: {
  isBeforeAfter: boolean;
  defaultBeforeUri: string | undefined;
  defaultAfterUri: string | undefined;
  onPhotosReady: (beforeUri: string, afterUri?: string) => void;
}) {
  const [beforeUri, setBeforeUri] = useState<string | undefined>(
    defaultBeforeUri,
  );
  const [afterUri, setAfterUri] = useState<string | undefined>(defaultAfterUri);

  async function handleBefore() {
    const uri = await takePhoto();
    if (!uri) return;
    setBeforeUri(uri);
    if (!isBeforeAfter) onPhotosReady(uri);
    else if (afterUri) onPhotosReady(uri, afterUri);
  }

  async function handleAfter() {
    if (!beforeUri) return;
    const uri = await takePhoto();
    if (!uri) return;
    setAfterUri(uri);
    onPhotosReady(beforeUri, uri);
  }

  const isReady = isBeforeAfter ? !!beforeUri && !!afterUri : !!beforeUri;

  return (
    <CozyCard style={styles.photoCard}>
      <Text style={styles.sectionTitle}>
        {isBeforeAfter ? "Before + after photos" : "Photo proof"}
      </Text>
      <View style={styles.photoRow}>
        <Pressable style={styles.photoSlot} onPress={handleBefore}>
          {beforeUri ? (
            <Image source={{ uri: beforeUri }} style={styles.photoThumb} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons
                color={palette.inkSoft}
                name="photo-camera"
                size={28}
              />
              <Text style={styles.photoSlotLabel}>
                {isBeforeAfter ? "Before" : "Take photo"}
              </Text>
            </View>
          )}
        </Pressable>
        {isBeforeAfter && (
          <Pressable
            style={[styles.photoSlot, !beforeUri && styles.photoSlotDisabled]}
            onPress={beforeUri ? handleAfter : undefined}
          >
            {afterUri ? (
              <Image source={{ uri: afterUri }} style={styles.photoThumb} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons
                  color={beforeUri ? palette.inkSoft : palette.line}
                  name="photo-camera"
                  size={28}
                />
                <Text
                  style={[
                    styles.photoSlotLabel,
                    !beforeUri && styles.photoSlotLabelDisabled,
                  ]}
                >
                  After
                </Text>
              </View>
            )}
          </Pressable>
        )}
      </View>
      {isReady && (
        <View style={styles.photoDoneBadge}>
          <MaterialIcons color={palette.paper} name="check" size={16} />
          <Text style={styles.photoDoneText}>
            {isBeforeAfter ? "Both photos captured" : "Photo captured"}
          </Text>
        </View>
      )}
      <Text style={styles.photoHint}>
        Photos are stored on your device only.
      </Text>
    </CozyCard>
  );
}

// ─── Audio proof ──────────────────────────────────────────────────────────────

/** Minimum recording duration (seconds) to count as valid proof */
const MIN_AUDIO_SECONDS = 5;

function AudioProof({ onDone }: { onDone: (uri: string) => void }) {
  const [phase, setPhase] = useState<"idle" | "recording" | "done">("idle");
  const [elapsed, setElapsed] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Microphone permission needed",
          "Allow microphone access in Settings to record audio proof.",
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
      );
      recordingRef.current = recording;
      setPhase("recording");
      setElapsed(0);
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      Alert.alert("Could not start recording", "Please try again.");
    }
  }

  async function stopRecording() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let uri = "";
    try {
      await recordingRef.current?.stopAndUnloadAsync();
      uri = recordingRef.current?.getURI() ?? "";
    } catch {
      /* already stopped */
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    recordingRef.current = null;
    setPhase("done");
    onDone(uri);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, []);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const isLongEnough = elapsed >= MIN_AUDIO_SECONDS;

  return (
    <CozyCard style={styles.audioCard}>
      <Text style={styles.sectionTitle}>🎙️ Audio proof</Text>
      <Text style={styles.sectionHint}>
        Hum, sing, or say anything for a few seconds. Only the duration is
        checked — not the content.
      </Text>

      {phase === "idle" && (
        <Pressable style={styles.audioBtn} onPress={startRecording}>
          <MaterialIcons color={palette.paper} name="mic" size={24} />
          <Text style={styles.audioBtnText}>Start recording</Text>
        </Pressable>
      )}

      {phase === "recording" && (
        <View style={styles.audioRecording}>
          <View style={styles.audioLiveRow}>
            <View style={styles.audioLiveDot} />
            <Text style={styles.audioTimer}>
              {mm}:{ss}
            </Text>
          </View>
          <Pressable
            style={[
              styles.audioBtn,
              styles.audioBtnStop,
              !isLongEnough && styles.audioBtnDisabled,
            ]}
            onPress={isLongEnough ? stopRecording : undefined}
          >
            <MaterialIcons color={palette.paper} name="stop" size={24} />
            <Text style={styles.audioBtnText}>
              {isLongEnough
                ? "Stop & save"
                : `Keep going… (${MIN_AUDIO_SECONDS - elapsed}s)`}
            </Text>
          </Pressable>
        </View>
      )}

      {phase === "done" && (
        <View style={styles.audioDoneBadge}>
          <MaterialIcons color={palette.paper} name="check" size={18} />
          <Text style={styles.audioDoneText}>
            Recording saved · {mm}:{ss}
          </Text>
        </View>
      )}
    </CozyCard>
  );
}

// ─── Pedometer proof ──────────────────────────────────────────────────────────

const STEP_GOAL = 400;

function PedometerProof({ onDone }: { onDone: () => void }) {
  const isExpoGo = Constants.appOwnership === "expo";
  const [available, setAvailable] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [steps, setSteps] = useState(0);
  const [tracking, setTracking] = useState(false);
  const [done, setDone] = useState(false);
  const subRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(
    null,
  );

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setAvailable);
    return () => {
      subRef.current?.remove();
    };
  }, []);

  async function startTracking() {
    const { granted, canAskAgain } = await Pedometer.requestPermissionsAsync();
    if (!granted) {
      setPermissionDenied(true);
      if (!canAskAgain) {
        // Permission permanently denied — must go to Settings
        Alert.alert(
          "Motion permission blocked",
          "Recharge needs motion & fitness access to count your steps. Open Settings to allow it.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
      } else {
        Alert.alert(
          "Motion permission needed",
          "Allow motion & fitness access so Recharge can count your steps.",
          [
            { text: "Not now", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ],
        );
      }
      return;
    }
    setPermissionDenied(false);
    subRef.current = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
    });
    setTracking(true);
  }

  function stopTracking() {
    subRef.current?.remove();
    subRef.current = null;
    setTracking(false);
    setDone(true);
    onDone();
  }

  // Auto-complete when goal reached
  useEffect(() => {
    if (tracking && steps >= STEP_GOAL && !done) stopTracking();
  }, [steps, tracking, done]);

  const progress = Math.min(steps / STEP_GOAL, 1);

  if (isExpoGo) {
    return (
      <CozyCard style={styles.audioCard}>
        <Text style={styles.sectionTitle}>👟 Step count</Text>
        <Text style={styles.sectionHint}>
          Step counting isn't available in Expo Go — Android requires the
          Physical Activity permission to be declared in the app manifest, and
          Expo Go doesn't include it.
        </Text>
        <Text style={[styles.sectionHint, { marginTop: 8 }]}>
          This works normally in a production or development build. For now, tap
          "Mark as done" below to log your proof.
        </Text>
      </CozyCard>
    );
  }

  if (available === false) {
    return (
      <CozyCard style={styles.audioCard}>
        <Text style={styles.sectionTitle}>👟 Step count</Text>
        <Text style={styles.sectionHint}>
          Step counting isn't available on this device. Tap "Mark as done" to
          count your proof.
        </Text>
      </CozyCard>
    );
  }

  return (
    <CozyCard style={styles.audioCard}>
      <Text style={styles.sectionTitle}>👟 Step count</Text>
      <Text style={styles.sectionHint}>
        Goal: {STEP_GOAL} steps. Walk at whatever pace feels right.
      </Text>

      {permissionDenied && !tracking && !done && (
        <View style={styles.permissionBanner}>
          <MaterialIcons color={palette.ember} name="lock-outline" size={18} />
          <Text style={styles.permissionText}>
            Motion access is needed to count steps.
          </Text>
          <Pressable
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>Open Settings</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.stepCountWrap}>
        <Text style={styles.stepCount}>{steps}</Text>
        <Text style={styles.stepGoal}>/ {STEP_GOAL} steps</Text>
      </View>

      <View style={styles.stepTrack}>
        <View style={[styles.stepFill, { width: `${progress * 100}%` }]} />
      </View>

      {!done ? (
        <View style={styles.stepButtons}>
          {!tracking ? (
            <Pressable style={styles.audioBtn} onPress={startTracking}>
              <MaterialIcons
                color={palette.paper}
                name="directions-walk"
                size={22}
              />
              <Text style={styles.audioBtnText}>Start counting</Text>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.audioBtn, styles.audioBtnStop]}
              onPress={stopTracking}
            >
              <MaterialIcons color={palette.paper} name="stop" size={22} />
              <Text style={styles.audioBtnText}>Stop early</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.audioDoneBadge}>
          <MaterialIcons color={palette.paper} name="check" size={18} />
          <Text style={styles.audioDoneText}>
            {steps >= STEP_GOAL
              ? `${steps} steps — goal reached!`
              : `${steps} steps — that counts.`}
          </Text>
        </View>
      )}
    </CozyCard>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const { challengeId } = useLocalSearchParams<{ challengeId: string }>();
  const challenge = CHALLENGES.find((c) => c.id === challengeId);

  // ── Restore saved in-progress state synchronously on mount ──────────────
  // getState() is synchronous; the store is hydrated by the time the user
  // navigates here (Today → Challenge → Check-in).
  const saved = challengeId
    ? useChallengeStore.getState().inProgress[challengeId]
    : undefined;

  const [moodBefore, setMoodBeforeState] = useState<number | null>(
    saved?.moodBefore ?? null,
  );
  const [moodAfter, setMoodAfterState] = useState<number | null>(
    saved?.moodAfter ?? null,
  );
  const [proofUri, setProofUriState] = useState<string | undefined>(
    saved?.proofUri,
  );
  const [photoAfterUri, setPhotoAfterUriState] = useState<string | undefined>(
    saved?.photoAfterUri,
  );
  const [timerDone, setTimerDoneState] = useState(
    saved?.timerCompleted ?? false,
  );
  const [audioReady, setAudioReady] = useState(false);
  const [stepsReady, setStepsReady] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyRejected, setVerifyRejected] = useState<string | null>(null);

  // ── Auto-save helpers — each one updates local state AND persists ────────
  function setMoodBefore(i: number) {
    setMoodBeforeState(i);
    if (challengeId)
      useChallengeStore
        .getState()
        .updateInProgress(challengeId, { moodBefore: i });
  }

  function setMoodAfter(i: number) {
    setMoodAfterState(i);
    if (challengeId)
      useChallengeStore
        .getState()
        .updateInProgress(challengeId, { moodAfter: i });
  }

  const handleTimerDone = useCallback(() => {
    setTimerDoneState(true);
    if (challengeId)
      useChallengeStore
        .getState()
        .updateInProgress(challengeId, { timerCompleted: true });
  }, [challengeId]);

  const handlePhotosReady = useCallback(
    (beforeUri: string, afterUri?: string) => {
      setProofUriState(beforeUri);
      setPhotoAfterUriState(afterUri);
      if (challengeId) {
        useChallengeStore.getState().updateInProgress(challengeId, {
          proofUri: beforeUri,
          photoAfterUri: afterUri,
        });
      }
    },
    [challengeId],
  );

  const handleAudioDone = useCallback(
    (uri: string) => {
      setAudioReady(true);
      if (uri) setProofUriState(uri);
      if (challengeId)
        useChallengeStore.getState().updateInProgress(challengeId, {
          timerCompleted: true,
          proofUri: uri || undefined,
        });
    },
    [challengeId],
  );

  const handleStepsDone = useCallback(() => {
    setStepsReady(true);
    if (challengeId)
      useChallengeStore
        .getState()
        .updateInProgress(challengeId, { timerCompleted: true });
  }, [challengeId]);

  // ── Store actions ────────────────────────────────────────────────────────
  const completeChallenge = useChallengeStore((s) => s.completeChallenge);
  const recordCompletion = useUserStore((s) => s.recordCompletion);
  const awardPetals = usePetStore((s) => s.awardPetals);

  if (!challenge) {
    return (
      <AppBackground>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Challenge not found.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backLink}>Go back</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  const isTimerProof = challenge.proofType === "timer";
  const isPhotoProof =
    challenge.proofType === "photo" ||
    challenge.proofType === "photo_before_after";
  const isAudioProof = challenge.proofType === "audio";
  const isStepsProof = challenge.proofType === "steps";

  const proofReady =
    (isTimerProof && timerDone) ||
    (challenge.proofType === "photo" && !!proofUri) ||
    (challenge.proofType === "photo_before_after" &&
      !!proofUri &&
      !!photoAfterUri) ||
    (isAudioProof && audioReady) ||
    (isStepsProof && stepsReady) ||
    (!isTimerProof && !isPhotoProof && !isAudioProof && !isStepsProof);

  const canSubmit = moodBefore !== null && moodAfter !== null && proofReady;

  const durationSeconds = (() => {
    const match = challenge.duration.match(/(\d+)/);
    return match ? parseInt(match[1], 10) * 60 : 5 * 60;
  })();

  function commitCompletion() {
    if (!challenge) return;
    const completion: ChallengeCompletion = {
      challengeId: challenge.id,
      date: getTodayString(),
      proofUri,
      moodBefore: moodBefore!,
      moodAfter: moodAfter!,
      petalsEarned: challenge.petals,
    };
    completeChallenge(completion);
    useChallengeStore.getState().clearInProgress(challenge.id);
    recordCompletion(challenge.petals);
    awardPetals(challenge.petals);
    setSubmitted(true);
  }

  async function handleComplete() {
    if (!canSubmit || !challenge) return;

    const needsAI =
      (challenge.proofType === "photo" ||
        challenge.proofType === "photo_before_after" ||
        challenge.proofType === "audio") &&
      (proofUri || audioReady);

    if (!needsAI) {
      commitCompletion();
      return;
    }

    setVerifying(true);
    setVerifyRejected(null);

    try {
      const siteUrl = process.env.EXPO_PUBLIC_CONVEX_SITE_URL;
      if (!siteUrl) {
        console.warn(
          "[verify] EXPO_PUBLIC_CONVEX_SITE_URL is not set — skipping AI check",
        );
        commitCompletion();
        return;
      }
      const endpoint = `${siteUrl}/verify-proof`;

      let base64 = "";
      let mimeType = "image/jpeg";

      if (challenge.proofType === "audio") {
        // expo-av records as .m4a (AAC in MPEG-4 container)
        mimeType = "audio/mp4";
        if (proofUri) {
          base64 = await FileSystem.readAsStringAsync(proofUri, {
            encoding: "base64",
          });
        }
      } else if (proofUri) {
        mimeType = "image/jpeg";
        base64 = await FileSystem.readAsStringAsync(proofUri, {
          encoding: "base64",
        });
      }

      let base64After: string | undefined;
      if (challenge.proofType === "photo_before_after" && photoAfterUri) {
        base64After = await FileSystem.readAsStringAsync(photoAfterUri, {
          encoding: "base64",
        });
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofType: challenge.proofType,
          challengeTitle: challenge.title,
          base64,
          mimeType,
          base64After,
        }),
      });

      const data: { verified: boolean; reason: string } = await res.json();

      console.log("[verify] AI response:", data);

      if (data.verified) {
        commitCompletion();
      } else {
        setVerifyRejected(
          data.reason ?? "Proof didn't seem to match the challenge.",
        );
      }
    } catch (err) {
      console.error("[verify] fetch failed:", err);
      // Don't block the user on network errors
      commitCompletion();
    } finally {
      setVerifying(false);
    }
  }

  if (submitted) {
    return (
      <AppBackground>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>🌱</Text>
          <Text style={styles.successTitle}>Proof logged.</Text>
          <Text style={styles.successBody}>
            +{challenge.petals} petals · energy updated · streak alive.
          </Text>
          {moodAfter !== null &&
            moodBefore !== null &&
            moodAfter > moodBefore && (
              <TinyPill
                label={`Mood: ${MOODS[moodBefore].label} → ${MOODS[moodAfter].label}`}
                tone="moss"
              />
            )}
          <Pressable
            style={styles.doneButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.doneButtonText}>Back to today</Text>
          </Pressable>
        </View>
      </AppBackground>
    );
  }

  // Build a summary of what's already saved for the resume banner
  const savedSteps: string[] = [];
  if (moodBefore !== null) savedSteps.push(`Mood: ${MOODS[moodBefore].label}`);
  if (proofUri) savedSteps.push("Photo saved");
  if (timerDone) savedSteps.push("Timer done");

  return (
    <AppBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <MaterialIcons color={palette.ember} name="arrow-back" size={18} />
          <Text style={styles.backLink}>Back to challenge</Text>
        </Pressable>

        {/* Resume banner — shown when returning to a started session */}
        {savedSteps.length > 0 && (
          <View style={styles.resumeBanner}>
            <MaterialIcons color={palette.ember} name="restore" size={16} />
            <Text style={styles.resumeText}>
              Resumed · {savedSteps.join(" · ")}
            </Text>
          </View>
        )}

        <CozyCard style={styles.topCard}>
          <TinyPill label="Proof studio" tone="rose" />
          <Text style={styles.title}>
            Log the win while it still feels real.
          </Text>
          <View style={styles.challengeBadge}>
            <Text style={styles.challengeBadgeText}>{challenge.title}</Text>
            <Text style={styles.petalsText}>+{challenge.petals} petals</Text>
          </View>
        </CozyCard>

        {/* Mood before */}
        <CozyCard>
          <Text style={styles.sectionTitle}>How do you feel right now?</Text>
          <Text style={styles.sectionHint}>Before starting</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, i) => (
              <Pressable
                key={mood.label}
                style={[
                  styles.moodChip,
                  moodBefore === i && styles.moodChipActive,
                ]}
                onPress={() => setMoodBefore(i)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodText,
                    moodBefore === i && styles.moodTextActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </CozyCard>

        {/* Proof capture */}
        {isTimerProof && (
          <TimerProof
            durationSeconds={durationSeconds}
            startDone={timerDone}
            onDone={handleTimerDone}
          />
        )}
        {isPhotoProof && (
          <PhotoProof
            isBeforeAfter={challenge.proofType === "photo_before_after"}
            defaultBeforeUri={proofUri}
            defaultAfterUri={photoAfterUri}
            onPhotosReady={handlePhotosReady}
          />
        )}
        {isAudioProof && <AudioProof onDone={handleAudioDone} />}
        {isStepsProof && <PedometerProof onDone={handleStepsDone} />}

        {/* Mood after */}
        <CozyCard>
          <Text style={styles.sectionTitle}>How do you feel after?</Text>
          <Text style={styles.sectionHint}>Even a tiny shift counts</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, i) => (
              <Pressable
                key={mood.label}
                style={[
                  styles.moodChip,
                  moodAfter === i && styles.moodChipActive,
                ]}
                onPress={() => setMoodAfter(i)}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text
                  style={[
                    styles.moodText,
                    moodAfter === i && styles.moodTextActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </CozyCard>

        {verifyRejected && (
          <View style={styles.rejectBanner}>
            <MaterialIcons
              color={palette.ember}
              name="warning-amber"
              size={18}
            />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={styles.rejectTitle}>
                Hmm, we're not sure that counts
              </Text>
              <Text style={styles.rejectReason}>{verifyRejected}</Text>
              <Pressable
                style={styles.submitAnywayBtn}
                onPress={commitCompletion}
              >
                <Text style={styles.submitAnywayText}>Submit anyway</Text>
              </Pressable>
            </View>
          </View>
        )}

        <Pressable
          style={[
            styles.completeButton,
            (!canSubmit || verifying) && styles.completeButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={verifying}
        >
          <Text style={styles.completeButtonText}>
            {verifying
              ? "Verifying proof…"
              : moodBefore === null
                ? "Rate your mood to continue"
                : isTimerProof && !timerDone
                  ? "Start the timer first"
                  : isPhotoProof && !proofReady
                    ? "Take your photo first"
                    : isAudioProof && !audioReady
                      ? "Record audio first"
                      : isStepsProof && !stepsReady
                        ? "Start counting steps"
                        : "Mark as done"}
          </Text>
        </Pressable>
      </ScrollView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 70, paddingBottom: 40, gap: 18 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  backLink: { color: palette.ember, fontSize: 14, fontWeight: "700" },
  resumeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.wheat,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resumeText: { color: palette.ink, fontSize: 13, fontWeight: "600", flex: 1 },
  topCard: { backgroundColor: palette.blush, gap: 12 },
  title: {
    color: palette.ink,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "700",
  },
  challengeBadge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.paper,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  challengeBadgeText: { color: palette.ink, fontSize: 15, fontWeight: "700" },
  petalsText: { color: palette.ember, fontSize: 14, fontWeight: "700" },
  sectionTitle: {
    color: palette.ink,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 2,
  },
  sectionHint: { color: palette.inkSoft, fontSize: 13, marginBottom: 12 },
  moodRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodChip: {
    alignItems: "center",
    gap: 4,
    borderRadius: 16,
    backgroundColor: palette.paperShade,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 60,
  },
  moodChipActive: { backgroundColor: palette.ember },
  moodEmoji: { fontSize: 18 },
  moodText: { color: palette.ink, fontSize: 12, fontWeight: "700" },
  moodTextActive: { color: palette.paper },
  // Timer
  timerCard: { backgroundColor: palette.mist, gap: 16, alignItems: "center" },
  timerRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: palette.paperShade,
    alignItems: "center",
    justifyContent: "center",
  },
  timerRingFill: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: palette.ember,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  timerCenter: { alignItems: "center", gap: 2 },
  timerDigits: {
    color: palette.ink,
    fontSize: 32,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timerLabel: { color: palette.inkSoft, fontSize: 12, fontWeight: "600" },
  timerTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    overflow: "hidden",
  },
  timerFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.ember,
  },
  timerButtons: { flexDirection: "row", gap: 10, alignItems: "center" },
  timerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.ink,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  timerBtnPause: {
    backgroundColor: palette.paper,
    borderWidth: 1,
    borderColor: palette.line,
  },
  timerBtnText: { color: palette.paper, fontSize: 15, fontWeight: "700" },
  timerBtnTextPause: { color: palette.ink },
  timerSkip: { paddingVertical: 12, paddingHorizontal: 12 },
  timerSkipText: { color: palette.inkSoft, fontSize: 14, fontWeight: "600" },
  timerDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.moss,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  timerDoneText: { color: palette.paper, fontSize: 14, fontWeight: "700" },
  // Photo
  photoCard: { gap: 14 },
  photoRow: { flexDirection: "row", gap: 12 },
  photoSlot: {
    flex: 1,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: palette.paperShade,
    borderWidth: 2,
    borderColor: palette.line,
    borderStyle: "dashed",
  },
  photoSlotDisabled: { opacity: 0.4 },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoSlotLabel: { color: palette.inkSoft, fontSize: 13, fontWeight: "600" },
  photoSlotLabelDisabled: { color: palette.line },
  photoThumb: { width: "100%", height: "100%", resizeMode: "cover" },
  photoDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.moss,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
  },
  photoDoneText: { color: palette.paper, fontSize: 13, fontWeight: "700" },
  photoHint: { color: palette.inkSoft, fontSize: 13, lineHeight: 18 },
  // Passive
  passiveCard: { backgroundColor: palette.mist, gap: 10 },
  passiveBody: { color: palette.inkSoft, fontSize: 15, lineHeight: 22 },
  // Audio
  audioCard: { backgroundColor: palette.mist, gap: 14 },
  audioBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.ink,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignSelf: "flex-start",
  },
  audioBtnStop: { backgroundColor: palette.ember },
  audioBtnDisabled: { backgroundColor: palette.inkSoft },
  audioBtnText: { color: palette.paper, fontSize: 15, fontWeight: "700" },
  audioRecording: { gap: 12 },
  audioLiveRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  audioLiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.ember,
  },
  audioTimer: {
    color: palette.ink,
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  audioDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: palette.moss,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: "flex-start",
  },
  audioDoneText: { color: palette.paper, fontSize: 14, fontWeight: "700" },
  // Steps
  stepCountWrap: { alignItems: "center", paddingVertical: 8 },
  stepCount: {
    color: palette.ink,
    fontSize: 48,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  stepGoal: { color: palette.inkSoft, fontSize: 15, marginTop: 2 },
  stepTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: palette.paperShade,
    overflow: "hidden",
  },
  stepFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: palette.ember,
  },
  stepButtons: { alignItems: "flex-start" },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.blush,
    borderRadius: 14,
    padding: 12,
    flexWrap: "wrap",
  },
  permissionText: {
    flex: 1,
    color: palette.ink,
    fontSize: 13,
    lineHeight: 18,
  },
  permissionButton: {
    backgroundColor: palette.ember,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  permissionButtonText: {
    color: palette.paper,
    fontSize: 13,
    fontWeight: "700",
  },
  // Submit
  completeButton: {
    borderRadius: 22,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    alignItems: "center",
  },
  completeButtonDisabled: { backgroundColor: palette.inkSoft },
  completeButtonText: { color: palette.paper, fontSize: 16, fontWeight: "700" },
  // Success
  successWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  successEmoji: { fontSize: 64 },
  successTitle: { color: palette.ink, fontSize: 34, fontWeight: "700" },
  successBody: {
    color: palette.inkSoft,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  doneButton: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  doneButtonText: { color: palette.paper, fontSize: 16, fontWeight: "700" },
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: { color: palette.ink, fontSize: 18 },
  rejectBanner: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: palette.wheat,
    borderRadius: 18,
    padding: 16,
    alignItems: "flex-start",
  },
  rejectTitle: {
    color: palette.ink,
    fontSize: 15,
    fontWeight: "700",
  },
  rejectReason: {
    color: palette.inkSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  submitAnywayBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: palette.ember,
    marginTop: 2,
  },
  submitAnywayText: {
    color: palette.paper,
    fontSize: 13,
    fontWeight: "700",
  },
});
