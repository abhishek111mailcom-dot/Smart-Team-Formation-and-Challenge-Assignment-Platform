-- ==============================================================================
-- DEMON SLAYER CORPS DISPATCH & ASSIGNMENT PLATFORM
-- SUPABASE DATABASE SCHEMA (PostgreSQL)
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Project and go to the "SQL Editor" in the left sidebar.
-- 3. Click "New Query", paste this entire script, and click "Run".
-- 4. All tables, security policies, and canon Demon Slayer seed lore will be initialized!
-- ==============================================================================

-- Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- Drop existing tables if re-initializing (cascades cleanly)
drop table if exists squads cascade;
drop table if exists missions cascade;
drop table if exists slayers cascade;
drop table if exists twelve_kizuki cascade;
drop table if exists formation_history cascade;

-- ------------------------------------------------------------------------------
-- 1. SLAYERS TABLE (Corps Members & Hashira)
-- ------------------------------------------------------------------------------
create table slayers (
  id text primary key,
  name text not null,
  japanese_name text,
  breathing_style text not null,
  base_breathing text not null,
  rank text not null,
  rank_level integer default 5,
  preferred_role text not null,
  skills jsonb default '[]'::jsonb,
  interests jsonb default '[]'::jsonb,
  combat_power integer default 75,
  katana_color text default 'Nichirin Steel',
  avatar text default '⚔️',
  avatar_image text,
  assigned_team_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 2. MISSIONS TABLE (Demon Incursion Challenges)
-- ------------------------------------------------------------------------------
create table missions (
  id text primary key,
  title text not null,
  japanese_title text,
  danger_rank text not null,
  location text not null,
  team_size integer default 4,
  required_roles jsonb default '[]'::jsonb,
  preferred_breathing jsonb default '[]'::jsonb,
  required_skills jsonb default '[]'::jsonb,
  min_combat_power integer default 250,
  demon_encounter text,
  demon_image text,
  secondary_demon_image text,
  demon_rank_title text,
  description text,
  assigned_team_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 3. SQUADS TABLE (Assembled Teams & Formation Results)
-- ------------------------------------------------------------------------------
create table squads (
  id text primary key,
  name text not null,
  japanese_name text,
  formation_strategy text,
  hashira_leader jsonb,
  synergy_score integer default 0,
  members jsonb default '[]'::jsonb,
  assigned_mission_id text,
  assignment_metrics jsonb,
  stats jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 4. TWELVE KIZUKI TABLE (Ranked Demon Threats)
-- ------------------------------------------------------------------------------
create table twelve_kizuki (
  id text primary key,
  name text not null,
  japanese_name text,
  rank_category text not null,
  rank_title text not null,
  danger_rank text not null,
  blood_demon_art text,
  image text,
  secondary_image text,
  threat_power integer default 80,
  description text,
  counter_hint text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- 5. FORMATION HISTORY TABLE (Audit Log for Algorithm Runs)
-- ------------------------------------------------------------------------------
create table formation_history (
  id bigint generated always as identity primary key,
  meta jsonb,
  squad_count integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Allows full read and write access for both anon and service keys
-- ------------------------------------------------------------------------------
alter table slayers enable row level security;
alter table missions enable row level security;
alter table squads enable row level security;
alter table twelve_kizuki enable row level security;
alter table formation_history enable row level security;

create policy "Allow all operations on slayers" on slayers for all using (true) with check (true);
create policy "Allow all operations on missions" on missions for all using (true) with check (true);
create policy "Allow all operations on squads" on squads for all using (true) with check (true);
create policy "Allow all operations on twelve_kizuki" on twelve_kizuki for all using (true) with check (true);
create policy "Allow all operations on formation_history" on formation_history for all using (true) with check (true);

-- ------------------------------------------------------------------------------
-- SEED DATA: 16 CANON SLAYERS
-- ------------------------------------------------------------------------------
insert into slayers (id, name, japanese_name, breathing_style, base_breathing, rank, rank_level, preferred_role, skills, interests, combat_power, katana_color, avatar, avatar_image, assigned_team_id)
values
(
  'slayer-1', 'Tanjiro Kamado', '竈門 炭治郎', 'Sun & Water Breathing', 'Water', 'Kanoe', 7, 'Vanguard',
  '["Total Concentration Constant", "Heightened Olfactory Sense", "Dance of the Fire God", "Dragon Sun Halo Head Dance"]'::jsonb,
  '["Demon Rehabilitation", "Swordsmithing Lore", "Family Protection", "Culinary Arts"]'::jsonb,
  89, 'Jet Black', '🌊', null, null
),
(
  'slayer-2', 'Zenitsu Agatsuma', '我妻 善逸', 'Thunder Breathing (雷の呼吸)', 'Thunder', 'Kanoe', 6, 'Recon',
  '["Thunderclap and Flash: Godspeed (霹靂一閃 神速)", "Heightened Auditory Sense", "Sixfold Dash", "Flaming Thunder God (火雷神)"]'::jsonb,
  '["Nezuko-chan", "Homing Pigeons", "Sweets & Wagashi", "Safe Patrols"]'::jsonb,
  86, 'Golden Yellow Lightning', '⚡', '/images/zenitsu.png', null
),
(
  'slayer-3', 'Inosuke Hashibira', '嘴平 伊之助', 'Beast Breathing', 'Wind', 'Kanoe', 6, 'Vanguard',
  '["Spatial Awareness", "Dual Serrated Swords", "Joint Dislocation", "Rip and Tear"]'::jsonb,
  '["Mountain King Duels", "Tempura", "Headbutting Trees", "Boasting"]'::jsonb,
  85, 'Indigo Grey', '🐗', null, null
),
(
  'slayer-4', 'Kanao Tsuyuri', '栗花落 カナヲ', 'Flower Breathing', 'Water', 'Tsuguko', 8, 'Tactician',
  '["Equinoctial Vermilion Eye", "Superhuman Kinetic Vision", "Crimson Hanagoromo", "Silent Step"]'::jsonb,
  '["Coin Flipping", "Butterfly Gardening", "Quiet Contemplation", "Aoi''s Onigiri"]'::jsonb,
  88, 'Light Pink', '🌸', null, null
),
(
  'slayer-5', 'Genya Shinazugawa', '不死川 玄弥', 'Demonic Assimilation & Gunner', 'Other', 'Kanoe', 6, 'Trapper',
  '["Demon Flesh Ingestion", "Double-Barrel Nichirin Shotgun", "Regeneration", "Flesh Bullets"]'::jsonb,
  '["Bonsai Cultivation", "Reconciling with Brother", "Weapon Modding", "Target Practice"]'::jsonb,
  82, 'Dark Purple & Gunmetal', '💥', null, null
),
(
  'slayer-6', 'Aoi Kanzaki', '神崎 アオイ', 'Water Breathing (Medical Practitioner)', 'Water', 'Mizunoto', 4, 'Medical',
  '["Wisteria Medicine Alchemy", "Butterfly Ward Triage", "Rehabilitation Regimen", "Venom Antidote"]'::jsonb,
  '["Herbal Medicine", "Hygiene Management", "Baking Steamed Buns", "Slayer Physicals"]'::jsonb,
  58, 'Pale Blue', '💊', null, null
),
(
  'slayer-7', 'Giyu Tomioka', '冨岡 義勇', 'Water Breathing (Water Hashira)', 'Water', 'Hashira', 10, 'Vanguard',
  '["Eleventh Form: Dead Calm (凪)", "Flowing Water Calamity", "Master Swordsmanship", "Total Concentration Constant"]'::jsonb,
  '["Simmered Salmon with Daikon", "Solitude", "Kasugai Crow Training", "Duty"]'::jsonb,
  96, 'Deep Ocean Blue', '🌊', null, null
),
(
  'slayer-8', 'Shinobu Kocho', '胡蝶 しのぶ', 'Insect Breathing (Insect Hashira)', 'Water', 'Hashira', 10, 'Medical',
  '["Dance of the Bee Sting", "Wisteria Lethal Neurotoxin", "Super Speed Thrusts", "Compound Pharmacology"]'::jsonb,
  '["Ghost Stories", "Venom Synthesis", "Sisters Legacy", "Butterfly Rearing"]'::jsonb,
  92, 'Lavender & Turquoise', '🦋', null, null
),
(
  'slayer-9', 'Kyojuro Rengoku', '煉獄 杏寿郎', 'Flame Breathing (Flame Hashira)', 'Flame', 'Hashira', 10, 'Vanguard',
  '["Ninth Form: Rengoku (煉獄)", "Blazing Universe", "Indomitable Spirit", "Rising Scorching Sun"]'::jsonb,
  '["Sweet Potato Rice", "Sumo Wrestling", "Mentoring Juniors", "Proclaiming ''UMAI!''"]'::jsonb,
  97, 'Crimson Flame', '🔥', null, null
),
(
  'slayer-10', 'Tengen Uzui', '宇髄 天元', 'Sound Breathing (Sound Hashira)', 'Thunder', 'Hashira', 10, 'Recon',
  '["Musical Score Technique", "Dual Cleaver Explosive Bombs", "Shinobi Poison Resistance", "Flashy Stealth"]'::jsonb,
  '["Flamboyant Aesthetics", "Hot Springs", "Ninja Mice Training", "Fireworks"]'::jsonb,
  94, 'Amber & Black Notch', '🎆', null, null
),
(
  'slayer-11', 'Muichiro Tokito', '時透 無一郎', 'Mist Breathing (Mist Hashira)', 'Wind', 'Hashira', 10, 'Tactician',
  '["Seventh Form: Obscuring Clouds (朧)", "Sea of Clouds and Haze", "Transparent World", "Prodigy Reflexes"]'::jsonb,
  '["Origami", "Cloud Watching", "Silent Meditation", "Bird Whittling"]'::jsonb,
  95, 'Mist White', '🌫️', null, null
),
(
  'slayer-12', 'Mitsuri Kanroji', '甘露寺 蜜璃', 'Love Breathing (Love Hashira)', 'Flame', 'Hashira', 9, 'Vanguard',
  '["Whip-like Flexible Nichirin", "Catlegged Winds of Love", "Superdense Muscle Constitution", "Acrobatic Flurry"]'::jsonb,
  '["Sakura Mochi", "Western Western Cuisine", "Finding a Strong Husband", "Adopting Pets"]'::jsonb,
  93, 'Bright Hot Pink', '💖', null, null
),
(
  'slayer-13', 'Murata', '村田', 'Water Breathing (Veteran Sentinel)', 'Water', 'Kanoe', 5, 'Trapper',
  '["Basic Water Forms", "Mount Natagumo Survival", "Signal Flare Dispatch", "Defensive Stance"]'::jsonb,
  '["Surviving the Night", "Hair Care", "Checking on Tanjiro", "Card Games"]'::jsonb,
  65, 'Standard Silver', '🛡️', null, null
),
(
  'slayer-14', 'Gotou', '後藤', 'Kakushi Corps Brigade', 'Other', 'Mizunoto', 4, 'Medical',
  '["Battlefield Extraction", "Stretcher Transport", "Emergency Bandaging", "Clean-up Protocol"]'::jsonb,
  '["Castella Cakes", "Prompt Reporting", "Avoiding Hashira Wrath", "Inventory Logs"]'::jsonb,
  52, 'Unarmed Support', '🚑', null, null
),
(
  'slayer-15', 'Gyomei Himejima', '悲鳴嶼 行冥', 'Stone Breathing (Stone Hashira)', 'Stone', 'Hashira', 10, 'Vanguard',
  '["Spiked Flail & Battleaxe Master", "Volcanic Rock Rapid Conquest", "Stone Sanctuary", "Echolocation Perception"]'::jsonb,
  '["Chanting Sutras", "Shakuhachi Flute", "Cats", "Crying for the Pure"]'::jsonb,
  99, 'Heavy Dark Iron', '🪨', null, null
),
(
  'slayer-16', 'Sanemi Shinazugawa', '不死川 実弥', 'Wind Breathing (Wind Hashira)', 'Wind', 'Hashira', 10, 'Vanguard',
  '["Idaten Gale", "Claws-Purifying Wind", "Marechi Rare Blood Trap", "Relentless Slashing"]'::jsonb,
  '["Ohagi (Sweet Rice Cakes)", "Breeding Rhinoceros Beetles", "Brutal Sparring", "Protecting Genya secretly"]'::jsonb,
  96, 'Forest Green Serrated', '🌪️', null, null
)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- SEED DATA: 7 DEMON INCURSION MISSIONS
-- ------------------------------------------------------------------------------
insert into missions (id, title, japanese_title, danger_rank, location, team_size, required_roles, preferred_breathing, required_skills, min_combat_power, demon_encounter, demon_image, secondary_demon_image, demon_rank_title, description, assigned_team_id)
values
(
  'mission-1', 'Mount Natagumo Web Cleansing', '那田蜘蛛山 索敵討伐', 'Rank B', 'Mount Natagumo Forest, Gunma', 4,
  '["Vanguard", "Medical"]'::jsonb,
  '["Water", "Insect", "Wind"]'::jsonb,
  '["Total Concentration Constant", "Venom Antidote"]'::jsonb,
  260, 'Rui & Spider Family (Lower Moon 5)', '/images/rui.png', null, 'Lower Moon 5 (下弦の伍)',
  'Entire squads of slayers have been turned into puppets by razor-sharp steel threads. Slayers must withstand acidic poison and cut the mother and daughter threads before confronting Rui.',
  null
),
(
  'mission-2', 'Mugen Train Nightmare Evacuation', '無限列車 護衛追撃', 'Rank A', 'Locomotive Railway, Tokyo Outskirts', 4,
  '["Vanguard", "Tactician", "Recon"]'::jsonb,
  '["Flame", "Thunder", "Sun"]'::jsonb,
  '["Heightened Auditory Sense", "High Speed Reflexes"]'::jsonb,
  310, 'Enmu (Lower Moon 1) & Akaza Incursion (Upper Moon 3)', '/images/enmu.png', '/images/akaza.png', 'Lower Moon 1 (下弦の壱) & Upper Moon 3',
  'Over 200 civilian passengers are trapped inside an 8-car demonic train merged with Enmu''s flesh. Requires simultaneous defense of passengers and synchronized decapitation.',
  null
),
(
  'mission-3', 'Yoshiwara Entertainment District Infiltration', '吉原遊郭 潜入暗殺', 'Rank S', 'Yoshiwara Red-Light District, Tokyo', 4,
  '["Recon", "Vanguard", "Trapper"]'::jsonb,
  '["Sound", "Beast", "Flower"]'::jsonb,
  '["Spatial Awareness", "Shinobi Poison Resistance"]'::jsonb,
  340, 'Daki & Gyutaro (Upper Moon 6 Dual Threats)', '/images/gyutaro.png', '/images/daki.png', 'Upper Moon 6 (上弦の陸)',
  'Oiran courtesans are vanishing through blood sashes. Slayers must conduct covert recon, resist blood sickle lethal venom, and sever both siblings'' necks simultaneously.',
  null
),
(
  'mission-4', 'Swordsmith Village Emergency Defense', '刀鍛冶の里 防衛奇襲', 'Rank S', 'Hidden Sanctuary of the Swordsmiths', 4,
  '["Tactician", "Vanguard", "Medical"]'::jsonb,
  '["Mist", "Love", "Stone"]'::jsonb,
  '["Transparent World", "Wisteria Medicine Alchemy"]'::jsonb,
  350, 'Gyokko (Upper Moon 5) & Hantengu (Upper Moon 4)', '/images/gyokko.png', '/images/hantengu.png', 'Upper Moon 5 & 4 (上弦の伍・肆)',
  'The secret village that crafts Nichirin katanas is under surprise siege by grotesque fish pots and splitting emotional clones. The forge and master smiths must be preserved at all costs.',
  null
),
(
  'mission-5', 'Tsuzumi Drum Mansion Search & Rescue', '鼓の屋敷 空間突破', 'Rank C', 'Deep Mountain Mansion, Tochigi', 3,
  '["Vanguard", "Recon"]'::jsonb,
  '["Water", "Thunder"]'::jsonb,
  '["Heightened Olfactory Sense"]'::jsonb,
  190, 'Kyogai (Former Lower Moon 6 - Drum Demon)', '/images/kyogai.png', null, 'Former Lower Moon 6 (元下弦の陸)',
  'A mansion where rooms rotate 90 degrees with every drum beat. Slayers must adapt to disorienting gravity shifts and rescue trapped civilians with Marechi blood.',
  null
),
(
  'mission-6', 'Asakusa City Moonlit Shadows Patrol', '浅草市街 密偵巡回', 'Rank D', 'Asakusa Metropolis, Tokyo', 3,
  '["Recon", "Tactician"]'::jsonb,
  '["Water", "Flower"]'::jsonb,
  '["Total Concentration Constant"]'::jsonb,
  160, 'Susamaru (Temari Demon) & Yahaba (Arrow Demon)', '/images/susamaru.png', '/images/yahaba.png', 'Blood Demon Art Duo (異能の鬼)',
  'Urban patrol in the bustling metropolis of Asakusa. Watch for invisible directional vector arrows and exploding temari balls while minimizing civilian notice.',
  null
),
(
  'mission-7', 'Infinity Castle Decapitation Raid', '無限城 上弦討伐決戦', 'Rank S', 'Dimensional Fortress Infinity Castle', 4,
  '["Vanguard", "Tactician", "Medical"]'::jsonb,
  '["Moon", "Sun", "Stone", "Wind"]'::jsonb,
  '["Transparent World", "Selfless State"]'::jsonb,
  380, 'Kokushibo (Upper Moon 1) & Doma (Upper Moon 2)', '/images/kokushibo.png', '/images/doma.png', 'Upper Moon 1 & 2 (上弦の壱・弐)',
  'The supreme incursion within the labyrinthine shifting corridors of the Infinity Castle against the deadliest Upper Moons.',
  null
)
on conflict (id) do nothing;

-- ------------------------------------------------------------------------------
-- SEED DATA: 10 TWELVE KIZUKI & DEMONS
-- ------------------------------------------------------------------------------
insert into twelve_kizuki (id, name, japanese_name, rank_category, rank_title, danger_rank, blood_demon_art, image, secondary_image, threat_power, description, counter_hint)
values
(
  'kizuki-1', 'Kokushibo', '黒死牟', 'Upper Moon (上弦)', 'Upper Moon 1 (上弦の壱)', 'Rank S',
  'Moon Breathing & Flesh Katana (月の呼吸)', '/images/kokushibo.png', null, 100,
  'The supreme leader of the Twelve Kizuki. A legendary former swordsman with six glowing eyes and a living blade constructed of demonic flesh.',
  'Requires multiple Hashira marks, Transparent World, and Crimson Red Nichirin Blades.'
),
(
  'kizuki-2', 'Doma', '童磨', 'Upper Moon (上弦)', 'Upper Moon 2 (上弦の弐)', 'Rank S',
  'Cryokinesis & Frozen Lotus (粉凍りの氷)', '/images/doma.png', null, 98,
  'Sociopathic cult leader of the Eternal Paradise. Wields golden fans that blast microscopic ice crystals to freeze and disintegrate the lungs.',
  'Immunity to cold or massive lethal wisteria poison dosage.'
),
(
  'kizuki-3', 'Akaza', '猗窩座', 'Upper Moon (上弦)', 'Upper Moon 3 (上弦の参)', 'Rank S',
  'Destructive Death & Compass Needle (破壊殺 羅針)', '/images/akaza.png', null, 96,
  'Unmatched martial arts prodigy whose Compass Needle locks onto the opponent''s fighting spirit to predict every attack angle.',
  'Suppressing all fighting spirit through the Selfless State (無我の境地).'
),
(
  'kizuki-4', 'Hantengu', '半天狗', 'Upper Moon (上弦)', 'Upper Moon 4 (上弦の肆)', 'Rank S',
  'Emotion Division & Zohakuten Dragons (喜怒哀楽・憎魄天)', '/images/hantengu.png', null, 94,
  'When decapitated, splits into emotional manifestations (Sekido, Karaku, Aizetsu, Urogi) and the colossal multi-headed Wood Dragon Zohakuten.',
  'Hold back Zohakuten while a scout tracks the tiny heart demon hiding in the heart.'
),
(
  'kizuki-5', 'Gyokko', '玉壺', 'Upper Moon (上弦)', 'Upper Moon 5 (上弦の伍)', 'Rank S',
  'Porcelain Pots & Aquatic Hell (殺戮魚鱗)', '/images/gyokko.png', null, 92,
  'Grotesque chimera demon dwelling inside porcelain pots, conjuring needle-firing demon fish and suffocating water prisons.',
  'Mist Breathing obscuring forms and slicing pots at blinding godspeed.'
),
(
  'kizuki-6', 'Gyutaro & Daki', '妓夫太郎 & 堕姫', 'Upper Moon (上弦)', 'Upper Moon 6 (上弦の陸)', 'Rank S',
  'Poison Blood Sickles & Flesh Ribbons (飛血蝙 & 八重帯斬り)', '/images/gyutaro.png', '/images/daki.png', 90,
  'Sibling demon pair residing in Yoshiwara. Gyutaro''s scythes carry instantaneous lethal venom, and both must be decapitated at the exact same instant.',
  'Dual Vanguard simultaneous strike with high Shinobi poison resistance.'
),
(
  'kizuki-7', 'Enmu', '魘夢', 'Lower Moon (下弦)', 'Lower Moon 1 (下弦の壱)', 'Rank A',
  'Forced Dream Hypnosis (強制昏倒催眠の囁き)', '/images/enmu.png', null, 84,
  'Sadistic dream manipulator who merged his bodily flesh with the 8-car Mugen Train to devour 200 sleeping passengers.',
  'Severing one''s own neck inside the dream to forcefully wake into reality.'
),
(
  'kizuki-8', 'Rui', '累', 'Lower Moon (下弦)', 'Lower Moon 5 (下弦の伍)', 'Rank B',
  'Steel Threads & Blood Weave (刻糸牢・殺目籠)', '/images/rui.png', null, 76,
  'Spider demon ruler of Mount Natagumo. Spins razor-sharp crimson threads that can easily snap standard Nichirin steel katanas.',
  'Water Breathing Eleventh Form ''Dead Calm'' or concentrated Sun Breathing flare.'
),
(
  'kizuki-9', 'Kyogai', '響凱', 'Former Kizuki (元下弦)', 'Former Lower Moon 6 (元下弦の陸)', 'Rank C',
  'Tsuzumi Room Rotation (鼓の屋敷 空間転換)', '/images/kyogai.png', null, 66,
  'Former Lower Moon whose body-embedded drums disorient enemies by flipping the mansion''s rooms and firing air-slashing claws.',
  'Spatial awareness and calculating gravity trajectories between drumbeats.'
),
(
  'kizuki-10', 'Susamaru & Yahaba', '朱紗丸 & 矢琶羽', 'Blood Art Duo (異能の鬼)', 'Asakusa Incursion Duo (浅草の刺客)', 'Rank D',
  'Destructive Temari & Vector Arrows (毬遊び・紅潔の矢)', '/images/susamaru.png', '/images/yahaba.png', 58,
  'Muzan''s assassins who ambush in Asakusa. Susamaru hurls flesh-crushing temari balls guided by Yahaba''s invisible vector arrows.',
  'Yushiro''s visual talismans and twisting water defensive circles.'
)
on conflict (id) do nothing;
