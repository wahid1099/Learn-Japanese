import type { KanaChar, KanaRow, KanaKind } from '@/types';

// Hand-tuned SVG stroke paths inside a 100x100 viewBox.
// Each character has 1-5 strokes ordered top-to-bottom, left-to-right.
type Stroke = { d: string; w?: number };

// Master composition table: most kana are well-known shapes; we render
// them via clean SVG primitives composed at runtime in the component.
// To keep this file compact and reliable, we instead encode each glyph
// as a small SVG fragment. The component handles stroke animation by
// drawing them in sequence using the stroke array's `d` paths.

const S = (d: string, w = 4): Stroke => ({ d, w });

// --- Base kana strokes (a, i, u, e, o) ---
const BASE: Record<string, Stroke[][]> = {
  a:  [[S('M50 20 C30 20 22 40 26 60 C30 80 50 84 50 84')],[S('M50 84 C60 84 70 72 70 58')],[S('M30 46 C40 50 60 50 70 46')]],
  i:  [[S('M34 26 C34 60 32 78 30 84')],[S('M70 26 C70 60 68 78 66 84')]],
  u:  [[S('M28 30 C50 30 50 60 30 64 C20 66 18 76 30 78 C40 80 50 70 54 60')],[S('M50 36 C58 50 66 70 70 86')]],
  e:  [[S('M28 30 L72 30')],[S('M72 30 C72 46 50 50 30 50 L72 50')],[S('M72 50 L30 70')]],
  o:  [[S('M30 30 C70 30 70 50 50 50 C30 50 30 70 50 70 C70 70 70 50')]],
};

// Row helper: append base sound to consonant prefix.
const ROW_BASE: Record<string, string[]> = {
  '':  ['a','i','u','e','o'],
  k:   ['ka','ki','ku','ke','ko'],
  s:   ['sa','shi','su','se','so'],
  t:   ['ta','chi','tsu','te','to'],
  n:   ['na','ni','nu','ne','no'],
  h:   ['ha','hi','fu','he','ho'],
  m:   ['ma','mi','mu','me','mo'],
  y:   ['ya','','yu','','yo'],
  r:   ['ra','ri','ru','re','ro'],
  w:   ['wa','','','','wo'],
  g:   ['ga','gi','gu','ge','go'],
  z:   ['za','ji','zu','ze','zo'],
  d:   ['da','','du','de','do'],
  b:   ['ba','bi','bu','be','bo'],
  p:   ['pa','pi','pu','pe','po'],
  ky:  ['kya','','kyu','','kyo'],
  sh:  ['sha','','shu','','sho'],
  ch:  ['cha','','chu','','cho'],
  ny:  ['nya','','nyu','','nyo'],
  hy:  ['hya','','hyu','','hyo'],
  my:  ['mya','','myu','','myo'],
  ry:  ['rya','','ryu','','ryo'],
  gy:  ['gya','','gyu','','gyo'],
  j:   ['ja','','ju','','jo'],
  by:  ['bya','','byu','','byo'],
  py:  ['pya','','pyu','','pyo'],
};

// Mnemonics (English, memorable)
const MNEMONICS: Record<string, string> = {
  'a':'A wish pointing skyward with arms wide open.',
  'i':'Two needles standing together.',
  'u':'A hanging flute swinging in the breeze.',
  'e':'An "e" with one kick — energetic exit.',
  'o':'A ribbon twisting into a loop — the letter O.',
  'ka':'A slim "k" with a confident diagonal kick.',
  'ki':'A standing "k" with crossed swords.',
  'ku':'A bent wing diving down, caw of a crow.',
  'ke':'A door-shaped "k" with a kicker.',
  'ko':'A "k" with a clean right-angle cap.',
  'sa':'A runway crossing an X.',
  'shi':'A pair of hooks catching fish — "she".',
  'su':'A fishing line with a swinging thread.',
  'se':'A flowing stream into a back wave.',
  'so':'A threaded needle bundled at the base.',
  'ta':'A T balanced by a curl below.',
  'chi':'A tea-cher with a hooked cane.',
  'tsu':'A "tu" with a swift flick: っ is just a short version.',
  'te':'A "t" with a tall cross.',
  'to':'A T wearing a hat tilted forward.',
  'na':'A "n" with a balanced crossbar.',
  'ni':'Two character pillars with a crossbeam.',
  'nu':'A needle with a cross-stitch of thread.',
  'ne':'A cat sleeping curled up (ね = "hey").',
  'no':'A no symbol made of "n" and an O.',
  'ha':'A flowing hairline with two side dashes (は = "HA-ha").',
  'hi':'An "h" with a long vertical smile.',
  'fu':'A whirlwind coming from a face — フ "whoosh".',
  'he':'A fenced cross (the legendary へ "hey").',
  'ho':"A roof: a horizontal beam with vertical posts — 木-style.",
  'ma':'A horse with two pointy ears.',
  'mi':'Twenty-three (二三) turning into a "m".',
  'mu':'A "mu" with two gravity lines.',
  'me':'A wide eye (目) — the "meh" eye.',
  'mo':'A blanket (毛) shaped "mo".',
  'ya':'A leaning "y" with a curl, yaaay!',
  'yu':'A hooked fishing line "yu" + a curve.',
  'yo':'A dancing "yo" — arm and leg.',
  'ra':'A "ra" wearing a small bar of sun.',
  'ri':'Two strokes balancing on a base — "ri".',
  'ru':'A flow with a final dot at the bottom.',
  're':'A twisting "re" — hook + curve.',
  'ro':'A piston with the brim of "ro".',
  'wa':'A "wa" with a wide-hipped bowl.',
  'wo':'A double-loop "wo" — the only one.',
  'n':'A single hanging — the lonely letter "n" of Japanese.',
  'ga':'A "ka" with a double-tennis accent.',
  'gi':'A "ki" with the voiced accent.',
  'gu':'A "ku" with the voiced accent.',
  'ge':'A "ke" with the voiced accent.',
  'go':'A "ko" with the voiced accent.',
  'za':"A twisted 'sa' with voicing mark.",
  'ji':'A pair of hooks catching fish — voiced.',
  'zu':"A 'su' with a voice crack.",
  'ze':"A 'se' with voice.",
  'zo':"A 'so' with voice.",
  'da':"A 'ta' with voice crack.",
  'ji2':"A 'chi' voiced.",
  'du':"A 'tsu' voiced.",
  'de':"A 'te' with voice.",
  'do':"A 'to' with voice.",
  'ba':"A 'ha' with voice — 'ba' boom.",
  'bi':"A 'hi' with voice — bzz.",
  'bu':"A 'fu' with voice — buzz.",
  'be':"A 'he' with voice — bell.",
  'bo':"A 'ho' with voice — bonk.",
  'pa':"A 'ha' with circle — pop!",
  'pi':"A 'hi' with circle — pip.",
  'pu':"A 'fu' with circle — poof.",
  'pe':"A 'he' with circle — pep.",
  'po':"A 'ho' with circle — pop.",
  'kya':"A small 'ya' combo of ki+ya.",
  'kyu':"A 'ki' + 'yu' combo.",
  'kyo':"A 'ki' + 'yo' combo.",
  'sha':"shi + small ya — fresh.",
  'shu':"shi + yu — shoe!",
  'sho':"shi + yo — showtime.",
  'cha':"chi + small ya — cha-cha.",
  'chu':"chi + yu — chew!",
  'cho':"chi + yo — choo-choo.",
  'nya':"ni + small ya — nyan (cat).",
  'nyu':"ni + yu — new!",
  'nyo':"ni + yo — NYO!",
  'hya':"hi + small ya — huh-ya.",
  'hyu':"hi + yu — hue.",
  'hyo':"hi + yo — h'yo!",
  'mya':"mi + small ya — miaow.",
  'myu':"mi + yu — mew.",
  'myo':"mi + yo — myo hoo!",
  'rya':"ri + small ya — ryaa.",
  'ryu':"ri + yu — dragon ryu!",
  'ryo':"ri + yo — ryo!",
  'gya':"gi + small ya.",
  'gyu':"gi + yu — beef (gyu).",
  'gyo':"gi + yo — gyoza!",
  'ja':"ji + small ya — ja!",
  'ju':"ji + yu — jewel? ジュース.",
  'jo':"ji + yo — joy.",
  'bya':"bi + small ya.",
  'byu':"bi + yu — beauty.",
  'byo':"bi + yo — bio.",
  'pya':"pi + small ya.",
  'pyu':"pi + yu — pew!",
  'pyo':"pi + yo — pio.",
};

// Example words (short, recognizable)
const EXAMPLES: Record<string, { word: string; reading: string; meaning: string }> = {
  'a':{ word:'あめ', reading:'ame', meaning:'rain' },
  'i':{ word:'いぬ', reading:'inu', meaning:'dog' },
  'u':{ word:'うみ', reading:'umi', meaning:'sea' },
  'e':{ word:'えき', reading:'eki', meaning:'station' },
  'o':{ word:'おちゃ', reading:'ocha', meaning:'tea' },
  'ka':{ word:'かさ', reading:'kasa', meaning:'umbrella' },
  'ki':{ word:'きって', reading:'kitte', meaning:'stamp' },
  'ku':{ word:'くるま', reading:'kuruma', meaning:'car' },
  'ke':{ word:'けしき', reading:'keshiki', meaning:'scenery' },
  'ko':{ word:'こえ', reading:'koe', meaning:'voice' },
  'sa':{ word:'さくら', reading:'sakura', meaning:'cherry blossom' },
  'shi':{ word:'しんぶん', reading:'shinbun', meaning:'newspaper' },
  'su':{ word:'すし', reading:'sushi', meaning:'sushi' },
  'se':{ word:'せんせい', reading:'sensei', meaning:'teacher' },
  'so':{ word:'そら', reading:'sora', meaning:'sky' },
  'ta':{ word:'たまご', reading:'tamago', meaning:'egg' },
  'chi':{ word:'ちず', reading:'chizu', meaning:'map' },
  'tsu':{ word:'つき', reading:'tsuki', meaning:'moon' },
  'te':{ word:'てがみ', reading:'tegami', meaning:'letter' },
  'to':{ word:'とり', reading:'tori', meaning:'bird' },
  'na':{ word:'なまえ', reading:'namae', meaning:'name' },
  'ni':{ word:'にく', reading:'niku', meaning:'meat' },
  'nu':{ word:'いぬ', reading:'inu', meaning:'dog' },
  'ne':{ word:'ねこ', reading:'neko', meaning:'cat' },
  'no':{ word:'のみもの', reading:'nomimono', meaning:'drink' },
  'ha':{ word:'はな', reading:'hana', meaning:'flower' },
  'hi':{ word:'ひと', reading:'hito', meaning:'person' },
  'fu':{ word:'ふゆ', reading:'fuyu', meaning:'winter' },
  'he':{ word:'へや', reading:'heya', meaning:'room' },
  'ho':{ word:'ほし', reading:'hoshi', meaning:'star' },
  'ma':{ word:'まど', reading:'mado', meaning:'window' },
  'mi':{ word:'みず', reading:'mizu', meaning:'water' },
  'mu':{ word:'むし', reading:'mushi', meaning:'insect' },
  'me':{ word:'め', reading:'me', meaning:'eye' },
  'mo':{ word:'もり', reading:'mori', meaning:'forest' },
  'ya':{ word:'やま', reading:'yama', meaning:'mountain' },
  'yu':{ word:'ゆき', reading:'yuki', meaning:'snow' },
  'yo':{ word:'よる', reading:'yoru', meaning:'night' },
  'ra':{ word:'らくだ', reading:'rakuda', meaning:'camel' },
  'ri':{ word:'りんご', reading:'ringo', meaning:'apple' },
  'ru':{ word:'るす', reading:'rusu', meaning:'absent' },
  're':{ word:'れい', reading:'rei', meaning:'zero' },
  'ro':{ word:'ろうそく', reading:'rousoku', meaning:'candle' },
  'wa':{ word:'わたし', reading:'watashi', meaning:'I/me' },
  'wo':{ word:'ほん を よむ', reading:'hon o yomu', meaning:'read a book' },
  'n':{ word:'ほん', reading:'hon', meaning:'book' },
  'ga':{ word:'がくせい', reading:'gakusei', meaning:'student' },
  'gi':{ word:'ぎんこう', reading:'ginkou', meaning:'bank' },
  'gu':{ word:'ぐんま', reading:'Gunma', meaning:'Gunma pref.' },
  'ge':{ word:'げき', reading:'geki', meaning:'drama' },
  'go':{ word:'ごみ', reading:'gomi', meaning:'trash' },
  'za':{ word:'ざっし', reading:'zasshi', meaning:'magazine' },
  'ji':{ word:'じてんしゃ', reading:'jitensha', meaning:'bicycle' },
  'zu':{ word:'ずかん', reading:'zukan', meaning:'picture book' },
  'ze':{ word:'ぜんぶ', reading:'zenbu', meaning:'all' },
  'zo':{ word:'ぞう', reading:'zou', meaning:'elephant' },
  'da':{ word:'だいすき', reading:'daisuki', meaning:'love (a lot)' },
  'du':{ word:'おんど', reading:'ondo', meaning:'temperature' },
  'de':{ word:'でんしゃ', reading:'densha', meaning:'train' },
  'do':{ word:'どうぶつ', reading:'doubutsu', meaning:'animal' },
  'ba':{ word:'ばんごう', reading:'bangou', meaning:'number' },
  'bi':{ word:'びじゅつ', reading:'bijutsu', meaning:'art' },
  'bu':{ word:'ぶた', reading:'buta', meaning:'pig' },
  'be':{ word:'べんり', reading:'benri', meaning:'convenient' },
  'bo':{ word:'ぼうし', reading:'boushi', meaning:'hat' },
  'pa':{ word:'ぱん', reading:'pan', meaning:'bread' },
  'pi':{ word:'ぴあの', reading:'piano', meaning:'piano' },
  'pu':{ word:'ぷーさん', reading:'Pu-san', meaning:'Winnie the Pooh' },
  'pe':{ word:'ぺん', reading:'pen', meaning:'pen' },
  'po':{ word:'ぽすと', reading:'posuto', meaning:'post box' },
  'kya':{ word:'きゃべつ', reading:'kyabetsu', meaning:'cabbage' },
  'kyu':{ word:'きゅう', reading:'kyuu', meaning:'nine' },
  'kyo':{ word:'きょう', reading:'kyou', meaning:'today' },
  'sha':{ word:'しゃしん', reading:'shashin', meaning:'photo' },
  'shu':{ word:'しゅう', reading:'shuu', meaning:'week' },
  'sho':{ word:'しょうがくせい', reading:'shougakusei', meaning:'elementary pupil' },
  'cha':{ word:'ちゃ', reading:'cha', meaning:'tea' },
  'chu':{ word:'ちゅう', reading:'chuu', meaning:'middle' },
  'cho':{ word:'ちょう', reading:'chou', meaning:'butterfly / length' },
  'nya':{ word:'にゃん', reading:'nyan', meaning:'meow' },
  'nyu':{ word:'にゅう', reading:'nyuu', meaning:'entering' },
  'nyo':{ word:'にょろ', reading:'nyoro', meaning:'slither' },
  'hya':{ word:'ひゃく', reading:'hyaku', meaning:'hundred' },
  'hyu':{ word:'ヒューマノイド', reading:'hyu-manoido', meaning:'humanoid' },
  'hyo':{ word:'ひょう', reading:'hyou', meaning:'leopard' },
  'mya':{ word:'ミャンマー', reading:'Myanmar', meaning:'Myanmar' },
  'myu':{ word:'ミューズ', reading:'myuuzu', meaning:'muse' },
  'myo':{ word:'みょうにち', reading:'myounichi', meaning:'tomorrow (hon.)' },
  'rya':{ word:'りゃん', reading:'ryan', meaning:'Ryan’s boat' },
  'ryu':{ word:'りゅう', reading:'ryuu', meaning:'dragon' },
  'ryo':{ word:'りょう', reading:'ryou', meaning:'dormitory' },
  'gya':{ word:'ぎゃく', reading:'gyaku', meaning:'reverse' },
  'gyu':{ word:'ぎゅうどん', reading:'gyuudon', meaning:'beef bowl' },
  'gyo':{ word:'ぎょうざ', reading:'gyouza', meaning:'gyoza' },
  'ja':{ word:'じゃ', reading:'ja', meaning:"well (then)" },
  'ju':{ word:'じゅう', reading:'juu', meaning:'ten' },
  'jo':{ word:'じょうず', reading:'jouzu', meaning:'skilled' },
  'bya':{ word:'びゃく', reading:'byaku', meaning:'counter for vol.' },
  'byu':{ word:'ビュー', reading:'byuu', meaning:'view' },
  'byo':{ word:'びょう', reading:'byou', meaning:'second / illness' },
  'pya':{ word:'ぴゃあ', reading:'pyaa', meaning:'pyow!' },
  'pyu':{ word:'ピュア', reading:'pyua', meaning:'pure' },
  'pyo':{ word:'ぴょこ', reading:'pyoko', meaning:'peep' },
};

// Pronunciation reference using Japanese text: we use Web Speech API with ja-JP voice at call site.
// The data only carries the actual character; audio is synthesized.

// Map romaji -> character (the canonical mapping we are confident about)
const ROMAJI_HIRA: Record<string, string> = {
  a:'あ', i:'い', u:'う', e:'え', o:'お',
  ka:'か', ki:'き', ku:'く', ke:'け', ko:'こ',
  sa:'さ', shi:'し', su:'す', se:'せ', so:'そ',
  ta:'た', chi:'ち', tsu:'つ', te:'て', to:'と',
  na:'な', ni:'に', nu:'ぬ', ne:'ね', no:'の',
  ha:'は', hi:'ひ', fu:'ふ', he:'へ', ho:'ほ',
  ma:'ま', mi:'み', mu:'む', me:'め', mo:'も',
  ya:'や', yu:'ゆ', yo:'よ',
  ra:'ら', ri:'り', ru:'る', re:'れ', ro:'ろ',
  wa:'わ', wo:'を', n:'ん',
  ga:'が', gi:'ぎ', gu:'ぐ', ge:'げ', go:'ご',
  za:'ざ', ji:'じ', zu:'ず', ze:'ぜ', zo:'ぞ',
  da:'だ', du:'づ', de:'で', do:'ど',
  ba:'ば', bi:'び', bu:'ぶ', be:'べ', bo:'ぼ',
  pa:'ぱ', pi:'ぴ', pu:'ぷ', pe:'ぺ', po:'ぽ',
  kya:'きゃ', kyu:'きゅ', kyo:'きょ',
  sha:'しゃ', shu:'しゅ', sho:'しょ',
  cha:'ちゃ', chu:'ちゅ', cho:'ちょ',
  nya:'にゃ', nyu:'にゅ', nyo:'にょ',
  hya:'ひゃ', hyu:'ひゅ', hyo:'ひょ',
  mya:'みゃ', myu:'みゅ', myo:'みょ',
  rya:'りゃ', ryu:'りゅ', ryo:'りょ',
  gya:'ぎゃ', gyu:'ぎゅ', gyo:'ぎょ',
  ja:'じゃ', ju:'じゅ', jo:'じょ',
  bya:'びゃ', byu:'びゅ', byo:'びょ',
  pya:'ぴゃ', pyu:'ぴゅ', pyo:'ぴょ',
};

const ROMAJI_KATA: Record<string, string> = {
  a:'ア', i:'イ', u:'ウ', e:'エ', o:'オ',
  ka:'カ', ki:'キ', ku:'ク', ke:'ケ', ko:'コ',
  sa:'サ', shi:'シ', su:'ス', se:'セ', so:'ソ',
  ta:'タ', chi:'チ', tsu:'ツ', te:'テ', to:'ト',
  na:'ナ', ni:'ニ', nu:'ヌ', ne:'ネ', no:'ノ',
  ha:'ハ', hi:'ヒ', fu:'フ', he:'ヘ', ho:'ホ',
  ma:'マ', mi:'ミ', mu:'ム', me:'メ', mo:'モ',
  ya:'ヤ', yu:'ユ', yo:'ヨ',
  ra:'ラ', ri:'リ', ru:'ル', re:'レ', ro:'ロ',
  wa:'ワ', wo:'ヲ', n:'ン',
  ga:'ガ', gi:'ギ', gu:'グ', ge:'ゲ', go:'ゴ',
  za:'ザ', ji:'ジ', zu:'ズ', ze:'ゼ', zo:'ゾ',
  da:'ダ', du:'ヅ', de:'デ', do:'ド',
  ba:'バ', bi:'ビ', bu:'ブ', be:'ベ', bo:'ボ',
  pa:'パ', pi:'ピ', pu:'プ', pe:'ペ', po:'ポ',
  kya:'キャ', kyu:'キュ', kyo:'キョ',
  sha:'シャ', shu:'シュ', sho:'ショ',
  cha:'チャ', chu:'チュ', cho:'チョ',
  nya:'ニャ', nyu:'ニュ', nyo:'ニョ',
  hya:'ヒャ', hyu:'ヒュ', hyo:'ヒョ',
  mya:'ミャ', myu:'ミュ', myo:'ミョ',
  rya:'リャ', ryu:'リュ', ryo:'リョ',
  gya:'ギャ', gyu:'ギュ', gyo:'ギョ',
  ja:'ジャ', ju:'ジュ', jo:'ジョ',
  bya:'ビャ', byu:'ビュ', byo:'ビョ',
  pya:'ピャ', pyu:'ピュ', pyo:'ピョ',
};

// Classify each by row + kind
function classify(romaji: string): { row: KanaRow; kind: KanaKind } {
  if (romaji === 'n') return { row: 'n', kind: 'base' };
  if (['a','i','u','e','o'].includes(romaji)) return { row: 'a', kind: 'base' };
  if (['ka','ga','kya','gya'].some(p => romaji.startsWith(p))) return { row: 'ka', kind: romaji.endsWith('a')||romaji.endsWith('u')||romaji.endsWith('o')? romaji.startsWith('g')?'dakuon':'youon':'base' } as { row: KanaRow; kind: KanaKind };
  // We'll do a thorough table-driven classification
  const TABLE: Array<{ prefix: string; row: KanaRow; kind: KanaKind }> = [
    { prefix:'kya', row:'ka', kind:'youon' }, { prefix:'kyu', row:'ka', kind:'youon' }, { prefix:'kyo', row:'ka', kind:'youon' },
    { prefix:'ka', row:'ka', kind:'base' }, { prefix:'ki', row:'ka', kind:'base' }, { prefix:'ku', row:'ka', kind:'base' }, { prefix:'ke', row:'ka', kind:'base' }, { prefix:'ko', row:'ka', kind:'base' },
    { prefix:'gya', row:'ka', kind:'dakuon' }, { prefix:'gyu', row:'ka', kind:'dakuon' }, { prefix:'gyo', row:'ka', kind:'dakuon' },
    { prefix:'ga', row:'ka', kind:'dakuon' }, { prefix:'gi', row:'ka', kind:'dakuon' }, { prefix:'gu', row:'ka', kind:'dakuon' }, { prefix:'ge', row:'ka', kind:'dakuon' }, { prefix:'go', row:'ka', kind:'dakuon' },

    { prefix:'sha', row:'sa', kind:'youon' }, { prefix:'shu', row:'sa', kind:'youon' }, { prefix:'sho', row:'sa', kind:'youon' },
    { prefix:'sa', row:'sa', kind:'base' }, { prefix:'shi', row:'sa', kind:'base' }, { prefix:'su', row:'sa', kind:'base' }, { prefix:'se', row:'sa', kind:'base' }, { prefix:'so', row:'sa', kind:'base' },
    { prefix:'za', row:'sa', kind:'dakuon' }, { prefix:'ji', row:'sa', kind:'dakuon' }, { prefix:'zu', row:'sa', kind:'dakuon' }, { prefix:'ze', row:'sa', kind:'dakuon' }, { prefix:'zo', row:'sa', kind:'dakuon' },

    { prefix:'cha', row:'ta', kind:'youon' }, { prefix:'chu', row:'ta', kind:'youon' }, { prefix:'cho', row:'ta', kind:'youon' },
    { prefix:'ta', row:'ta', kind:'base' }, { prefix:'chi', row:'ta', kind:'base' }, { prefix:'tsu', row:'ta', kind:'base' }, { prefix:'te', row:'ta', kind:'base' }, { prefix:'to', row:'ta', kind:'base' },
    { prefix:'da', row:'ta', kind:'dakuon' }, { prefix:'du', row:'ta', kind:'dakuon' }, { prefix:'de', row:'ta', kind:'dakuon' }, { prefix:'do', row:'ta', kind:'dakuon' },

    { prefix:'na', row:'na', kind:'base' }, { prefix:'ni', row:'na', kind:'base' }, { prefix:'nu', row:'na', kind:'base' }, { prefix:'ne', row:'na', kind:'base' }, { prefix:'no', row:'na', kind:'base' },
    { prefix:'nya', row:'na', kind:'youon' }, { prefix:'nyu', row:'na', kind:'youon' }, { prefix:'nyo', row:'na', kind:'youon' },

    { prefix:'ha', row:'ha', kind:'base' }, { prefix:'hi', row:'ha', kind:'base' }, { prefix:'fu', row:'ha', kind:'base' }, { prefix:'he', row:'ha', kind:'base' }, { prefix:'ho', row:'ha', kind:'base' },
    { prefix:'ba', row:'ha', kind:'dakuon' }, { prefix:'bi', row:'ha', kind:'dakuon' }, { prefix:'bu', row:'ha', kind:'dakuon' }, { prefix:'be', row:'ha', kind:'dakuon' }, { prefix:'bo', row:'ha', kind:'dakuon' },
    { prefix:'pa', row:'ha', kind:'handakuon' }, { prefix:'pi', row:'ha', kind:'handakuon' }, { prefix:'pu', row:'ha', kind:'handakuon' }, { prefix:'pe', row:'ha', kind:'handakuon' }, { prefix:'po', row:'ha', kind:'handakuon' },
    { prefix:'hya', row:'ha', kind:'youon' }, { prefix:'hyu', row:'ha', kind:'youon' }, { prefix:'hyo', row:'ha', kind:'youon' },
    { prefix:'bya', row:'ha', kind:'youon' }, { prefix:'byu', row:'ha', kind:'youon' }, { prefix:'byo', row:'ha', kind:'youon' },
    { prefix:'pya', row:'ha', kind:'youon' }, { prefix:'pyu', row:'ha', kind:'youon' }, { prefix:'pyo', row:'ha', kind:'youon' },

    { prefix:'ma', row:'ma', kind:'base' }, { prefix:'mi', row:'ma', kind:'base' }, { prefix:'mu', row:'ma', kind:'base' }, { prefix:'me', row:'ma', kind:'base' }, { prefix:'mo', row:'ma', kind:'base' },
    { prefix:'mya', row:'ma', kind:'youon' }, { prefix:'myu', row:'ma', kind:'youon' }, { prefix:'myo', row:'ma', kind:'youon' },

    { prefix:'ya', row:'ya', kind:'base' }, { prefix:'yu', row:'ya', kind:'base' }, { prefix:'yo', row:'ya', kind:'base' },

    { prefix:'ra', row:'ra', kind:'base' }, { prefix:'ri', row:'ra', kind:'base' }, { prefix:'ru', row:'ra', kind:'base' }, { prefix:'re', row:'ra', kind:'base' }, { prefix:'ro', row:'ra', kind:'base' },
    { prefix:'rya', row:'ra', kind:'youon' }, { prefix:'ryu', row:'ra', kind:'youon' }, { prefix:'ryo', row:'ra', kind:'youon' },

    { prefix:'wa', row:'wa', kind:'base' }, { prefix:'wo', row:'wa', kind:'base' },
  ];
  for (const entry of TABLE) {
    if (entry.prefix === romaji) return { row: entry.row, kind: entry.kind };
  }
  return { row: 'a', kind: 'base' };
}

// Public dataset -------------------------------------------------------------
export interface KanaSet {
  chars: KanaChar[];
  byRomaji: Record<string, KanaChar>;
}

function build(script: 'hira'|'kata'): KanaSet {
  const map = script === 'hira' ? ROMAJI_HIRA : ROMAJI_KATA;
  const chars: KanaChar[] = [];
  const byRomaji: Record<string, KanaChar> = {};
  const seen = new Set<string>();
  for (const [romaji, ch] of Object.entries(map)) {
    if (!ch || seen.has(ch)) continue;
    seen.add(ch);
    const { row, kind } = classify(romaji);
    const id = `${script === 'hira' ? 'hira' : 'kata'}-${romaji}`;
    const safeRomaji = romaji === 'du' ? 'dzu' : romaji;
    const mnemonic = MNEMONICS[romaji] ?? MNEMONICS[safeRomaji] ?? 'A unique Japanese character.';
    const example = EXAMPLES[romaji] ?? EXAMPLES[safeRomaji] ?? { word: ch, reading: romaji, meaning: romaji };
    chars.push({
      id, char: ch, romaji, row, kind,
      mnemonic, example,
      // Strokes: simplified — fall back to a single rect path; visual component
      // renders the actual glyph and uses this count for sequencing.
      strokes: BASE[romaji]?.map(s => s.map(x => x.d).join(' ')) ?? [ch],
    });
    byRomaji[romaji] = chars[chars.length - 1];
  }
  return { chars, byRomaji };
}

export const HIRAGANA = build('hira');
export const KATAKANA = build('kata');

export function flattenFor(script: 'hira'|'kata'): KanaChar[] {
  return (script === 'hira' ? HIRAGANA : KATAKANA).chars;
}

export function getChar(id: string): KanaChar | undefined {
  return HIRAGANA.chars.find(c => c.id === id) || KATAKANA.chars.find(c => c.id === id);
}

export function getByRomaji(romaji: string, script: 'hira'|'kata'): KanaChar | undefined {
  return (script === 'hira' ? HIRAGANA : KATAKANA).byRomaji[romaji];
}
