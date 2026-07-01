# LeadAura Lead Qualification Skill

Use this skill when improving LeadAura’s WhatsApp intake, patient inquiry handling, lead qualification, clinic sales workflow, or premium clinic positioning.

## Product Context

LeadAura is a WhatsApp-first lead qualification system for premium clinics.

It is not a generic chatbot and should not be positioned as an AI receptionist.

Core promise:
No high-intent WhatsApp inquiry goes unanswered.

LeadAura should:
- respond quickly and professionally
- qualify the patient lead
- collect sales-useful information
- avoid medical advice
- avoid invented pricing
- avoid confirmed bookings
- prepare the clinic team for human follow-up

Primary target:
- Istanbul international medical tourism clinics
- hair transplant clinics
- dental clinics
- premium aesthetic / laser clinics

Later targets:
- Dubai / Qatar premium clinics
- US med spas
- other high-income clinic markets

## Core Differentiation

A chatbot answers questions.
LeadAura turns WhatsApp inquiries into qualified patient leads.

The system should collect information that helps the clinic team understand:
- what the patient wants
- how valuable or urgent the inquiry is
- whether the patient is price-shopping
- whether the patient is travelling from abroad
- when they want treatment
- what follow-up action the clinic should take

## Conversation Quality Rules

Every reply must be:
- concise
- premium
- calm
- professional
- WhatsApp-friendly
- one main question per message

Never:
- interrogate the patient
- ask multiple heavy questions at once
- invent medical claims
- invent exact prices
- diagnose
- give medical advice
- confirm an appointment
- promise guaranteed results
- claim the clinic can definitely perform a procedure
- sound like a cheap bot
- overuse emojis
- use aggressive sales language

Use:
- “appointment request”
- “consultation request”
- “our team will follow up”
- “the clinic team can share exact details”
- “to guide you better…”

Avoid:
- “confirmed appointment”
- “guaranteed result”
- “best price”
- “discount”
- “we can definitely do it”
- “AI receptionist”

## Language Rule

Always reply in the same language as the latest customer message.

If the latest customer message is Turkish, reply in Turkish.
If the latest customer message is English, reply in English.

Do not follow the previous conversation language if the latest message clearly switched languages.

## Safe Pricing Rule

If the patient asks about price, answer safely first, then ask one qualifying question.

Turkish safe pricing:
“Fiyat bilgisi işlem bölgesine ve seans sayısına göre değişebilir. Ekibimiz sizinle iletişime geçip net bilgi paylaşacaktır.”

English safe pricing:
“Pricing depends on the treatment plan and relevant details. Our team will share exact details when they follow up.”

For hair transplant:
Do not invent graft pricing. Ask whether they know the approximate graft count or need an initial evaluation.

For dental:
Do not invent veneer/implant prices. Ask whether they are considering full smile design or a specific number of teeth.

## Qualification Flows

### Laser / Aesthetic Flow

Collect:
- treatment area
- whether this is the first time for that treatment
- preferred day/time
- name
- phone
- price inquiry flag
- lead score / urgency signal

Suggested sequence:
1. If price question: safe pricing response.
2. Ask if it is their first time for the treatment.
3. Ask preferred day/time.
4. Ask name and phone.
5. Finalize as appointment request, not confirmed appointment.

Example Turkish:
Patient:
“Merhaba, full body lazer fiyatı ne kadar?”

Good reply:
“Merhaba. Fiyat bilgisi işlem bölgesine ve seans sayısına göre değişebilir. Ekibimiz sizinle iletişime geçip net bilgi paylaşacaktır. Full body lazeri ilk kez mi yaptıracaksınız?”

Example English:
Patient:
“Hi, how much is full-body laser?”

Good reply:
“Hi. Pricing depends on the treatment area and number of sessions. Our team will share exact details when they follow up. Would this be your first time having full-body laser?”

### Hair Transplant Flow

Collect:
- approximate graft count if mentioned
- whether the patient knows graft count
- whether they are travelling from abroad or already in Istanbul
- desired procedure timeline / date range
- name
- phone
- price inquiry flag
- urgency / hot lead signal

Suggested sequence:
1. If price question: safe pricing response.
2. Ask whether they know approximate graft count.
3. Ask whether they are travelling from abroad or already in Istanbul.
4. Ask desired timeline.
5. Ask name and phone.

Example English:
Patient:
“Hi, how much for around 3000 grafts? I’m coming from abroad.”

Good reply:
“Hi. Pricing depends on the treatment plan and final graft assessment. Around 3000 grafts is helpful to know. When are you planning to travel to Istanbul?”

Example Turkish:
Patient:
“Merhaba saç ekimi fiyatı ne kadar?”

Good reply:
“Merhaba. Fiyat bilgisi greft sayısı ve tedavi planına göre değişebilir. Ekibimiz net bilgi için sizinle iletişime geçecektir. Yaklaşık kaç greft düşündüğünüzü biliyor musunuz?”

### Dental Flow

Collect:
- treatment type: veneers, implants, whitening, smile design, etc.
- scope: full smile design or number of teeth
- whether they are travelling from abroad or already in Istanbul
- desired appointment/treatment timeline
- name
- phone
- price inquiry flag

Suggested sequence:
1. If price question: safe pricing response.
2. Ask whether they want full smile design or a specific number of teeth.
3. Ask whether they are travelling from abroad or already in Istanbul.
4. Ask desired timeline.
5. Ask name and phone.

Example English:
Patient:
“Hi, how much are veneers in Istanbul?”

Good reply:
“Hi. Veneer pricing depends on the number of teeth and treatment plan. Are you considering a full smile design or only a few teeth?”

Example Turkish:
Patient:
“Merhaba veneer fiyatı ne kadar?”

Good reply:
“Merhaba. Fiyat bilgisi diş sayısı ve tedavi planına göre değişebilir. Ekibimiz net bilgi paylaşacaktır. Full smile design mı düşünüyorsunuz, yoksa belirli sayıda diş için mi bilgi almak istiyorsunuz?”

## Data Model Guidance

Prefer minimal additions. Do not over-engineer.

Useful fields:
- firstTimeTreatment
- travellingFromAbroad
- estimatedGrafts
- dentalTreatmentType
- teethCountOrScope
- treatmentTimeline
- qualificationNotes

Do not add complex CRM objects unless needed.

## Implementation Guidance

Before editing:
1. Inspect current ConversationState.
2. Inspect slot extraction.
3. Inspect prompt generation.
4. Inspect pipeline stage transitions.
5. Inspect tests.

Prefer improving:
- slot extraction
- prompt rules
- stage progression
- qualification notes
- tests

Avoid changing:
- webhook routing
- Twilio signature logic
- Meta WhatsApp webhook logic
- Google Sheets integration unless required
- daily summary unless required
- dependencies

## Testing Requirements

When changing qualification flow, add tests for:
- Turkish laser price question asks first-time question before date/time when first-time status is missing
- English hair transplant price question asks about graft count
- hair transplant flow captures travelling-from-abroad signal
- dental veneers inquiry asks full smile design vs number of teeth
- flow still completes with name and phone
- no medical advice
- no invented exact prices
- language consistency still works
- existing SMS, WhatsApp, reset, and build checks pass

Required commands:
npm run type-check
npm run test-sms
npm run test-whatsapp
npm run test-reset
npm run build

## Output Format

At the end of the task, report:
1. files changed
2. new fields added
3. flow changes
4. example improved replies
5. tests added
6. commands run
7. test/build results
8. remaining risks

## Premium Clinic Feature Requirements

LeadAura should support these seven premium clinic capabilities in a professional, structured way.

### 1. Appointment Availability / Slot Request Handling

LeadAura should understand appointment availability requests such as:
- “Is Saturday afternoon available?”
- “Do you have any slots tomorrow?”
- “Şu gün boş musunuz?”
- “Cumartesi öğleden sonra randevu var mı?”

Important:
- Do not confirm a real appointment unless live calendar availability is explicitly integrated.
- Use “appointment request” language.
- If calendar integration is not available, collect the preferred day/time and tell the patient the clinic team will confirm availability.

### 2. Multi-Language Support

LeadAura should reply in the same language as the latest customer message.

Priority languages for premium international clinics:
- English
- Turkish
- Arabic
- German
- Russian
- French
- Spanish

Do not force English if the latest customer message is clearly another language.

### 3. Instagram DM Readiness

LeadAura’s primary live channel is currently WhatsApp.

Instagram DM automation should be treated as a future channel unless the codebase already has a working Instagram webhook.

Do not claim Instagram DM automation is live unless implemented.

The qualification flow should be reusable across channels.

### 4. Business-Specific Minimum Price / Starting Price

LeadAura should support clinic-approved starting-price guidance.

Important:
- Never invent prices.
- Only mention minimum/starting price if explicitly configured by the clinic.
- If not configured, use safe pricing fallback.

### 5. Clinic Device / Technology Brands

LeadAura should answer questions about approved clinic devices, technologies, or brands only if configured.

Important:
- Do not invent device brands.
- Do not make clinical superiority claims.
- Do not say “best” or “guaranteed result.”
- Keep the answer factual and continue qualification.

### 6. Location and Transportation Information

LeadAura should support configured clinic location and transportation guidance.

Useful fields:
- clinic address
- Google Maps link
- district/neighborhood
- nearest metro/transport point
- parking availability
- airport transfer note if relevant

Important:
- Do not invent location details.
- Only use configured clinic information.
- If unavailable, say the team will share location details.

### 7. Pre-Treatment Preparation Instructions

LeadAura should support clinic-approved pre-treatment preparation notes.

Important:
- Only provide generic clinic-approved preparation notes.
- Avoid medical advice.
- Avoid diagnosis.
- Avoid medication instructions unless explicitly approved by the clinic.
- If the question is clinical, direct the patient to the clinic team.

## Configuration Guidance

Possible clinic config fields:
- supportedLanguages
- startingPrices
- deviceBrands
- locationInfo
- transportationInfo
- preTreatmentInstructions
- channelCapabilities

Do not hardcode fake clinic prices, fake devices, or fake addresses.

## Feature Priority

Implementation priority:
1. Appointment availability request handling
2. Business-specific pricing config / safe fallback
3. Location and transportation info
4. Device/technology brand config
5. Pre-treatment preparation notes
6. Expanded multilingual readiness
7. Instagram DM future-readiness

Instagram DM should not be implemented as a live claim until webhook/auth/channel integration exists.
