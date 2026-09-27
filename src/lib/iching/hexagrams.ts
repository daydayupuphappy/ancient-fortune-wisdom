import { TRIGRAMS, type Trigram, type TrigramKey } from "./trigrams";

export interface Hexagram {
  number: number;
  chinese: string;
  pinyin: string;
  english: string;
  lower: Trigram;
  upper: Trigram;
  /** Six line values, bottom (index 0) to top (index 5). 1 = yang, 0 = yin. */
  lines: number[];
  /** Same as `lines`, as a string, bottom to top. e.g. "111111" */
  binary: string;
  theme: string;
  interpretation: string;
  keywords: string[];
}

type Row = [
  number,
  string,
  string,
  string,
  TrigramKey,
  TrigramKey,
  string,
  string,
  string[],
];

// [number, chinese, pinyin, english, lower, upper, theme, interpretation, keywords]
// King Wen sequence.
const ROWS: Row[] = [
  [1, "乾", "Qián", "The Creative", "heaven", "heaven", "Creative Power", "Strong creative energy is available, but it should be directed with awareness rather than ego.", ["initiative", "creativity", "strength", "leadership"]],
  [2, "坤", "Kūn", "The Receptive", "earth", "earth", "Receptivity", "Support and patience may achieve more than pushing. Let things take shape before acting.", ["receptivity", "patience", "nourishment", "devotion"]],
  [3, "屯", "Zhūn", "Difficulty at the Beginning", "thunder", "water", "New Beginnings", "Early struggle is part of growth. Sorting through confusion carefully may be more useful than rushing forward.", ["beginnings", "growth", "perseverance", "chaos"]],
  [4, "蒙", "Méng", "Youthful Folly", "water", "mountain", "Learning", "Inexperience is not a flaw when met with humility. Seeking guidance may serve better than guessing.", ["learning", "humility", "inexperience", "guidance"]],
  [5, "需", "Xū", "Waiting", "heaven", "water", "Patience", "Timing matters. Nourishing yourself while waiting may be wiser than forcing the moment.", ["waiting", "timing", "trust", "nourishment"]],
  [6, "讼", "Sòng", "Conflict", "water", "heaven", "Disagreement", "Tension may be present. Seeking a fair middle path can be more valuable than winning.", ["conflict", "fairness", "caution", "mediation"]],
  [7, "师", "Shī", "The Army", "water", "earth", "Discipline", "Collective effort works when there is discipline and clear purpose. Lead by example.", ["discipline", "organization", "leadership", "purpose"]],
  [8, "比", "Bǐ", "Holding Together", "earth", "water", "Union", "Connection and belonging are highlighted. Choose your alliances with sincerity.", ["union", "community", "loyalty", "belonging"]],
  [9, "小畜", "Xiǎo Chù", "Small Taming", "heaven", "wind", "Gentle Restraint", "Small, gentle influence may be more effective than a grand gesture right now.", ["restraint", "subtlety", "small steps", "patience"]],
  [10, "履", "Lǚ", "Treading", "lake", "heaven", "Careful Conduct", "Walk carefully but confidently. Good manners and awareness of others can open the path.", ["conduct", "care", "respect", "confidence"]],
  [11, "泰", "Tài", "Peace", "heaven", "earth", "Harmony", "A time of flow and ease. Enjoy it, and lay foundations while conditions are favorable.", ["peace", "harmony", "prosperity", "flow"]],
  [12, "否", "Pǐ", "Standstill", "earth", "heaven", "Stagnation", "Not every moment is for action. Preserving your integrity during stagnation may matter most.", ["standstill", "retreat", "integrity", "patience"]],
  [13, "同人", "Tóng Rén", "Fellowship", "fire", "heaven", "Community", "Shared goals bring people together. Openness may create meaningful fellowship.", ["fellowship", "openness", "shared purpose", "trust"]],
  [14, "大有", "Dà Yǒu", "Great Possession", "heaven", "fire", "Abundance", "Resources and strength may be at hand. Generosity and modesty keep abundance healthy.", ["abundance", "generosity", "clarity", "responsibility"]],
  [15, "谦", "Qiān", "Modesty", "mountain", "earth", "Humility", "Quiet competence may carry further than display. Let the work speak.", ["modesty", "balance", "humility", "grounding"]],
  [16, "豫", "Yù", "Enthusiasm", "earth", "thunder", "Enthusiasm", "Genuine enthusiasm can move others. Let joy lead, but keep your footing.", ["enthusiasm", "inspiration", "music", "momentum"]],
  [17, "随", "Suí", "Following", "thunder", "lake", "Adaptability", "Adapting to circumstances is a form of strength. Consider what is worth following.", ["following", "adaptability", "trust", "flexibility"]],
  [18, "蛊", "Gǔ", "Work on What Has Been Spoiled", "wind", "mountain", "Repair", "Something may need mending. Careful, honest repair can renew what has decayed.", ["repair", "renewal", "responsibility", "healing"]],
  [19, "临", "Lín", "Approach", "lake", "earth", "Approach", "Something is drawing near. Meet it with warmth and attentiveness.", ["approach", "growth", "openness", "care"]],
  [20, "观", "Guān", "Contemplation", "earth", "wind", "Perspective", "Stepping back to observe may reveal more than acting. See the wider view.", ["contemplation", "perspective", "observation", "insight"]],
  [21, "噬嗑", "Shì Kè", "Biting Through", "thunder", "fire", "Decisiveness", "An obstacle may need clear, decisive attention. Address what has been avoided.", ["decisiveness", "justice", "clarity", "resolution"]],
  [22, "贲", "Bì", "Grace", "fire", "mountain", "Beauty", "Form and beauty have their place. Appreciate elegance without mistaking it for substance.", ["grace", "beauty", "form", "aesthetics"]],
  [23, "剥", "Bō", "Splitting Apart", "earth", "mountain", "Letting Go", "Something may be falling away. Releasing what no longer holds can make room for renewal.", ["release", "endings", "acceptance", "patience"]],
  [24, "复", "Fù", "Return", "thunder", "earth", "Renewal", "A turning point. Small returns to what matters can quietly rebuild momentum.", ["return", "renewal", "cycles", "recovery"]],
  [25, "无妄", "Wú Wàng", "Innocence", "thunder", "heaven", "Authenticity", "Acting from sincerity rather than calculation may serve you well now.", ["innocence", "sincerity", "spontaneity", "authenticity"]],
  [26, "大畜", "Dà Chù", "Great Taming", "heaven", "mountain", "Accumulated Strength", "Holding power in reserve builds capacity. Focus and restraint can compound.", ["restraint", "accumulation", "focus", "potential"]],
  [27, "颐", "Yí", "Nourishment", "thunder", "mountain", "Nourishment", "Consider what you are feeding, body, mind, and attention. Choose nourishment wisely.", ["nourishment", "care", "attention", "sustenance"]],
  [28, "大过", "Dà Guò", "Great Exceeding", "wind", "lake", "Pressure", "A load may feel heavy. Extraordinary moments call for steadiness, not heroics.", ["pressure", "excess", "steadiness", "courage"]],
  [29, "坎", "Kǎn", "The Abysmal", "water", "water", "Depth", "Uncertainty may be present. Moving through it steadily, like water, can be a strength.", ["depth", "danger", "flow", "resilience"]],
  [30, "离", "Lí", "The Clinging", "fire", "fire", "Clarity", "Brightness and awareness are highlighted. Stay attached to what gives light.", ["clarity", "awareness", "warmth", "attachment"]],
  [31, "咸", "Xián", "Influence", "mountain", "lake", "Influence", "Attraction and connection may be stirring. Gentle openness invites resonance.", ["influence", "attraction", "connection", "openness"]],
  [32, "恒", "Héng", "Duration", "wind", "thunder", "Consistency", "Steadiness over time builds what matters. Consider what deserves lasting commitment.", ["duration", "consistency", "endurance", "commitment"]],
  [33, "遁", "Dùn", "Retreat", "mountain", "heaven", "Strategic Retreat", "Stepping back can be strength rather than defeat. Preserve energy for the right moment.", ["retreat", "strategy", "boundaries", "preservation"]],
  [34, "大壮", "Dà Zhuàng", "Great Power", "heaven", "thunder", "Strength", "Power may be available. Pair it with restraint and awareness so it serves rather than dominates.", ["power", "vigor", "restraint", "confidence"]],
  [35, "晋", "Jìn", "Progress", "earth", "fire", "Advancement", "Forward motion may be supported. Progress paired with clarity can open doors.", ["progress", "advancement", "recognition", "clarity"]],
  [36, "明夷", "Míng Yí", "Darkening of the Light", "fire", "earth", "Inner Light", "Outer conditions may feel dim. Protect your inner clarity and choose your moments.", ["protection", "inner light", "discretion", "endurance"]],
  [37, "家人", "Jiā Rén", "The Family", "fire", "wind", "Belonging", "Home and close relationships are highlighted. Clear roles and warmth create stability.", ["family", "belonging", "roles", "warmth"]],
  [38, "睽", "Kuí", "Opposition", "lake", "fire", "Difference", "Differences may surface. Understanding another view may reveal unexpected common ground.", ["opposition", "difference", "understanding", "tolerance"]],
  [39, "蹇", "Jiǎn", "Obstruction", "mountain", "water", "Obstacles", "A path may feel blocked. Consider whether to pause, seek help, or find another route.", ["obstacles", "patience", "reflection", "help"]],
  [40, "解", "Xiè", "Deliverance", "water", "thunder", "Release", "Tension may be loosening. Move forward lightly and forgive what can be forgiven.", ["release", "relief", "forgiveness", "freedom"]],
  [41, "损", "Sǔn", "Decrease", "lake", "mountain", "Simplicity", "Less may be more. Simplifying can reveal what is essential.", ["decrease", "simplicity", "sacrifice", "sincerity"]],
  [42, "益", "Yì", "Increase", "thunder", "wind", "Growth", "Conditions may favor expansion. Share the benefit and act with generosity.", ["increase", "growth", "generosity", "opportunity"]],
  [43, "夬", "Guài", "Breakthrough", "heaven", "lake", "Resolution", "A breakthrough may be near. Be clear and firm, but avoid harshness.", ["breakthrough", "resolution", "clarity", "determination"]],
  [44, "姤", "Gòu", "Coming to Meet", "wind", "heaven", "Encounter", "Unexpected encounters may arise. Stay attentive to what is entering your life.", ["encounter", "temptation", "awareness", "boundaries"]],
  [45, "萃", "Cuì", "Gathering Together", "earth", "lake", "Gathering", "People and resources may be drawing together. Shared purpose gives a gathering meaning.", ["gathering", "community", "purpose", "celebration"]],
  [46, "升", "Shēng", "Pushing Upward", "wind", "earth", "Gradual Progress", "Momentum comes through consistent action rather than force. A small step taken with intention may matter more than a dramatic move.", ["progress", "growth", "effort", "ascent"]],
  [47, "困", "Kùn", "Oppression", "water", "lake", "Constraint", "Limits may be pressing. Inner steadiness matters more than outer circumstances right now.", ["constraint", "exhaustion", "endurance", "inner strength"]],
  [48, "井", "Jǐng", "The Well", "wind", "water", "Deep Resources", "Reliable inner resources are available. Draw from what nourishes, and keep the well clear.", ["resources", "depth", "reliability", "nourishment"]],
  [49, "革", "Gé", "Revolution", "fire", "lake", "Transformation", "Change may be called for. Time it well and communicate clearly.", ["change", "transformation", "timing", "renewal"]],
  [50, "鼎", "Dǐng", "The Cauldron", "wind", "fire", "Refinement", "Something is being transformed into nourishment. Culture, craft, and care refine raw material.", ["refinement", "culture", "transformation", "nourishment"]],
  [51, "震", "Zhèn", "The Arousing", "thunder", "thunder", "Awakening", "A jolt may arrive. Shock can clear the air and wake attention.", ["shock", "awakening", "movement", "alertness"]],
  [52, "艮", "Gèn", "Keeping Still", "mountain", "mountain", "Stillness", "Stillness is an action too. Pausing may bring clarity that motion cannot.", ["stillness", "meditation", "pause", "grounding"]],
  [53, "渐", "Jiàn", "Development", "mountain", "wind", "Gradual Development", "Slow, steady progress may be the way. Trust the pace of natural growth.", ["gradual", "development", "patience", "steadiness"]],
  [54, "归妹", "Guī Mèi", "The Marrying Maiden", "lake", "thunder", "Transitions", "Entering a new arrangement may require adjustment. Know your place in it with grace.", ["transition", "relationships", "adjustment", "tact"]],
  [55, "丰", "Fēng", "Abundance", "fire", "thunder", "Fullness", "A peak moment. Enjoy fullness without assuming it is permanent.", ["abundance", "fullness", "peak", "brilliance"]],
  [56, "旅", "Lǚ", "The Wanderer", "mountain", "fire", "Journey", "You may be in unfamiliar territory. Travel lightly and treat hosts with respect.", ["journey", "travel", "impermanence", "adaptability"]],
  [57, "巽", "Xùn", "The Gentle", "wind", "wind", "Gentle Influence", "Persistent, gentle effort may penetrate where force cannot.", ["gentleness", "penetration", "persistence", "subtlety"]],
  [58, "兑", "Duì", "The Joyous", "lake", "lake", "Joy", "Joy and openness are highlighted. Shared delight builds real connection.", ["joy", "openness", "pleasure", "communication"]],
  [59, "涣", "Huàn", "Dispersion", "water", "wind", "Dissolving", "Rigidity may be dissolving. Let what is stuck begin to flow again.", ["dispersion", "dissolving", "release", "reunion"]],
  [60, "节", "Jié", "Limitation", "lake", "water", "Boundaries", "Healthy limits create freedom. Consider where structure would help.", ["limits", "boundaries", "structure", "moderation"]],
  [61, "中孚", "Zhōng Fú", "Inner Truth", "lake", "wind", "Sincerity", "Sincerity may resonate with others. Truth held at the center invites trust.", ["sincerity", "trust", "truth", "resonance"]],
  [62, "小过", "Xiǎo Guò", "Small Exceeding", "mountain", "thunder", "Small Matters", "Attend to small details. Modest care may be more suitable than bold moves.", ["details", "modesty", "care", "small steps"]],
  [63, "既济", "Jì Jì", "After Completion", "fire", "water", "Completion", "Something has come together. Maintain it carefully; completion asks for attention, not complacency.", ["completion", "maintenance", "balance", "vigilance"]],
  [64, "未济", "Wèi Jì", "Before Completion", "water", "fire", "Almost There", "The goal is near but not yet reached. Careful, steady steps may carry you across.", ["transition", "anticipation", "care", "perseverance"]],
];

export const HEXAGRAMS: Hexagram[] = ROWS.map(
  ([number, chinese, pinyin, english, lowerKey, upperKey, theme, interpretation, keywords]) => {
    const lower = TRIGRAMS[lowerKey];
    const upper = TRIGRAMS[upperKey];
    const lines = [...lower.lines, ...upper.lines];
    return {
      number,
      chinese,
      pinyin,
      english,
      lower,
      upper,
      lines,
      binary: lines.join(""),
      theme,
      interpretation,
      keywords,
    };
  },
);

const BY_BINARY = new Map(HEXAGRAMS.map((h) => [h.binary, h]));

export function getHexagram(number: number): Hexagram {
  const h = HEXAGRAMS[number - 1];
  if (!h) throw new Error(`Invalid hexagram number ${number}`);
  return h;
}

/** Lines are bottom to top, 1 = yang, 0 = yin. */
export function hexagramFromLines(lines: readonly number[]): Hexagram {
  const key = lines.join("");
  const h = BY_BINARY.get(key);
  if (!h) throw new Error(`No hexagram for lines ${key}`);
  return h;
}
