# Aura

A minimalist cat-themed AI self-help workspace for adults. Aura is not therapy, diagnosis or emergency care, and has not been clinically validated.

## Run locally

Python 3.10+ is required, with no additional packages. Set GEMINI_API_KEY in the server environment, run `python server.py`, and open http://127.0.0.1:4173. The default model is gemini-3.1-flash-lite; AURA_MODEL can select another supported model. Credentials remain on the server and are not included in this download. Keep dist/ beside server.py. This loopback-only development server is not suitable for public hosting.

## Your space

Chat uses short conversational replies, recent context, and instructions against repetitive openings and questions. These instructions do not guarantee perfect recall, quality or clinical safety.

The journal has searchable pages, editable titles and text, automatic saving, word counts and per-page memory exclusions. The small memory link above the chat opens Memory & country settings. Journal memory is off by default. If enabled, local keyword/recency retrieval selects up to two relevant excerpts of about 2,100 characters each for Gemini. Excluded entries are never selected. This is retrieval, not fine-tuning or semantic search over an unlimited history; it may miss relevant entries.

Country is explicitly chosen, not inferred from GPS or IP. It is included with chats if selected. Location context does not verify services, eligibility or phone numbers.

Conversation logs are automatic while private storage is unlocked. Logs can be viewed, resumed and deleted. Before private storage is set up or unlocked, new work is temporary in this tab.

Practices include thought records, behavioural activation, values, problem-solving, pattern reflection, self-compassion, grounding, optional breathing and action plans. These are original self-help prompts informed by psychological approaches, not licensed treatment protocols.

## Encrypted private saving

Open Your space > Conversation logs. Create a passphrase of at least 12 characters and remember it: there is no recovery. The passphrase is never sent to the server or Gemini. The browser derives a non-exportable AES-256-GCM key with PBKDF2-SHA-256, 600,000 iterations, and a random salt. Each save has a fresh 96-bit IV. Only ciphertext is written to .aura-data/vault.json, outside the served dist/ directory. Runtime data is excluded from Git and from this source archive.

While unlocked, chats and journal changes save automatically. Wait for “Encrypted · saved on this computer” before closing. Aura warns about pending saves. Locking clears the in-tab data and encryption key; unlocking restores the journal, logs and current chat. Avoid multiple unlocked tabs: revision checks prevent silent overwrites, but a conflicting tab may need to export its unsaved work, lock without saving, and unlock the newer disk copy.

This is encryption at rest, not a promise that only Aura can ever read the data. Someone controlling the device, browser or extensions while Aura is unlocked may see plaintext. Weak or lost passphrases, malware, device backups and provider-retained data remain limitations. This is one local vault, not a multi-user account system or an audited security product.

Encrypted backups can be exported from Logs. To restore manually, stop Aura, preserve the existing .aura-data/vault.json if present, copy the backup to that path, restart, and unlock using the backup's original passphrase. Readable exports contain sensitive plaintext. Deleting in Aura does not erase exports, backups or data retained by Google.

Earlier unencrypted Aura browser-local copies are removed after the first successful encrypted save. Until then, a legacy copy may remain in that browser profile. New saving does not use localStorage.

## What goes to Google

Only after chat opt-in and sending: the recent conversation, authorized journal excerpts, authorized weekly and after-chat check-ins, and an optional country setting. Google API terms apply. Local encryption does not control provider-retained data. Mood check-ins, passphrases and the rest of the journal are not automatically sent. Turning memory off stops future excerpt sharing and cannot retract earlier requests.

## Cat system

Original SVG puppets have articulated heads, tails and legs. CAT_ROSTER in dist/motion.js describes appearance; each cat has an independent state machine for walking, sitting, grooming, stretching, sleeping, pouncing, kneading, rolling and nuzzling. Walking position and leg phase advance together with requestAnimationFrame rather than timed CSS slides. Hover or touch pets them. They have no text or speech bubbles.

Mood changes the balance of quiet versus playful actions, not the count. Settings allow one or two cats with a hard maximum of two. New characters can be added to CAT_ROSTER and selected in the renderer; roster entries do not all appear automatically. Pause/hide controls and reduced-motion support are available. Cats are decorative, not diagnostic indicators or rewards for disclosure.

## Verification

Run `node check.cjs` and `python check_server.py`. Checks cover core flows; chat consent/context/errors; journal sharing opt-in and exclusions; country context; actual encryption/decryption; wrong-passphrase and tamper rejection; log saving and lock/restore; server format validation and revision conflicts; silent, bounded cats. Synthetic live API checks verified journal recall and country context. No real journal entries were submitted in testing.

These checks are not a clinical evaluation, security audit, or comprehensive browser/accessibility test. Before public release, commission clinical and security review, use production hosting with per-user authentication, define human escalation responsibilities, and evaluate safety, accessibility and outcomes.


## Weekly reflections, patterns and garden

Your space now includes Weekly reflection and Patterns & garden. An in-app invitation appears once each local calendar week (Monday start); there are no background notifications or scheduled jobs. Eight original questions ask about the past seven days. Every question and the optional note can be skipped. These are not validated screening instruments and do not identify disorders, personality types or hidden trauma.

The visual history shows reported frequency for one selected question across up to eight recorded weeks. Skipped answers remain missing, and missed weeks are not filled with zeros or connected with an invented trend line. Descriptive repeated-answer observations require at least three completed weeks. Supportive experiences and difficulties are clearly distinguished, with no combined mental-health or trauma score.

The garden awards one stamp per completed week, independent of answers or disclosure. Editing a week cannot earn extra stamps. Missing a week removes nothing. Journal page and reviewed-action counts are simple activity counts. No support feature is locked behind points or distress disclosures.

Completed weekly reflections are included in encrypted private saving. They are not shared by default. They may be included when Weekly & after-chat check-in memory is enabled, or when the user chooses to send a prepared Talk about this week message after chat consent. In-progress reflections stay in this tab until saved and are cleared when the vault locks.

Explore a familiar reaction provides neutral, optional prompts about a recent situation, responses, needs, and any connections to experiences the person already remembers. It explicitly avoids recovered-memory suggestions or inferring trauma from feelings or quiz answers. Users can stop, ground themselves, or seek professional support. The model instructions reinforce those limits.

Cats now also yawn, loaf, hop, shake and watch a rolling toy. The cat-controls Play action starts a short toy chase, respecting the two-cat limit, bounded movement, pause controls and reduced-motion preferences.


## Connected memory and conversation endings

Memory preferences now have independent Journal and Weekly & after-chat check-in controls. Both are opt-in. The chat can retrieve up to two relevant journal excerpts, three weekly reflections and two recent prior chat reviews, while respecting per-entry exclusions. The server converts weekly numbers into frequency labels and tells the model not to treat them as clinical scores or evidence of hidden causes.

Gemini returns conversational text and internal IDs for memories it reports using. The server filters IDs against the actual supplied context; IDs and structured response data are not shown in chat. The client uses those references to cool down recently mentioned records for four assistant turns, and across new conversations for a day. Direct memory questions bypass that cooldown. Existing conversation context can still contain earlier observations; this does not guarantee zero repetition or perfect retrieval.

Finish chat opens an optional short check-in only after a conversation has had an AI reply. Starting a new chat offers it too, unless the same completed conversation has already been reviewed. Two optional questions ask about perceived helpfulness and current feelings, followed by an optional takeaway. The user can skip everything or keep talking. No answer is inferred, and no problem is labeled fixed or resolved. Closing the browser cannot run an after-close quiz; use Finish chat when you want to wrap up.

Reviews save with the normal encrypted private-storage setting and can be viewed, excluded from memory, or deleted under the related conversation log. Check-in memory must be enabled before future chats can receive them. Locking clears in-progress feedback and other private drafts. A small non-content welcome flag can remember the onboarding acknowledgment in this browser; Delete my Aura data clears it.

Cats remain original flat SVG artwork with a rounder silhouette, large faces, soft paws, ear flicks, blinking and hover nuzzles. No VideoGen or Pollo integration, promotional link, third-party video or 3D asset is used in the application.
