import { PrismaClient } from '@prisma/client';
import { SUPPORTED_LANGUAGES } from '../src/config/languages';

const prisma = new PrismaClient();

interface SampleWords {
  [key: string]: Array<{
    originalText: string;
    translationText: string;
    pronunciation?: string;
    difficulty?: number;
  }>;
}

const SAMPLE_WORDS: SampleWords = {
  he: [
    { originalText: 'שלום', translationText: 'hello', pronunciation: 'shalom', difficulty: 1 },
    { originalText: 'תודה', translationText: 'thank you', pronunciation: 'toda', difficulty: 1 },
    { originalText: 'בבקשה', translationText: 'please', pronunciation: 'bevakasha', difficulty: 1 },
    { originalText: 'כן', translationText: 'yes', pronunciation: 'ken', difficulty: 1 },
    { originalText: 'לא', translationText: 'no', pronunciation: 'lo', difficulty: 1 },
    { originalText: 'מה שלומך', translationText: 'how are you', pronunciation: 'ma shlomcha', difficulty: 2 },
    { originalText: 'אני טוב', translationText: 'I am good', pronunciation: 'ani tov', difficulty: 2 },
    { originalText: 'להתראות', translationText: 'goodbye', pronunciation: 'lehitraot', difficulty: 2 },
    { originalText: 'בוקר טוב', translationText: 'good morning', pronunciation: 'boker tov', difficulty: 2 },
    { originalText: 'לילה טוב', translationText: 'good night', pronunciation: 'layla tov', difficulty: 2 },
  ],
  es: [
    { originalText: 'hola', translationText: 'hello', difficulty: 1 },
    { originalText: 'gracias', translationText: 'thank you', difficulty: 1 },
    { originalText: 'por favor', translationText: 'please', difficulty: 1 },
    { originalText: 'sí', translationText: 'yes', difficulty: 1 },
    { originalText: 'no', translationText: 'no', difficulty: 1 },
    { originalText: '¿cómo estás?', translationText: 'how are you', difficulty: 2 },
    { originalText: 'estoy bien', translationText: 'I am good', difficulty: 2 },
    { originalText: 'adiós', translationText: 'goodbye', difficulty: 2 },
    { originalText: 'buenos días', translationText: 'good morning', difficulty: 2 },
    { originalText: 'buenas noches', translationText: 'good night', difficulty: 2 },
  ],
  fr: [
    { originalText: 'bonjour', translationText: 'hello', difficulty: 1 },
    { originalText: 'merci', translationText: 'thank you', difficulty: 1 },
    { originalText: 's\'il vous plaît', translationText: 'please', difficulty: 1 },
    { originalText: 'oui', translationText: 'yes', difficulty: 1 },
    { originalText: 'non', translationText: 'no', difficulty: 1 },
    { originalText: 'comment allez-vous?', translationText: 'how are you', difficulty: 2 },
    { originalText: 'je vais bien', translationText: 'I am good', difficulty: 2 },
    { originalText: 'au revoir', translationText: 'goodbye', difficulty: 2 },
    { originalText: 'bonne nuit', translationText: 'good night', difficulty: 2 },
    { originalText: 'excusez-moi', translationText: 'excuse me', difficulty: 2 },
  ],
  it: [
    { originalText: 'ciao', translationText: 'hello', difficulty: 1 },
    { originalText: 'grazie', translationText: 'thank you', difficulty: 1 },
    { originalText: 'per favore', translationText: 'please', difficulty: 1 },
    { originalText: 'sì', translationText: 'yes', difficulty: 1 },
    { originalText: 'no', translationText: 'no', difficulty: 1 },
    { originalText: 'come stai?', translationText: 'how are you', difficulty: 2 },
    { originalText: 'sto bene', translationText: 'I am good', difficulty: 2 },
    { originalText: 'arrivederci', translationText: 'goodbye', difficulty: 2 },
    { originalText: 'buongiorno', translationText: 'good morning', difficulty: 2 },
    { originalText: 'buonanotte', translationText: 'good night', difficulty: 2 },
  ],
  de: [
    { originalText: 'hallo', translationText: 'hello', difficulty: 1 },
    { originalText: 'danke', translationText: 'thank you', difficulty: 1 },
    { originalText: 'bitte', translationText: 'please', difficulty: 1 },
    { originalText: 'ja', translationText: 'yes', difficulty: 1 },
    { originalText: 'nein', translationText: 'no', difficulty: 1 },
    { originalText: 'wie geht es dir?', translationText: 'how are you', difficulty: 2 },
    { originalText: 'mir geht es gut', translationText: 'I am good', difficulty: 2 },
    { originalText: 'auf wiedersehen', translationText: 'goodbye', difficulty: 2 },
    { originalText: 'guten morgen', translationText: 'good morning', difficulty: 2 },
    { originalText: 'gute nacht', translationText: 'good night', difficulty: 2 },
  ],
  ru: [
    { originalText: 'привет', translationText: 'hello', pronunciation: 'privet', difficulty: 1 },
    { originalText: 'спасибо', translationText: 'thank you', pronunciation: 'spasibo', difficulty: 1 },
    { originalText: 'пожалуйста', translationText: 'please', pronunciation: 'pozhaluysta', difficulty: 1 },
    { originalText: 'да', translationText: 'yes', pronunciation: 'da', difficulty: 1 },
    { originalText: 'нет', translationText: 'no', pronunciation: 'net', difficulty: 1 },
    { originalText: 'как дела?', translationText: 'how are you', pronunciation: 'kak dela?', difficulty: 2 },
    { originalText: 'хорошо', translationText: 'good', pronunciation: 'khorosho', difficulty: 2 },
    { originalText: 'до свидания', translationText: 'goodbye', pronunciation: 'do svidaniya', difficulty: 2 },
    { originalText: 'доброе утро', translationText: 'good morning', pronunciation: 'dobroye utro', difficulty: 2 },
    { originalText: 'спокойной ночи', translationText: 'good night', pronunciation: 'spokoynoy nochi', difficulty: 2 },
  ],
  zh: [
    { originalText: '你好', translationText: 'hello', pronunciation: 'nǐ hǎo', difficulty: 1 },
    { originalText: '谢谢', translationText: 'thank you', pronunciation: 'xiè xiè', difficulty: 1 },
    { originalText: '请', translationText: 'please', pronunciation: 'qǐng', difficulty: 1 },
    { originalText: '是', translationText: 'yes', pronunciation: 'shì', difficulty: 1 },
    { originalText: '不是', translationText: 'no', pronunciation: 'bù shì', difficulty: 1 },
    { originalText: '你好吗?', translationText: 'how are you', pronunciation: 'nǐ hǎo ma?', difficulty: 2 },
    { originalText: '我很好', translationText: 'I am good', pronunciation: 'wǒ hěn hǎo', difficulty: 2 },
    { originalText: '再见', translationText: 'goodbye', pronunciation: 'zài jiàn', difficulty: 2 },
    { originalText: '早上好', translationText: 'good morning', pronunciation: 'zǎo shàng hǎo', difficulty: 2 },
    { originalText: '晚安', translationText: 'good night', pronunciation: 'wǎn ān', difficulty: 2 },
  ],
  pt: [
    { originalText: 'olá', translationText: 'hello', difficulty: 1 },
    { originalText: 'obrigado', translationText: 'thank you', difficulty: 1 },
    { originalText: 'por favor', translationText: 'please', difficulty: 1 },
    { originalText: 'sim', translationText: 'yes', difficulty: 1 },
    { originalText: 'não', translationText: 'no', difficulty: 1 },
    { originalText: 'como está?', translationText: 'how are you', difficulty: 2 },
    { originalText: 'estou bem', translationText: 'I am good', difficulty: 2 },
    { originalText: 'tchau', translationText: 'goodbye', difficulty: 2 },
    { originalText: 'bom dia', translationText: 'good morning', difficulty: 2 },
    { originalText: 'boa noite', translationText: 'good night', difficulty: 2 },
  ],
  ja: [
    { originalText: 'こんにちは', translationText: 'hello', pronunciation: 'konnichiwa', difficulty: 1 },
    { originalText: 'ありがとう', translationText: 'thank you', pronunciation: 'arigatou', difficulty: 1 },
    { originalText: 'お願いします', translationText: 'please', pronunciation: 'onegaishimasu', difficulty: 1 },
    { originalText: 'はい', translationText: 'yes', pronunciation: 'hai', difficulty: 1 },
    { originalText: 'いいえ', translationText: 'no', pronunciation: 'iie', difficulty: 1 },
    { originalText: '元気ですか?', translationText: 'how are you', pronunciation: 'genki desu ka?', difficulty: 2 },
    { originalText: '元気です', translationText: 'I am good', pronunciation: 'genki desu', difficulty: 2 },
    { originalText: 'さようなら', translationText: 'goodbye', pronunciation: 'sayounara', difficulty: 2 },
    { originalText: 'おはよう', translationText: 'good morning', pronunciation: 'ohayou', difficulty: 2 },
    { originalText: 'おやすみ', translationText: 'good night', pronunciation: 'oyasumi', difficulty: 2 },
  ],
};

async function seedLanguages() {
  console.log('🌍 Starting language seeding...');
  
  try {
    // Create languages
    console.log('📝 Creating languages...');
    for (const [code, config] of Object.entries(SUPPORTED_LANGUAGES)) {
      await prisma.language.upsert({
        where: { code },
        update: {
          name: config.name,
          nativeName: config.nativeName,
          isRTL: config.isRTL,
          fontFamily: config.fontFamily,
          isActive: config.isActive,
        },
        create: {
          code,
          name: config.name,
          nativeName: config.nativeName,
          isRTL: config.isRTL,
          fontFamily: config.fontFamily,
          isActive: config.isActive,
        },
      });
      console.log(`✅ Created/Updated language: ${config.name} (${code})`);
    }

    // Create default sections and words for each language
    console.log('📚 Creating default sections and words...');
    for (const [code, words] of Object.entries(SAMPLE_WORDS)) {
      const language = await prisma.language.findUnique({
        where: { code },
      });

      if (!language) {
        console.log(`❌ Language ${code} not found, skipping...`);
        continue;
      }

      const sectionName = 'Essential Phrases';
      
      // Create or find the section
      const section = await prisma.section.upsert({
        where: { 
          name_languageId: { 
            name: sectionName, 
            languageId: language.id 
          } 
        },
        update: {},
        create: {
          name: sectionName,
          description: `Essential phrases for learning ${language.name}`,
          isDefault: true,
          languageId: language.id,
        },
      });

      // Add words to the section (skip if they already exist)
      const existingWords = await prisma.word.findMany({
        where: { sectionId: section.id },
      });
      
      if (existingWords.length === 0) {
        await prisma.word.createMany({
          data: words.map(word => ({
            sectionId: section.id,
            languageId: language.id,
            originalText: word.originalText,
            translationText: word.translationText,
            pronunciation: word.pronunciation,
            difficulty: word.difficulty || 1,
          })),
        });
      }

      console.log(`✅ Created section "${sectionName}" with ${words.length} words for ${language.name}`);
    }

    console.log('🎉 Language seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding languages:', error);
    throw error;
  }
}

export default seedLanguages;

// Run if called directly
if (require.main === module) {
  seedLanguages()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}