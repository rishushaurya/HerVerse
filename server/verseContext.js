// Builds VerseAI's system prompt on the server from the signed-in user's own records,
// so the AI sees everything she has logged without trusting context sent by the browser.

const DAY_MS = 24 * 60 * 60 * 1000;
const MOODS = ['very low', 'low', 'neutral', 'good', 'excellent'];
const ENERGY = ['exhausted', 'tired', 'okay', 'energetic', 'very energetic'];
const LANGUAGES = { english: 'English', hindi: 'Hindi (Devanagari; Hinglish is fine if she writes that way)', kannada: 'Kannada' };
const TONES = {
    gentle: 'gentle, soft and reassuring',
    normal: 'warm and friendly',
    minimal: 'brief and to the point, no fluff',
};

const APP_GUIDE = `You are VerseAI, the companion inside HerVerse ("every women every phase"), an app for women in India.
You are warm, respectful, non-judgmental and practical. You are not a doctor or lawyer and never diagnose.

How to reply:
- Speak in the language and tone given in <user_profile>. Keep it short: usually 2-6 sentences, or a few short bullet points for plans and steps.
- Use what you know about her from <user_data> naturally and specifically ("you slept 5 hours and logged high stress, so...").
  Never invent data that is not there, and never dump the data back at her.
- Do not use emoji. Plain, warm, natural language.
- When something in the app would help, name the exact screen: Home (mood check-in, affirmation, streak, wellness score),
  Planner (tasks with time, priority, category), Health (daily check-in, period tracker, symptoms, exercise, insights),
  VerseAI (this chat), Profile (preferences, theme, language), SOS button (alerts emergency contacts), Helplines, Gov. Schemes.

Safety (overrides everything):
- If she mentions danger, violence, being followed, abuse, or self-harm: tell her to call 112 now, mention the SOS button,
  and give the matching helpline: Women Helpline 1091 or 181, Police 100, Mental health KIRAN 1800-599-0019, Cyber crime 1930.
  Then stay with her supportively.
- Red-flag symptoms (very heavy bleeding, severe pain, fainting, chest pain, pregnancy concerns): advise seeing a doctor promptly.
- Cycle predictions are estimates, never contraception advice.

Government schemes you can suggest when relevant (tell her to confirm eligibility on the official site, linked in Gov. Schemes):
Beti Bachao Beti Padhao (girls' education), Sukanya Samriddhi Yojana (savings for a daughter), PM Matru Vandana Yojana (₹5000 maternity benefit),
Mahila Shakti Kendra (skills, community), Stand-Up India (₹10 lakh-₹1 crore business loans), Working Women Hostel, One Stop Centre (legal aid,
counselling, shelter for violence survivors), PM Ujjwala Yojana (free LPG), National Creche Scheme (childcare), STEP (skill training, jobs).`;

const byDateDesc = (field) => (a, b) => String(b[field] || '').localeCompare(String(a[field] || ''));
// YYYY-MM-DD in her time zone (the server itself runs in UTC on Vercel).
const localDate = (timeZone, d = new Date()) => {
    try {
        return new Intl.DateTimeFormat('en-CA', { timeZone }).format(d);
    } catch {
        return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(d);
    }
};
const daysBetween = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

const cycleSummary = (prefs, periodLogs, today) => {
    const starts = periodLogs.map(p => p.start_date).filter(Boolean);
    if (prefs?.last_period_start) starts.push(prefs.last_period_start);
    if (!starts.length || prefs?.period_tracking === false) return null;

    const lastStart = starts.sort().at(-1);
    const loggedLengths = periodLogs.map(p => Number(p.cycle_length)).filter(n => n >= 20 && n <= 45);
    const cycleLength = Number(prefs?.average_cycle_length)
        || (loggedLengths.length ? Math.round(loggedLengths.reduce((a, b) => a + b, 0) / loggedLengths.length) : 28);
    const day = daysBetween(lastStart, today) + 1;

    let phase;
    if (day <= 5) phase = 'menstrual';
    else if (day < cycleLength - 15) phase = 'follicular';
    else if (day <= cycleLength - 12) phase = 'ovulation window';
    else if (day <= cycleLength) phase = 'luteal';
    else return `Cycle: day ${day} since last period started on ${lastStart}; period may be ${day - cycleLength} day(s) late (usual cycle ${cycleLength} days).`;

    const next = new Date(Date.parse(lastStart) + cycleLength * DAY_MS).toISOString().slice(0, 10);
    return `Cycle: day ${day} of ~${cycleLength}, ${phase} phase, next period expected around ${next} (estimate).`;
};

/**
 * @param {object} user - user record (without password)
 * @param {object} data - { preferences, checkIns, periodLogs, symptoms, exercises, tasks, contacts } for this user
 * @param {string} timeZone - IANA zone from her browser, e.g. 'Asia/Kolkata'
 */
export const buildVerseSystemPrompt = (user, data, timeZone = 'Asia/Kolkata') => {
    const prefs = data.preferences[0] || {};
    const today = localDate(timeZone);

    const profile = [
        `Name: ${user.name || 'not given'}`,
        `Reply language: ${LANGUAGES[prefs.language] || 'English'}`,
        `Tone: ${TONES[prefs.reminder_style] || TONES.normal}`,
        prefs.age_range && prefs.age_range !== 'prefer_not_to_say' && `Age range: ${prefs.age_range}`,
        prefs.life_stage && `Life stage: ${prefs.life_stage}`,
        (prefs.city || prefs.state) && `Lives in: ${[prefs.city, prefs.state].filter(Boolean).join(', ')}`,
        prefs.blood_group && `Blood group: ${prefs.blood_group}`,
        prefs.mental_health_checkins && `Wants mental-health check-ins: ${prefs.mental_health_checkins}`,
        prefs.planner_usage && `Plans: ${prefs.planner_usage}`,
    ].filter(Boolean);

    const facts = [`Today is ${today} (${new Date(today).toLocaleDateString('en-IN', { weekday: 'long', timeZone: 'UTC' })}).`];

    const cycle = cycleSummary(prefs, data.periodLogs, today);
    if (cycle) facts.push(cycle);

    const checkIns = [...data.checkIns].sort(byDateDesc('date')).slice(0, 7);
    if (checkIns.length) {
        facts.push('Recent daily check-ins (newest first):');
        checkIns.forEach(c => facts.push('- ' + [
            c.date,
            c.mood && `mood ${MOODS[c.mood - 1] || c.mood}`,
            c.energy && `energy ${ENERGY[c.energy - 1] || c.energy}`,
            c.sleep_hours && `sleep ${c.sleep_hours}h`,
            c.stress_level && `stress ${c.stress_level}/5`,
            c.water_intake && `water ${c.water_intake} glasses`,
            c.physical_discomfort && `discomfort: ${c.physical_discomfort}`,
            c.notes && `note: "${String(c.notes).slice(0, 120)}"`,
        ].filter(Boolean).join(', ')));
    } else {
        facts.push('No daily check-ins yet (suggest the Home or Health check-in if it fits).');
    }

    const symptoms = [...data.symptoms].sort(byDateDesc('date')).slice(0, 8);
    if (symptoms.length) {
        facts.push('Recent symptoms: ' + symptoms.map(s =>
            `${s.symptom_name || s.symptom_type} (${s.date}${s.severity ? `, severity ${s.severity}/5` : ''}${s.related_to_cycle ? ', cycle-related' : ''})`
        ).join('; ') + '.');
    }

    const exercises = [...data.exercises].sort(byDateDesc('date')).slice(0, 5);
    if (exercises.length) {
        facts.push('Recent exercise: ' + exercises.map(e => `${e.activity_type} ${e.duration || '?'} min ${e.intensity || ''} on ${e.date}`.trim()).join('; ') + '.');
    }

    const tasks = data.tasks
        .filter(t => t.status !== 'completed' && t.status !== 'skipped' && (!t.date || t.date >= today))
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 10);
    const doneToday = data.tasks.filter(t => t.date === today && t.status === 'completed').length;
    facts.push(tasks.length
        ? `Upcoming tasks: ${tasks.map(t => `${t.title} (${!t.date ? 'no date' : t.date === today ? 'today' : t.date}${t.time ? ' ' + t.time : ''}, ${t.priority || 'normal'}${t.category ? ', ' + t.category : ''})`).join('; ')}. Completed today: ${doneToday}.`
        : `No upcoming tasks. Completed today: ${doneToday}.`);

    facts.push(data.contacts.length
        ? `Emergency contacts saved: ${data.contacts.map(c => `${c.name}${c.relationship ? ` (${c.relationship})` : ''}`).join(', ')}.`
        : 'No emergency contacts saved yet: gently suggest adding one in Profile/SOS when safety comes up.');

    return `${APP_GUIDE}\n\n<user_profile>\n${profile.join('\n')}\n</user_profile>\n\n<user_data>\n${facts.join('\n')}\n</user_data>`;
};
