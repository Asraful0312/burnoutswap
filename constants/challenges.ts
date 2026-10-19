import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";

export type BurnoutType = "doomscroll" | "creative_fog" | "social_battery";
export type ProofType =
  | "photo_before_after"
  | "photo"
  | "audio"
  | "timer"
  | "steps";
export type ChallengeCategory =
  | "physical_home"
  | "creative"
  | "nourish"
  | "express"
  | "move"
  | "screen_detox";

export type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

export interface Challenge {
  id: string;
  title: string;
  category: ChallengeCategory;
  duration: string;
  proofType: ProofType;
  description: string;
  steps: string[];
  gentleNote: string;
  petals: number;
  icon: MaterialIconName;
  colorKey: "clay" | "moss" | "gold" | "blush" | "wheat" | "mist";
  burnoutTypes: BurnoutType[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: "desk-reset",
    title: "Desk corner reset",
    category: "physical_home",
    duration: "7 min",
    proofType: "photo_before_after",
    description:
      "A tactile challenge for days when your brain needs visible evidence that something got lighter.",
    steps: [
      "Clear only one desk corner. You are absolutely not required to become a new person today.",
      "Snap a before photo, put on one song, and stop when the song ends if you want.",
      "Take the after photo and notice whether the space feels even 5% calmer.",
    ],
    gentleNote:
      "If the room is too much, do a drawer. If the drawer is too much, do one object. Proof still counts when the win is tiny.",
    petals: 30,
    icon: "auto-awesome",
    colorKey: "clay",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "window-walk",
    title: "Window walk",
    category: "move",
    duration: "12 min",
    proofType: "steps",
    description:
      "Movement is one of the fastest ways to shift your nervous system out of freeze mode.",
    steps: [
      "Put on shoes or not. Walk to a window, door, or outside if that feels okay.",
      "Walk slowly for about 10 minutes. No destination required.",
      "The app will count your steps. 400 steps is a win. 4000 steps is also a win.",
    ],
    gentleNote:
      'Walking to the kitchen and back is allowed. This is not a fitness challenge. It\'s a "your body is real" reminder.',
    petals: 35,
    icon: "directions-walk",
    colorKey: "moss",
    burnoutTypes: ["doomscroll", "social_battery"],
  },
  {
    id: "tiny-toast-plate",
    title: "Tiny toast plate",
    category: "nourish",
    duration: "10 min",
    proofType: "photo",
    description:
      "Burnout eats meals last. Assembling something real, even toast, is a small act of care.",
    steps: [
      "Make or assemble anything edible. Toast, cereal, cheese and crackers, leftovers.",
      "Put it on an actual plate or bowl. Presentation optional but encouraged.",
      "Snap a photo before you eat it.",
    ],
    gentleNote:
      "Instant noodles count. Yesterday's pizza counts. The challenge is the photo, not the cuisine.",
    petals: 25,
    icon: "bakery-dining",
    colorKey: "gold",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "doodle-anything",
    title: "Doodle anything for 5 min",
    category: "creative",
    duration: "5 min",
    proofType: "photo",
    description:
      "Your inner critic is tired too. This is five minutes where lines and shapes are enough.",
    steps: [
      "Grab any pen and paper. Phone notes sketch mode works too.",
      "Draw anything — a square, a face, a plant, a blob.",
      "Set a 5-minute timer. When it goes off, take a photo of the page.",
    ],
    gentleNote:
      "The AI check only looks for marks on paper, it won't judge your art. Neither will we.",
    petals: 20,
    icon: "edit",
    colorKey: "blush",
    burnoutTypes: ["creative_fog", "doomscroll"],
  },
  {
    id: "hum-something",
    title: "Hum or sing for 2 min",
    category: "express",
    duration: "2 min",
    proofType: "audio",
    description:
      "Humming activates your vagus nerve. It is a direct signal to your body that you are safe.",
    steps: [
      "Find a spot where you feel okay making sound. Bathroom, car, bedroom.",
      "Hum, sing, or make any steady noise for 2 minutes.",
      "Record the audio inside the app, we just check that sound happened.",
    ],
    gentleNote:
      "Off-key counts double. Humming the same three notes is fine. There is no audience.",
    petals: 20,
    icon: "music-note",
    colorKey: "blush",
    burnoutTypes: ["social_battery", "creative_fog"],
  },
  {
    id: "stretch-routine",
    title: "5-minute stretch",
    category: "move",
    duration: "5 min",
    proofType: "timer",
    description:
      "Tension stored in your body from stress is real. This five minutes is just about noticing it.",
    steps: [
      "Find floor space or a clear spot.",
      "Roll your neck, stretch your arms overhead, reach toward your feet.",
      "Keep the timer running for 5 minutes. That is the whole challenge.",
    ],
    gentleNote:
      "Sitting down and doing neck rolls counts. Lying on the floor and breathing counts. Your body, your rules.",
    petals: 20,
    icon: "self-improvement",
    colorKey: "moss",
    burnoutTypes: ["doomscroll", "social_battery", "creative_fog"],
  },
  {
    id: "voice-gratitude",
    title: "Voice-note gratitude",
    category: "express",
    duration: "3 min",
    proofType: "audio",
    description:
      "Spoken gratitude has a different effect than written. It forces you to actually hear yourself.",
    steps: [
      "Open the recorder inside the app.",
      "Say out loud three things that existed today that weren't terrible.",
      "They can be tiny. 'My coffee was okay' is valid research.",
    ],
    gentleNote:
      "You don't have to mean it deeply. The act of saying it out loud is the whole point.",
    petals: 25,
    icon: "mic",
    colorKey: "wheat",
    burnoutTypes: ["social_battery", "creative_fog"],
  },
  {
    id: "tidy-nightstand",
    title: "Tidy the nightstand",
    category: "physical_home",
    duration: "5 min",
    proofType: "photo_before_after",
    description:
      "The last thing you see before sleep shapes your nervous system overnight. This takes five minutes.",
    steps: [
      "Look at your nightstand or the area beside your bed.",
      "Snap a before photo.",
      "Remove anything that doesn't belong, wipe it down if you want, take the after shot.",
    ],
    gentleNote:
      "The bar is 'slightly less chaotic.' You are not staging a hotel room.",
    petals: 25,
    icon: "hotel",
    colorKey: "clay",
    burnoutTypes: ["doomscroll", "social_battery"],
  },
  {
    id: "screen-detox-20",
    title: "20-min screen detox",
    category: "screen_detox",
    duration: "20 min",
    proofType: "timer",
    description:
      "Put the phone face-down and let the timer run. Your brain does not need to be doing anything.",
    steps: [
      "Set the timer inside the app and keep Recharge in the foreground.",
      "Put the phone face-down or out of sight.",
      "Do anything else, tea, stare at the ceiling, stretch, sit outside.",
    ],
    gentleNote:
      "If you pick the phone up, it's okay. Restart the timer. The goal is noticing the pull, not being perfect.",
    petals: 40,
    icon: "do-not-disturb-on",
    colorKey: "mist",
    burnoutTypes: ["doomscroll"],
  },
  {
    id: "cook-simple-meal",
    title: "Cook something simple",
    category: "nourish",
    duration: "15 min",
    proofType: "photo",
    description:
      "Cooking activates sensory focus, smell, heat, texture. It pulls your attention out of your head.",
    steps: [
      "Pick something with fewer than five steps. Eggs, pasta, soup from a can you doctor up.",
      "Cook it.",
      "Photo the finished plate before eating.",
    ],
    gentleNote:
      "Instant ramen with an egg on top is absolutely a cooked meal for this challenge.",
    petals: 35,
    icon: "restaurant",
    colorKey: "gold",
    burnoutTypes: ["creative_fog", "doomscroll", "social_battery"],
  },
  {
    id: "read-five-pages",
    title: "Read 5 pages",
    category: "creative",
    duration: "10 min",
    proofType: "photo",
    description:
      "Not scrolling. Not a feed. A physical page or e-reader, moving through something at your own pace.",
    steps: [
      "Pick any book, comic, magazine, or long article.",
      "Read five pages. Or fewer if that is what you have today.",
      "Photo the open page when you are done.",
    ],
    gentleNote:
      "Re-reading the same page three times still counts. Burnout brain is allowed.",
    petals: 25,
    icon: "menu-book",
    colorKey: "wheat",
    burnoutTypes: ["creative_fog", "social_battery"],
  },
  {
    id: "call-or-text-someone",
    title: "Reach out to one person",
    category: "express",
    duration: "5 min",
    proofType: "photo",
    description:
      "Isolation reinforces burnout. One genuine exchange even a meme breaks the loop.",
    steps: [
      "Think of one person you like but haven't talked to recently.",
      "Send them a message, voice note, or call.",
      "It can be 'thinking of you' or a funny link. Screenshot the sent message as proof.",
    ],
    gentleNote:
      "A two-word reply from them is not required. You sent it. That is the challenge.",
    petals: 30,
    icon: "chat-bubble-outline",
    colorKey: "blush",
    burnoutTypes: ["social_battery"],
  },
  {
    id: "make-your-bed",
    title: "Make your bed",
    category: "physical_home",
    duration: "4 min",
    proofType: "photo_before_after",
    description:
      "The smallest possible environmental reset. One made bed changes the visual weight of the whole room.",
    steps: [
      "Take a before photo — no judgment, this is evidence not critique.",
      "Pull the sheets up, straighten the pillow. It does not have to be perfect.",
      "Take the after photo. You've already changed something today.",
    ],
    gentleNote:
      "Duvet roughly in place counts. Hospital corners are for a different kind of person.",
    petals: 20,
    icon: "king-bed",
    colorKey: "clay",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "cold-splash-reset",
    title: "Cold water face splash",
    category: "move",
    duration: "3 min",
    proofType: "timer",
    description:
      "Cold water on the face triggers the dive reflex — your heart rate actually slows within seconds. It's biology, not willpower.",
    steps: [
      "Go to a sink. Run cold water.",
      "Splash your face or hold your wrists under the cold water for 30 seconds.",
      "Keep the timer running. Stay present with the sensation.",
    ],
    gentleNote:
      "If cold feels too much, lukewarm is fine. The point is the sensation, not the temperature.",
    petals: 15,
    icon: "water-drop",
    colorKey: "mist",
    burnoutTypes: ["doomscroll", "social_battery"],
  },
  {
    id: "three-sentences",
    title: "Write 3 sentences",
    category: "creative",
    duration: "5 min",
    proofType: "photo",
    description:
      "Not journaling. Not therapy homework. Just three sentences about whatever is actually in your head right now.",
    steps: [
      "Grab paper, a notes app, or anything writable.",
      "Write exactly three sentences. They do not need to connect or make sense.",
      "Photo the page or screen when you're done.",
    ],
    gentleNote:
      "'I am tired. The ceiling is white. I don't know what day it is.' That's three. That counts.",
    petals: 20,
    icon: "draw",
    colorKey: "wheat",
    burnoutTypes: ["creative_fog", "doomscroll"],
  },
  {
    id: "kitchen-sink-reset",
    title: "Clear the kitchen sink",
    category: "physical_home",
    duration: "8 min",
    proofType: "photo_before_after",
    description:
      "A clear sink is one of the highest-return domestic wins. It makes the whole kitchen feel different.",
    steps: [
      "Before photo — the sink as it is.",
      "Move dishes to the dishwasher or a rack. Rinse anything that needs it.",
      "Wipe the basin if you have the energy. After photo.",
    ],
    gentleNote:
      "Stacking dishes neatly beside the sink still counts. You moved things. That's the win.",
    petals: 30,
    icon: "cleaning-services",
    colorKey: "clay",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "ten-minutes-silence",
    title: "10 minutes of quiet",
    category: "screen_detox",
    duration: "10 min",
    proofType: "timer",
    description:
      "Social battery recharges in silence. Not sleep, not meditation — just permission to exist without input.",
    steps: [
      "Find a spot where no one needs anything from you.",
      "No phone, no podcast, no background TV. Just you and whatever room you're in.",
      "Let the timer run. If thoughts come, let them. You're not required to think productively.",
    ],
    gentleNote:
      "Boring is the point. Boredom is your nervous system exhaling.",
    petals: 35,
    icon: "do-not-disturb-on",
    colorKey: "mist",
    burnoutTypes: ["social_battery", "doomscroll"],
  },
  {
    id: "drink-water",
    title: "Drink a full glass of water",
    category: "nourish",
    duration: "3 min",
    proofType: "photo",
    description:
      "Burnout brains are frequently dehydrated. This is the smallest possible act of care for your body.",
    steps: [
      "Fill a full glass of water. Not a sip — a full glass.",
      "Drink it slowly, sitting down if you can.",
      "Photo the empty glass. You did something kind for your body today.",
    ],
    gentleNote:
      "Add lemon, ice, nothing — however it goes down easiest. This is not a health challenge. It's a 'I exist and I matter' challenge.",
    petals: 15,
    icon: "local-cafe",
    colorKey: "gold",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "step-outside",
    title: "Step outside for 5 min",
    category: "move",
    duration: "5 min",
    proofType: "timer",
    description:
      "Natural light resets your cortisol curve. You don't have to go anywhere — just outside the door.",
    steps: [
      "Put on shoes or sandals. Open the door.",
      "Stand, sit, or walk slowly. No destination. No productivity.",
      "Stay outside for 5 minutes. Let the timer run.",
    ],
    gentleNote:
      "Balcony, doorstep, fire escape — all count. The sky is the proof.",
    petals: 25,
    icon: "wb-sunny",
    colorKey: "moss",
    burnoutTypes: ["doomscroll", "social_battery"],
  },
  {
    id: "warm-drink-ritual",
    title: "Make a warm drink slowly",
    category: "nourish",
    duration: "8 min",
    proofType: "photo",
    description:
      "Making something warm and holding it is a grounding ritual. The slow part is intentional.",
    steps: [
      "Pick anything — tea, coffee, hot water with lemon, warm milk.",
      "Make it slowly. Notice the smell, the steam, the weight of the mug.",
      "Photo the finished drink before your first sip.",
    ],
    gentleNote:
      "Instant coffee counts. A mug of hot water counts. The ritual is the point, not the drink.",
    petals: 20,
    icon: "emoji-food-beverage",
    colorKey: "gold",
    burnoutTypes: ["social_battery", "creative_fog"],
  },
  {
    id: "one-song-nothing-else",
    title: "One song, nothing else",
    category: "screen_detox",
    duration: "4 min",
    proofType: "timer",
    description:
      "Put on one song and only listen. No scrolling. No doing anything else. Just the music.",
    steps: [
      "Pick a song — any song, whatever you feel like.",
      "Press play. Put the phone down or set it face-down.",
      "Just listen until it ends. That's the whole challenge.",
    ],
    gentleNote:
      "If you reach for your phone mid-song, that's information, not failure. Notice it and keep listening.",
    petals: 20,
    icon: "headphones",
    colorKey: "blush",
    burnoutTypes: ["doomscroll", "creative_fog", "social_battery"],
  },
  {
    id: "shake-it-out",
    title: "Shake your body for 3 min",
    category: "move",
    duration: "3 min",
    proofType: "timer",
    description:
      "Animals literally shake to discharge stress after threat. Humans stopped. This is you starting again.",
    steps: [
      "Stand up. Start with your hands and let the shaking move up your arms.",
      "Shake your whole body — arms, legs, shoulders, head. It will feel weird. That's fine.",
      "Keep going for 3 minutes. You might laugh. That's a bonus.",
    ],
    gentleNote:
      "If standing is hard, seated shaking still works. Any movement counts.",
    petals: 20,
    icon: "waves",
    colorKey: "moss",
    burnoutTypes: ["doomscroll", "social_battery", "creative_fog"],
  },
  {
    id: "voice-memo-day",
    title: "Describe your day out loud",
    category: "express",
    duration: "3 min",
    proofType: "audio",
    description:
      "Putting words to a day — even a flat one — helps your brain process it instead of just carrying it.",
    steps: [
      "Open the recorder inside the app.",
      "Describe your day out loud like you're leaving a voicemail for yourself.",
      "No performance needed. Start with 'Today was...' and see where it goes.",
    ],
    gentleNote:
      "'Today was nothing. I didn't do much. I'm tired.' That's a valid recording. Press submit.",
    petals: 25,
    icon: "record-voice-over",
    colorKey: "wheat",
    burnoutTypes: ["creative_fog", "doomscroll"],
  },
  {
    id: "send-a-compliment",
    title: "Send one genuine compliment",
    category: "express",
    duration: "4 min",
    proofType: "photo",
    description:
      "Giving something good to someone else is one of the fastest ways to feel slightly less alone.",
    steps: [
      "Think of one person and one true thing you appreciate about them.",
      "Send it — text, DM, voice note, whatever feels easiest.",
      "Screenshot the sent message as proof. You made someone's day.",
    ],
    gentleNote:
      "It doesn't need to be profound. 'Your playlist you shared last week has been on repeat' is enough.",
    petals: 25,
    icon: "favorite-border",
    colorKey: "blush",
    burnoutTypes: ["social_battery"],
  },
];

// Colour values per key (matches palette in recharge-theme.ts)
export const CATEGORY_COLORS: Record<ChallengeCategory, Challenge["colorKey"]> =
  {
    physical_home: "clay",
    creative: "moss",
    nourish: "gold",
    express: "blush",
    move: "wheat",
    screen_detox: "mist",
  };

export const BURNOUT_TYPES: Record<
  BurnoutType,
  { label: string; note: string; colorKey: Challenge["colorKey"] }
> = {
  doomscroll: {
    label: "Doomscroll fatigue",
    note: "Needs tactile wins first your hands should touch something real before your brain follows.",
    colorKey: "blush",
  },
  creative_fog: {
    label: "Creative fog",
    note: "Needs playful proof with zero stakes your creativity is resting, not gone.",
    colorKey: "wheat",
  },
  social_battery: {
    label: "Social battery drain",
    note: "Needs solo rituals and honest rest being alone is recovery, not avoidance.",
    colorKey: "mist",
  },
};

export const PET_ITEMS = [
  {
    id: "cinnamon-scarf",
    label: "Cinnamon scarf",
    petalsRequired: 0,
    icon: "checkroom" as MaterialIconName,
  },
  {
    id: "patchwork-blanket",
    label: "Patchwork blanket",
    petalsRequired: 0,
    icon: "king-bed" as MaterialIconName,
  },
  {
    id: "window-plants",
    label: "Window plants",
    petalsRequired: 0,
    icon: "local-florist" as MaterialIconName,
  },
  {
    id: "ceramic-lamp",
    label: "Ceramic lamp",
    petalsRequired: 180,
    icon: "lightbulb" as MaterialIconName,
  },
  {
    id: "cozy-rug",
    label: "Cozy rug",
    petalsRequired: 150,
    icon: "home" as MaterialIconName,
  },
  {
    id: "reading-nook",
    label: "Reading nook light",
    petalsRequired: 300,
    icon: "auto-stories" as MaterialIconName,
  },
  {
    id: "spice-shelf",
    label: "Tiny spice shelf",
    petalsRequired: 240,
    icon: "kitchen" as MaterialIconName,
  },
  {
    id: "fairy-lights",
    label: "Fairy lights",
    petalsRequired: 400,
    icon: "star" as MaterialIconName,
  },
];

export const DEFAULT_UNLOCKED_ITEMS = [
  "cinnamon-scarf",
  "patchwork-blanket",
  "window-plants",
];
