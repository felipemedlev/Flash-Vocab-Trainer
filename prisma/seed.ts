import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Starting multi-language database seeding...');

  // Create languages
  console.log('📚 Creating languages...');
  
  const languages = [
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false },
    { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', isRTL: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', isRTL: false },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', isRTL: false },
    { code: 'zh', name: 'Chinese', nativeName: '中文', isRTL: false },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', isRTL: false },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', isRTL: false },
  ];

  for (const lang of languages) {
    await db.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }

  console.log(`✅ Created ${languages.length} languages`);

  // Create essential phrases for each language
  console.log('💬 Creating essential phrases...');
  
  const essentialPhrases = {
    he: [
      { original: 'שלום', translation: 'Hello/Peace', pronunciation: 'Shalom' },
      { original: 'תודה', translation: 'Thank you', pronunciation: 'Toda' },
      { original: 'בבקשה', translation: 'Please/You\'re welcome', pronunciation: 'Bevakasha' },
      { original: 'סליחה', translation: 'Excuse me/Sorry', pronunciation: 'Slicha' },
      { original: 'כן', translation: 'Yes', pronunciation: 'Ken' },
      { original: 'לא', translation: 'No', pronunciation: 'Lo' },
      { original: 'בוקר טוב', translation: 'Good morning', pronunciation: 'Boker tov' },
      { original: 'לילה טוב', translation: 'Good night', pronunciation: 'Laila tov' },
      { original: 'איך קוראים לך?', translation: 'What is your name?', pronunciation: 'Eich korim lecha?' },
      { original: 'אני מבין', translation: 'I understand', pronunciation: 'Ani mevin' },
    ],
    es: [
      { original: 'Hola', translation: 'Hello', pronunciation: 'OH-lah' },
      { original: 'Gracias', translation: 'Thank you', pronunciation: 'GRAH-see-ahs' },
      { original: 'Por favor', translation: 'Please', pronunciation: 'por fah-VOR' },
      { original: 'Perdón', translation: 'Excuse me/Sorry', pronunciation: 'per-DOHN' },
      { original: 'Sí', translation: 'Yes', pronunciation: 'see' },
      { original: 'No', translation: 'No', pronunciation: 'noh' },
      { original: 'Buenos días', translation: 'Good morning', pronunciation: 'BWAY-nohs DEE-ahs' },
      { original: 'Buenas noches', translation: 'Good night', pronunciation: 'BWAY-nahs NOH-chehs' },
      { original: '¿Cómo te llamas?', translation: 'What is your name?', pronunciation: 'KOH-moh teh YAH-mahs' },
      { original: 'Entiendo', translation: 'I understand', pronunciation: 'en-tee-EN-doh' },
    ],
    fr: [
      { original: 'Bonjour', translation: 'Hello/Good day', pronunciation: 'bon-ZHOOR' },
      { original: 'Merci', translation: 'Thank you', pronunciation: 'mer-SEE' },
      { original: 'S\'il vous plaît', translation: 'Please', pronunciation: 'seel voo PLEH' },
      { original: 'Excusez-moi', translation: 'Excuse me', pronunciation: 'ehk-skew-zay MWAH' },
      { original: 'Oui', translation: 'Yes', pronunciation: 'wee' },
      { original: 'Non', translation: 'No', pronunciation: 'nohn' },
      { original: 'Bonjour', translation: 'Good morning', pronunciation: 'bon-ZHOOR' },
      { original: 'Bonne nuit', translation: 'Good night', pronunciation: 'bun NWEE' },
      { original: 'Comment vous appelez-vous?', translation: 'What is your name?', pronunciation: 'koh-mahn voo zah-play VOO' },
      { original: 'Je comprends', translation: 'I understand', pronunciation: 'zhuh kom-PRAHN' },
    ],
    it: [
      { original: 'Ciao', translation: 'Hello/Goodbye', pronunciation: 'chah-oh' },
      { original: 'Grazie', translation: 'Thank you', pronunciation: 'GRAH-tsee-eh' },
      { original: 'Per favore', translation: 'Please', pronunciation: 'per fah-VOH-reh' },
      { original: 'Scusi', translation: 'Excuse me', pronunciation: 'SKOO-zee' },
      { original: 'Sì', translation: 'Yes', pronunciation: 'see' },
      { original: 'No', translation: 'No', pronunciation: 'noh' },
      { original: 'Buongiorno', translation: 'Good morning', pronunciation: 'bwohn-JHOR-noh' },
      { original: 'Buonanotte', translation: 'Good night', pronunciation: 'bwoh-nah-NOT-teh' },
      { original: 'Come ti chiami?', translation: 'What is your name?', pronunciation: 'KOH-meh tee kee-AH-mee' },
      { original: 'Capisco', translation: 'I understand', pronunciation: 'kah-PEES-koh' },
    ],
    de: [
      { original: 'Hallo', translation: 'Hello', pronunciation: 'HAH-loh' },
      { original: 'Danke', translation: 'Thank you', pronunciation: 'DAHN-keh' },
      { original: 'Bitte', translation: 'Please/You\'re welcome', pronunciation: 'BIT-teh' },
      { original: 'Entschuldigung', translation: 'Excuse me/Sorry', pronunciation: 'ent-SHOOL-di-goong' },
      { original: 'Ja', translation: 'Yes', pronunciation: 'yah' },
      { original: 'Nein', translation: 'No', pronunciation: 'nine' },
      { original: 'Guten Morgen', translation: 'Good morning', pronunciation: 'GOO-ten MOR-gen' },
      { original: 'Gute Nacht', translation: 'Good night', pronunciation: 'GOO-teh nahkt' },
      { original: 'Wie heißen Sie?', translation: 'What is your name?', pronunciation: 'vee HIGH-sen zee' },
      { original: 'Ich verstehe', translation: 'I understand', pronunciation: 'ikh fer-SHTEH-eh' },
    ],
    ru: [
      { original: 'Привет', translation: 'Hello', pronunciation: 'pri-VYET' },
      { original: 'Спасибо', translation: 'Thank you', pronunciation: 'spa-SEE-bah' },
      { original: 'Пожалуйста', translation: 'Please/You\'re welcome', pronunciation: 'pah-ZHAH-loo-stah' },
      { original: 'Извините', translation: 'Excuse me/Sorry', pronunciation: 'iz-vi-NEE-tye' },
      { original: 'Да', translation: 'Yes', pronunciation: 'dah' },
      { original: 'Нет', translation: 'No', pronunciation: 'nyet' },
      { original: 'Доброе утро', translation: 'Good morning', pronunciation: 'DOH-broh-yeh OO-troh' },
      { original: 'Спокойной ночи', translation: 'Good night', pronunciation: 'spa-KOY-noy NOH-chee' },
      { original: 'Как вас зовут?', translation: 'What is your name?', pronunciation: 'kahk vahs za-VOOT' },
      { original: 'Я понимаю', translation: 'I understand', pronunciation: 'yah pa-ni-MAH-yu' },
    ],
    zh: [
      { original: '你好', translation: 'Hello', pronunciation: 'Nǐ hǎo' },
      { original: '谢谢', translation: 'Thank you', pronunciation: 'Xiè xiè' },
      { original: '请', translation: 'Please', pronunciation: 'Qǐng' },
      { original: '对不起', translation: 'Excuse me/Sorry', pronunciation: 'Duì bù qǐ' },
      { original: '是', translation: 'Yes', pronunciation: 'Shì' },
      { original: '不是', translation: 'No', pronunciation: 'Bù shì' },
      { original: '早上好', translation: 'Good morning', pronunciation: 'Zǎo shàng hǎo' },
      { original: '晚安', translation: 'Good night', pronunciation: 'Wǎn ān' },
      { original: '你叫什么名字?', translation: 'What is your name?', pronunciation: 'Nǐ jiào shén me míng zì?' },
      { original: '我明白', translation: 'I understand', pronunciation: 'Wǒ míng bái' },
    ],
    pt: [
      { original: 'Olá', translation: 'Hello', pronunciation: 'oh-LAH' },
      { original: 'Obrigado', translation: 'Thank you', pronunciation: 'oh-bree-GAH-doo' },
      { original: 'Por favor', translation: 'Please', pronunciation: 'por fah-VOR' },
      { original: 'Desculpe', translation: 'Excuse me/Sorry', pronunciation: 'desh-KOOL-peh' },
      { original: 'Sim', translation: 'Yes', pronunciation: 'seem' },
      { original: 'Não', translation: 'No', pronunciation: 'nah-OW' },
      { original: 'Bom dia', translation: 'Good morning', pronunciation: 'bom DEE-ah' },
      { original: 'Boa noite', translation: 'Good night', pronunciation: 'BOH-ah NOY-chee' },
      { original: 'Qual é o seu nome?', translation: 'What is your name?', pronunciation: 'kwahl eh oo say-oo NOH-meh' },
      { original: 'Eu entendo', translation: 'I understand', pronunciation: 'eh-oo en-TEN-doo' },
    ],
    ja: [
      { original: 'こんにちは', translation: 'Hello', pronunciation: 'Konnichiwa' },
      { original: 'ありがとう', translation: 'Thank you', pronunciation: 'Arigatou' },
      { original: 'お願いします', translation: 'Please', pronunciation: 'Onegaishimasu' },
      { original: 'すみません', translation: 'Excuse me/Sorry', pronunciation: 'Sumimasen' },
      { original: 'はい', translation: 'Yes', pronunciation: 'Hai' },
      { original: 'いいえ', translation: 'No', pronunciation: 'Iie' },
      { original: 'おはよう', translation: 'Good morning', pronunciation: 'Ohayou' },
      { original: 'おやすみ', translation: 'Good night', pronunciation: 'Oyasumi' },
      { original: 'お名前は？', translation: 'What is your name?', pronunciation: 'Onamae wa?' },
      { original: 'わかります', translation: 'I understand', pronunciation: 'Wakarimasu' },
    ],
  };

  let totalSections = 0;
  let totalWords = 0;

  for (const language of languages) {
    const dbLanguage = await db.language.findUnique({
      where: { code: language.code }
    });

    if (!dbLanguage) continue;

    const phrases = essentialPhrases[language.code as keyof typeof essentialPhrases];
    if (!phrases) continue;

    // Create section for this language
    const section = await db.section.upsert({
      where: {
        name_languageId: {
          name: 'Essential Phrases',
          languageId: dbLanguage.id
        }
      },
      update: {},
      create: {
        name: 'Essential Phrases',
        description: `Essential ${language.name} phrases for beginners`,
        isDefault: true,
        languageId: dbLanguage.id,
      },
    });

    console.log(`📝 Created section: Essential Phrases for ${language.name}`);
    totalSections++;

    // Create words for this section
    for (const phrase of phrases) {
      const existingWord = await db.word.findFirst({
        where: {
          originalText: phrase.original,
          translationText: phrase.translation,
          sectionId: section.id
        }
      });

      if (!existingWord) {
        await db.word.create({
          data: {
            originalText: phrase.original,
            translationText: phrase.translation,
            pronunciation: phrase.pronunciation,
            difficulty: 1,
            sectionId: section.id,
            languageId: dbLanguage.id,
          },
        });
        totalWords++;
      }
    }

    console.log(`✅ Created ${phrases.length} words for ${language.name}`);
  }

  console.log('🎉 Multi-language seeding completed!');
  console.log(`📊 Created ${totalSections} sections and ${totalWords} words across ${languages.length} languages`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });