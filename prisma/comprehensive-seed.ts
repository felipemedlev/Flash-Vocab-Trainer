import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define all supported languages
const LANGUAGES = {
  he: { name: 'Hebrew', nativeName: 'עברית' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  ru: { name: 'Russian', nativeName: 'Русский' },
  zh: { name: 'Chinese', nativeName: '中文' },
  ja: { name: 'Japanese', nativeName: '日本語' }
};

// Helper function to capitalize first letter
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Comprehensive vocabulary data for each language
const VOCABULARY_DATA = {
  he: {
    '100 Most Used Words': [
      ['שלום', 'Hello'], ['תודה', 'Thank you'], ['בבקשה', 'Please'], ['סליחה', 'Sorry'],
      ['כן', 'Yes'], ['לא', 'No'], ['מה', 'What'], ['איך', 'How'], ['איפה', 'Where'], ['מתי', 'When'],
      ['למה', 'Why'], ['מי', 'Who'], ['טוב', 'Good'], ['רע', 'Bad'], ['גדול', 'Big'], ['קטן', 'Small'],
      ['חדש', 'New'], ['ישן', 'Old'], ['יפה', 'Beautiful'], ['מכוער', 'Ugly'], ['חם', 'Hot'], ['קר', 'Cold'],
      ['מים', 'Water'], ['אוכל', 'Food'], ['לחם', 'Bread'], ['חלב', 'Milk'], ['קפה', 'Coffee'], ['תה', 'Tea'],
      ['בית', 'House'], ['דלת', 'Door'], ['חלון', 'Window'], ['שולחן', 'Table'], ['כיסא', 'Chair'], ['מיטה', 'Bed'],
      ['ספר', 'Book'], ['עיפרון', 'Pencil'], ['נייר', 'Paper'], ['מחשב', 'Computer'], ['טלפון', 'Phone'], ['זמן', 'Time'],
      ['יום', 'Day'], ['לילה', 'Night'], ['בוקר', 'Morning'], ['ערב', 'Evening'], ['שבוע', 'Week'], ['חודש', 'Month'],
      ['שנה', 'Year'], ['כסף', 'Money'], ['עבודה', 'Work'], ['בית ספר', 'School'], ['משפחה', 'Family'], ['ילד', 'Child'],
      ['אבא', 'Father'], ['אמא', 'Mother'], ['אח', 'Brother'], ['אחות', 'Sister'], ['חבר', 'Friend'], ['אהבה', 'Love'],
      ['שמח', 'Happy'], ['עצוב', 'Sad'], ['כועס', 'Angry'], ['פחד', 'Fear'], ['בריא', 'Healthy'], ['חולה', 'Sick'],
      ['רכב', 'Car'], ['אוטובוס', 'Bus'], ['רכבת', 'Train'], ['מטוס', 'Airplane'], ['דרך', 'Road'], ['עיר', 'City'],
      ['כפר', 'Village'], ['ים', 'Sea'], ['הר', 'Mountain'], ['יער', 'Forest'], ['גן', 'Garden'], ['פרח', 'Flower'],
      ['עץ', 'Tree'], ['כלב', 'Dog'], ['חתול', 'Cat'], ['ציפור', 'Bird'], ['דג', 'Fish'], ['צבע', 'Color'],
      ['אדום', 'Red'], ['כחול', 'Blue'], ['ירוק', 'Green'], ['צהוב', 'Yellow'], ['שחור', 'Black'], ['לבן', 'White'],
      ['מספר', 'Number'], ['אחד', 'One'], ['שניים', 'Two'], ['שלושה', 'Three'], ['ארבעה', 'Four'], ['חמישה', 'Five'],
      ['שש', 'Six'], ['שבעה', 'Seven'], ['שמונה', 'Eight'], ['תשעה', 'Nine'], ['עשרה', 'Ten'], ['מאה', 'Hundred'],
      ['אלף', 'Thousand'], ['ראש', 'Head'], ['עיניים', 'Eyes'], ['אף', 'Nose'], ['פה', 'Mouth'], ['אוזניים', 'Ears'],
      ['ידיים', 'Hands'], ['רגליים', 'Legs'], ['לב', 'Heart'], ['גוף', 'Body']
    ],
    'Essential Greetings': [
      ['שלום', 'Hello'], ['להתראות', 'Goodbye'], ['בוקר טוב', 'Good morning'], ['ערב טוב', 'Good evening'],
      ['לילה טוב', 'Good night'], ['איך שלומך', 'How are you'], ['בסדר', 'Fine'], ['תודה רבה', 'Thank you very much'],
      ['אין בעד מה', 'You\'re welcome'], ['סליחה', 'Excuse me'], ['אני מצטער', 'I\'m sorry'], ['מזל טוב', 'Congratulations'],
      ['חג שמח', 'Happy holiday'], ['שבת שלום', 'Shabbat peace'], ['ברוך הבא', 'Welcome'], ['נעים להכיר', 'Nice to meet you'],
      ['כל הכבוד', 'Well done'], ['בהצלחה', 'Good luck'], ['רפואה שלמה', 'Get well'], ['יום הולדת שמח', 'Happy birthday']
    ],
    'Family & Relationships': [
      ['משפחה', 'Family'], ['הורים', 'Parents'], ['אבא', 'Father'], ['אמא', 'Mother'], ['בן', 'Son'],
      ['בת', 'Daughter'], ['אח', 'Brother'], ['אחות', 'Sister'], ['סבא', 'Grandfather'], ['סבתא', 'Grandmother'],
      ['דוד', 'Uncle'], ['דודה', 'Aunt'], ['בן דוד', 'Cousin (male)'], ['בת דודה', 'Cousin (female)'], ['בעל', 'Husband'],
      ['אשה', 'Wife'], ['ילד', 'Child'], ['תינוק', 'Baby'], ['חתן', 'Groom'], ['כלה', 'Bride']
    ],
    'Food & Dining': [
      ['אוכל', 'Food'], ['ארוחה', 'Meal'], ['ארוחת בוקר', 'Breakfast'], ['ארוחת צהריים', 'Lunch'], ['ארוחת ערב', 'Dinner'],
      ['לחם', 'Bread'], ['חמאה', 'Butter'], ['גבינה', 'Cheese'], ['ביצה', 'Egg'], ['חלב', 'Milk'],
      ['בשר', 'Meat'], ['עוף', 'Chicken'], ['דג', 'Fish'], ['ירקות', 'Vegetables'], ['פירות', 'Fruits'],
      ['תפוח', 'Apple'], ['בננה', 'Banana'], ['תפוז', 'Orange'], ['מים', 'Water'], ['מיץ', 'Juice']
    ],
    'Time & Calendar': [
      ['זמן', 'Time'], ['שעה', 'Hour'], ['דקה', 'Minute'], ['שנייה', 'Second'], ['יום', 'Day'],
      ['שבוע', 'Week'], ['חודש', 'Month'], ['שנה', 'Year'], ['ראשון', 'Sunday'], ['שני', 'Monday'],
      ['שלישי', 'Tuesday'], ['רביעי', 'Wednesday'], ['חמישי', 'Thursday'], ['שישי', 'Friday'], ['שבת', 'Saturday'],
      ['בוקר', 'Morning'], ['צהריים', 'Noon'], ['אחר הצהריים', 'Afternoon'], ['ערב', 'Evening'], ['לילה', 'Night']
    ],
    'Colors & Descriptions': [
      ['צבע', 'Color'], ['אדום', 'Red'], ['כחול', 'Blue'], ['ירוק', 'Green'], ['צהוב', 'Yellow'],
      ['כתום', 'Orange'], ['סגול', 'Purple'], ['ורוד', 'Pink'], ['חום', 'Brown'], ['שחור', 'Black'],
      ['לבן', 'White'], ['אפור', 'Gray'], ['בהיר', 'Light'], ['כהה', 'Dark'], ['גדול', 'Big'],
      ['קטן', 'Small'], ['ארוך', 'Long'], ['קצר', 'Short'], ['רחב', 'Wide'], ['צר', 'Narrow']
    ],
    'Numbers & Mathematics': [
      ['מספר', 'Number'], ['אפס', 'Zero'], ['אחד', 'One'], ['שניים', 'Two'], ['שלושה', 'Three'],
      ['ארבעה', 'Four'], ['חמישה', 'Five'], ['שש', 'Six'], ['שבעה', 'Seven'], ['שמונה', 'Eight'],
      ['תשעה', 'Nine'], ['עשרה', 'Ten'], ['עשרים', 'Twenty'], ['שלושים', 'Thirty'], ['מאה', 'Hundred'],
      ['אלף', 'Thousand'], ['חיבור', 'Addition'], ['חיסור', 'Subtraction'], ['כפל', 'Multiplication'], ['חילוק', 'Division']
    ],
    'Transportation': [
      ['תחבורה', 'Transportation'], ['רכב', 'Car'], ['אוטובוס', 'Bus'], ['רכבת', 'Train'], ['מטוס', 'Airplane'],
      ['אוניה', 'Ship'], ['אופנוע', 'Motorcycle'], ['אופניים', 'Bicycle'], ['מונית', 'Taxi'], ['רכבת תחתית', 'Subway'],
      ['תחנה', 'Station'], ['שדה תעופה', 'Airport'], ['נמל', 'Port'], ['דרך', 'Road'], ['רחוב', 'Street'],
      ['כביש', 'Highway'], ['גשר', 'Bridge'], ['מנהרה', 'Tunnel'], ['חנייה', 'Parking'], ['תחנת דלק', 'Gas station']
    ],
    'Weather & Nature': [
      ['מזג אויר', 'Weather'], ['שמש', 'Sun'], ['גשם', 'Rain'], ['שלג', 'Snow'], ['רוח', 'Wind'],
      ['עננים', 'Clouds'], ['ברק', 'Lightning'], ['רעם', 'Thunder'], ['קשת', 'Rainbow'], ['טבע', 'Nature'],
      ['יער', 'Forest'], ['הר', 'Mountain'], ['נהר', 'River'], ['ים', 'Sea'], ['אגם', 'Lake'],
      ['חוף', 'Beach'], ['מדבר', 'Desert'], ['עמק', 'Valley'], ['אי', 'Island'], ['מערה', 'Cave']
    ],
    'Technology & Modern Life': [
      ['טכנולוגיה', 'Technology'], ['מחשב', 'Computer'], ['טלפון', 'Phone'], ['אינטרנט', 'Internet'], ['מייל', 'Email'],
      ['אתר', 'Website'], ['אפליקציה', 'Application'], ['תוכנה', 'Software'], ['מצלמה', 'Camera'], ['טלוויזיה', 'Television'],
      ['רדיו', 'Radio'], ['מוזיקה', 'Music'], ['סרט', 'Movie'], ['משחק', 'Game'], ['רובוט', 'Robot'],
      ['בינה מלאכותית', 'Artificial intelligence'], ['מדפסת', 'Printer'], ['מקלדת', 'Keyboard'], ['עכבר', 'Mouse'], ['מסך', 'Screen']
    ]
  },
  es: {
    '100 Most Used Words': [
      ['hola', 'Hello'], ['gracias', 'Thank you'], ['por favor', 'Please'], ['perdón', 'Sorry'],
      ['sí', 'Yes'], ['no', 'No'], ['qué', 'What'], ['cómo', 'How'], ['dónde', 'Where'], ['cuándo', 'When'],
      ['por qué', 'Why'], ['quién', 'Who'], ['bueno', 'Good'], ['malo', 'Bad'], ['grande', 'Big'], ['pequeño', 'Small'],
      ['nuevo', 'New'], ['viejo', 'Old'], ['bonito', 'Beautiful'], ['feo', 'Ugly'], ['caliente', 'Hot'], ['frío', 'Cold'],
      ['agua', 'Water'], ['comida', 'Food'], ['pan', 'Bread'], ['leche', 'Milk'], ['café', 'Coffee'], ['té', 'Tea'],
      ['casa', 'House'], ['puerta', 'Door'], ['ventana', 'Window'], ['mesa', 'Table'], ['silla', 'Chair'], ['cama', 'Bed'],
      ['libro', 'Book'], ['lápiz', 'Pencil'], ['papel', 'Paper'], ['computadora', 'Computer'], ['teléfono', 'Phone'], ['tiempo', 'Time'],
      ['día', 'Day'], ['noche', 'Night'], ['mañana', 'Morning'], ['tarde', 'Evening'], ['semana', 'Week'], ['mes', 'Month'],
      ['año', 'Year'], ['dinero', 'Money'], ['trabajo', 'Work'], ['escuela', 'School'], ['familia', 'Family'], ['niño', 'Child'],
      ['padre', 'Father'], ['madre', 'Mother'], ['hermano', 'Brother'], ['hermana', 'Sister'], ['amigo', 'Friend'], ['amor', 'Love'],
      ['feliz', 'Happy'], ['triste', 'Sad'], ['enojado', 'Angry'], ['miedo', 'Fear'], ['sano', 'Healthy'], ['enfermo', 'Sick'],
      ['coche', 'Car'], ['autobús', 'Bus'], ['tren', 'Train'], ['avión', 'Airplane'], ['calle', 'Street'], ['ciudad', 'City'],
      ['pueblo', 'Village'], ['mar', 'Sea'], ['montaña', 'Mountain'], ['bosque', 'Forest'], ['jardín', 'Garden'], ['flor', 'Flower'],
      ['árbol', 'Tree'], ['perro', 'Dog'], ['gato', 'Cat'], ['pájaro', 'Bird'], ['pez', 'Fish'], ['color', 'Color'],
      ['rojo', 'Red'], ['azul', 'Blue'], ['verde', 'Green'], ['amarillo', 'Yellow'], ['negro', 'Black'], ['blanco', 'White'],
      ['número', 'Number'], ['uno', 'One'], ['dos', 'Two'], ['tres', 'Three'], ['cuatro', 'Four'], ['cinco', 'Five'],
      ['seis', 'Six'], ['siete', 'Seven'], ['ocho', 'Eight'], ['nueve', 'Nine'], ['diez', 'Ten'], ['cien', 'Hundred'],
      ['mil', 'Thousand'], ['cabeza', 'Head'], ['ojos', 'Eyes'], ['nariz', 'Nose'], ['boca', 'Mouth'], ['oídos', 'Ears'],
      ['manos', 'Hands'], ['piernas', 'Legs'], ['corazón', 'Heart'], ['cuerpo', 'Body']
    ],
    'Essential Greetings': [
      ['hola', 'Hello'], ['adiós', 'Goodbye'], ['buenos días', 'Good morning'], ['buenas tardes', 'Good afternoon'],
      ['buenas noches', 'Good evening'], ['¿cómo estás?', 'How are you'], ['bien', 'Fine'], ['muchas gracias', 'Thank you very much'],
      ['de nada', 'You\'re welcome'], ['disculpe', 'Excuse me'], ['lo siento', 'I\'m sorry'], ['felicidades', 'Congratulations'],
      ['bienvenido', 'Welcome'], ['mucho gusto', 'Nice to meet you'], ['que tengas un buen día', 'Have a good day'], ['buena suerte', 'Good luck']
    ],
    'Family & Relationships': [
      ['familia', 'Family'], ['padres', 'Parents'], ['padre', 'Father'], ['madre', 'Mother'], ['hijo', 'Son'],
      ['hija', 'Daughter'], ['hermano', 'Brother'], ['hermana', 'Sister'], ['abuelo', 'Grandfather'], ['abuela', 'Grandmother'],
      ['tío', 'Uncle'], ['tía', 'Aunt'], ['primo', 'Cousin (male)'], ['prima', 'Cousin (female)'], ['esposo', 'Husband'],
      ['esposa', 'Wife'], ['niño', 'Child'], ['bebé', 'Baby'], ['novio', 'Boyfriend'], ['novia', 'Girlfriend']
    ],
    'Food & Dining': [
      ['comida', 'Food'], ['comida', 'Meal'], ['desayuno', 'Breakfast'], ['almuerzo', 'Lunch'], ['cena', 'Dinner'],
      ['pan', 'Bread'], ['mantequilla', 'Butter'], ['queso', 'Cheese'], ['huevo', 'Egg'], ['leche', 'Milk'],
      ['carne', 'Meat'], ['pollo', 'Chicken'], ['pescado', 'Fish'], ['verduras', 'Vegetables'], ['frutas', 'Fruits'],
      ['manzana', 'Apple'], ['plátano', 'Banana'], ['naranja', 'Orange'], ['agua', 'Water'], ['jugo', 'Juice']
    ],
    'Time & Calendar': [
      ['tiempo', 'Time'], ['hora', 'Hour'], ['minuto', 'Minute'], ['segundo', 'Second'], ['día', 'Day'],
      ['semana', 'Week'], ['mes', 'Month'], ['año', 'Year'], ['domingo', 'Sunday'], ['lunes', 'Monday'],
      ['martes', 'Tuesday'], ['miércoles', 'Wednesday'], ['jueves', 'Thursday'], ['viernes', 'Friday'], ['sábado', 'Saturday'],
      ['mañana', 'Morning'], ['mediodía', 'Noon'], ['tarde', 'Afternoon'], ['noche', 'Evening'], ['medianoche', 'Midnight']
    ],
    'Colors & Descriptions': [
      ['color', 'Color'], ['rojo', 'Red'], ['azul', 'Blue'], ['verde', 'Green'], ['amarillo', 'Yellow'],
      ['naranja', 'Orange'], ['púrpura', 'Purple'], ['rosa', 'Pink'], ['marrón', 'Brown'], ['negro', 'Black'],
      ['blanco', 'White'], ['gris', 'Gray'], ['claro', 'Light'], ['oscuro', 'Dark'], ['grande', 'Big'],
      ['pequeño', 'Small'], ['largo', 'Long'], ['corto', 'Short'], ['ancho', 'Wide'], ['estrecho', 'Narrow']
    ],
    'Numbers & Mathematics': [
      ['número', 'Number'], ['cero', 'Zero'], ['uno', 'One'], ['dos', 'Two'], ['tres', 'Three'],
      ['cuatro', 'Four'], ['cinco', 'Five'], ['seis', 'Six'], ['siete', 'Seven'], ['ocho', 'Eight'],
      ['nueve', 'Nine'], ['diez', 'Ten'], ['veinte', 'Twenty'], ['treinta', 'Thirty'], ['cien', 'Hundred'],
      ['mil', 'Thousand'], ['suma', 'Addition'], ['resta', 'Subtraction'], ['multiplicación', 'Multiplication'], ['división', 'Division']
    ],
    'Transportation': [
      ['transporte', 'Transportation'], ['coche', 'Car'], ['autobús', 'Bus'], ['tren', 'Train'], ['avión', 'Airplane'],
      ['barco', 'Ship'], ['motocicleta', 'Motorcycle'], ['bicicleta', 'Bicycle'], ['taxi', 'Taxi'], ['metro', 'Subway'],
      ['estación', 'Station'], ['aeropuerto', 'Airport'], ['puerto', 'Port'], ['carretera', 'Highway'], ['calle', 'Street'],
      ['puente', 'Bridge'], ['túnel', 'Tunnel'], ['parking', 'Parking'], ['gasolinera', 'Gas station'], ['semáforo', 'Traffic light']
    ],
    'Weather & Nature': [
      ['clima', 'Weather'], ['sol', 'Sun'], ['lluvia', 'Rain'], ['nieve', 'Snow'], ['viento', 'Wind'],
      ['nubes', 'Clouds'], ['rayo', 'Lightning'], ['trueno', 'Thunder'], ['arcoíris', 'Rainbow'], ['naturaleza', 'Nature'],
      ['bosque', 'Forest'], ['montaña', 'Mountain'], ['río', 'River'], ['mar', 'Sea'], ['lago', 'Lake'],
      ['playa', 'Beach'], ['desierto', 'Desert'], ['valle', 'Valley'], ['isla', 'Island'], ['cueva', 'Cave']
    ],
    'Technology & Modern Life': [
      ['tecnología', 'Technology'], ['computadora', 'Computer'], ['teléfono', 'Phone'], ['internet', 'Internet'], ['correo', 'Email'],
      ['sitio web', 'Website'], ['aplicación', 'Application'], ['software', 'Software'], ['cámara', 'Camera'], ['televisión', 'Television'],
      ['radio', 'Radio'], ['música', 'Music'], ['película', 'Movie'], ['juego', 'Game'], ['robot', 'Robot'],
      ['inteligencia artificial', 'Artificial intelligence'], ['impresora', 'Printer'], ['teclado', 'Keyboard'], ['ratón', 'Mouse'], ['pantalla', 'Screen']
    ]
  },
  // Continue with other languages...
  fr: {
    '100 Most Used Words': [
      ['bonjour', 'Hello'], ['merci', 'Thank you'], ['s\'il vous plaît', 'Please'], ['excusez-moi', 'Sorry'],
      ['oui', 'Yes'], ['non', 'No'], ['quoi', 'What'], ['comment', 'How'], ['où', 'Where'], ['quand', 'When'],
      ['pourquoi', 'Why'], ['qui', 'Who'], ['bon', 'Good'], ['mauvais', 'Bad'], ['grand', 'Big'], ['petit', 'Small'],
      ['nouveau', 'New'], ['vieux', 'Old'], ['beau', 'Beautiful'], ['laid', 'Ugly'], ['chaud', 'Hot'], ['froid', 'Cold'],
      ['eau', 'Water'], ['nourriture', 'Food'], ['pain', 'Bread'], ['lait', 'Milk'], ['café', 'Coffee'], ['thé', 'Tea'],
      ['maison', 'House'], ['porte', 'Door'], ['fenêtre', 'Window'], ['table', 'Table'], ['chaise', 'Chair'], ['lit', 'Bed'],
      ['livre', 'Book'], ['crayon', 'Pencil'], ['papier', 'Paper'], ['ordinateur', 'Computer'], ['téléphone', 'Phone'], ['temps', 'Time'],
      ['jour', 'Day'], ['nuit', 'Night'], ['matin', 'Morning'], ['soir', 'Evening'], ['semaine', 'Week'], ['mois', 'Month'],
      ['année', 'Year'], ['argent', 'Money'], ['travail', 'Work'], ['école', 'School'], ['famille', 'Family'], ['enfant', 'Child'],
      ['père', 'Father'], ['mère', 'Mother'], ['frère', 'Brother'], ['sœur', 'Sister'], ['ami', 'Friend'], ['amour', 'Love'],
      ['heureux', 'Happy'], ['triste', 'Sad'], ['en colère', 'Angry'], ['peur', 'Fear'], ['sain', 'Healthy'], ['malade', 'Sick'],
      ['voiture', 'Car'], ['bus', 'Bus'], ['train', 'Train'], ['avion', 'Airplane'], ['rue', 'Street'], ['ville', 'City'],
      ['village', 'Village'], ['mer', 'Sea'], ['montagne', 'Mountain'], ['forêt', 'Forest'], ['jardin', 'Garden'], ['fleur', 'Flower'],
      ['arbre', 'Tree'], ['chien', 'Dog'], ['chat', 'Cat'], ['oiseau', 'Bird'], ['poisson', 'Fish'], ['couleur', 'Color'],
      ['rouge', 'Red'], ['bleu', 'Blue'], ['vert', 'Green'], ['jaune', 'Yellow'], ['noir', 'Black'], ['blanc', 'White'],
      ['nombre', 'Number'], ['un', 'One'], ['deux', 'Two'], ['trois', 'Three'], ['quatre', 'Four'], ['cinq', 'Five'],
      ['six', 'Six'], ['sept', 'Seven'], ['huit', 'Eight'], ['neuf', 'Nine'], ['dix', 'Ten'], ['cent', 'Hundred'],
      ['mille', 'Thousand'], ['tête', 'Head'], ['yeux', 'Eyes'], ['nez', 'Nose'], ['bouche', 'Mouth'], ['oreilles', 'Ears'],
      ['mains', 'Hands'], ['jambes', 'Legs'], ['cœur', 'Heart'], ['corps', 'Body']
    ],
    'Essential Greetings': [
      ['bonjour', 'Hello'], ['au revoir', 'Goodbye'], ['bonne matinée', 'Good morning'], ['bonsoir', 'Good evening'],
      ['bonne nuit', 'Good night'], ['comment allez-vous', 'How are you'], ['ça va', 'Fine'], ['merci beaucoup', 'Thank you very much'],
      ['de rien', 'You\'re welcome'], ['excusez-moi', 'Excuse me'], ['je suis désolé', 'I\'m sorry'], ['félicitations', 'Congratulations'],
      ['joyeux anniversaire', 'Happy birthday'], ['bonne chance', 'Good luck'], ['bienvenue', 'Welcome'], ['enchanté', 'Nice to meet you'],
      ['à bientôt', 'See you soon'], ['prenez soin de vous', 'Take care'], ['passe une bonne journée', 'Have a good day'], ['salut', 'Hi']
    ],
    'Family & Relationships': [
      ['famille', 'Family'], ['parents', 'Parents'], ['père', 'Father'], ['mère', 'Mother'], ['fils', 'Son'], ['fille', 'Daughter'],
      ['frère', 'Brother'], ['sœur', 'Sister'], ['grand-père', 'Grandfather'], ['grand-mère', 'Grandmother'], ['oncle', 'Uncle'], ['tante', 'Aunt'],
      ['cousin', 'Cousin'], ['époux', 'Husband'], ['épouse', 'Wife'], ['petit ami', 'Boyfriend'], ['petite amie', 'Girlfriend'], ['ami', 'Friend'],
      ['voisin', 'Neighbor'], ['bébé', 'Baby'], ['enfant', 'Child'], ['adolescent', 'Teenager'], ['adulte', 'Adult'], ['personne âgée', 'Elderly person'],
      ['mariage', 'Marriage'], ['divorce', 'Divorce'], ['célibataire', 'Single'], ['marié', 'Married'], ['fiancé', 'Engaged'], ['veuf', 'Widowed']
    ],
    'Food & Dining': [
      ['nourriture', 'Food'], ['repas', 'Meal'], ['petit-déjeuner', 'Breakfast'], ['déjeuner', 'Lunch'], ['dîner', 'Dinner'], ['pain', 'Bread'],
      ['viande', 'Meat'], ['poisson', 'Fish'], ['légumes', 'Vegetables'], ['fruits', 'Fruits'], ['riz', 'Rice'], ['pâtes', 'Pasta'],
      ['fromage', 'Cheese'], ['lait', 'Milk'], ['œufs', 'Eggs'], ['beurre', 'Butter'], ['sucre', 'Sugar'], ['sel', 'Salt'],
      ['poivre', 'Pepper'], ['huile', 'Oil'], ['eau', 'Water'], ['jus', 'Juice'], ['café', 'Coffee'], ['thé', 'Tea'],
      ['vin', 'Wine'], ['bière', 'Beer'], ['restaurant', 'Restaurant'], ['menu', 'Menu'], ['serveur', 'Waiter'], ['addition', 'Bill']
    ],
    'Time & Calendar': [
      ['temps', 'Time'], ['heure', 'Hour'], ['minute', 'Minute'], ['seconde', 'Second'], ['jour', 'Day'], ['semaine', 'Week'],
      ['mois', 'Month'], ['année', 'Year'], ['lundi', 'Monday'], ['mardi', 'Tuesday'], ['mercredi', 'Wednesday'], ['jeudi', 'Thursday'],
      ['vendredi', 'Friday'], ['samedi', 'Saturday'], ['dimanche', 'Sunday'], ['janvier', 'January'], ['février', 'February'], ['mars', 'March'],
      ['avril', 'April'], ['mai', 'May'], ['juin', 'June'], ['juillet', 'July'], ['août', 'August'], ['septembre', 'September'],
      ['octobre', 'October'], ['novembre', 'November'], ['décembre', 'December'], ['aujourd\'hui', 'Today'], ['hier', 'Yesterday'], ['demain', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['couleur', 'Color'], ['rouge', 'Red'], ['bleu', 'Blue'], ['vert', 'Green'], ['jaune', 'Yellow'], ['orange', 'Orange'],
      ['violet', 'Purple'], ['rose', 'Pink'], ['noir', 'Black'], ['blanc', 'White'], ['gris', 'Gray'], ['marron', 'Brown'],
      ['grand', 'Big'], ['petit', 'Small'], ['long', 'Long'], ['court', 'Short'], ['large', 'Wide'], ['étroit', 'Narrow'],
      ['épais', 'Thick'], ['mince', 'Thin'], ['lourd', 'Heavy'], ['léger', 'Light'], ['dur', 'Hard'], ['mou', 'Soft'],
      ['chaud', 'Hot'], ['froid', 'Cold'], ['sec', 'Dry'], ['humide', 'Wet'], ['propre', 'Clean'], ['sale', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['nombre', 'Number'], ['zéro', 'Zero'], ['un', 'One'], ['deux', 'Two'], ['trois', 'Three'], ['quatre', 'Four'],
      ['cinq', 'Five'], ['six', 'Six'], ['sept', 'Seven'], ['huit', 'Eight'], ['neuf', 'Nine'], ['dix', 'Ten'],
      ['vingt', 'Twenty'], ['trente', 'Thirty'], ['quarante', 'Forty'], ['cinquante', 'Fifty'], ['cent', 'Hundred'], ['mille', 'Thousand'],
      ['plus', 'Plus'], ['moins', 'Minus'], ['fois', 'Times'], ['divisé par', 'Divided by'], ['égal', 'Equals'], ['pourcentage', 'Percentage'],
      ['premier', 'First'], ['deuxième', 'Second'], ['troisième', 'Third'], ['dernier', 'Last'], ['moitié', 'Half'], ['double', 'Double']
    ],
    'Transportation': [
      ['transport', 'Transportation'], ['voiture', 'Car'], ['autobus', 'Bus'], ['train', 'Train'], ['avion', 'Airplane'], ['vélo', 'Bicycle'],
      ['moto', 'Motorcycle'], ['taxi', 'Taxi'], ['métro', 'Subway'], ['bateau', 'Boat'], ['navire', 'Ship'], ['camion', 'Truck'],
      ['route', 'Road'], ['rue', 'Street'], ['autoroute', 'Highway'], ['pont', 'Bridge'], ['tunnel', 'Tunnel'], ['gare', 'Station'],
      ['aéroport', 'Airport'], ['port', 'Port'], ['arrêt', 'Stop'], ['ticket', 'Ticket'], ['passeport', 'Passport'], ['bagages', 'Luggage'],
      ['conduite', 'Driving'], ['parking', 'Parking'], ['essence', 'Gas'], ['réparation', 'Repair'], ['accident', 'Accident'], ['circulation', 'Traffic']
    ],
    'Weather & Nature': [
      ['météo', 'Weather'], ['soleil', 'Sun'], ['lune', 'Moon'], ['étoiles', 'Stars'], ['nuages', 'Clouds'], ['pluie', 'Rain'],
      ['neige', 'Snow'], ['vent', 'Wind'], ['orage', 'Storm'], ['brouillard', 'Fog'], ['arc-en-ciel', 'Rainbow'], ['température', 'Temperature'],
      ['chaud', 'Hot'], ['froid', 'Cold'], ['saison', 'Season'], ['printemps', 'Spring'], ['été', 'Summer'], ['automne', 'Autumn'],
      ['hiver', 'Winter'], ['nature', 'Nature'], ['arbre', 'Tree'], ['fleur', 'Flower'], ['herbe', 'Grass'], ['forêt', 'Forest'],
      ['montagne', 'Mountain'], ['rivière', 'River'], ['lac', 'Lake'], ['mer', 'Sea'], ['plage', 'Beach'], ['désert', 'Desert']
    ],
    'Technology & Modern Life': [
      ['technologie', 'Technology'], ['ordinateur', 'Computer'], ['internet', 'Internet'], ['site web', 'Website'], ['email', 'Email'], ['téléphone', 'Phone'],
      ['smartphone', 'Smartphone'], ['application', 'App'], ['logiciel', 'Software'], ['réseau', 'Network'], ['mot de passe', 'Password'], ['fichier', 'File'],
      ['dossier', 'Folder'], ['téléchargement', 'Download'], ['téléversement', 'Upload'], ['connexion', 'Connection'], ['wifi', 'WiFi'], ['bluetooth', 'Bluetooth'],
      ['écran', 'Screen'], ['clavier', 'Keyboard'], ['souris', 'Mouse'], ['imprimante', 'Printer'], ['caméra', 'Camera'], ['vidéo', 'Video'],
      ['photo', 'Photo'], ['musique', 'Music'], ['jeu', 'Game'], ['réseaux sociaux', 'Social media'], ['messagerie', 'Messaging'], ['numérique', 'Digital']
    ]
  },
  de: {
    '100 Most Used Words': [
      ['hallo', 'Hello'], ['danke', 'Thank you'], ['bitte', 'Please'], ['entschuldigung', 'Sorry'],
      ['ja', 'Yes'], ['nein', 'No'], ['was', 'What'], ['wie', 'How'], ['wo', 'Where'], ['wann', 'When'],
      ['warum', 'Why'], ['wer', 'Who'], ['gut', 'Good'], ['schlecht', 'Bad'], ['groß', 'Big'], ['klein', 'Small'],
      ['neu', 'New'], ['alt', 'Old'], ['schön', 'Beautiful'], ['hässlich', 'Ugly'], ['heiß', 'Hot'], ['kalt', 'Cold'],
      ['wasser', 'Water'], ['essen', 'Food'], ['brot', 'Bread'], ['milch', 'Milk'], ['kaffee', 'Coffee'], ['tee', 'Tea'],
      ['haus', 'House'], ['tür', 'Door'], ['fenster', 'Window'], ['tisch', 'Table'], ['stuhl', 'Chair'], ['bett', 'Bed'],
      ['buch', 'Book'], ['bleistift', 'Pencil'], ['papier', 'Paper'], ['computer', 'Computer'], ['telefon', 'Phone'], ['zeit', 'Time'],
      ['tag', 'Day'], ['nacht', 'Night'], ['morgen', 'Morning'], ['abend', 'Evening'], ['woche', 'Week'], ['monat', 'Month'],
      ['jahr', 'Year'], ['geld', 'Money'], ['arbeit', 'Work'], ['schule', 'School'], ['familie', 'Family'], ['kind', 'Child'],
      ['vater', 'Father'], ['mutter', 'Mother'], ['bruder', 'Brother'], ['schwester', 'Sister'], ['freund', 'Friend'], ['liebe', 'Love'],
      ['glücklich', 'Happy'], ['traurig', 'Sad'], ['wütend', 'Angry'], ['angst', 'Fear'], ['gesund', 'Healthy'], ['krank', 'Sick'],
      ['auto', 'Car'], ['bus', 'Bus'], ['zug', 'Train'], ['flugzeug', 'Airplane'], ['straße', 'Street'], ['stadt', 'City'],
      ['dorf', 'Village'], ['meer', 'Sea'], ['berg', 'Mountain'], ['wald', 'Forest'], ['garten', 'Garden'], ['blume', 'Flower'],
      ['baum', 'Tree'], ['hund', 'Dog'], ['katze', 'Cat'], ['vogel', 'Bird'], ['fisch', 'Fish'], ['farbe', 'Color'],
      ['rot', 'Red'], ['blau', 'Blue'], ['grün', 'Green'], ['gelb', 'Yellow'], ['schwarz', 'Black'], ['weiß', 'White'],
      ['zahl', 'Number'], ['eins', 'One'], ['zwei', 'Two'], ['drei', 'Three'], ['vier', 'Four'], ['fünf', 'Five'],
      ['sechs', 'Six'], ['sieben', 'Seven'], ['acht', 'Eight'], ['neun', 'Nine'], ['zehn', 'Ten'], ['hundert', 'Hundred'],
      ['tausend', 'Thousand'], ['kopf', 'Head'], ['augen', 'Eyes'], ['nase', 'Nose'], ['mund', 'Mouth'], ['ohren', 'Ears'],
      ['hände', 'Hands'], ['beine', 'Legs'], ['herz', 'Heart'], ['körper', 'Body']
    ],
    'Essential Greetings': [
      ['hallo', 'Hello'], ['auf wiedersehen', 'Goodbye'], ['guten morgen', 'Good morning'], ['guten abend', 'Good evening'],
      ['gute nacht', 'Good night'], ['wie geht es ihnen', 'How are you'], ['gut', 'Fine'], ['vielen dank', 'Thank you very much'],
      ['bitte schön', 'You\'re welcome'], ['entschuldigen sie', 'Excuse me'], ['es tut mir leid', 'I\'m sorry'], ['herzlichen glückwunsch', 'Congratulations']
    ],
    'Family & Relationships': [
      ['familie', 'Family'], ['eltern', 'Parents'], ['vater', 'Father'], ['mutter', 'Mother'], ['sohn', 'Son'],
      ['tochter', 'Daughter'], ['bruder', 'Brother'], ['schwester', 'Sister'], ['großvater', 'Grandfather'], ['großmutter', 'Grandmother'],
      ['onkel', 'Uncle'], ['tante', 'Aunt'], ['cousin', 'Cousin'], ['ehemann', 'Husband'], ['ehefrau', 'Wife']
    ],
    'Food & Dining': [
      ['essen', 'Food'], ['mahlzeit', 'Meal'], ['frühstück', 'Breakfast'], ['mittagessen', 'Lunch'], ['abendessen', 'Dinner'],
      ['brot', 'Bread'], ['butter', 'Butter'], ['käse', 'Cheese'], ['ei', 'Egg'], ['milch', 'Milk'],
      ['fleisch', 'Meat'], ['huhn', 'Chicken'], ['fisch', 'Fish'], ['gemüse', 'Vegetables'], ['obst', 'Fruits']
    ],
    'Time & Calendar': [
      ['zeit', 'Time'], ['stunde', 'Hour'], ['minute', 'Minute'], ['sekunde', 'Second'], ['tag', 'Day'],
      ['woche', 'Week'], ['monat', 'Month'], ['jahr', 'Year'], ['sonntag', 'Sunday'], ['montag', 'Monday'],
      ['dienstag', 'Tuesday'], ['mittwoch', 'Wednesday'], ['donnerstag', 'Thursday'], ['freitag', 'Friday'], ['samstag', 'Saturday']
    ],
    'Colors & Descriptions': [
      ['farbe', 'Color'], ['rot', 'Red'], ['blau', 'Blue'], ['grün', 'Green'], ['gelb', 'Yellow'],
      ['orange', 'Orange'], ['lila', 'Purple'], ['rosa', 'Pink'], ['braun', 'Brown'], ['schwarz', 'Black'],
      ['weiß', 'White'], ['grau', 'Gray'], ['hell', 'Light'], ['dunkel', 'Dark'], ['groß', 'Big']
    ],
    'Numbers & Mathematics': [
      ['zahl', 'Number'], ['null', 'Zero'], ['eins', 'One'], ['zwei', 'Two'], ['drei', 'Three'],
      ['vier', 'Four'], ['fünf', 'Five'], ['sechs', 'Six'], ['sieben', 'Seven'], ['acht', 'Eight'],
      ['neun', 'Nine'], ['zehn', 'Ten'], ['zwanzig', 'Twenty'], ['dreißig', 'Thirty'], ['hundert', 'Hundred']
    ],
    'Transportation': [
      ['transport', 'Transportation'], ['auto', 'Car'], ['bus', 'Bus'], ['zug', 'Train'], ['flugzeug', 'Airplane'],
      ['schiff', 'Ship'], ['motorrad', 'Motorcycle'], ['fahrrad', 'Bicycle'], ['taxi', 'Taxi'], ['u-bahn', 'Subway'],
      ['bahnhof', 'Station'], ['flughafen', 'Airport'], ['hafen', 'Port'], ['straße', 'Street'], ['autobahn', 'Highway']
    ],
    'Weather & Nature': [
      ['wetter', 'Weather'], ['sonne', 'Sun'], ['regen', 'Rain'], ['schnee', 'Snow'], ['wind', 'Wind'],
      ['wolken', 'Clouds'], ['blitz', 'Lightning'], ['donner', 'Thunder'], ['regenbogen', 'Rainbow'], ['natur', 'Nature'],
      ['wald', 'Forest'], ['berg', 'Mountain'], ['fluss', 'River'], ['meer', 'Sea'], ['see', 'Lake']
    ],
    'Technology & Modern Life': [
      ['technologie', 'Technology'], ['computer', 'Computer'], ['telefon', 'Phone'], ['internet', 'Internet'], ['e-mail', 'Email'],
      ['website', 'Website'], ['anwendung', 'Application'], ['software', 'Software'], ['kamera', 'Camera'], ['fernseher', 'Television'],
      ['radio', 'Radio'], ['musik', 'Music'], ['film', 'Movie'], ['spiel', 'Game'], ['roboter', 'Robot']
    ]
  },
  it: {
    '100 Most Used Words': [
      ['ciao', 'Hello'], ['grazie', 'Thank you'], ['per favore', 'Please'], ['scusa', 'Sorry'],
      ['sì', 'Yes'], ['no', 'No'], ['cosa', 'What'], ['come', 'How'], ['dove', 'Where'], ['quando', 'When'],
      ['perché', 'Why'], ['chi', 'Who'], ['buono', 'Good'], ['cattivo', 'Bad'], ['grande', 'Big'], ['piccolo', 'Small'],
      ['nuovo', 'New'], ['vecchio', 'Old'], ['bello', 'Beautiful'], ['brutto', 'Ugly'], ['caldo', 'Hot'], ['freddo', 'Cold'],
      ['acqua', 'Water'], ['cibo', 'Food'], ['pane', 'Bread'], ['latte', 'Milk'], ['caffè', 'Coffee'], ['tè', 'Tea'],
      ['casa', 'House'], ['porta', 'Door'], ['finestra', 'Window'], ['tavolo', 'Table'], ['sedia', 'Chair'], ['letto', 'Bed'],
      ['libro', 'Book'], ['matita', 'Pencil'], ['carta', 'Paper'], ['computer', 'Computer'], ['telefono', 'Phone'], ['tempo', 'Time'],
      ['giorno', 'Day'], ['notte', 'Night'], ['mattina', 'Morning'], ['sera', 'Evening'], ['settimana', 'Week'], ['mese', 'Month'],
      ['anno', 'Year'], ['soldi', 'Money'], ['lavoro', 'Work'], ['scuola', 'School'], ['famiglia', 'Family'], ['bambino', 'Child'],
      ['padre', 'Father'], ['madre', 'Mother'], ['fratello', 'Brother'], ['sorella', 'Sister'], ['amico', 'Friend'], ['amore', 'Love'],
      ['felice', 'Happy'], ['triste', 'Sad'], ['arrabbiato', 'Angry'], ['paura', 'Fear'], ['sano', 'Healthy'], ['malato', 'Sick'],
      ['macchina', 'Car'], ['autobus', 'Bus'], ['treno', 'Train'], ['aereo', 'Airplane'], ['strada', 'Street'], ['città', 'City'],
      ['paese', 'Village'], ['mare', 'Sea'], ['montagna', 'Mountain'], ['bosco', 'Forest'], ['giardino', 'Garden'], ['fiore', 'Flower'],
      ['albero', 'Tree'], ['cane', 'Dog'], ['gatto', 'Cat'], ['uccello', 'Bird'], ['pesce', 'Fish'], ['colore', 'Color'],
      ['rosso', 'Red'], ['blu', 'Blue'], ['verde', 'Green'], ['giallo', 'Yellow'], ['nero', 'Black'], ['bianco', 'White'],
      ['numero', 'Number'], ['uno', 'One'], ['due', 'Two'], ['tre', 'Three'], ['quattro', 'Four'], ['cinque', 'Five'],
      ['sei', 'Six'], ['sette', 'Seven'], ['otto', 'Eight'], ['nove', 'Nine'], ['dieci', 'Ten'], ['cento', 'Hundred'],
      ['mille', 'Thousand'], ['testa', 'Head'], ['occhi', 'Eyes'], ['naso', 'Nose'], ['bocca', 'Mouth'], ['orecchie', 'Ears'],
      ['mani', 'Hands'], ['gambe', 'Legs'], ['cuore', 'Heart'], ['corpo', 'Body']
    ],
    'Essential Greetings': [
      ['ciao', 'Hello'], ['arrivederci', 'Goodbye'], ['buongiorno', 'Good morning'], ['buonasera', 'Good evening'],
      ['buonanotte', 'Good night'], ['come sta', 'How are you'], ['bene', 'Fine'], ['grazie mille', 'Thank you very much'],
      ['prego', 'You\'re welcome'], ['scusi', 'Excuse me'], ['mi dispiace', 'I\'m sorry'], ['congratulazioni', 'Congratulations'],
      ['buon compleanno', 'Happy birthday'], ['in bocca al lupo', 'Good luck'], ['benvenuto', 'Welcome'], ['piacere', 'Nice to meet you'],
      ['a presto', 'See you soon'], ['abbi cura', 'Take care'], ['buona giornata', 'Have a good day'], ['salve', 'Hi']
    ],
    'Family & Relationships': [
      ['famiglia', 'Family'], ['genitori', 'Parents'], ['padre', 'Father'], ['madre', 'Mother'], ['figlio', 'Son'], ['figlia', 'Daughter'],
      ['fratello', 'Brother'], ['sorella', 'Sister'], ['nonno', 'Grandfather'], ['nonna', 'Grandmother'], ['zio', 'Uncle'], ['zia', 'Aunt'],
      ['cugino', 'Cousin'], ['marito', 'Husband'], ['moglie', 'Wife'], ['fidanzato', 'Boyfriend'], ['fidanzata', 'Girlfriend'], ['amico', 'Friend'],
      ['vicino', 'Neighbor'], ['bambino', 'Baby'], ['bambina', 'Child'], ['adolescente', 'Teenager'], ['adulto', 'Adult'], ['anziano', 'Elderly person'],
      ['matrimonio', 'Marriage'], ['divorzio', 'Divorce'], ['single', 'Single'], ['sposato', 'Married'], ['fidanzato', 'Engaged'], ['vedovo', 'Widowed']
    ],
    'Food & Dining': [
      ['cibo', 'Food'], ['pasto', 'Meal'], ['colazione', 'Breakfast'], ['pranzo', 'Lunch'], ['cena', 'Dinner'], ['pane', 'Bread'],
      ['carne', 'Meat'], ['pesce', 'Fish'], ['verdure', 'Vegetables'], ['frutta', 'Fruits'], ['riso', 'Rice'], ['pasta', 'Pasta'],
      ['formaggio', 'Cheese'], ['latte', 'Milk'], ['uova', 'Eggs'], ['burro', 'Butter'], ['zucchero', 'Sugar'], ['sale', 'Salt'],
      ['pepe', 'Pepper'], ['olio', 'Oil'], ['acqua', 'Water'], ['succo', 'Juice'], ['caffè', 'Coffee'], ['tè', 'Tea'],
      ['vino', 'Wine'], ['birra', 'Beer'], ['ristorante', 'Restaurant'], ['menu', 'Menu'], ['cameriere', 'Waiter'], ['conto', 'Bill']
    ],
    'Time & Calendar': [
      ['tempo', 'Time'], ['ora', 'Hour'], ['minuto', 'Minute'], ['secondo', 'Second'], ['giorno', 'Day'], ['settimana', 'Week'],
      ['mese', 'Month'], ['anno', 'Year'], ['lunedì', 'Monday'], ['martedì', 'Tuesday'], ['mercoledì', 'Wednesday'], ['giovedì', 'Thursday'],
      ['venerdì', 'Friday'], ['sabato', 'Saturday'], ['domenica', 'Sunday'], ['gennaio', 'January'], ['febbraio', 'February'], ['marzo', 'March'],
      ['aprile', 'April'], ['maggio', 'May'], ['giugno', 'June'], ['luglio', 'July'], ['agosto', 'August'], ['settembre', 'September'],
      ['ottobre', 'October'], ['novembre', 'November'], ['dicembre', 'December'], ['oggi', 'Today'], ['ieri', 'Yesterday'], ['domani', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['colore', 'Color'], ['rosso', 'Red'], ['blu', 'Blue'], ['verde', 'Green'], ['giallo', 'Yellow'], ['arancione', 'Orange'],
      ['viola', 'Purple'], ['rosa', 'Pink'], ['nero', 'Black'], ['bianco', 'White'], ['grigio', 'Gray'], ['marrone', 'Brown'],
      ['grande', 'Big'], ['piccolo', 'Small'], ['lungo', 'Long'], ['corto', 'Short'], ['largo', 'Wide'], ['stretto', 'Narrow'],
      ['spesso', 'Thick'], ['sottile', 'Thin'], ['pesante', 'Heavy'], ['leggero', 'Light'], ['duro', 'Hard'], ['morbido', 'Soft'],
      ['caldo', 'Hot'], ['freddo', 'Cold'], ['secco', 'Dry'], ['bagnato', 'Wet'], ['pulito', 'Clean'], ['sporco', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['numero', 'Number'], ['zero', 'Zero'], ['uno', 'One'], ['due', 'Two'], ['tre', 'Three'], ['quattro', 'Four'],
      ['cinque', 'Five'], ['sei', 'Six'], ['sette', 'Seven'], ['otto', 'Eight'], ['nove', 'Nine'], ['dieci', 'Ten'],
      ['venti', 'Twenty'], ['trenta', 'Thirty'], ['quaranta', 'Forty'], ['cinquanta', 'Fifty'], ['cento', 'Hundred'], ['mille', 'Thousand'],
      ['più', 'Plus'], ['meno', 'Minus'], ['volte', 'Times'], ['diviso', 'Divided by'], ['uguale', 'Equals'], ['percentuale', 'Percentage'],
      ['primo', 'First'], ['secondo', 'Second'], ['terzo', 'Third'], ['ultimo', 'Last'], ['metà', 'Half'], ['doppio', 'Double']
    ],
    'Transportation': [
      ['trasporto', 'Transportation'], ['macchina', 'Car'], ['autobus', 'Bus'], ['treno', 'Train'], ['aereo', 'Airplane'], ['bicicletta', 'Bicycle'],
      ['moto', 'Motorcycle'], ['taxi', 'Taxi'], ['metro', 'Subway'], ['barca', 'Boat'], ['nave', 'Ship'], ['camion', 'Truck'],
      ['strada', 'Road'], ['via', 'Street'], ['autostrada', 'Highway'], ['ponte', 'Bridge'], ['tunnel', 'Tunnel'], ['stazione', 'Station'],
      ['aeroporto', 'Airport'], ['porto', 'Port'], ['fermata', 'Stop'], ['biglietto', 'Ticket'], ['passaporto', 'Passport'], ['bagaglio', 'Luggage'],
      ['guidare', 'Driving'], ['parcheggio', 'Parking'], ['benzina', 'Gas'], ['riparazione', 'Repair'], ['incidente', 'Accident'], ['traffico', 'Traffic']
    ],
    'Weather & Nature': [
      ['tempo', 'Weather'], ['sole', 'Sun'], ['luna', 'Moon'], ['stelle', 'Stars'], ['nuvole', 'Clouds'], ['pioggia', 'Rain'],
      ['neve', 'Snow'], ['vento', 'Wind'], ['tempesta', 'Storm'], ['nebbia', 'Fog'], ['arcobaleno', 'Rainbow'], ['temperatura', 'Temperature'],
      ['caldo', 'Hot'], ['freddo', 'Cold'], ['stagione', 'Season'], ['primavera', 'Spring'], ['estate', 'Summer'], ['autunno', 'Autumn'],
      ['inverno', 'Winter'], ['natura', 'Nature'], ['albero', 'Tree'], ['fiore', 'Flower'], ['erba', 'Grass'], ['foresta', 'Forest'],
      ['montagna', 'Mountain'], ['fiume', 'River'], ['lago', 'Lake'], ['mare', 'Sea'], ['spiaggia', 'Beach'], ['deserto', 'Desert']
    ],
    'Technology & Modern Life': [
      ['tecnologia', 'Technology'], ['computer', 'Computer'], ['internet', 'Internet'], ['sito web', 'Website'], ['email', 'Email'], ['telefono', 'Phone'],
      ['smartphone', 'Smartphone'], ['app', 'App'], ['software', 'Software'], ['rete', 'Network'], ['password', 'Password'], ['file', 'File'],
      ['cartella', 'Folder'], ['download', 'Download'], ['upload', 'Upload'], ['connessione', 'Connection'], ['wifi', 'WiFi'], ['bluetooth', 'Bluetooth'],
      ['schermo', 'Screen'], ['tastiera', 'Keyboard'], ['mouse', 'Mouse'], ['stampante', 'Printer'], ['fotocamera', 'Camera'], ['video', 'Video'],
      ['foto', 'Photo'], ['musica', 'Music'], ['gioco', 'Game'], ['social media', 'Social media'], ['messaggi', 'Messaging'], ['digitale', 'Digital']
    ]
  },
  pt: {
    '100 Most Used Words': [
      ['olá', 'Hello'], ['obrigado', 'Thank you'], ['por favor', 'Please'], ['desculpa', 'Sorry'],
      ['sim', 'Yes'], ['não', 'No'], ['o que', 'What'], ['como', 'How'], ['onde', 'Where'], ['quando', 'When'],
      ['por que', 'Why'], ['quem', 'Who'], ['bom', 'Good'], ['mau', 'Bad'], ['grande', 'Big'], ['pequeno', 'Small'],
      ['novo', 'New'], ['velho', 'Old'], ['bonito', 'Beautiful'], ['feio', 'Ugly'], ['quente', 'Hot'], ['frio', 'Cold'],
      ['água', 'Water'], ['comida', 'Food'], ['pão', 'Bread'], ['leite', 'Milk'], ['café', 'Coffee'], ['chá', 'Tea'],
      ['casa', 'House'], ['porta', 'Door'], ['janela', 'Window'], ['mesa', 'Table'], ['cadeira', 'Chair'], ['cama', 'Bed'],
      ['livro', 'Book'], ['lápis', 'Pencil'], ['papel', 'Paper'], ['computador', 'Computer'], ['telefone', 'Phone'], ['tempo', 'Time'],
      ['dia', 'Day'], ['noite', 'Night'], ['manhã', 'Morning'], ['tarde', 'Evening'], ['semana', 'Week'], ['mês', 'Month'],
      ['ano', 'Year'], ['dinheiro', 'Money'], ['trabalho', 'Work'], ['escola', 'School'], ['família', 'Family'], ['criança', 'Child'],
      ['pai', 'Father'], ['mãe', 'Mother'], ['irmão', 'Brother'], ['irmã', 'Sister'], ['amigo', 'Friend'], ['amor', 'Love'],
      ['feliz', 'Happy'], ['triste', 'Sad'], ['zangado', 'Angry'], ['medo', 'Fear'], ['saudável', 'Healthy'], ['doente', 'Sick'],
      ['carro', 'Car'], ['ônibus', 'Bus'], ['trem', 'Train'], ['avião', 'Airplane'], ['rua', 'Street'], ['cidade', 'City'],
      ['aldeia', 'Village'], ['mar', 'Sea'], ['montanha', 'Mountain'], ['floresta', 'Forest'], ['jardim', 'Garden'], ['flor', 'Flower'],
      ['árvore', 'Tree'], ['cão', 'Dog'], ['gato', 'Cat'], ['pássaro', 'Bird'], ['peixe', 'Fish'], ['cor', 'Color'],
      ['vermelho', 'Red'], ['azul', 'Blue'], ['verde', 'Green'], ['amarelo', 'Yellow'], ['preto', 'Black'], ['branco', 'White'],
      ['número', 'Number'], ['um', 'One'], ['dois', 'Two'], ['três', 'Three'], ['quatro', 'Four'], ['cinco', 'Five'],
      ['seis', 'Six'], ['sete', 'Seven'], ['oito', 'Eight'], ['nove', 'Nine'], ['dez', 'Ten'], ['cem', 'Hundred'],
      ['mil', 'Thousand'], ['cabeça', 'Head'], ['olhos', 'Eyes'], ['nariz', 'Nose'], ['boca', 'Mouth'], ['ouvidos', 'Ears'],
      ['mãos', 'Hands'], ['pernas', 'Legs'], ['coração', 'Heart'], ['corpo', 'Body']
    ],
    'Essential Greetings': [
      ['olá', 'Hello'], ['tchau', 'Goodbye'], ['bom dia', 'Good morning'], ['boa tarde', 'Good afternoon'],
      ['boa noite', 'Good night'], ['como está', 'How are you'], ['bem', 'Fine'], ['muito obrigado', 'Thank you very much'],
      ['de nada', 'You\'re welcome'], ['com licença', 'Excuse me'], ['desculpe', 'I\'m sorry'], ['parabéns', 'Congratulations'],
      ['feliz aniversário', 'Happy birthday'], ['boa sorte', 'Good luck'], ['bem-vindo', 'Welcome'], ['prazer', 'Nice to meet you'],
      ['até logo', 'See you soon'], ['cuide-se', 'Take care'], ['tenha um bom dia', 'Have a good day'], ['oi', 'Hi']
    ],
    'Family & Relationships': [
      ['família', 'Family'], ['pais', 'Parents'], ['pai', 'Father'], ['mãe', 'Mother'], ['filho', 'Son'], ['filha', 'Daughter'],
      ['irmão', 'Brother'], ['irmã', 'Sister'], ['avô', 'Grandfather'], ['avó', 'Grandmother'], ['tio', 'Uncle'], ['tia', 'Aunt'],
      ['primo', 'Cousin'], ['marido', 'Husband'], ['esposa', 'Wife'], ['namorado', 'Boyfriend'], ['namorada', 'Girlfriend'], ['amigo', 'Friend'],
      ['vizinho', 'Neighbor'], ['bebê', 'Baby'], ['criança', 'Child'], ['adolescente', 'Teenager'], ['adulto', 'Adult'], ['idoso', 'Elderly person'],
      ['casamento', 'Marriage'], ['divórcio', 'Divorce'], ['solteiro', 'Single'], ['casado', 'Married'], ['noivo', 'Engaged'], ['viúvo', 'Widowed']
    ],
    'Food & Dining': [
      ['comida', 'Food'], ['refeição', 'Meal'], ['café da manhã', 'Breakfast'], ['almoço', 'Lunch'], ['jantar', 'Dinner'], ['pão', 'Bread'],
      ['carne', 'Meat'], ['peixe', 'Fish'], ['vegetais', 'Vegetables'], ['frutas', 'Fruits'], ['arroz', 'Rice'], ['macarrão', 'Pasta'],
      ['queijo', 'Cheese'], ['leite', 'Milk'], ['ovos', 'Eggs'], ['manteiga', 'Butter'], ['açúcar', 'Sugar'], ['sal', 'Salt'],
      ['pimenta', 'Pepper'], ['óleo', 'Oil'], ['água', 'Water'], ['suco', 'Juice'], ['café', 'Coffee'], ['chá', 'Tea'],
      ['vinho', 'Wine'], ['cerveja', 'Beer'], ['restaurante', 'Restaurant'], ['cardápio', 'Menu'], ['garçom', 'Waiter'], ['conta', 'Bill']
    ],
    'Time & Calendar': [
      ['tempo', 'Time'], ['hora', 'Hour'], ['minuto', 'Minute'], ['segundo', 'Second'], ['dia', 'Day'], ['semana', 'Week'],
      ['mês', 'Month'], ['ano', 'Year'], ['segunda-feira', 'Monday'], ['terça-feira', 'Tuesday'], ['quarta-feira', 'Wednesday'], ['quinta-feira', 'Thursday'],
      ['sexta-feira', 'Friday'], ['sábado', 'Saturday'], ['domingo', 'Sunday'], ['janeiro', 'January'], ['fevereiro', 'February'], ['março', 'March'],
      ['abril', 'April'], ['maio', 'May'], ['junho', 'June'], ['julho', 'July'], ['agosto', 'August'], ['setembro', 'September'],
      ['outubro', 'October'], ['novembro', 'November'], ['dezembro', 'December'], ['hoje', 'Today'], ['ontem', 'Yesterday'], ['amanhã', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['cor', 'Color'], ['vermelho', 'Red'], ['azul', 'Blue'], ['verde', 'Green'], ['amarelo', 'Yellow'], ['laranja', 'Orange'],
      ['roxo', 'Purple'], ['rosa', 'Pink'], ['preto', 'Black'], ['branco', 'White'], ['cinza', 'Gray'], ['marrom', 'Brown'],
      ['grande', 'Big'], ['pequeno', 'Small'], ['longo', 'Long'], ['curto', 'Short'], ['largo', 'Wide'], ['estreito', 'Narrow'],
      ['grosso', 'Thick'], ['fino', 'Thin'], ['pesado', 'Heavy'], ['leve', 'Light'], ['duro', 'Hard'], ['macio', 'Soft'],
      ['quente', 'Hot'], ['frio', 'Cold'], ['seco', 'Dry'], ['molhado', 'Wet'], ['limpo', 'Clean'], ['sujo', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['número', 'Number'], ['zero', 'Zero'], ['um', 'One'], ['dois', 'Two'], ['três', 'Three'], ['quatro', 'Four'],
      ['cinco', 'Five'], ['seis', 'Six'], ['sete', 'Seven'], ['oito', 'Eight'], ['nove', 'Nine'], ['dez', 'Ten'],
      ['vinte', 'Twenty'], ['trinta', 'Thirty'], ['quarenta', 'Forty'], ['cinquenta', 'Fifty'], ['cem', 'Hundred'], ['mil', 'Thousand'],
      ['mais', 'Plus'], ['menos', 'Minus'], ['vezes', 'Times'], ['dividido por', 'Divided by'], ['igual', 'Equals'], ['porcentagem', 'Percentage'],
      ['primeiro', 'First'], ['segundo', 'Second'], ['terceiro', 'Third'], ['último', 'Last'], ['metade', 'Half'], ['dobro', 'Double']
    ],
    'Transportation': [
      ['transporte', 'Transportation'], ['carro', 'Car'], ['ônibus', 'Bus'], ['trem', 'Train'], ['avião', 'Airplane'], ['bicicleta', 'Bicycle'],
      ['moto', 'Motorcycle'], ['táxi', 'Taxi'], ['metrô', 'Subway'], ['barco', 'Boat'], ['navio', 'Ship'], ['caminhão', 'Truck'],
      ['estrada', 'Road'], ['rua', 'Street'], ['rodovia', 'Highway'], ['ponte', 'Bridge'], ['túnel', 'Tunnel'], ['estação', 'Station'],
      ['aeroporto', 'Airport'], ['porto', 'Port'], ['parada', 'Stop'], ['bilhete', 'Ticket'], ['passaporte', 'Passport'], ['bagagem', 'Luggage'],
      ['dirigir', 'Driving'], ['estacionamento', 'Parking'], ['gasolina', 'Gas'], ['reparo', 'Repair'], ['acidente', 'Accident'], ['trânsito', 'Traffic']
    ],
    'Weather & Nature': [
      ['tempo', 'Weather'], ['sol', 'Sun'], ['lua', 'Moon'], ['estrelas', 'Stars'], ['nuvens', 'Clouds'], ['chuva', 'Rain'],
      ['neve', 'Snow'], ['vento', 'Wind'], ['tempestade', 'Storm'], ['névoa', 'Fog'], ['arco-íris', 'Rainbow'], ['temperatura', 'Temperature'],
      ['quente', 'Hot'], ['frio', 'Cold'], ['estação', 'Season'], ['primavera', 'Spring'], ['verão', 'Summer'], ['outono', 'Autumn'],
      ['inverno', 'Winter'], ['natureza', 'Nature'], ['árvore', 'Tree'], ['flor', 'Flower'], ['grama', 'Grass'], ['floresta', 'Forest'],
      ['montanha', 'Mountain'], ['rio', 'River'], ['lago', 'Lake'], ['mar', 'Sea'], ['praia', 'Beach'], ['deserto', 'Desert']
    ],
    'Technology & Modern Life': [
      ['tecnologia', 'Technology'], ['computador', 'Computer'], ['internet', 'Internet'], ['site', 'Website'], ['email', 'Email'], ['telefone', 'Phone'],
      ['smartphone', 'Smartphone'], ['aplicativo', 'App'], ['software', 'Software'], ['rede', 'Network'], ['senha', 'Password'], ['arquivo', 'File'],
      ['pasta', 'Folder'], ['download', 'Download'], ['upload', 'Upload'], ['conexão', 'Connection'], ['wifi', 'WiFi'], ['bluetooth', 'Bluetooth'],
      ['tela', 'Screen'], ['teclado', 'Keyboard'], ['mouse', 'Mouse'], ['impressora', 'Printer'], ['câmera', 'Camera'], ['vídeo', 'Video'],
      ['foto', 'Photo'], ['música', 'Music'], ['jogo', 'Game'], ['redes sociais', 'Social media'], ['mensagens', 'Messaging'], ['digital', 'Digital']
    ]
  },
  ru: {
    '100 Most Used Words': [
      ['привет', 'Hello'], ['спасибо', 'Thank you'], ['пожалуйста', 'Please'], ['извините', 'Sorry'],
      ['да', 'Yes'], ['нет', 'No'], ['что', 'What'], ['как', 'How'], ['где', 'Where'], ['когда', 'When'],
      ['почему', 'Why'], ['кто', 'Who'], ['хорошо', 'Good'], ['плохо', 'Bad'], ['большой', 'Big'], ['маленький', 'Small'],
      ['новый', 'New'], ['старый', 'Old'], ['красивый', 'Beautiful'], ['некрасивый', 'Ugly'], ['горячий', 'Hot'], ['холодный', 'Cold'],
      ['вода', 'Water'], ['еда', 'Food'], ['хлеб', 'Bread'], ['молоко', 'Milk'], ['кофе', 'Coffee'], ['чай', 'Tea'],
      ['дом', 'House'], ['дверь', 'Door'], ['окно', 'Window'], ['стол', 'Table'], ['стул', 'Chair'], ['кровать', 'Bed'],
      ['книга', 'Book'], ['карандаш', 'Pencil'], ['бумага', 'Paper'], ['компьютер', 'Computer'], ['телефон', 'Phone'], ['время', 'Time'],
      ['день', 'Day'], ['ночь', 'Night'], ['утро', 'Morning'], ['вечер', 'Evening'], ['неделя', 'Week'], ['месяц', 'Month'],
      ['год', 'Year'], ['деньги', 'Money'], ['работа', 'Work'], ['школа', 'School'], ['семья', 'Family'], ['ребенок', 'Child'],
      ['отец', 'Father'], ['мать', 'Mother'], ['брат', 'Brother'], ['сестра', 'Sister'], ['друг', 'Friend'], ['любовь', 'Love'],
      ['счастливый', 'Happy'], ['грустный', 'Sad'], ['сердитый', 'Angry'], ['страх', 'Fear'], ['здоровый', 'Healthy'], ['больной', 'Sick'],
      ['машина', 'Car'], ['автобус', 'Bus'], ['поезд', 'Train'], ['самолет', 'Airplane'], ['улица', 'Street'], ['город', 'City'],
      ['деревня', 'Village'], ['море', 'Sea'], ['гора', 'Mountain'], ['лес', 'Forest'], ['сад', 'Garden'], ['цветок', 'Flower'],
      ['дерево', 'Tree'], ['собака', 'Dog'], ['кот', 'Cat'], ['птица', 'Bird'], ['рыба', 'Fish'], ['цвет', 'Color'],
      ['красный', 'Red'], ['синий', 'Blue'], ['зеленый', 'Green'], ['желтый', 'Yellow'], ['черный', 'Black'], ['белый', 'White'],
      ['число', 'Number'], ['один', 'One'], ['два', 'Two'], ['три', 'Three'], ['четыре', 'Four'], ['пять', 'Five'],
      ['шесть', 'Six'], ['семь', 'Seven'], ['восемь', 'Eight'], ['девять', 'Nine'], ['десять', 'Ten'], ['сто', 'Hundred'],
      ['тысяча', 'Thousand'], ['голова', 'Head'], ['глаза', 'Eyes'], ['нос', 'Nose'], ['рот', 'Mouth'], ['уши', 'Ears'],
      ['руки', 'Hands'], ['ноги', 'Legs'], ['сердце', 'Heart'], ['тело', 'Body']
    ],
    'Essential Greetings': [
      ['привет', 'Hello'], ['до свидания', 'Goodbye'], ['доброе утро', 'Good morning'], ['добрый вечер', 'Good evening'],
      ['спокойной ночи', 'Good night'], ['как дела', 'How are you'], ['хорошо', 'Fine'], ['большое спасибо', 'Thank you very much'],
      ['пожалуйста', 'You\'re welcome'], ['извините', 'Excuse me'], ['прости', 'I\'m sorry'], ['поздравляю', 'Congratulations'],
      ['с днём рождения', 'Happy birthday'], ['удачи', 'Good luck'], ['добро пожаловать', 'Welcome'], ['приятно познакомиться', 'Nice to meet you'],
      ['до встречи', 'See you soon'], ['береги себя', 'Take care'], ['хорошего дня', 'Have a good day'], ['привет', 'Hi']
    ],
    'Family & Relationships': [
      ['семья', 'Family'], ['родители', 'Parents'], ['отец', 'Father'], ['мать', 'Mother'], ['сын', 'Son'], ['дочь', 'Daughter'],
      ['брат', 'Brother'], ['сестра', 'Sister'], ['дедушка', 'Grandfather'], ['бабушка', 'Grandmother'], ['дядя', 'Uncle'], ['тётя', 'Aunt'],
      ['двоюродный брат', 'Cousin'], ['муж', 'Husband'], ['жена', 'Wife'], ['парень', 'Boyfriend'], ['девушка', 'Girlfriend'], ['друг', 'Friend'],
      ['сосед', 'Neighbor'], ['малыш', 'Baby'], ['ребёнок', 'Child'], ['подросток', 'Teenager'], ['взрослый', 'Adult'], ['пожилой', 'Elderly person'],
      ['свадьба', 'Marriage'], ['развод', 'Divorce'], ['холостой', 'Single'], ['женат', 'Married'], ['помолвлен', 'Engaged'], ['вдовец', 'Widowed']
    ],
    'Food & Dining': [
      ['еда', 'Food'], ['еда', 'Meal'], ['завтрак', 'Breakfast'], ['обед', 'Lunch'], ['ужин', 'Dinner'], ['хлеб', 'Bread'],
      ['мясо', 'Meat'], ['рыба', 'Fish'], ['овощи', 'Vegetables'], ['фрукты', 'Fruits'], ['рис', 'Rice'], ['макароны', 'Pasta'],
      ['сыр', 'Cheese'], ['молоко', 'Milk'], ['яйца', 'Eggs'], ['масло', 'Butter'], ['сахар', 'Sugar'], ['соль', 'Salt'],
      ['перец', 'Pepper'], ['масло', 'Oil'], ['вода', 'Water'], ['сок', 'Juice'], ['кофе', 'Coffee'], ['чай', 'Tea'],
      ['вино', 'Wine'], ['пиво', 'Beer'], ['ресторан', 'Restaurant'], ['меню', 'Menu'], ['официант', 'Waiter'], ['счёт', 'Bill']
    ],
    'Time & Calendar': [
      ['время', 'Time'], ['час', 'Hour'], ['минута', 'Minute'], ['секунда', 'Second'], ['день', 'Day'], ['неделя', 'Week'],
      ['месяц', 'Month'], ['год', 'Year'], ['понедельник', 'Monday'], ['вторник', 'Tuesday'], ['среда', 'Wednesday'], ['четверг', 'Thursday'],
      ['пятница', 'Friday'], ['суббота', 'Saturday'], ['воскресенье', 'Sunday'], ['январь', 'January'], ['февраль', 'February'], ['март', 'March'],
      ['апрель', 'April'], ['май', 'May'], ['июнь', 'June'], ['июль', 'July'], ['август', 'August'], ['сентябрь', 'September'],
      ['октябрь', 'October'], ['ноябрь', 'November'], ['декабрь', 'December'], ['сегодня', 'Today'], ['вчера', 'Yesterday'], ['завтра', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['цвет', 'Color'], ['красный', 'Red'], ['синий', 'Blue'], ['зелёный', 'Green'], ['жёлтый', 'Yellow'], ['оранжевый', 'Orange'],
      ['фиолетовый', 'Purple'], ['розовый', 'Pink'], ['чёрный', 'Black'], ['белый', 'White'], ['серый', 'Gray'], ['коричневый', 'Brown'],
      ['большой', 'Big'], ['маленький', 'Small'], ['длинный', 'Long'], ['короткий', 'Short'], ['широкий', 'Wide'], ['узкий', 'Narrow'],
      ['толстый', 'Thick'], ['тонкий', 'Thin'], ['тяжёлый', 'Heavy'], ['лёгкий', 'Light'], ['твёрдый', 'Hard'], ['мягкий', 'Soft'],
      ['горячий', 'Hot'], ['холодный', 'Cold'], ['сухой', 'Dry'], ['мокрый', 'Wet'], ['чистый', 'Clean'], ['грязный', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['число', 'Number'], ['ноль', 'Zero'], ['один', 'One'], ['два', 'Two'], ['три', 'Three'], ['четыре', 'Four'],
      ['пять', 'Five'], ['шесть', 'Six'], ['семь', 'Seven'], ['восемь', 'Eight'], ['девять', 'Nine'], ['десять', 'Ten'],
      ['двадцать', 'Twenty'], ['тридцать', 'Thirty'], ['сорок', 'Forty'], ['пятьдесят', 'Fifty'], ['сто', 'Hundred'], ['тысяча', 'Thousand'],
      ['плюс', 'Plus'], ['минус', 'Minus'], ['раз', 'Times'], ['разделить на', 'Divided by'], ['равно', 'Equals'], ['процент', 'Percentage'],
      ['первый', 'First'], ['второй', 'Second'], ['третий', 'Third'], ['последний', 'Last'], ['половина', 'Half'], ['двойной', 'Double']
    ],
    'Transportation': [
      ['транспорт', 'Transportation'], ['машина', 'Car'], ['автобус', 'Bus'], ['поезд', 'Train'], ['самолёт', 'Airplane'], ['велосипед', 'Bicycle'],
      ['мотоцикл', 'Motorcycle'], ['такси', 'Taxi'], ['метро', 'Subway'], ['лодка', 'Boat'], ['корабль', 'Ship'], ['грузовик', 'Truck'],
      ['дорога', 'Road'], ['улица', 'Street'], ['шоссе', 'Highway'], ['мост', 'Bridge'], ['туннель', 'Tunnel'], ['станция', 'Station'],
      ['аэропорт', 'Airport'], ['порт', 'Port'], ['остановка', 'Stop'], ['билет', 'Ticket'], ['паспорт', 'Passport'], ['багаж', 'Luggage'],
      ['вождение', 'Driving'], ['парковка', 'Parking'], ['бензин', 'Gas'], ['ремонт', 'Repair'], ['авария', 'Accident'], ['движение', 'Traffic']
    ],
    'Weather & Nature': [
      ['погода', 'Weather'], ['солнце', 'Sun'], ['луна', 'Moon'], ['звёзды', 'Stars'], ['облака', 'Clouds'], ['дождь', 'Rain'],
      ['снег', 'Snow'], ['ветер', 'Wind'], ['буря', 'Storm'], ['туман', 'Fog'], ['радуга', 'Rainbow'], ['температура', 'Temperature'],
      ['жарко', 'Hot'], ['холодно', 'Cold'], ['сезон', 'Season'], ['весна', 'Spring'], ['лето', 'Summer'], ['осень', 'Autumn'],
      ['зима', 'Winter'], ['природа', 'Nature'], ['дерево', 'Tree'], ['цветок', 'Flower'], ['трава', 'Grass'], ['лес', 'Forest'],
      ['гора', 'Mountain'], ['река', 'River'], ['озеро', 'Lake'], ['море', 'Sea'], ['пляж', 'Beach'], ['пустыня', 'Desert']
    ],
    'Technology & Modern Life': [
      ['технология', 'Technology'], ['компьютер', 'Computer'], ['интернет', 'Internet'], ['сайт', 'Website'], ['электронная почта', 'Email'], ['телефон', 'Phone'],
      ['смартфон', 'Smartphone'], ['приложение', 'App'], ['программа', 'Software'], ['сеть', 'Network'], ['пароль', 'Password'], ['файл', 'File'],
      ['папка', 'Folder'], ['скачать', 'Download'], ['загрузить', 'Upload'], ['соединение', 'Connection'], ['вайфай', 'WiFi'], ['блютус', 'Bluetooth'],
      ['экран', 'Screen'], ['клавиатура', 'Keyboard'], ['мышь', 'Mouse'], ['принтер', 'Printer'], ['камера', 'Camera'], ['видео', 'Video'],
      ['фото', 'Photo'], ['музыка', 'Music'], ['игра', 'Game'], ['соцсети', 'Social media'], ['сообщения', 'Messaging'], ['цифровой', 'Digital']
    ]
  },
  zh: {
    '100 Most Used Words': [
      ['你好', 'Hello'], ['谢谢', 'Thank you'], ['请', 'Please'], ['对不起', 'Sorry'],
      ['是', 'Yes'], ['不', 'No'], ['什么', 'What'], ['怎么', 'How'], ['哪里', 'Where'], ['什么时候', 'When'],
      ['为什么', 'Why'], ['谁', 'Who'], ['好', 'Good'], ['坏', 'Bad'], ['大', 'Big'], ['小', 'Small'],
      ['新', 'New'], ['老', 'Old'], ['漂亮', 'Beautiful'], ['丑', 'Ugly'], ['热', 'Hot'], ['冷', 'Cold'],
      ['水', 'Water'], ['食物', 'Food'], ['面包', 'Bread'], ['牛奶', 'Milk'], ['咖啡', 'Coffee'], ['茶', 'Tea'],
      ['房子', 'House'], ['门', 'Door'], ['窗户', 'Window'], ['桌子', 'Table'], ['椅子', 'Chair'], ['床', 'Bed'],
      ['书', 'Book'], ['铅笔', 'Pencil'], ['纸', 'Paper'], ['电脑', 'Computer'], ['电话', 'Phone'], ['时间', 'Time'],
      ['天', 'Day'], ['夜', 'Night'], ['早上', 'Morning'], ['晚上', 'Evening'], ['周', 'Week'], ['月', 'Month'],
      ['年', 'Year'], ['钱', 'Money'], ['工作', 'Work'], ['学校', 'School'], ['家庭', 'Family'], ['孩子', 'Child'],
      ['父亲', 'Father'], ['母亲', 'Mother'], ['兄弟', 'Brother'], ['姐妹', 'Sister'], ['朋友', 'Friend'], ['爱', 'Love'],
      ['快乐', 'Happy'], ['悲伤', 'Sad'], ['生气', 'Angry'], ['害怕', 'Fear'], ['健康', 'Healthy'], ['生病', 'Sick'],
      ['车', 'Car'], ['公共汽车', 'Bus'], ['火车', 'Train'], ['飞机', 'Airplane'], ['街道', 'Street'], ['城市', 'City'],
      ['村庄', 'Village'], ['海', 'Sea'], ['山', 'Mountain'], ['森林', 'Forest'], ['花园', 'Garden'], ['花', 'Flower'],
      ['树', 'Tree'], ['狗', 'Dog'], ['猫', 'Cat'], ['鸟', 'Bird'], ['鱼', 'Fish'], ['颜色', 'Color'],
      ['红色', 'Red'], ['蓝色', 'Blue'], ['绿色', 'Green'], ['黄色', 'Yellow'], ['黑色', 'Black'], ['白色', 'White'],
      ['数字', 'Number'], ['一', 'One'], ['二', 'Two'], ['三', 'Three'], ['四', 'Four'], ['五', 'Five'],
      ['六', 'Six'], ['七', 'Seven'], ['八', 'Eight'], ['九', 'Nine'], ['十', 'Ten'], ['百', 'Hundred'],
      ['千', 'Thousand'], ['头', 'Head'], ['眼睛', 'Eyes'], ['鼻子', 'Nose'], ['嘴', 'Mouth'], ['耳朵', 'Ears'],
      ['手', 'Hands'], ['腿', 'Legs'], ['心', 'Heart'], ['身体', 'Body']
    ],
    'Essential Greetings': [
      ['你好', 'Hello'], ['再见', 'Goodbye'], ['早上好', 'Good morning'], ['晚上好', 'Good evening'],
      ['晚安', 'Good night'], ['你好吗', 'How are you'], ['很好', 'Fine'], ['非常感谢', 'Thank you very much'],
      ['不客气', 'You\'re welcome'], ['对不起', 'Excuse me'], ['抱歉', 'I\'m sorry'], ['恭喜', 'Congratulations'],
      ['生日快乐', 'Happy birthday'], ['祝你好运', 'Good luck'], ['欢迎', 'Welcome'], ['很高兴认识你', 'Nice to meet you'],
      ['回头见', 'See you soon'], ['保重', 'Take care'], ['祝你今天愉快', 'Have a good day'], ['嗨', 'Hi']
    ],
    'Family & Relationships': [
      ['家庭', 'Family'], ['父母', 'Parents'], ['父亲', 'Father'], ['母亲', 'Mother'], ['儿子', 'Son'], ['女儿', 'Daughter'],
      ['兄弟', 'Brother'], ['姐妹', 'Sister'], ['祖父', 'Grandfather'], ['祖母', 'Grandmother'], ['叔叔', 'Uncle'], ['阿姨', 'Aunt'],
      ['堂兄弟', 'Cousin'], ['丈夫', 'Husband'], ['妻子', 'Wife'], ['男朋友', 'Boyfriend'], ['女朋友', 'Girlfriend'], ['朋友', 'Friend'],
      ['邻居', 'Neighbor'], ['婴儿', 'Baby'], ['孩子', 'Child'], ['青少年', 'Teenager'], ['成人', 'Adult'], ['老人', 'Elderly person'],
      ['结婚', 'Marriage'], ['离婚', 'Divorce'], ['单身', 'Single'], ['已婚', 'Married'], ['订婚', 'Engaged'], ['寡妇', 'Widowed']
    ],
    'Food & Dining': [
      ['食物', 'Food'], ['餐', 'Meal'], ['早餐', 'Breakfast'], ['午餐', 'Lunch'], ['晚餐', 'Dinner'], ['面包', 'Bread'],
      ['肉', 'Meat'], ['鱼', 'Fish'], ['蔬菜', 'Vegetables'], ['水果', 'Fruits'], ['米饭', 'Rice'], ['面条', 'Pasta'],
      ['奶酪', 'Cheese'], ['牛奶', 'Milk'], ['鸡蛋', 'Eggs'], ['黄油', 'Butter'], ['糖', 'Sugar'], ['盐', 'Salt'],
      ['胡椒', 'Pepper'], ['油', 'Oil'], ['水', 'Water'], ['果汁', 'Juice'], ['咖啡', 'Coffee'], ['茶', 'Tea'],
      ['酒', 'Wine'], ['啤酒', 'Beer'], ['餐厅', 'Restaurant'], ['菜单', 'Menu'], ['服务员', 'Waiter'], ['账单', 'Bill']
    ],
    'Time & Calendar': [
      ['时间', 'Time'], ['小时', 'Hour'], ['分钟', 'Minute'], ['秒', 'Second'], ['天', 'Day'], ['周', 'Week'],
      ['月', 'Month'], ['年', 'Year'], ['星期一', 'Monday'], ['星期二', 'Tuesday'], ['星期三', 'Wednesday'], ['星期四', 'Thursday'],
      ['星期五', 'Friday'], ['星期六', 'Saturday'], ['星期日', 'Sunday'], ['一月', 'January'], ['二月', 'February'], ['三月', 'March'],
      ['四月', 'April'], ['五月', 'May'], ['六月', 'June'], ['七月', 'July'], ['八月', 'August'], ['九月', 'September'],
      ['十月', 'October'], ['十一月', 'November'], ['十二月', 'December'], ['今天', 'Today'], ['昨天', 'Yesterday'], ['明天', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['颜色', 'Color'], ['红色', 'Red'], ['蓝色', 'Blue'], ['绿色', 'Green'], ['黄色', 'Yellow'], ['橙色', 'Orange'],
      ['紫色', 'Purple'], ['粉色', 'Pink'], ['黑色', 'Black'], ['白色', 'White'], ['灰色', 'Gray'], ['棕色', 'Brown'],
      ['大', 'Big'], ['小', 'Small'], ['长', 'Long'], ['短', 'Short'], ['宽', 'Wide'], ['窄', 'Narrow'],
      ['厚', 'Thick'], ['薄', 'Thin'], ['重', 'Heavy'], ['轻', 'Light'], ['硬', 'Hard'], ['软', 'Soft'],
      ['热', 'Hot'], ['冷', 'Cold'], ['干', 'Dry'], ['湿', 'Wet'], ['干净', 'Clean'], ['脏', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['数字', 'Number'], ['零', 'Zero'], ['一', 'One'], ['二', 'Two'], ['三', 'Three'], ['四', 'Four'],
      ['五', 'Five'], ['六', 'Six'], ['七', 'Seven'], ['八', 'Eight'], ['九', 'Nine'], ['十', 'Ten'],
      ['二十', 'Twenty'], ['三十', 'Thirty'], ['四十', 'Forty'], ['五十', 'Fifty'], ['一百', 'Hundred'], ['一千', 'Thousand'],
      ['加', 'Plus'], ['减', 'Minus'], ['乘', 'Times'], ['除以', 'Divided by'], ['等于', 'Equals'], ['百分比', 'Percentage'],
      ['第一', 'First'], ['第二', 'Second'], ['第三', 'Third'], ['最后', 'Last'], ['一半', 'Half'], ['双倍', 'Double']
    ],
    'Transportation': [
      ['交通', 'Transportation'], ['汽车', 'Car'], ['公共汽车', 'Bus'], ['火车', 'Train'], ['飞机', 'Airplane'], ['自行车', 'Bicycle'],
      ['摩托车', 'Motorcycle'], ['出租车', 'Taxi'], ['地铁', 'Subway'], ['船', 'Boat'], ['轮船', 'Ship'], ['卡车', 'Truck'],
      ['道路', 'Road'], ['街道', 'Street'], ['高速公路', 'Highway'], ['桥', 'Bridge'], ['隧道', 'Tunnel'], ['车站', 'Station'],
      ['机场', 'Airport'], ['港口', 'Port'], ['站', 'Stop'], ['票', 'Ticket'], ['护照', 'Passport'], ['行李', 'Luggage'],
      ['驾驶', 'Driving'], ['停车', 'Parking'], ['汽油', 'Gas'], ['修理', 'Repair'], ['事故', 'Accident'], ['交通', 'Traffic']
    ],
    'Weather & Nature': [
      ['天气', 'Weather'], ['太阳', 'Sun'], ['月亮', 'Moon'], ['星星', 'Stars'], ['云', 'Clouds'], ['雨', 'Rain'],
      ['雪', 'Snow'], ['风', 'Wind'], ['暴风雨', 'Storm'], ['雾', 'Fog'], ['彩虹', 'Rainbow'], ['温度', 'Temperature'],
      ['热', 'Hot'], ['冷', 'Cold'], ['季节', 'Season'], ['春天', 'Spring'], ['夏天', 'Summer'], ['秋天', 'Autumn'],
      ['冬天', 'Winter'], ['自然', 'Nature'], ['树', 'Tree'], ['花', 'Flower'], ['草', 'Grass'], ['森林', 'Forest'],
      ['山', 'Mountain'], ['河', 'River'], ['湖', 'Lake'], ['海', 'Sea'], ['海滩', 'Beach'], ['沙漠', 'Desert']
    ],
    'Technology & Modern Life': [
      ['技术', 'Technology'], ['电脑', 'Computer'], ['互联网', 'Internet'], ['网站', 'Website'], ['电子邮件', 'Email'], ['电话', 'Phone'],
      ['智能手机', 'Smartphone'], ['应用程序', 'App'], ['软件', 'Software'], ['网络', 'Network'], ['密码', 'Password'], ['文件', 'File'],
      ['文件夹', 'Folder'], ['下载', 'Download'], ['上传', 'Upload'], ['连接', 'Connection'], ['无线网络', 'WiFi'], ['蓝牙', 'Bluetooth'],
      ['屏幕', 'Screen'], ['键盘', 'Keyboard'], ['鼠标', 'Mouse'], ['打印机', 'Printer'], ['相机', 'Camera'], ['视频', 'Video'],
      ['照片', 'Photo'], ['音乐', 'Music'], ['游戏', 'Game'], ['社交媒体', 'Social media'], ['消息', 'Messaging'], ['数字', 'Digital']
    ]
  },
  ja: {
    '100 Most Used Words': [
      ['こんにちは', 'Hello'], ['ありがとう', 'Thank you'], ['お願いします', 'Please'], ['すみません', 'Sorry'],
      ['はい', 'Yes'], ['いいえ', 'No'], ['何', 'What'], ['どう', 'How'], ['どこ', 'Where'], ['いつ', 'When'],
      ['なぜ', 'Why'], ['誰', 'Who'], ['良い', 'Good'], ['悪い', 'Bad'], ['大きい', 'Big'], ['小さい', 'Small'],
      ['新しい', 'New'], ['古い', 'Old'], ['美しい', 'Beautiful'], ['醜い', 'Ugly'], ['暑い', 'Hot'], ['寒い', 'Cold'],
      ['水', 'Water'], ['食べ物', 'Food'], ['パン', 'Bread'], ['牛乳', 'Milk'], ['コーヒー', 'Coffee'], ['お茶', 'Tea'],
      ['家', 'House'], ['ドア', 'Door'], ['窓', 'Window'], ['テーブル', 'Table'], ['椅子', 'Chair'], ['ベッド', 'Bed'],
      ['本', 'Book'], ['鉛筆', 'Pencil'], ['紙', 'Paper'], ['コンピューター', 'Computer'], ['電話', 'Phone'], ['時間', 'Time'],
      ['日', 'Day'], ['夜', 'Night'], ['朝', 'Morning'], ['夕方', 'Evening'], ['週', 'Week'], ['月', 'Month'],
      ['年', 'Year'], ['お金', 'Money'], ['仕事', 'Work'], ['学校', 'School'], ['家族', 'Family'], ['子供', 'Child'],
      ['父', 'Father'], ['母', 'Mother'], ['兄弟', 'Brother'], ['姉妹', 'Sister'], ['友達', 'Friend'], ['愛', 'Love'],
      ['幸せ', 'Happy'], ['悲しい', 'Sad'], ['怒っている', 'Angry'], ['恐れ', 'Fear'], ['健康', 'Healthy'], ['病気', 'Sick'],
      ['車', 'Car'], ['バス', 'Bus'], ['電車', 'Train'], ['飛行機', 'Airplane'], ['道', 'Street'], ['都市', 'City'],
      ['村', 'Village'], ['海', 'Sea'], ['山', 'Mountain'], ['森', 'Forest'], ['庭', 'Garden'], ['花', 'Flower'],
      ['木', 'Tree'], ['犬', 'Dog'], ['猫', 'Cat'], ['鳥', 'Bird'], ['魚', 'Fish'], ['色', 'Color'],
      ['赤', 'Red'], ['青', 'Blue'], ['緑', 'Green'], ['黄色', 'Yellow'], ['黒', 'Black'], ['白', 'White'],
      ['数', 'Number'], ['一', 'One'], ['二', 'Two'], ['三', 'Three'], ['四', 'Four'], ['五', 'Five'],
      ['六', 'Six'], ['七', 'Seven'], ['八', 'Eight'], ['九', 'Nine'], ['十', 'Ten'], ['百', 'Hundred'],
      ['千', 'Thousand'], ['頭', 'Head'], ['目', 'Eyes'], ['鼻', 'Nose'], ['口', 'Mouth'], ['耳', 'Ears'],
      ['手', 'Hands'], ['足', 'Legs'], ['心臓', 'Heart'], ['体', 'Body']
    ],
    'Essential Greetings': [
      ['こんにちは', 'Hello'], ['さようなら', 'Goodbye'], ['おはよう', 'Good morning'], ['こんばんは', 'Good evening'],
      ['おやすみ', 'Good night'], ['元気ですか', 'How are you'], ['元気です', 'Fine'], ['ありがとうございます', 'Thank you very much'],
      ['どういたしまして', 'You\'re welcome'], ['すみません', 'Excuse me'], ['ごめんなさい', 'I\'m sorry'], ['おめでとう', 'Congratulations'],
      ['誕生日おめでとう', 'Happy birthday'], ['頑張って', 'Good luck'], ['いらっしゃいませ', 'Welcome'], ['はじめまして', 'Nice to meet you'],
      ['また今度', 'See you soon'], ['お気をつけて', 'Take care'], ['よい一日を', 'Have a good day'], ['こんにちは', 'Hi']
    ],
    'Family & Relationships': [
      ['家族', 'Family'], ['両親', 'Parents'], ['父', 'Father'], ['母', 'Mother'], ['息子', 'Son'], ['娘', 'Daughter'],
      ['兄弟', 'Brother'], ['姉妹', 'Sister'], ['祖父', 'Grandfather'], ['祖母', 'Grandmother'], ['おじ', 'Uncle'], ['おば', 'Aunt'],
      ['いとこ', 'Cousin'], ['夫', 'Husband'], ['妻', 'Wife'], ['彼氏', 'Boyfriend'], ['彼女', 'Girlfriend'], ['友達', 'Friend'],
      ['隣人', 'Neighbor'], ['赤ちゃん', 'Baby'], ['子供', 'Child'], ['十代', 'Teenager'], ['大人', 'Adult'], ['高齢者', 'Elderly person'],
      ['結婚', 'Marriage'], ['離婚', 'Divorce'], ['独身', 'Single'], ['既婚', 'Married'], ['婚約', 'Engaged'], ['未亡人', 'Widowed']
    ],
    'Food & Dining': [
      ['食べ物', 'Food'], ['食事', 'Meal'], ['朝食', 'Breakfast'], ['昼食', 'Lunch'], ['夕食', 'Dinner'], ['パン', 'Bread'],
      ['肉', 'Meat'], ['魚', 'Fish'], ['野菜', 'Vegetables'], ['果物', 'Fruits'], ['米', 'Rice'], ['パスタ', 'Pasta'],
      ['チーズ', 'Cheese'], ['牛乳', 'Milk'], ['卵', 'Eggs'], ['バター', 'Butter'], ['砂糖', 'Sugar'], ['塩', 'Salt'],
      ['こしょう', 'Pepper'], ['油', 'Oil'], ['水', 'Water'], ['ジュース', 'Juice'], ['コーヒー', 'Coffee'], ['お茶', 'Tea'],
      ['ワイン', 'Wine'], ['ビール', 'Beer'], ['レストラン', 'Restaurant'], ['メニュー', 'Menu'], ['ウェイター', 'Waiter'], ['請求書', 'Bill']
    ],
    'Time & Calendar': [
      ['時間', 'Time'], ['時', 'Hour'], ['分', 'Minute'], ['秒', 'Second'], ['日', 'Day'], ['週', 'Week'],
      ['月', 'Month'], ['年', 'Year'], ['月曜日', 'Monday'], ['火曜日', 'Tuesday'], ['水曜日', 'Wednesday'], ['木曜日', 'Thursday'],
      ['金曜日', 'Friday'], ['土曜日', 'Saturday'], ['日曜日', 'Sunday'], ['一月', 'January'], ['二月', 'February'], ['三月', 'March'],
      ['四月', 'April'], ['五月', 'May'], ['六月', 'June'], ['七月', 'July'], ['八月', 'August'], ['九月', 'September'],
      ['十月', 'October'], ['十一月', 'November'], ['十二月', 'December'], ['今日', 'Today'], ['昨日', 'Yesterday'], ['明日', 'Tomorrow']
    ],
    'Colors & Descriptions': [
      ['色', 'Color'], ['赤', 'Red'], ['青', 'Blue'], ['緑', 'Green'], ['黄色', 'Yellow'], ['オレンジ', 'Orange'],
      ['紫', 'Purple'], ['ピンク', 'Pink'], ['黒', 'Black'], ['白', 'White'], ['グレー', 'Gray'], ['茶色', 'Brown'],
      ['大きい', 'Big'], ['小さい', 'Small'], ['長い', 'Long'], ['短い', 'Short'], ['広い', 'Wide'], ['狭い', 'Narrow'],
      ['厚い', 'Thick'], ['薄い', 'Thin'], ['重い', 'Heavy'], ['軽い', 'Light'], ['硬い', 'Hard'], ['柔らかい', 'Soft'],
      ['暑い', 'Hot'], ['寒い', 'Cold'], ['乾いた', 'Dry'], ['濡れた', 'Wet'], ['きれい', 'Clean'], ['汚い', 'Dirty']
    ],
    'Numbers & Mathematics': [
      ['数', 'Number'], ['ゼロ', 'Zero'], ['一', 'One'], ['二', 'Two'], ['三', 'Three'], ['四', 'Four'],
      ['五', 'Five'], ['六', 'Six'], ['七', 'Seven'], ['八', 'Eight'], ['九', 'Nine'], ['十', 'Ten'],
      ['二十', 'Twenty'], ['三十', 'Thirty'], ['四十', 'Forty'], ['五十', 'Fifty'], ['百', 'Hundred'], ['千', 'Thousand'],
      ['プラス', 'Plus'], ['マイナス', 'Minus'], ['かける', 'Times'], ['割る', 'Divided by'], ['等しい', 'Equals'], ['パーセント', 'Percentage'],
      ['第一', 'First'], ['第二', 'Second'], ['第三', 'Third'], ['最後', 'Last'], ['半分', 'Half'], ['二倍', 'Double']
    ],
    'Transportation': [
      ['交通', 'Transportation'], ['車', 'Car'], ['バス', 'Bus'], ['電車', 'Train'], ['飛行機', 'Airplane'], ['自転車', 'Bicycle'],
      ['バイク', 'Motorcycle'], ['タクシー', 'Taxi'], ['地下鉄', 'Subway'], ['ボート', 'Boat'], ['船', 'Ship'], ['トラック', 'Truck'],
      ['道路', 'Road'], ['道', 'Street'], ['高速道路', 'Highway'], ['橋', 'Bridge'], ['トンネル', 'Tunnel'], ['駅', 'Station'],
      ['空港', 'Airport'], ['港', 'Port'], ['停留所', 'Stop'], ['チケット', 'Ticket'], ['パスポート', 'Passport'], ['荷物', 'Luggage'],
      ['運転', 'Driving'], ['駐車', 'Parking'], ['ガソリン', 'Gas'], ['修理', 'Repair'], ['事故', 'Accident'], ['交通', 'Traffic']
    ],
    'Weather & Nature': [
      ['天気', 'Weather'], ['太陽', 'Sun'], ['月', 'Moon'], ['星', 'Stars'], ['雲', 'Clouds'], ['雨', 'Rain'],
      ['雪', 'Snow'], ['風', 'Wind'], ['嵐', 'Storm'], ['霧', 'Fog'], ['虹', 'Rainbow'], ['温度', 'Temperature'],
      ['暑い', 'Hot'], ['寒い', 'Cold'], ['季節', 'Season'], ['春', 'Spring'], ['夏', 'Summer'], ['秋', 'Autumn'],
      ['冬', 'Winter'], ['自然', 'Nature'], ['木', 'Tree'], ['花', 'Flower'], ['草', 'Grass'], ['森', 'Forest'],
      ['山', 'Mountain'], ['川', 'River'], ['湖', 'Lake'], ['海', 'Sea'], ['浜', 'Beach'], ['砂漠', 'Desert']
    ],
    'Technology & Modern Life': [
      ['技術', 'Technology'], ['コンピューター', 'Computer'], ['インターネット', 'Internet'], ['ウェブサイト', 'Website'], ['メール', 'Email'], ['電話', 'Phone'],
      ['スマートフォン', 'Smartphone'], ['アプリ', 'App'], ['ソフトウェア', 'Software'], ['ネットワーク', 'Network'], ['パスワード', 'Password'], ['ファイル', 'File'],
      ['フォルダ', 'Folder'], ['ダウンロード', 'Download'], ['アップロード', 'Upload'], ['接続', 'Connection'], ['ワイファイ', 'WiFi'], ['ブルートゥース', 'Bluetooth'],
      ['画面', 'Screen'], ['キーボード', 'Keyboard'], ['マウス', 'Mouse'], ['プリンター', 'Printer'], ['カメラ', 'Camera'], ['ビデオ', 'Video'],
      ['写真', 'Photo'], ['音楽', 'Music'], ['ゲーム', 'Game'], ['ソーシャルメディア', 'Social media'], ['メッセージ', 'Messaging'], ['デジタル', 'Digital']
    ]
  }
};

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.userProgress.deleteMany();
    await prisma.word.deleteMany();
    await prisma.section.deleteMany();
    await prisma.language.deleteMany();

    // Create languages
    console.log('🌍 Creating languages...');
    const languageRecords = await Promise.all(
      Object.entries(LANGUAGES).map(([code, config]) =>
        prisma.language.create({
          data: {
            code,
            name: config.name,
            nativeName: config.nativeName,
            isRTL: ['he', 'ar'].includes(code),
          },
        })
      )
    );

    console.log(`✅ Created ${languageRecords.length} languages`);

    // Create sections and words for each language
    let totalSections = 0;
    let totalWords = 0;

    for (const [langCode, languageData] of Object.entries(VOCABULARY_DATA)) {
      const language = languageRecords.find(l => l.code === langCode);
      if (!language) continue;

      console.log(`📚 Creating sections for ${langCode.toUpperCase()}...`);

      for (const [sectionName, words] of Object.entries(languageData)) {
        // Create section
        const section = await prisma.section.create({
          data: {
            name: sectionName,
            description: `Learn essential ${sectionName.toLowerCase()} in ${language.name}`,
            languageId: language.id,
            isDefault: true,
          },
        });

        // Create words for this section
        const wordData = words.map(([original, translation]) => ({
          originalText: original,
          translationText: capitalize(translation),
          pronunciation: null,
          sectionId: section.id,
          languageId: language.id,
        }));

        await prisma.word.createMany({
          data: wordData,
          skipDuplicates: true,
        });

        totalSections++;
        totalWords += words.length;
        console.log(`  ✅ Created "${sectionName}" with ${words.length} words`);
      }
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   • Languages: ${languageRecords.length}`);
    console.log(`   • Sections: ${totalSections}`);
    console.log(`   • Words: ${totalWords}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });