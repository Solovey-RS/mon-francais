export const PRONUNCIATION_MODULES = [
  {
    id: "vowels",
    title: "Простые гласные",
    description: "Слышим и читаем a, i, o и французское u.",
    itemIds: ["vowel-a", "vowel-i", "vowel-o", "vowel-u"],
    bilan: { text: "Lis : ami, moto, musique. Puis : Lili a une moto.", audioText: "Ami, moto, musique. Lili a une moto." },
  },
  {
    id: "letter-e",
    title: "Семья буквы e",
    description: "Различаем закрытое é, открытое è и слабое e.",
    itemIds: ["e-closed", "e-open", "e-weak"],
    bilan: { text: "Lis : été, mère, semaine. Puis : René regarde la mer.", audioText: "Été, mère, semaine. René regarde la mer." },
  },
  {
    id: "syllables",
    title: "Собираем слоги",
    description: "Соединяем согласную и гласную без лишнего звука между ними.",
    itemIds: ["syllable-mn", "syllable-lr"],
    bilan: { text: "Lis : ma, mi, la, ri. Puis : Marie arrive à Lille.", audioText: "Ma, mi, la, ri. Marie arrive à Lille." },
  },
  {
    id: "digraphs",
    title: "ch, qu и gu",
    description: "Три частых сочетания, которые читаются не по одной букве.",
    itemIds: ["digraph-ch", "digraph-qu", "digraph-gu"],
    bilan: { text: "Lis : chat, quatre, guitare. Puis : Hugo cherche sa guitare.", audioText: "Chat, quatre, guitare. Hugo cherche sa guitare." },
  },
  {
    id: "ou-oi",
    title: "ou и oi",
    description: "Не путаем французские звуки ou и oi.",
    itemIds: ["combo-ou", "combo-oi"],
    bilan: { text: "Lis : rouge, trois, voiture. Puis : Louis voit trois voitures.", audioText: "Rouge, trois, voiture. Louis voit trois voitures." },
  },
  {
    id: "nasals",
    title: "Носовые гласные",
    description: "Воздух проходит и через нос; конечные n и m отдельно не произносятся.",
    itemIds: ["nasal-on", "nasal-an", "nasal-in", "nasal-un"],
    bilan: { text: "Lis : bon, enfant, matin, lundi. Puis : Un enfant vient lundi matin.", audioText: "Bon, enfant, matin, lundi. Un enfant vient lundi matin." },
  },
  {
    id: "combined-vowels",
    title: "au, eau, eu, œu и ui",
    description: "Читаем сочетание как единый звук.",
    itemIds: ["combo-au-eau", "combo-eu-oeu", "combo-ui"],
    bilan: { text: "Lis : bateau, deux, nuit. Puis : Il pleut cette nuit.", audioText: "Bateau, deux, nuit. Il pleut cette nuit." },
  },
  {
    id: "changing-consonants",
    title: "Согласные меняют звук",
    description: "Соседние буквы влияют на c и g; отдельные сочетания дают новый звук.",
    itemIds: ["change-c-cedilla", "change-g-ge", "change-gn", "change-ph"],
    bilan: { text: "Lis : citron, girafe, montagne, photo. Puis : François photographie la montagne.", audioText: "Citron, girafe, montagne, photo. François photographie la montagne." },
  },
  {
    id: "advanced-combinations",
    title: "Сложные сочетания",
    description: "Узнаём ill, ail, eil, ouil и tion целиком.",
    itemIds: ["advanced-ill", "advanced-ail-eil-ouil", "advanced-tion"],
    bilan: { text: "Lis : famille, soleil, grenouille, attention. Puis : La famille regarde le soleil.", audioText: "Famille, soleil, grenouille, attention. La famille regarde le soleil." },
  },
  {
    id: "silent-endings",
    title: "Непроизносимые окончания",
    description: "В конце французского слова часть букв часто остаётся на письме, но не звучит.",
    itemIds: ["silent-final-consonant", "silent-verb-ent"],
    bilan: { text: "Lis : petit, grand, parlent, dansent. Puis : Les enfants parlent et jouent.", audioText: "Petit, grand, parlent, dansent. Les enfants parlent et jouent." },
  },
];

export const PRONUNCIATION_ITEMS = [
  { id: "vowel-a", moduleId: "vowels", pattern: "a, â", explanation: "Открытый звук, близкий к русскому «а». Буква â обычно сохраняет тот же основной звук.", modelWord: "arbre", audioText: "arbre", practiceWords: ["ami", "salade", "caméra"] },
  { id: "vowel-i", moduleId: "vowels", pattern: "i, î, y", explanation: "Чёткий звук «и». В этой позиции y часто передаёт тот же гласный звук.", modelWord: "image", audioText: "image", practiceWords: ["livre", "tapis", "style"] },
  { id: "vowel-o", moduleId: "vowels", pattern: "o, ô", explanation: "Французское o бывает более открытым или закрытым, но не превращается в безударное русское «а».", modelWord: "moto", audioText: "moto", practiceWords: ["photo", "domino", "rose"] },
  { id: "vowel-u", moduleId: "vowels", pattern: "u, û", explanation: "Губы как для «у», а язык как для «и». Это не русский звук «у».", modelWord: "lune", audioText: "lune", practiceWords: ["tu", "musique", "rue"] },

  { id: "e-closed", moduleId: "letter-e", pattern: "é, er, ez", explanation: "Закрытый звук [e], похожий на ясное «э» с улыбкой.", modelWord: "été", audioText: "été", practiceWords: ["café", "parler", "vous aimez"] },
  { id: "e-open", moduleId: "letter-e", pattern: "è, ê, ai", explanation: "Более открытый звук [ɛ]. Рот открывается заметнее, чем для é.", modelWord: "mère", audioText: "mère", practiceWords: ["frère", "forêt", "seize"] },
  { id: "e-weak", moduleId: "letter-e", pattern: "e", explanation: "Слабое e может звучать кратко или исчезать в быстрой речи. Сначала слушайте слово целиком.", modelWord: "semaine", audioText: "semaine", practiceWords: ["petit", "revenir", "demain"] },

  { id: "syllable-mn", moduleId: "syllables", pattern: "m / n + гласная", explanation: "Согласная сразу соединяется с гласной: ma, mi, na, ni — без вставного «ы».", modelWord: "maman", audioText: "maman", practiceWords: ["moto", "minute", "nature"] },
  { id: "syllable-lr", moduleId: "syllables", pattern: "l / r + гласная", explanation: "Сохраняйте один слог и не добавляйте гласную после согласной.", modelWord: "lire", audioText: "lire", practiceWords: ["rue", "parole", "Lara"] },

  { id: "digraph-ch", moduleId: "digraphs", pattern: "ch", explanation: "В большинстве французских слов ch читается как мягкое «ш».", modelWord: "chat", audioText: "chat", practiceWords: ["chemin", "marché", "chocolat"] },
  { id: "digraph-qu", moduleId: "digraphs", pattern: "qu", explanation: "Сочетание qu обычно даёт звук [k]; буква u отдельно не звучит.", modelWord: "quatre", audioText: "quatre", practiceWords: ["qui", "équipe", "chaque"] },
  { id: "digraph-gu", moduleId: "digraphs", pattern: "gu + e/i", explanation: "Буква u сохраняет твёрдый звук [g] перед e или i и сама обычно не произносится.", modelWord: "guitare", audioText: "guitare", practiceWords: ["guide", "fatigue", "guerre"] },

  { id: "combo-ou", moduleId: "ou-oi", pattern: "ou", explanation: "Сочетание ou читается как чистый звук [u], близкий к русскому «у».", modelWord: "rouge", audioText: "rouge", practiceWords: ["vous", "toujours", "soupe"] },
  { id: "combo-oi", moduleId: "ou-oi", pattern: "oi", explanation: "Сочетание oi читается [wa], примерно как слитное «уа».", modelWord: "voiture", audioText: "voiture", practiceWords: ["moi", "trois", "soir"] },

  { id: "nasal-on", moduleId: "nasals", pattern: "on, om", explanation: "Носовой [ɔ̃]: не произносите отдельное n или m после гласного.", modelWord: "bonjour", audioText: "bonjour", practiceWords: ["monde", "ballon", "pont"] },
  { id: "nasal-an", moduleId: "nasals", pattern: "an, en, am, em", explanation: "Носовой [ɑ̃]. Окончание не превращается в отдельное «ан».", modelWord: "enfant", audioText: "enfant", practiceWords: ["France", "dimanche", "chambre"] },
  { id: "nasal-in", moduleId: "nasals", pattern: "in, ain, ein", explanation: "Носовой [ɛ̃]. Следующая n не произносится отдельно, если за ней нет гласной.", modelWord: "matin", audioText: "matin", practiceWords: ["pain", "plein", "jardin"] },
  { id: "nasal-un", moduleId: "nasals", pattern: "un, um", explanation: "Носовой звук [œ̃]. В современной речи он иногда сближается с [ɛ̃].",
    modelWord: "lundi", audioText: "lundi", practiceWords: ["brun", "chacun", "parfum"] },

  { id: "combo-au-eau", moduleId: "combined-vowels", pattern: "au, eau", explanation: "Оба сочетания обычно читаются как закрытое [o].",
    modelWord: "bateau", audioText: "bateau", practiceWords: ["jaune", "château", "beau"] },
  { id: "combo-eu-oeu", moduleId: "combined-vowels", pattern: "eu, œu", explanation: "Звук образуется с округлёнными губами; в deux он закрытее, а в sœur — открытее.", modelWord: "deux", audioText: "deux, sœur", practiceWords: ["feu", "cœur", "neuf"] },
  { id: "combo-ui", moduleId: "combined-vowels", pattern: "ui", explanation: "Начните с французского u и быстро перейдите к i, не разделяя на два слога.", modelWord: "nuit", audioText: "nuit", practiceWords: ["pluie", "huit", "fruit"] },

  { id: "change-c-cedilla", moduleId: "changing-consonants", pattern: "c, ç", explanation: "Перед e, i, y буква c звучит [s]; ç сохраняет [s] перед a, o, u.", modelWord: "citron", audioText: "citron", practiceWords: ["garçon", "façade", "français"] },
  { id: "change-g-ge", moduleId: "changing-consonants", pattern: "g, ge", explanation: "Перед e, i, y буква g звучит как [ʒ]; ge помогает сохранить этот звук перед a или o.", modelWord: "girafe", audioText: "girafe", practiceWords: ["orange", "genou", "mangeons"] },
  { id: "change-gn", moduleId: "changing-consonants", pattern: "gn", explanation: "Сочетание gn даёт мягкий звук [ɲ], близкий к «нь».", modelWord: "montagne", audioText: "montagne", practiceWords: ["ligne", "mignon", "baignoire"] },
  { id: "change-ph", moduleId: "changing-consonants", pattern: "ph", explanation: "Сочетание ph читается как [f].",
    modelWord: "photo", audioText: "photo", practiceWords: ["téléphone", "pharmacie", "dauphin"] },

  { id: "advanced-ill", moduleId: "advanced-combinations", pattern: "ill", explanation: "После гласной ill часто даёт скользящий звук [j], но встречаются исключения — слушайте слово целиком.", modelWord: "fille", audioText: "fille", practiceWords: ["famille", "papillon", "billet"] },
  { id: "advanced-ail-eil-ouil", moduleId: "advanced-combinations", pattern: "ail, eil, ouil", explanation: "Конец сочетания звучит с [j]: не произносите каждую букву отдельно.", modelWord: "travail", audioText: "travail", practiceWords: ["soleil", "grenouille", "fauteuil"] },
  { id: "advanced-tion", moduleId: "advanced-combinations", pattern: "tion", explanation: "Во многих существительных tion читается [sjɔ̃].",
    modelWord: "attention", audioText: "attention", practiceWords: ["nation", "solution", "émotion"] },

  { id: "silent-final-consonant", moduleId: "silent-endings", pattern: "конечные согласные", explanation: "Конечные d, s, t и другие согласные часто не звучат. Проверяйте слово по аудио, а не по русскому чтению букв.", modelWord: "petit", audioText: "petit", practiceWords: ["grand", "vous", "français"] },
  { id: "silent-verb-ent", moduleId: "silent-endings", pattern: "-ent у глаголов", explanation: "В форме ils/elles окончание -ent не произносится: parlent звучит без отдельного «энт».", modelWord: "ils parlent", audioText: "ils parlent", practiceWords: ["ils dansent", "elles jouent", "ils regardent"] },
];
