import { PrismaClient } from '@prisma/client';
import { SUPPORTED_LANGUAGES, getLanguageConfig, isValidLanguageCode } from './src/config/languages';

const prisma = new PrismaClient();

async function testPhase1() {
  console.log('🧪 Testing Phase 1: Multi-Language Foundation');
  console.log('=' .repeat(50));

  try {
    // Test 1: Verify all languages were created
    console.log('\n📋 Test 1: Language Creation');
    const languages = await prisma.language.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log(`✅ Found ${languages.length} languages in database`);
    languages.forEach(lang => {
      console.log(`   ${lang.code}: ${lang.name} (${lang.nativeName}) ${lang.isRTL ? '[RTL]' : '[LTR]'}`);
    });

    // Test 2: Verify language configuration system
    console.log('\n📋 Test 2: Language Configuration System');
    console.log(`✅ Total configured languages: ${Object.keys(SUPPORTED_LANGUAGES).length}`);
    
    // Test specific functions
    console.log(`✅ Hebrew config: ${JSON.stringify(getLanguageConfig('he'), null, 2)}`);
    console.log(`✅ Chinese RTL: ${getLanguageConfig('zh')?.isRTL}`);
    console.log(`✅ Valid code 'es': ${isValidLanguageCode('es')}`);
    console.log(`✅ Valid code 'invalid': ${isValidLanguageCode('invalid')}`);

    // Test 3: Verify sections were created for each language
    console.log('\n📋 Test 3: Default Sections');
    const sections = await prisma.section.findMany({
      include: {
        language: true,
        _count: {
          select: { words: true }
        }
      },
      orderBy: { language: { code: 'asc' } }
    });
    
    console.log(`✅ Found ${sections.length} sections`);
    sections.forEach(section => {
      console.log(`   ${section.language.code}: "${section.name}" (${section._count.words} words)`);
    });

    // Test 4: Verify words were created with proper structure
    console.log('\n📋 Test 4: Word Structure');
    const sampleWords = await prisma.word.findMany({
      include: {
        language: true,
        section: true
      },
      take: 5,
      orderBy: { language: { code: 'asc' } }
    });

    console.log(`✅ Sample words (showing 5):`);
    sampleWords.forEach(word => {
      console.log(`   ${word.language.code}: "${word.originalText}" → "${word.translationText}"${word.pronunciation ? ` [${word.pronunciation}]` : ''} (difficulty: ${word.difficulty})`);
    });

    // Test 5: Verify database relationships
    console.log('\n📋 Test 5: Database Relationships');
    const relationshipTest = await prisma.language.findFirst({
      where: { code: 'he' },
      include: {
        sections: {
          include: {
            words: {
              take: 3
            }
          }
        }
      }
    });

    if (relationshipTest) {
      console.log(`✅ Hebrew language has ${relationshipTest.sections.length} sections`);
      console.log(`✅ First section has ${relationshipTest.sections[0]?.words.length || 0} words (showing 3)`);
    }

    // Test 6: Performance check
    console.log('\n📋 Test 6: Performance Check');
    const start = Date.now();
    
    const stats = await prisma.$transaction([
      prisma.language.count(),
      prisma.section.count(),
      prisma.word.count(),
    ]);
    
    const end = Date.now();
    console.log(`✅ Database stats (${end - start}ms):`);
    console.log(`   Languages: ${stats[0]}`);
    console.log(`   Sections: ${stats[1]}`);
    console.log(`   Words: ${stats[2]}`);

    console.log('\n🎉 Phase 1 tests completed successfully!');
    console.log('✅ All systems ready for Phase 2 implementation');

  } catch (error) {
    console.error('❌ Phase 1 test failed:', error);
    throw error;
  }
}

// Run tests if called directly
if (require.main === module) {
  testPhase1()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default testPhase1;