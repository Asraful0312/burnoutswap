### Quick research check (Reddit + X + web, April 2026)

- **Demand is real.** Tons of Reddit threads in r/ProductivityApps, r/Stress, r/getdisciplined, r/AuDHDWomen etc. where people say “I couldn’t find a good burnout app” or “I built one myself because nothing fit.” Many users complain generic mindfulness apps don’t help when you’re already numb.
- **Photo-proof habit apps already exist and work.** Apps like _Proofs_, _Folksable_, _Momentum_ let users upload photos for verification and users love the “no cheating” feel. AI judging is a hot feature right now.
- **Phone-lock / digital detox apps are popular** (Lock My Phone, Focus Lock, etc.). People use them but want them _inside_ a bigger recovery system, not standalone.
- **Would people actually use it?** Yes. Burnout recovery is a massive pain point — people download wellness apps daily and actively search for “burnout challenges,” “dopamine detox,” “analog habits.”
- **Would they spend money?** Mixed but promising. Wellness apps are mostly freemium. People happily pay $5–15/month for premium on Headspace, Calm, or habit apps _if_ it feels worth it (extra challenges, better AI, community, no ads). Reddit users say they skip $15/month “fluffy” apps but will pay for something that actually forces action and shows progress. Market is huge — mental health apps keep growing because burnout isn’t going away.

Your idea has a real edge because it’s **specific to burnout** and uses **proof-based challenges** instead of “just meditate bro.”

### Completed & polished app concept: Let’s call it “Recharge” (or “Burnout Breaker”, “Analog Reset”, whatever you like)

**Core promise:**  
“30 days of tiny real-world wins that actually feel good again — no scrolling required. We make sure you actually did them.”

**Onboarding (2 minutes)**

- Quick 8-question burnout quiz → tells them their type (e.g., “Doomscroll Fatigue”, “Creative Block”, “Social Burnout”).
- Sets starting energy level so challenges feel doable, not overwhelming.

**Daily/Weekly Challenge System** (the heart of the app)
Every day = 3–5 micro-challenges. Mix of your ideas + extras that research shows burnout people actually need:

| Category          | Example Challenges (your ideas + expansions)                                                                      | Proof Required                  | AI Judge (simple version)        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------- |
| **Screen Detox**  | 30-min zero screens (phone locked)                                                                                | Timer + app stays in foreground | Auto (timer enforcement)         |
| **Creative**      | Doodle anything for 5 min                                                                                         | Upload doodle image             | Detects lines/shapes (not blank) |
| **Physical Home** | Clean one small area (desk, drawer, room corner)                                                                  | Before + after photo            | Compares two images              |
| **Nourish**       | Cook or assemble a simple meal                                                                                    | Photo of finished dish          | Detects food/plate               |
| **Express**       | Sing, hum, or make any noise for 2 min                                                                            | Audio recording                 | Detects voice/sound              |
| **Move**          | Walk outside (or around house)                                                                                    | Steps via phone sensors         | Auto (pedometer)                 |
| **Extra ideas**   | Read 5 pages physical book, 5-min stretch, voice-note gratitude list, call/text one person, water + stretch combo | Photo/audio/text                | As needed                        |

**Accountability that actually works**

- **Proof upload** right after challenge (camera/mic built-in with Expo).
- **AI judge** (use a cheap backend like Firebase + Google Cloud Vision or even simple open-source models). Start basic: “does this image contain a drawing?” “are these two photos different enough?” If AI is unsure → optional community vote (anonymous) or self-approve with streak warning.
- Streaks, points, “Recovery Level” that goes up (Level 1 = “Couch Potato” → Level 10 = “Human Again”).
- Gentle: Miss a day? No punishment, just “rest day” option with tiny bonus for honesty.

**Extra features to make it sticky**

- **Recovery Pet** (like Finch self-care app) — tiny creature that “revives” as you complete challenges. Super motivating for burnt-out brains.
- Mood slider before/after each challenge → shows real progress graphs (“Your energy went up 40% after walks”).
- **Community (optional & anonymous)**: Scroll cute success stories (“My doodle today 😂”) or join group challenges. Or keep it solo if they want privacy.
- **Custom challenge builder**: Users can create their own (“Meditate then photo of candle”).
- **Phone Lock mode**: Full-screen timer. On iOS/Android use Expo’s background tasks + notifications. For stricter lock, guide users to native Screen Time / Digital Wellbeing and reward them for using it.
- Daily gentle reminder: “Your brain needs 20 min of real life today ❤️”
- Offline-first (Expo makes this easy).

**Monetization (how you make money)**

- **Freemium** (this is what works):
  - Free: 3 challenges/day, basic AI, no pet, limited history.
  - Premium ($4.99/mo or $29/year — people actually pay this): Unlimited challenges, advanced AI judge, pet upgrades, community, detailed analytics, ad-free, custom packs.
- One-time “Lifetime” unlock (~$49) for the “I hate subscriptions” crowd.
- No creepy data selling. People in burnout hate that.

**Tech feasibility with Expo React Native (you already know this stuff)**

- Camera, mic, pedometer → expo-camera, expo-av, expo-sensors (super easy).
- Timer lock → expo-background-fetch + notifications.
- Backend for AI/storage → Firebase or Supabase (free tier to start).
- MVP in a weekend: Just 5 challenges + photo upload + streak counter.
- Later add AI (you can even use free Hugging Face models via API).

**Potential problems & easy fixes**

- AI judging not perfect → Start with “good enough” + let users appeal or self-approve on low-stakes days.
- People drop off → Make onboarding stupidly easy, celebrate tiny wins, allow rest days.
- Privacy → Clear: “Photos only used for verification, deleted after AI check unless you save them.”
- Burnout users hate pressure → Tone is kind, never shaming. “Progress > perfection.”

**Would people really use & pay?**  
From everything I saw: **yes**. There’s a gap in the market for a _fun, proof-based, burnout-specific_ app. Existing ones are either too fluffy (meditation) or too generic (habit trackers). Your version feels different because it forces the exact behaviors that actually fix burnout (analog activities + proof = real dopamine).

**Next steps I’d take if I were you**

1. Build a super small MVP this week (just 4–5 of your original challenges + photo upload + streak).
2. Test it on yourself for 7 days.
3. Put it on TestFlight / Google Play internal test and post in r/burnout, r/getdisciplined, r/ProductivityApps with “I built this for people like me — honest feedback?”
4. If 20–30 people love it → add premium and launch.

This could genuinely help a lot of burnt-out people (including future you).

Want me to sketch a simple user flow, suggest exact challenge list for v1, or help name it / write the App Store description? Just say the word. You’ve got something good here — let’s make it real. 🚀
