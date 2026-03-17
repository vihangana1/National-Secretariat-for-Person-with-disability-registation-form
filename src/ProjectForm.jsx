import { useState, useCallback, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import headerImg from './assests/Gemini_Generated_Image_hd3vqrhd3vqrhd3v.png';
import logoImg from './assests/logo.png';

const Send = ({ style }) => (
  <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const PROVINCE_DATA = {
  'Western / බස්නාහිර / மேல்': {
    districts: ['Colombo / කොළඹ / கொழும்பு', 'Gampaha / ගම්පහ / கம்பஹா', 'Kalutara / කළුතර / களுத்துறை'],
    divisions: {
      'Colombo / කොළඹ / கொழும்பு': ['Colombo / කොළඹ / கொழும்பு','Dehiwala / දෙහිවල / தெஹிவளை','Homagama / හෝමගම / ஹோமாகம','Kaduwela / කඩුවෙල / கடுவெல','Kesbewa / කැස්බෑව / கெஸ்பேவ','Maharagama / මහරගම / மஹரகம','Moratuwa / මොරටුව / மொரட்டுவை','Sri Jayawardenepura Kotte / ශ්‍රී ජයවර්ධනපුර කෝට්ටෙ / ஸ்ரீ ஜயவர்தணபுர கோட்டை','Thimbirigasyaya / තිඹිරිගස්යාය / திம்பிரிகஸ்யாய'],
      'Gampaha / ගම්පහ / கம்பஹா': ['Gampaha / ගම්පහ / கம்பஹா','Attanagalla / අත්තනගල්ල / அத்தனகல்ல','Biyagama / බියගම / பியகம','Divulapitiya / දිවුලපිටිය / திவுலப்பிட்டிய','Dompe / දොම්පෙ / தொம்பே','Ja-Ela / ජා-ඇල / ஜா-எல','Katana / කටාන / கடானை','Kelaniya / කැලණිය / களணி','Mahara / මහර / மஹர','Minuwangoda / මිනුවන්ගොඩ / மினுவாங்கொடை','Mirigama / මීරිගම / மீரிகமை','Negombo / මීගමුව / நீர்கொழும்பு','Wattala / වත්තල / வத்தளை'],
      'Kalutara / කළුතර / களுத்துறை': ['Kalutara / කළුතර / களுத்துறை','Bandaragama / බණ්ඩාරගම / பண்டாரகம','Beruwala / බේරුවල / பேருவளை','Bulathsinhala / බුලත්සිංහල / புளத்சிங்கள','Dodangoda / දොඩම්ගොඩ / தொடந்தூவை','Horana / හොරණ / ஹொறணை','Ingiriya / ඉංගිරිය / இங்கிரிய','Mathugama / මතුගම / மத்துகம','Panadura / පානදුර / பாணந்துறை','Walallawita / වලල්ලාවිට / வளள்ளாவிட்ட']
    }
  },
  'Central / මධ්‍යම / மத்திய': {
    districts: ['Kandy / මහනුවර / கண்டி','Matale / මාතලේ / மாத்தளை','Nuwara Eliya / නුවරඑළිය / நுவரඑளிய'],
    divisions: {
      'Kandy / මහනුවර / கண்டி': ['Kandy / මහනුවර / கண்டி','Akurana / අකුරණ / அக்குரணை','Doluwa / දොළුව / தொழுவ','Harispattuwa / හාරිස්පත්තුව / ஹரிஸ்பத்துவ','Kundasale / කුණ්ඩසාලෙ / குண்டசாலை','Minipe / මිනිපේ / மினிபே','Panvila / පන්විල / பண்வில','Pathadumbara / පාතදුම්බර / பாத்ததும்பரை','Poojapitiya / පූජාපිටිය / பூஜாபிட்டிய','Udunuwara / උඩුනුවර / உடுனுவர','Yatinuwara / යටිනුවර / யட்டினுவர'],
      'Matale / මාතලේ / மாத்தளை': ['Matale / මාතලේ / மாத்தளை','Dambulla / දඹුල්ල / தம்புல்ல','Galewela / ගලේවෙල / கலேவெல','Laggala-Pallegama / ලග්ගල - පල්ලෙගම / லக்கல - பல்லேகம','Naula / නාඋල / நாஉல','Pallepola / පල්ලෙපොල / பல்லெபொல','Rattota / රත්තොට / ரத்தொட','Ukuwela / උකුවෙල / உகுவெல','Wilgamuwa / විල්ගමුව / வில்கமுவ','Yatawatta / යටවත්ත / யடவத்த'],
      'Nuwara Eliya / නුවරඑළිය / நுவரඑளிய': ['Nuwara Eliya / නුවරඑළිය / நுவரெலியா','Ambagamuwa / අඹගමුව / அம்பகமுவ','Hanguranketha / හඟුරන්කෙත / ஹங்குரங்கெத','Kothmale / කොත්මලේ / கொத்மலை','Walapane / වලපනේ / வலபனே']
    }
  },
  'Southern / දකුණු / தெற்கு': {
    districts: ['Galle / ගාල්ල / காலி','Matara / මාතර / மாத்தறை','Hambantota / හම්බන්තොට / அம்பாந்தோட்டை'],
    divisions: {
      'Galle / ගාල්ල / காலி': ['Galle / ගාල්ල / காலி','Ambalangoda / අම්බලන්ගොඩ / அம்பலாங்கொடை','Baddegama / බද්දෙගම / பத்தேகம','Bentota / බෙන්තොට / பென்தொட்டை','Elpitiya / ඇල්පිටිය / எல்பிடி','Habaraduwa / හබරාදුව / ஹபராதூவ','Hikkaduwa / හික්කඩුව / ஹிக்கடுவை','Karandeniya / කරන්දෙණිය / கரதெனிய','Neluwa / නෙළුව / நெழுவ','Yakkalamulla / යක්කල මුල්ල / யக்கலமுல்ல'],
      'Matara / මාතර / மாத்தறை': ['Matara / මාතර / மாத்தறை','Akuressa / අකුරැස්ස / அக்குரெஸ்ஸ','Athuraliya / අතුරලිය / அத்துரெளிய','Devinuwara / දෙවිනුවර / தெவிநுவர','Dickwella / දික්වැල්ල / திக்வெல்ல','Hakmana / හක්මන / ஹக்மண','Kamburupitiya / කඹුරුපිටිය / கம்புறுபிடிய','Kotapola / කොටපොල / கொடபொல','Mulatiyana / මුලටියන / முலடியன','Weligama / වැලිගම / வெலிகம'],
      'Hambantota / හම්බන්තොට / அம்பாந்தோட்டை': ['Hambantota / හම්බන්තොට / ஹம்பாந்தோட்டை','Ambalantota / අම්බලන්තොට / அம்பலாந்தோட்டை','Beliatta / බෙලිඅත්ත / பெலியத்த','Lunugamvehera / ලුණුගම්වෙහෙර / லுணுகம்வெஹற','Sooriyawewa / සූරියවැව / சூரியவெவெ','Tangalle / තංගල්ල / தங்கல்லை','Tissamaharama','Walasmulla / වලස්මුල්ල / வலஸ்முல்ல']
    }
  },
  'Northern / උතුරු / வடக்கு': {
    districts: ['Jaffna / යාපනය / யாழ்ப்பாணம்','Kilinochchi / කිලිනොච්චි / கிளிநொச்சி','Mannar / මන්නාරම / மன்னார்','Vavuniya / වවුනියා / வவுனியா','Mullaitivu / මුලතිව් / முல்லைத்தீவு'],
    divisions: {
      'Jaffna / යාපනය / யாழ்ப்பாணம்': ['Jaffna / යාපනය / யாழ்ப்பாணம்','Delft / ඩෙල්ෆ් / டெல்ப்','Kayts / කයිට්ස් / கைட்ஸ்','Kopay / කෝපයි / கோப்பாய்','Nallur / නල්ලූර් / நல்லூர்','Point Pedro / පේදුරුතුඩුව / பருத்தித்துறை','Tellippalai / තෙල්ලිප්පලෙයි / தெல்லிப்பழை','Uduvil / උදුවිල් / உடுவில்','Velanai / වේලනෙයි / வேலணை'],
      'Kilinochchi / කිලිනොච්චි / கிளிநொச்சி': ['Kandavalai / කන්දවලායි / கந்தவளை','Karachchi / කරච්චි / கரச்சி','Pachchilaipalli / පච්චිලෙයිපල්ලෙයි / பச்சிலைப்பள்ளி','Poonakary / පුනාකරි / பூணாகரி'],
      'Mannar / මන්නාරම / மன்னார்': ['Mannar Town / මන්නාරම නගරය / மன்னார் நகரம்','Madhu / මඩු / மடு','Manthai West / මන්තායි බටහිර / மாந்தை மேற்கு','Musali / මුසලි / முசலி','Nanattan / නානාධන් / நனாதன்'],
      'Vavuniya / වවුනියා / வவுனியா': ['Vavuniya / වවුනියා / வவுனியா','Vavuniya North / වවුනියා උතුර / வவுனியா வடக்கு','Vavuniya South / වවුනියා දකුණ / வவுனியா தெற்கு','Vengalacheddikulam / වෙන්ගලචෙඩ්ඩිකුලම් / வெங்கலச்செட்டிக்குளம்'],
      'Mullaitivu / මුලතිව් / முல்லைத்தீவு': ['Maritimepattu / මැරිටයිම්පත්තු / மரிதிமேப்பட்டு','Oddusuddan / ඔඩ්ඩුසුදාන් / ஒட்டுச்சுட்டாண்','Puthukudiyiruppu / පුදුකුඩියිරිප්පු / புதுக்குடியிருப்பு','Thunukkai / තුනුක්කායි / துணுக்கை','Welioya / වැලිඔය / வெலிஓய']
    }
  },
  'Eastern / නැගෙනහිර / கிழக்கு': {
    districts: ['Trincomalee / ත්‍රිකුණාමලය / திருகோணமலை','Batticaloa / මඩකලපුව / மட்டக்களப்பு','Ampara / අම්පාර / அம்பாறை'],
    divisions: {
      'Trincomalee / ත්‍රිකුණාමලය / திருகோணமலை': ['Trincomalee Town and Gravets / ත්‍රිකුණාමලය නගරය හා කඩවත් / திருகோணமலை நகரம்','Kantale / කන්තලේ / கந்தளாய்','Kinniya / කින්නියා / கின்னியா','Muttur / මුත්තූර් / மூதூர்','Seruvila / සේරුවිල / சேருவில்'],
      'Batticaloa / මඩකලපුව / மட்டக்களப்பு': ['Batticaloa / මඩකලපුව / மட்டக்களப்பு','Eravur Pattu / එරාවුර්පත්තු / ஏறாவூர் பட்டு','Kattankudy / කාත්තන්කුඩි / காத்தாங்குடி','Koralai Pattu / කෝරලේපත්තු / கோரலைப்பத்து','Manmunai North / මන්මුනායි උතුර / மண்முணை வடக்கு'],
      'Ampara / අම්පාර / அம்பாறை': ['Ampara / අම්පාර / அம்பாறை','Akkaraipattu / අක්කරෙයිපත්තු / அக்கரைப்பத்து','Dehiattakandiya / දෙහිඅත්තකන්ඩිය / தெஹிஅத்தக்கண்டிய','Kalmunai / කල්මුනෙයි / கல்முனை','Mahaoya / මහඔය / மஹாஓயா','Pothuvil / පොතුවිල් / பொத்துவில்','Uhana / උහන / உஹண']
    }
  },
  'North Western / වයඹ / வடமேல்': {
    districts: ['Kurunegala / කුරුණෑගල / குருநாகல்','Puttalam / පුත්තලම / புத்தளம்'],
    divisions: {
      'Kurunegala / කුරුණෑගල / குருநாகல்': ['Kurunegala / කුරුණෑගල / குருணாகலை','Alawwa / අලව්ව / அலவ்வ','Galgamuwa / ගල්ගමුව / கல்கமுவ','Kuliyapitiya / කුළියාපිටිය / குளியாபிட்டிய','Narammala / නාරම්මල / நாரம்மல','Nikaweratiya / නිකවෙරටිය / நிக்கவெரட்டிய','Pannala / පන්නල / பன்னல','Polgahawela / පොල්ගහවෙල / பொல்கஹவெல','Wariyapola / වාරියපොල / வாரியபொல'],
      'Puttalam / පුත්තලම / புத்தளம்': ['Puttalam / පුත්තලම / புத்தளம்','Anamaduwa / ආනමඩුව / ஆணமடுவ','Chilaw / හලාවත / சிலாபம்','Dankotuwa / දංකොටුව / தங்கொட்டுவ','Kalpitiya / කල්පිටිය / கல்பிடிய','Nattandiya / නාත්තන්ඩිය / நாத்தண்டிய','Wennappuwa / වෙන්නප්පුව / வெண்ணப்புவ']
    }
  },
  'North Central / උතුරු මැද / வடமத்திய': {
    districts: ['Anuradhapura / අනුරාධපුර / அனுராதபுரம்','Polonnaruwa / පොළොන්නරුව / பொலனறுவை'],
    divisions: {
      'Anuradhapura / අනුරාධපුර / அனுராதபுரம்': ['Anuradhapura / අනුරාධපුරය / அநுராதபுரம்','Galenbindunuwewa / ගලෙන්බිදුනුවැව / கலெண்பிந்துணுவெவ','Kekirawa / කැකිරාව / கெகிராவ','Medawachchiya / මැදවච්චිය / மெதவச்சிய','Mihintale / මිහින්තලේ / மிஹிந்தலை','Padaviya / පදවිය / பதவிய','Thalawa / තලාව / தலாவ','Thambuttegama / තඹුත්තෙගම / தம்புத்தேகம'],
      'Polonnaruwa / පොළොන්නරුව / பொலனறுவை': ['Thamankaduwa / තමන්කඩුව / தமண்கடுவ','Dimbulagala / දිඹුලාගල / திம்புலாகல','Hingurakgoda / හිඟුරක්ගොඩ / ஹிங்குரக்கொடை','Medirigiriya / මැදිරිගිරිය / மெதிரிகிரிய','Welikanda / වැලිකන්ද / வெலிகந்த']
    }
  },
  'Uva / ඌව / ஊவா': {
    districts: ['Badulla / බදුල්ල / பதுள்ள','Monaragala / මොණරාගල / மொணராகல'],
    divisions: {
      'Badulla / බදුල්ල / பதுள்ள': ['Badulla / බදුල්ල / பதுளை','Bandarawela / බණ්ඩාරවෙල / பண்டாரவளை','Ella / ඇල්ල / எல்ல','Haputale / හපුතලේ / ஹபுதலே','Mahiyanganaya / මහියංගනය / மஹியங்கணை','Passara / පස්සර / பசரை','Welimada / වැලිමඩ / வெலிமடை'],
      'Monaragala / මොණරාගල / மொணராகல': ['Monaragala / මොනරාගල / மொணராகலை','Buttala / බුත්තල / புத்தலை','Kataragama / කතරගම / கதிர்காமம்','Madulla / මඩුල්ල / மதுள்ள','Medagama / මැදගම / மெதகம','Wellawaya / වැල්ලවාය / வெல்லவாய']
    }
  },
  'Sabaragamuwa / සබරගමුව / சப்ரகமுவ': {
    districts: ['Ratnapura / රත්නපුර / இரத்தினபுரி','Kegalle / කෑගල්ල / கேகாலை'],
    divisions: {
      'Ratnapura / රත්නපුර / இரத்தினபுரி': ['Ratnapura / රත්නපුර / இரத்தினபுரி','Balangoda / බලන්ගොඩ / பலாங்கொடை','Eheliyagoda / ඇහැලියගොඩ / எஹலியகெடை','Embilipitiya / ඇඹිලිපිටිය / எம்பிலிபிட்டிய','Godakawela / ගොඩකවෙල / கொடகவெல','Kalawana / කලවාන / கலவான','Pelmadulla / පැල්මඩුල්ල / பெல்மடுல்ல'],
      'Kegalle / කෑගල්ල / கேகாலை': ['Kegalle / කෑගල්ල / கேகாலை','Aranayaka / අරනායක / அரநாயக்க','Dehiovita / දෙහිඹ්විට / தெஹியோவிட்ட','Mawanella / මාවනැල්ල / மாவணெல்ல','Rambukkana / රඹුක්කන / ரம்புக்கணை','Warakapola / වරකාපොළ / வரகாப்பொல']
    }
  }
};

const PROVINCES = Object.keys(PROVINCE_DATA);

// ✅ FIX 3: All disability options for multi-checkbox
const DISABILITY_OPTIONS = [
  { value: 'Physical / Bodily Disability', si: '1. ශාරීරික / කායික ආබාධ', ta: '1. உடல் / உடலியல் குறைபாடு', en: '1. Physical / Bodily Disability' },
  { value: 'Sensory Disability', si: '2. සංවේදන ආබාධ', ta: '2. உணர்வு குறைபாடு', en: '2. Sensory Disability' },
  { value: 'Deaf-Blindness', si: '3. අඳ බිහිරිභාවය', ta: '3. பார்வை மற்றும் செவிப்புலன் குறைபாடு', en: '3. Deaf-Blindness' },
  { value: 'Intellectual Disability', si: '4. බුද්ධිමය ආබාධ', ta: '4. அறிவுசார் குறைபாடு', en: '4. Intellectual Disability' },
  { value: 'Psychosocial / Mental Health', si: '5. මනෝ සමාජීය / මානසික සෞඛ්‍යය ආබාධ', ta: '5. உளவியல் / மனநல குறைபாடு', en: '5. Psychosocial / Mental Health' },
  { value: 'Neurodevelopmental Disorder', si: '6. ස්නායු වර්ධන ආබාධ', ta: '6. நரம்பியல் வளர்ச்சி குறைபாடு', en: '6. Neurodevelopmental Disorder' },
  { value: 'Specific Learning Disability', si: '7. නිශ්චිත ඉගෙනුම් ආබාධ', ta: '7. குறிப்பிட்ட கற்றல் குறைபாடு', en: '7. Specific Learning Disability' },
  { value: 'Communication and Speech Impairment', si: '8. සන්නිවේදන සහ කථන ආබාධ', ta: '8. தொடர்பாடல் மற்றும் பேச்சு குறைபாடு', en: '8. Communication and Speech' },
  { value: 'Neurological Disability', si: '9. ස්නායු ආබාධ', ta: '9. நரம்பியல் குறைபாடு', en: '9. Neurological Disability' },
  { value: 'Chronic Disease Related', si: '10. නිදන්ගත රෝග ආශ්‍රිත ආබාධ', ta: '10. நாட்பட்ட நோய் தொடர்பான குறைபாடு', en: '10. Chronic Disease Related' },
];

const FIELD_OPTIONS = [
  { value: 'Garments', si: 'ඇඟලුම්', ta: 'ஆடை', en: 'Garments' },
  { value: 'Cleaning Service', si: 'පිරිසිදු කිරීම්', ta: 'சுத்தம் செய்தல்', en: 'Cleaning Service' },
  { value: 'Beauty Salon', si: 'රූපලාවන්යාගාර', ta: 'அழகு நிலையம்', en: 'Beauty Salon' },
  { value: 'Hotels', si: 'හෝටල්', ta: 'உணவகம்', en: 'Hotels' },
  { value: 'IT', si: 'තොරතුරු තාක්ෂණය', ta: 'தகவல் தொழில்நுட்பம்', en: 'IT' },
  { value: 'Business', si: 'ව්‍යාපාර', ta: 'வணிகம்', en: 'Business' },
  { value: 'Agriculture', si: 'කෘෂිකර්මය', ta: 'விவசாயம்', en: 'Agriculture' },
  { value: 'Education', si: 'අධ්‍යාපනය', ta: 'கல்வி', en: 'Education' },
  { value: 'Healthcare', si: 'සෞඛ්‍ය', ta: 'சுகாதாரம்', en: 'Healthcare' },
  { value: 'Construction', si: 'ඉදිකිරීම්', ta: 'கட்டுமானம்', en: 'Construction' },
  { value: 'Handicraft', si: 'අත්කම්', ta: 'கைவினைஞர்', en: 'Handicraft' },
  { value: 'Data Entry', si: 'දත්ත ඇතුලත් කිරීම', ta: 'தரவு உள்ளீடு', en: 'Data Entry' },
  { value: 'Driving', si: 'රිය පැදවීම', ta: 'வாகனம் ஓட்டுதல்', en: 'Driving' },
  { value: 'Other', si: 'වෙනත්', ta: 'மற்றவை', en: 'Other' },
];


const base = {
  width: '100%', 
  padding: '14px 18px', 
  border: '2.5px solid #F3F4F6',
  borderRadius: '16px', 
  fontSize: '15px', 
  color: '#111827', 
  background: '#fff',
  boxSizing: 'border-box', 
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontFamily: 'inherit', 
  display: 'block',
  outline: 'none'
};

const styles = {
  container: { 
    minHeight: '100vh', 
    background: 'radial-gradient(circle at top left, #ffffff 0%, #fff0f0 100%)', 
    padding: '40px 16px', 
    fontFamily: '"Outfit", "Noto Sans Sinhala", "Noto Sans Tamil", -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: { 
    maxWidth: '1000px', 
    width: '100%',
    margin: '0 auto', 
    background: 'rgba(255, 255, 255, 0.98)', 
    borderRadius: '32px', 
    boxShadow: '0 40px 100px -20px rgba(124, 0, 0, 0.12), 0 0 40px rgba(0, 0, 0, 0.02)', 
    overflow: 'hidden',
    border: '1px solid rgba(124, 0, 0, 0.08)',
    backdropFilter: 'blur(20px)'
  },
  header: { 
    position: 'relative',
    background: '#7c0000', 
    padding: '160px 48px 80px', 
    textAlign: 'center',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '340px'
  },
  headerImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 1,
    zIndex: 0
  },
  logo: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    height: '60px',
    zIndex: 10,
    filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'transparent',
    zIndex: 1
  },
  headerContent: {
    position: 'relative',
    zIndex: 2
  },
  headerBadge: { 
    display: 'inline-block', 
    background: 'rgba(255,255,255,0.12)', 
    backdropFilter: 'blur(8px)',
    color: '#fff', 
    borderRadius: '30px', 
    padding: '8px 24px', 
    fontSize: '12px', 
    fontWeight: '700', 
    marginBottom: '20px',
    border: '1px solid rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  title:   { color: '#fff', fontSize: 'clamp(28px,7vw,42px)', fontWeight: '900', margin: '0 0 12px', lineHeight: 1.1, textShadow: '0 4px 12px rgba(0,0,0,0.4)', letterSpacing: '-0.5px' },
  titleTa: { color: 'rgba(255,255,255,0.95)', fontSize: 'clamp(18px,4.5vw,22px)', fontWeight: '600', margin: '0 0 6px' },
  titleEn: { color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: '500', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' },
  noticeHighlight: { color: '#FFD700', fontWeight: '800' },
  tabContainer: { 
    display: 'flex', 
    background: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: '20px', 
    padding: '6px', 
    marginTop: '-45px', 
    marginBottom: '32px',
    gap: '8px',
    maxWidth: '620px',
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid rgba(124, 0, 0, 0.1)',
    boxShadow: '0 20px 40px rgba(124, 0, 0, 0.12)',
    position: 'relative',
    zIndex: 10
  },
  tab: { 
    flex: 1, 
    padding: '14px 12px', 
    borderRadius: '16px', 
    border: 'none', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '800', 
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
    fontFamily: 'inherit', 
    lineHeight: 1.4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    textAlign: 'center'
  },
  tabActive:   { 
    background: 'linear-gradient(135deg, #7c0000 0%, #5a0000 100%)', 
    color: '#fff', 
    boxShadow: '0 8px 25px rgba(124, 0, 0, 0.3)',
    transform: 'translateY(-2px)',
  },
  tabInactive: { 
    background: 'transparent', 
    color: '#6B7280',
    border: '1px solid transparent',
    '&:hover': {
      background: 'rgba(124, 0, 0, 0.05)',
      color: '#7c0000'
    }
  },
  form: { padding: '40px 48px' },
  fieldRow: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' },
  label: { width: '280px', minWidth: '240px', paddingTop: '12px', fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: 1.5, flexShrink: 0 },
  inputWrap: { flex: 1, minWidth: '300px' },
  sel: { ...base, WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px', border: '2.5px solid #F3F4F6', '&:focus': { borderColor: '#7c0000', boxShadow: '0 0 0 5px rgba(124, 0, 0, 0.1)' } },
  inp: { ...base, userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#7c0000', border: '2px solid #F3F4F6' },
  inpOther: { ...base, marginTop: '12px', borderColor: '#FFD700', background: '#FFFEF5', userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#7c0000', borderRadius: '14px' },
  ta:  { ...base, minHeight: '120px', resize: 'vertical', lineHeight: '1.7', userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#7c0000', border: '2px solid #F3F4F6', borderRadius: '16px' },
  radioGroup: { display: 'flex', gap: '20px', paddingTop: '10px', flexWrap: 'wrap' },
  radioLabel: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '12px 20px', borderRadius: '16px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '2px solid #F3F4F6', background: '#fff' },
  radioInput: { width: '22px', height: '22px', accentColor: '#7c0000', cursor: 'pointer', marginTop: '1px', flexShrink: 0 },
  submitContainer: { marginTop: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '20px 64px', background: 'linear-gradient(135deg, #7c0000 0%, #5a0000 100%)', color: '#fff', border: 'none', borderRadius: '18px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', width: '100%', maxWidth: '520px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit', boxShadow: '0 15px 30px rgba(124, 0, 0, 0.3)', letterSpacing: '0.5px' },
  submitBtnDisabled: { background: '#E5E7EB', cursor: 'not-allowed', boxShadow: 'none', color: '#9CA3AF' },
  warningText: { fontSize: '13px', color: '#B91C1C', textAlign: 'center', margin: 0, lineHeight: 1.8, fontWeight: '500' },
  message: { padding: '20px 24px', borderRadius: '14px', textAlign: 'center', marginTop: '24px', fontSize: '15px', lineHeight: 1.7, fontWeight: '600' },
  msgSuccess: { background: '#F0FDF4', border: '1.5px solid #BBF7D0', color: '#15803d', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  msgError:   { background: '#FEF2F2', border: '1.5px solid #FECACA', color: '#b91c1c', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  divider: { border: 'none', borderTop: '2px solid #F3F4F6', margin: '48px 0' },
  sectionTitle: { fontSize: '18px', fontWeight: '900', color: '#7c0000', marginBottom: '24px', marginTop: '12px', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '0.2px' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', paddingTop: '12px' },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', border: '2px solid #F3F4F6', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#fff' },
  checkboxLabelChecked: { border: '2px solid #7c0000', background: '#FFFDFD', boxShadow: '0 10px 20px rgba(124, 0, 0, 0.08)', transform: 'translateY(-1px)' },
  checkboxInput: { width: '20px', height: '20px', accentColor: '#7c0000', cursor: 'pointer', marginTop: '4px', flexShrink: 0 },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 24px',
    background: '#fff',
    border: '2.5px solid #7c0000',
    borderRadius: '16px',
    color: '#7c0000',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '20px',
    boxShadow: '0 8px 20px rgba(124, 0, 0, 0.08)'
  },
};

const L = ({ si, ta, en, color }) => (
  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <span style={{ display: 'block', color: color || '#7c0000', fontSize: '14px', fontWeight: '800', letterSpacing: '0.2px' }}>{si}</span>
    <span style={{ display: 'block', color: color || '#5a0000', fontSize: '13px', fontWeight: '500', opacity: color ? 1 : 0.9 }}>{ta}</span>
    <span style={{ display: 'block', color: color || '#6B7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>{en}</span>
  </span>
);

const F = ({ si, ta, en, children }) => (
  <div style={styles.fieldRow}>
    <label style={styles.label}><L si={si} ta={ta} en={en} /></label>
    <div style={styles.inputWrap}>{children}</div>
  </div>
);

const RadioGroup = ({ name, value, onChange, options }) => (
  <div style={styles.radioGroup}>
    {options.map(opt => (
      <label key={opt.value} style={styles.radioLabel} className="radio-label">
        <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} style={styles.radioInput} />
        <span>
          <span style={{ display: 'block', color: '#800000', fontSize: '13px', fontWeight: '600' }}>{opt.si}</span>
          <span style={{ display: 'block', color: '#600000', fontSize: '11px' }}>{opt.ta}</span>
          <span style={{ display: 'block', color: '#6B7280', fontSize: '11px' }}>{opt.en}</span>
        </span>
      </label>
    ))}
  </div>
);

// ✅ FIX 3: Multi-checkbox component
const DisabilityCheckboxGroup = ({ selected, onChange, options }) => (
  <div style={styles.checkboxGrid}>
    {options.map(opt => {
      const isChecked = selected.includes(opt.value);
      return (
        <label key={opt.value} className="cb-label" style={{ ...styles.checkboxLabel, ...(isChecked ? styles.checkboxLabelChecked : {}) }}>
          <input type="checkbox" value={opt.value} checked={isChecked} onChange={() => onChange(opt.value)} style={styles.checkboxInput} />
          <span>
            <span style={{ display: 'block', color: '#800000', fontSize: '12px', fontWeight: '600' }}>{opt.si}</span>
            <span style={{ display: 'block', color: '#600000', fontSize: '11px' }}>{opt.ta}</span>
            <span style={{ display: 'block', color: '#6B7280', fontSize: '10px' }}>{opt.en}</span>
          </span>
        </label>
      );
    })}
  </div>
);

const selStyle = (off) => ({ ...styles.sel, background: off ? '#F3F4F6' : '#fff', color: off ? '#9CA3AF' : '#1f2937', cursor: off ? 'not-allowed' : 'pointer' });

const COMPANY_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFK4kMO4WgpRKJFKNEF_98y93eJnlr9PwqSIVxJ7-6ZrBY_xmbhov9TBQ2r_sSpDr19g/exec';
const PERSON_SCRIPT_URL  = 'https://script.google.com/macros/s/AKfycbymWP9l9hEDInd8Sg3SjJAxaBUq0djl4ZvmqsrE5XqSjvUA5d68m6oAIWfTwJXGo5gdWQ/exec';

const defaultCompany = { province:'',district:'',division:'',officeName:'',officerName:'',contact:'',email:'',whatsapp:'',hasJob:'',field:'',fieldOther:'',vacancies:'',vacancyDescription:'',pay:'',epfEtf:'',hasTrainee:'',supplyTransport:'',transportLimit:'',supplyFood:'',supplyClothes:'',ageCategory:'',ageCategoryOther:'',gender:'',disability:[],disabilityOther:'',searchVisibility:'' };
const defaultPerson  = { province:'',district:'',division:'',name:'',address:'',language:'',idType:'',idNo:'',dob:'',qualification:'',qualificationOther:'',phone:'',disability:[],disabilityOther:'',field:[],fieldOther:'',gender:'',age:'',caretakerName:'',caretakerMobile:'',villageOfficerName:'',villageOfficerWhatsapp:'',gnDivision:'' };

export default function CombinedForm() {
  const [activeTab,    setActiveTab]    = useState('person');
  const [companyData,  setCompanyData]  = useState(defaultCompany);
  const [personData,   setPersonData]   = useState(defaultPerson);
  const [uploading,    setUploading]    = useState(false);
  const [message,      setMessage]      = useState({ type:'', text:'' });
  const [showPersonDisabilities,  setShowPersonDisabilities]  = useState(false);
  const [showCompanyDisabilities, setShowCompanyDisabilities] = useState(false);
  const [showPersonFields,       setShowPersonFields]       = useState(false);

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://cdn.userway.org/widget.js';
    s.setAttribute('data-account','XfZSO2MTQw');
    s.async = true;
    document.body.appendChild(s);
    return () => { if (document.body.contains(s)) document.body.removeChild(s); };
  }, []);

  const switchTab = (tab) => { setActiveTab(tab); setMessage({ type:'', text:'' }); };

  const handleCompanyChange = useCallback((e) => {
    const { name, value } = e.target;
    setCompanyData(prev =>
      name==='province' ? {...prev,province:value,district:'',division:''}
      : name==='district' ? {...prev,district:value,division:''}
      : {...prev,[name]:value}
    );
  },[]);

  const cD = companyData.province ? PROVINCE_DATA[companyData.province]?.districts||[] : [];
  const cV = companyData.province&&companyData.district ? PROVINCE_DATA[companyData.province]?.divisions[companyData.district]||[] : [];
  const cOK = companyData.province&&companyData.district&&companyData.division&&companyData.officeName&&companyData.contact&&companyData.hasJob&&companyData.epfEtf&&companyData.hasTrainee;

  const handlePersonChange = useCallback((e) => {
    const { name, value } = e.target;
    setPersonData(prev =>
      name==='province' ? {...prev,province:value,district:'',division:''}
      : name==='district' ? {...prev,district:value,division:''}
      : {...prev,[name]:value}
    );
  },[]);

  // ✅ Toggle disability checkbox for person
  const handleDisabilityToggle = useCallback((val) => {
    setPersonData(prev => {
      const current = prev.disability || [];
      const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return { ...prev, disability: updated };
    });
  }, []);

  // ✅ Toggle field of work checkbox for person
  const handleFieldToggle = useCallback((val) => {
    setPersonData(prev => {
      const current = prev.field || [];
      const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return { ...prev, field: updated };
    });
  }, []);

  // ✅ Toggle disability checkbox for company
  const handleCompanyDisabilityToggle = useCallback((val) => {
    setCompanyData(prev => {
      const current = prev.disability || [];
      const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return { ...prev, disability: updated };
    });
  }, []);

  const pD = personData.province ? PROVINCE_DATA[personData.province]?.districts||[] : [];
  const pV = personData.province&&personData.district ? PROVINCE_DATA[personData.province]?.divisions[personData.district]||[] : [];
  const pOK = personData.province&&personData.district&&personData.division&&personData.name&&personData.idType&&personData.idNo&&personData.phone;

  const isCompany = activeTab==='company';
  const complete  = isCompany ? cOK : pOK;

  const handleSubmit = async () => {
    if (!complete) return;
    setUploading(true);
    setMessage({type:'', text:''});

    // Convert disability arrays → comma string for Sheets
    const companyDataForSubmit = {
      ...companyData,
      disability: Array.isArray(companyData.disability) ? companyData.disability.join(', ') : companyData.disability
    };
    const personDataForSubmit = {
      ...personData,
      disability: Array.isArray(personData.disability) ? personData.disability.join(', ') : personData.disability,
      field: Array.isArray(personData.field) ? personData.field.join(', ') : personData.field
    };

    const url  = isCompany ? COMPANY_SCRIPT_URL : PERSON_SCRIPT_URL;
    const data = isCompany
      ? { ...companyDataForSubmit, formType: 'company' }
      : { ...personDataForSubmit, formType: 'disabledPerson' };

    try {
      const payload = { ...data, timestamp: new Date().toLocaleString() };

      // 1. Save to Firebase
      try {
        const collectionName = isCompany ? 'companySubmissions' : 'personSubmissions';
        await addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });
        console.log('Firebase success');
      } catch (fbError) {
        console.error('Firebase error:', fbError);
        throw new Error('Firebase submission failed. Please check your database rules.');
      }

      // 2. Save to Google Sheets
      try {
        const formBody = Object.keys(payload)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k] ?? ''))
          .join('&');
        await fetch(url, { method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: formBody });
        console.log('Google Sheets success');
      } catch (gsError) {
        console.error('Google Sheets error:', gsError);
        throw new Error('Google Sheets submission failed.');
      }

      setMessage({ type:'success', text:'දත්ත සාර්ථකව ඉදිරිපත් කරන ලදී!\nதரவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!\nData submitted successfully!' });
      if (isCompany) setCompanyData(defaultCompany);
      else setPersonData(defaultPerson);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Submission error:', error);
      setMessage({ type:'error', text: error.message || 'දෝෂයක් ඇතිවිය / பிழை ஏற்பட்டது / An error occurred.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        button,select,input,textarea{font-family:'Noto Sans Sinhala','Noto Sans Tamil',sans-serif!important;}
        button:focus,select:focus,input:focus,textarea:focus{border-color:#800000!important;outline:none!important;box-shadow:0 0 0 4px rgba(128, 0, 0, 0.15)!important;}
        .sbtn:hover:not(:disabled){background:linear-gradient(135deg, #600000 0%, #400000 100%)!important; transform: translateY(-2px); box-shadow: 0 12px 20px -3px rgba(128, 0, 0, 0.4)!important;}
        .sbtn:active:not(:disabled){transform: translateY(0);}
        .hint{font-size:12px;color:#6B7280;margin:6px 0 0;line-height:1.5;}
        .cb-label:hover{border-color:#800000!important;background:#FFFBFB!important;transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.05);}
        .radio-label:hover{background:#fff5f5!important;}
        html{scroll-behavior:auto!important;}
        ::selection { background: #800000; color: white; }
      `}</style>

      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <img src={headerImg} alt="Header Background" style={styles.headerImg} />
          <img src={logoImg} alt="Logo" style={{ 
            position: 'absolute', 
            top: '20px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            height: '130px', 
            zIndex: 10, 
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))' 
          }} />
          <div style={styles.headerOverlay} />
          <div style={styles.headerContent}>
            
          </div>
        </div>
        <div style={styles.tabContainer}>
          <button style={{...styles.tab,...(!isCompany?styles.tabActive:styles.tabInactive)}} onClick={()=>switchTab('person')}>
            <div><L si="♿ රැකියා අපේක්ෂිත ආබාධ සහිත තැනැත්තන් ලියාපදිංචි කිරීමේ පෝරමය" ta="மாற்றுத்திறனாளி குடிமக்கள் பதிவு படிவம்" en="Persons with Disabilities Registration Form" color={!isCompany ? '#fff' : undefined} /></div>
          </button>
          <button style={{...styles.tab,...(isCompany?styles.tabActive:styles.tabInactive)}} onClick={()=>switchTab('company')}>
            <div><L si="🏢 සේවා යෝජකයින් ලියාපදිංචි කිරීමේ පෝරමය" ta="நிறுவன பதிவு படிவம்" en="Company Registration Form" color={isCompany ? '#fff' : undefined} /></div>
          </button>
        </div>
        
        {message.text && (
          <div style={{...styles.message, margin: '20px 48px 0', ...(message.type==='success'?styles.msgSuccess:styles.msgError)}}>
            {message.text.split('\n').map((line,i)=><div key={i}>{line}</div>)}
          </div>
        )}

        <div style={styles.form}>

          {/* ══════════ COMPANY FORM  Form══════════ */}
          {isCompany && (<>

            {/* Payment Notice */}
            <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',border:'2px solid #F59E0B',borderRadius:'12px',padding:'18px 20px',marginBottom:'24px',display:'flex',gap:'14px',alignItems:'flex-start'}}>
              <span style={{ fontSize:'24px', lineHeight:1, flexShrink:0, marginTop:'2px' }}>💰</span>
              <div>
                <p style={{ margin:'0 0 6px', color:'#800000', fontSize:'13px', fontWeight:'700', lineHeight:1.8 }}>
                  ආබාධ සහිත තැනැත්තන් රැකියා ගත කරන ආයතන සඳහා රජය මගින් <span style={{color:'#b45309',fontWeight:'700'}}>මාස 24ක්</span> දක්වා <span style={{color:'#b45309',fontWeight:'700'}}>රු. 15,000</span>ක උපරිමයකට යටත්ව ගෙවීම් සිදු කරනු ලැබේ.
                </p>
                <p style={{ margin:'0 0 6px', color:'#991b1b', fontSize:'12px', lineHeight:1.8 }}>
                  மாற்றுத்திறனாளிகளை வேலைக்கமர்த்தும் நிறுவனங்களுக்கு அரசு <span style={{color:'#b45309',fontWeight:'700'}}>24 மாதங்கள்</span> வரை <span style={{color:'#b45309',fontWeight:'700'}}>ரூ. 15,000</span> வரம்பில் கொடுப்பனவு செய்யும்.
                </p>
                <p style={{ margin:0, color:'#991b1b', fontSize:'12px', lineHeight:1.8 }}>
                  The government will make payments for up to <strong style={{color:'#b45309'}}>24 months</strong>, subject to a maximum of <strong style={{color:'#b45309'}}>Rs. 15,000</strong>.
                </p>
              </div>
            </div>

            <p style={styles.sectionTitle}>📍 ස්ථානීය  තොරතුරු · இட விவரங்கள் · Location Details</p>
            <F si="පළාත *" ta="மாகாணம் *" en="Province *">
              <select name="province" value={companyData.province} onChange={handleCompanyChange} style={styles.sel}>
                <option value="">-- පළාත / මமாகாணம் / Province --</option>
                {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </F>
            <F si="දිස්ත්‍රික්කය *" ta="மாவட்டம் *" en="District *">
              <select name="district" value={companyData.district} onChange={handleCompanyChange} style={selStyle(!companyData.province)} disabled={!companyData.province}>
                <option value="">-- දිස්ත්‍රික්කය / மாவட்டம் / District --</option>
                {cD.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {!companyData.province && <p className="hint">පළාත තෝරන්න · மாகாணத்தை தேர்ந்தெடுக்கவும் · Select Province first</p>}
            </F>
            <F si="ප්‍රාදේශීය ලේකම් කොට්ඨාශය *" ta="பிரதேச செயலகம் *" en="Divisional Secretariat *">
              <select name="division" value={companyData.division} onChange={handleCompanyChange} style={selStyle(!companyData.district)} disabled={!companyData.district}>
                <option value="">-- ප්‍රාදේශීය ලේකම් / பிரதேச செயலகம் / Div. Secretariat --</option>
                {cV.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {!companyData.district && <p className="hint">දිස්ත්‍රික්කය තෝරන්න · மாவட்டத்தை தேர்ந்தெடுக்கவும் · Select District first</p>}
            </F>

            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>🏢 කාර්යාලීය  තොරතුරු · நிறுவன தகவல்கள் · Office Information</p>
            <F si="ආයතනයේ නම *" ta="நிறுவனத்தின் பெயர் *" en="Office / Company Name *">
              <input type="text" name="officeName" value={companyData.officeName} onChange={handleCompanyChange} style={styles.inp} maxLength={100} autoComplete="off"/>
              <p className="hint">{companyData.officeName.length}/100</p>
            </F>
            <F si="ලිපිනය" ta="முழு முகவரி" en="Address">
              <textarea name="address" value={personData.address} onChange={handlePersonChange} style={styles.ta} rows={3} maxLength={250} autoComplete="off"/>
              <p className="hint">{personData.address.length}/250</p>
            </F>
            <F si="ආයතනයේ  දුරකථනය අංකය *" ta="தொலைபேசி *" en="Contact Number *">
              <input type="tel" name="contact" value={companyData.contact} onChange={handleCompanyChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
            <F si="සම්බන්ධ කල හැකි නිලධාරියාගේ නම" ta="தொடர்பு அதிகாரி பெயர்" en="Contact Officer Name">
              <input type="text" name="officerName" value={companyData.officerName} onChange={handleCompanyChange} style={styles.inp} maxLength={100} autoComplete="off"/>
            </F>
            <F si="WhatsApp අංකය" ta="வாட்ஸ்அப் எண்" en="WhatsApp Number">
              <input type="tel" name="whatsapp" value={companyData.whatsapp} onChange={handleCompanyChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
            <F si="විද්‍යුත් තැපෑල" ta="மின்னஞ்சல்" en="Email Address">
              <input type="email" name="email" value={companyData.email} onChange={handleCompanyChange} style={styles.inp} maxLength={100} placeholder="example@email.com" autoComplete="off"/>
            </F>

            {/* ✅ FIX 1: Field/Sector — completely separate from vacancies */}
            <F si="ආයතනයේ ක්ෂේත්‍රය" ta="நிறுவனத்தின் துறை" en="Company Field / Sector">
              <select name="field" value={companyData.field} onChange={handleCompanyChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="Garments">ඇඟලුම් / ஆடை / Garments</option>
                <option value="Beauty Salon">රූපලාවන්යාගාර / அழகு நிலையம் / Beauty Salon</option>
                <option value="Hotels">හෝටල් / உணவகம் / Hotels</option>
                <option value="IT">තොරතුරු තාක්ෂණය / தகவல் தொழில்நுட்பம் / IT</option>
                <option value="Business">ව්‍යාපාර / வணிகம் / Business</option>
                <option value="Agriculture">කෘෂිකර්මාන්තය / விவசாயம் / Agriculture</option>
                <option value="Construction">ඉදිකිරීම් / கட்டுமானம் / Construction</option>
                <option value="Healthcare">සෞඛ්‍ය සේවා / சுகாதார சேவை / Healthcare</option>
                <option value="Education">අධ්‍යාපනය / கல்வி / Education</option>
                <option value="Other">වෙනත් / மற்றவை / Other</option>
              </select>
              {companyData.field === 'Other' && (
                <input type="text" name="fieldOther" value={companyData.fieldOther} onChange={handleCompanyChange}
                  style={styles.inpOther} maxLength={100}
                  placeholder="වෙනත් ක්ෂේත්‍රය / பிற துறை / Specify field..." autoComplete="off"/>
              )}
            </F>

            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>💼 <L si="පුරප්පාඩු පිලිබඳ තොරතුරු" ta="வேலை விவரங்கள்" en="Employment Details" /></p>
            <F si="රැකියා පුරප්පාඩු  *" ta="வேலைவாய்ப்பு உள்ளதா? *" en="Do you have vacancies? *">
              <RadioGroup name="hasJob" value={companyData.hasJob} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'ඇත ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'නැත',ta:'இல்லை',en:'No'},
              ]}/>
            </F>


            {companyData.hasJob === 'Yes' && (
              <>
            <F si="පුරප්පාඩු මොනවාද" ta="காலியிட விவரம்" en="What are the Vacancies?">
              <textarea
                name="vacancyDescription"
                value={companyData.vacancyDescription}
                onChange={handleCompanyChange}
                style={styles.ta}
                rows={3}
                maxLength={300}
                placeholder="උදා: කළමනාකරු, අලෙවිකරු, රියදුරු... / எ.கா: மேலாளர், காசாளர், ஓட்டுனர்... / e.g. Manager, Cashier, Driver..."
                autoComplete="off"
              />
              <p className="hint">{(companyData.vacancyDescription||'').length}/300</p>
            </F>

            <F si="පුරප්පාඩු ගණන" ta="காலியிடங்கள் எண்ணிக்கை" en="Number of Vacancies">
              <input type="text" name="vacancies" value={companyData.vacancies} onChange={handleCompanyChange} style={styles.inp} maxLength={100}  autoComplete="off"/>

            </F>
              </>
            )}

            <hr style={styles.divider}/>
            
            <F si="අපේක්ෂිත වයස් කාණ්ඩය" ta="வயது பிரிவு" en="Age Category">
              <select name="ageCategory" value={companyData.ageCategory} onChange={handleCompanyChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="18-30">18 – 30</option>
                <option value="30-40">30 – 40</option>
                <option value="40-50">40 – 50</option>
                <option value="50+">50+</option>
                <option value="Other">වෙනත් / மற்றவை / Other</option>
              </select>
              {companyData.ageCategory === 'Other' && (
                <input type="text" name="ageCategoryOther" value={companyData.ageCategoryOther} onChange={handleCompanyChange}
                  style={styles.inpOther} maxLength={50}
                  placeholder="වයස් කාණ්ඩය සඳහන් කරන්න / வயது வரம்பை குறிப்பிடவும் / Specify age range..." autoComplete="off"/>
              )}
            </F>
            <F si="ස්ත්‍රී පුරුෂ භාවය" ta="பாலினம்" en="Gender">
              <select name="gender" value={companyData.gender} onChange={handleCompanyChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="Male">පිරිමි / ஆண் / Male</option>
                <option value="Female">ස්ත්‍රී / பெண் / Female</option>
                <option value="Any">ස්ත්‍රී/පුරුෂ දෙපාර්ශවයම / எவரும் / Any</option>
              </select>
            </F>
            <F si="පිළිගත හැකි ආබාධතා වර්ග" ta="ஏற்கக்கூடிய இயலாமை வகைகள்" en="Types of Disability Accepted">
              <div>
                <button type="button" onClick={() => setShowCompanyDisabilities(!showCompanyDisabilities)} style={styles.toggleBtn}>
                  <span>📍 ආබාධිතතා වර්ග තෝරන්න / இயலாமை வகைகளைத் தேர்ந்தெடுக்கவும் / Select Disability Types</span>
                  <span style={{ fontSize: '18px' }}>{showCompanyDisabilities ? '▲' : '▼'}</span>
                </button>

                {showCompanyDisabilities && (
                  <div style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1.5px solid #e5e7eb',
                    marginBottom: '20px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <p className="hint" style={{ marginBottom: '15px', color: '#1a56db', fontWeight: '700', fontSize: '13px' }}>
                      ☑ එකට වඩා තෝරා ගත හැකිය · ஒன்றுக்கு மேலானவற்றை தேர்வு செய்யலாம் · You may select multiple
                    </p>
                    <label className="cb-label" style={{
                      ...styles.checkboxLabel,
                      marginBottom: '12px', width: '100%',
                      ...((companyData.disability || []).includes('Any') ? styles.checkboxLabelChecked : {})
                    }}>
                      <input type="checkbox" value="Any"
                        checked={(companyData.disability || []).includes('Any')}
                        onChange={() => handleCompanyDisabilityToggle('Any')}
                        style={styles.checkboxInput} />
                      <span>
                        <span style={{ display: 'block', color: '#800000', fontSize: '13px', fontWeight: '700' }}>ඕනෑම ආබාධයක්</span>
                        <span style={{ display: 'block', color: '#600000', fontSize: '12px' }}>எந்த குறைபாடும்</span>
                        <span style={{ display: 'block', color: '#6B7280', fontSize: '11px' }}>Any Disability</span>
                      </span>
                    </label>
                    <DisabilityCheckboxGroup
                      selected={companyData.disability || []}
                      onChange={handleCompanyDisabilityToggle}
                      options={DISABILITY_OPTIONS.filter(o => o.value !== 'Other')}
                    />
                  </div>
                )}

                {(companyData.disability || []).includes('Other') && (
                  <input type="text" name="disabilityOther" value={companyData.disabilityOther || ''} onChange={handleCompanyChange}
                    style={styles.inpOther} maxLength={100}
                    placeholder="ආබාධතා වර්ගය සඳහන් කරන්න / இயலாமை வகையை குறிப்பிடவும் / Specify disability type..."
                    autoComplete="off" />
                )}
                {(companyData.disability || []).length > 0 && (
                  <p className="hint" style={{ color: '#166534', marginTop: '10px', fontWeight: '700', fontSize: '13px' }}>
                    ✅ තෝරාගත් / தேர்ந்தெடுக்கப்பட்டவை / Selected ({(companyData.disability || []).length}): {(companyData.disability || []).join(' · ')}
                  </p>
                )}
              </div>
            </F>

            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>📋 <L si="දීමනා, පහසුකම් & පුහුණු" ta="சலுகைகள், வசதிகள் & பயிற்சி" en="Benefits, Facilities & Training" /></p>
            <F si="ගෙවිය හැකි අවම වැටුප" ta="ஊதியம்" en="Pay / Salary">
              <input type="text" name="pay" value={companyData.pay} onChange={handleCompanyChange} style={styles.inp} maxLength={50} placeholder="Rs. XXXXX" autoComplete="off"/>
            </F>
            <F si="EPF / ETF  *" ta="ஈபிஎஃப் / ஈடிஎஃப் *" en="EPF / ETF *">
              <RadioGroup name="epfEtf" value={companyData.epfEtf} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'ගෙවනු ලැබේ ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'ගෙවනු නොලැබේ ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
            <F si="පෙර පුහුනු වැඩසටහනක්  *" ta="பயிற்சி திட்டம் *" en="Training Programme *">
              <RadioGroup name="hasTrainee" value={companyData.hasTrainee} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'පවත්වයි ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'නොපවත්වයි ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
            <F si="ප්‍රවාහන පහසුකම්" ta="போக்குவரத்து வசதி" en="Supply Transport">
              <RadioGroup name="supplyTransport" value={companyData.supplyTransport} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'සපයනු ලැබේ ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'සපයනු නොලැබේ ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
            {companyData.supplyTransport==='Yes' && (
              <F si="ප්‍රවාහන පහසුකම් සපයන දුර ප්‍රමාණය" ta="போக்குவரத்து வரம்பு" en="Transport Limit">
                <input type="text" name="transportLimit" value={companyData.transportLimit} onChange={handleCompanyChange} style={styles.inp} maxLength={100} placeholder="e.g. 20km radius" autoComplete="off"/>
              </F>
            )}
            <F si="අහාර" ta="உணவு வசதி" en="Supply Food">
              <RadioGroup name="supplyFood" value={companyData.supplyFood} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'සපයනු ලැබේ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'සපයනු නොලැබේ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
            <F si="ඇඳුම් / යූනිෆෝම් " ta="ஆடை / சீருடை வழங்கல்" en="Supply Clothes / Uniform">
              <RadioGroup name="supplyClothes" value={companyData.supplyClothes} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'සපයනු ලැබේ',ta:'ஆம',en:'Yes'},
                {value:'No', si:'සපයනු නොලැබේ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
          </>)}

          {/* ══════════ DISABLED PERSON FORM ══════════ */}
          {!isCompany && (<>
            <div style={{background:'linear-gradient(135deg,#fffbeb,#fef3c7)',border:'2px solid #F59E0B',borderRadius:'12px',padding:'18px 20px',marginBottom:'24px',display:'flex',gap:'14px',alignItems:'flex-start'}}>
              <span style={{fontSize:'26px',lineHeight:1,flexShrink:0,marginTop:'2px'}}>⚠️</span>
              <div>
                <div style={{width:'100%',height:'1.5px',background:'#FCD34D',margin:'4px 0 10px'}}/>
                <p style={{margin:'0 0 4px',color:'#92400E',fontSize:'13px',fontWeight:'700',lineHeight:1.8}}>
                  එක් පුද්ගලයකු සඳහා <span style={{color:'#B45309'}}>එක් වරක් පමණක්</span> පෝරමය භාවිතා කරන්න.
                </p>
                <p style={{margin:'0 0 4px',color:'#78350F',fontSize:'12px',lineHeight:1.8}}>
                  ஒருவருக்கு <span style={{color:'#B45309',fontWeight:'700'}}>ஒரு முறை மட்டுமே</span> படிவத்தைப் பயன்படுத்தவும்.
                </p>
                <p style={{margin:0,color:'#78350F',fontSize:'12px',lineHeight:1.8}}>
                  Use the form <strong>once per person</strong> only.
                </p>
              </div>
            </div>

            <p style={styles.sectionTitle}>📍 <L si="ස්ථානීය තොරතුරු" ta="இட விவரங்கள்" en="Location Details" /></p>
            <F si="පළාත *" ta="மாகாணம் *" en="Province *">
              <select name="province" value={personData.province} onChange={handlePersonChange} style={styles.sel}>
                <option value="">-- පළාත / මாகාணம் / Province --</option>
                {PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </F>
            <F si="දිස්ත්‍රික්කය *" ta="மாவட்டம் *" en="District *">
              <select name="district" value={personData.district} onChange={handlePersonChange} style={selStyle(!personData.province)} disabled={!personData.province}>
                <option value="">-- දිස්ත්‍රික්කය / மாவட்டம் / District --</option>
                {pD.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {!personData.province && <p className="hint">පළාත තෝරන්න · மாகாணத்தை தேர்ந்தெடுக்கவும் · Select Province first</p>}
            </F>
            <F si="ප්‍රාදේශීය ලේකම් කොට්ඨාශය *" ta="பிரதேச செயலகம் *" en="Divisional Secretariat *">
              <select name="division" value={personData.division} onChange={handlePersonChange} style={selStyle(!personData.district)} disabled={!personData.district}>
                <option value="">-- ප්‍රාදේශීය ලේකම් / பிரதேச செயலகம் / Div. Secretariat --</option>
                {pV.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {!personData.district && <p className="hint">දිස්ත්‍රික්කය තෝරන්න · மாவட்டத்தை தேர்ந்தெடுக்கவும் · Select District first</p>}
            </F>
            <F si="ග්‍රාම නිලධාරි කොට්ඨාශය" ta="கிராம நிர்வாக பிரிவு" en="GN Division">
              <input type="text" name="gnDivision" value={personData.gnDivision} onChange={handlePersonChange} style={styles.inp} maxLength={100} autoComplete="off" placeholder="උදා: 123A / எ.கா: 123A / e.g. 123A"/>
            </F>

            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>👤 <L si="පුද්ගලික තොරතුරු" ta="தனிப்பட்ட தகவல்கள்" en="Personal Details" /></p>
            <F si="නම *" ta="பெயர் *" en="Full Name *">
              <input type="text" name="name" value={personData.name} onChange={handlePersonChange} style={styles.inp} maxLength={100} autoComplete="off"/>
              <p className="hint">{personData.name.length}/100</p>
            </F>
            <F si="ලිපිනය" ta="முழு முகவரி" en="Address">
              <textarea name="address" value={personData.address} onChange={handlePersonChange} style={styles.ta} rows={3} maxLength={250} autoComplete="off"/>
              <p className="hint">{personData.address.length}/250</p>
            </F>
            <F si="දුරකථනය *" ta="தொலைபேசி எண் *" en="Phone Number *">
              <input type="tel" name="phone" value={personData.phone} onChange={handlePersonChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
            <F si="උපන් දිනය" ta="பிறந்த திகதி" en="Date of Birth">
              <input type="date" name="dob" value={personData.dob} onChange={handlePersonChange} style={styles.inp}/>
            </F>
            <F si="වයස" ta="வயது" en="Age">
              <input type="number" name="age" value={personData.age} onChange={handlePersonChange} style={styles.inp} min="0" max="120" placeholder="උදා: 30 / எ.கா: 30 / e.g. 30" autoComplete="off"/>
            </F>
            <F si="ස්ත්‍රී පුරුෂ භාවය" ta="பாலினம்" en="Gender">
              <select name="gender" value={personData.gender} onChange={handlePersonChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="Male">පිරිමි / ஆண் / Male</option>
                <option value="Female">ස්ත්‍රී / பெண் / Female</option>
                <option value="Other">වෙනත් / மற்றவை / Other</option>
              </select>
            </F>
            
            <F si="භාෂාව" ta="மொழி" en="Language">
              <select name="language" value={personData.language} onChange={handlePersonChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="සිංහල">සිංහල / சிங்களம் / Sinhala</option>
                <option value="தமிழ்">தமிழ் / தமிழ் / Tamil</option>
                <option value="English">English / ஆங்கிலம் / English</option>
              </select>
            </F>
            <F si="හැඳුනුම්පත් අංකය *" ta="அடையாள அட்டை எண் *" en="ID Number *">
              <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
                <select name="idType" value={personData.idType} onChange={handlePersonChange} style={{...styles.sel,flex:'1',minWidth:'160px'}}>
                  <option value="">-- හැඳුනුම්පත් වර්ගය / அடையාළ வகை / ID Type --</option>
                  <option value="NIC">ජාතික හැඳුනුම්පත / தேசிய அடையாள அட்டை / NIC</option>
                  <option value="Passport">ගමන් බලපත්‍රය / கடவுச்சீட்டு / Passport</option>
                  <option value="Driving License">රියදුරු බලපත්‍රය / ஓட்டுநர் உரிமம் / Driving License</option>
                  <option value="Other">වෙනත් / Other</option>
                </select>
                <input type="text" name="idNo" value={personData.idNo} onChange={handlePersonChange} placeholder="ID Number" style={{...styles.inp,flex:'1',minWidth:'140px'}} maxLength={20} autoComplete="off"/>
              </div>
            </F>
            
            <F si="සුදුසුකම්" ta="கல்வித் தகுதிகள்" en="Qualifications">
              <select name="qualification" value={personData.qualification} onChange={handlePersonChange} style={styles.sel}>
                <option value="">-- තෝරන්න / தேர்வு செய்யவும் / Select --</option>
                <option value="Education">අධ්‍යාපන සුදුසුකම් / கல்வித் தகுதி / Education Level</option>
                <option value="Vocational Training">වෘත්තීය පුහුණු / தொழில்சார் பயிற்சி / Vocational Training</option>
                <option value="No Formal Education">විධිමත් අධ්‍යාපනයක් නැත / முறையான கல்வி இல்லை / No Formal Education</option>
                <option value="Other">වෙනත් / மற்றவை / Other</option>
              </select>
              {personData.qualification && (
                <input type="text" name="qualificationOther" value={personData.qualificationOther} onChange={handlePersonChange}
                  style={styles.inpOther} maxLength={150}
                  placeholder={
                    personData.qualification === 'Education' ? "ඉහලම සුදුසුකම / கல்வித் தகுதி / Highest Qualification..." :
                    personData.qualification === 'Vocational Training' ? "පුහුණු නාමය/ආයතනය / பயிற்சின் பெயர்/நிறுவனம் / Programme name/Institute..." :
                    "වැඩි විස්තර / மேலதிக விவரங்கள் / More details..."
                  }
                  autoComplete="off"/>
              )}
            </F>
            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>🤝 <L si="භාරකරුගේ තොරතුරු" ta="பராமரிப்பாளர் தகவல்கள்" en="Guardian Details" /></p>
            <F si="භාරකරුගේ නම" ta="பராமரிப்பாளர் பெயர்" en="Guardian Name">
              <input type="text" name="caretakerName" value={personData.caretakerName} onChange={handlePersonChange} style={styles.inp} maxLength={100} autoComplete="off"/>
            </F>
            <F si="භාරකරුගේ දුරකථන අංකය" ta="பராமரிப்பாளர் தொலைபேசி எண்" en="Guardian Mobile Number">
              <input type="tel" name="caretakerMobile" value={personData.caretakerMobile} onChange={handlePersonChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
           

            <hr style={styles.divider}/>
            <p style={styles.sectionTitle}>♿ <L si="ආබාධිතභාවය පිළිබඳ තොරතුරු" ta="இயலாமை தகவல்கள்" en="Disability Details" /></p>

            {/* ✅ FIX 3: Multi-checkbox for person */}
            <F si="ආබාධිත වර්ගීකරණය  " ta="இயலாமை வகை" en="Type of Disability">
              <div>
                <button type="button" onClick={() => setShowPersonDisabilities(!showPersonDisabilities)} style={styles.toggleBtn}>
                  <span>📍 ආබාධිතතා වර්ගය තෝරන්න / இயலாமை வகைகளைத் தேர்ந்தெடுக்கவும் / Select Disability Types</span>
                  <span style={{ fontSize: '13px' }}>{showPersonDisabilities ? '▲' : '▼'}</span>
                </button>

                {showPersonDisabilities && (
                  <div style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1.5px solid #e5e7eb',
                    marginBottom: '20px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <p className="hint" style={{ marginBottom: '15px', color: '#1a56db', fontWeight: '700', fontSize: '13px' }}>
                      ☑ එකට වඩා තෝරා ගත හැකිය · ஒன்றுக்கு மேலானவற்றை தேர்வு செய்யலாம் · You may select multiple
                    </p>
                    <DisabilityCheckboxGroup
                      selected={personData.disability || []}
                      onChange={handleDisabilityToggle}
                      options={DISABILITY_OPTIONS}
                    />
                  </div>
                )}

                {(personData.disability || []).includes('Other') && (
                  <input type="text" name="disabilityOther" value={personData.idType==='Other' ? personData.idTypeOther : personData.disabilityOther} onChange={handlePersonChange}
                    style={styles.inpOther} maxLength={100}
                    placeholder="ආබාධතා වර්ගය සඳහන් කරන්න / இயலாமை வகையை குறிப்பிடவும் / Specify disability type..."
                    autoComplete="off"/>
                )}
                {(personData.disability || []).length > 0 && (
                  <p className="hint" style={{ color: '#166534', marginTop: '10px', fontWeight: '700', fontSize: '13px' }}>
                    ✅ තෝරාගත් / தேர்ந்தெடுக்கப்பட்டவை / Selected ({(personData.disability || []).length}): {(personData.disability || []).join(' · ')}
                  </p>
                )}
              </div>
            </F>

            <F si="කැමති ක්ෂේත්‍රය" ta="விரும்பும் பணித் துறை" en="Preferred Field of Work">
              <div>
                <button type="button" onClick={() => setShowPersonFields(!showPersonFields)} style={styles.toggleBtn}>
                  <span>📍 ක්ෂේත්‍ර තෝරන්න / துறைகளைத் தேர்ந்தெடுக்கவும் / Select Fields</span>
                  <span style={{ fontSize: '13px' }}>{showPersonFields ? '▲' : '▼'}</span>
                </button>

                {showPersonFields && (
                  <div style={{
                    background: '#fff',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1.5px solid #e5e7eb',
                    marginBottom: '20px',
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                  }}>
                    <p className="hint" style={{ marginBottom: '15px', color: '#1a56db', fontWeight: '700', fontSize: '13px' }}>
                      ☑ එකට වඩා තෝරා ගත හැකිය · ஒன்றுக்கு மேலானவற்றை தேர்வு செய்யலாம் · You may select multiple
                    </p>
                    <DisabilityCheckboxGroup
                      selected={personData.field || []}
                      onChange={handleFieldToggle}
                      options={FIELD_OPTIONS}
                    />
                  </div>
                )}

                {(personData.field || []).includes('Other') && (
                  <input type="text" name="fieldOther" value={personData.fieldOther} onChange={handlePersonChange}
                    style={styles.inpOther} maxLength={100}
                    placeholder="ක්ෂේත්‍රය සඳහන් කරන්න / துறையைக் குறிப்பிடவும் / Specify field..."
                    autoComplete="off"/>
                )}
                {(personData.field || []).length > 0 && (
                  <p className="hint" style={{ color: '#166534', marginTop: '10px', fontWeight: '700', fontSize: '13px' }}>
                    ✅ තෝරාගත් / தேர்ந்தெடுக்கப்பட்டவை / Selected ({(personData.field || []).length}): {(personData.field || []).join(' · ')}
                  </p>
                )}
              </div>
            </F>

            
          </>)}

          {/* SUBMIT */}
          <div style={styles.submitContainer}>
            <button type="button" onClick={handleSubmit} disabled={uploading||!complete} className="sbtn"
              style={{...styles.submitBtn,...((uploading||!complete)?styles.submitBtnDisabled:{})}}>
              {uploading
                ? <span><L si="ඉදිරිපත් කරමින්..." ta="சமர்ப்பிக்கிறது..." en="Submitting..." color="#fff" /></span>
                : <><Send style={{width:18,height:18}}/><span><L si="ඉදිරිපත් කරන්න" ta="சமர்ப்பிக்கவும்" en="Submit" color="#fff" /></span></>}
            </button>
            {!complete && !uploading && (
              <p style={styles.warningText}>
                කරුණාකර සියලු අවශ්‍ය ක්ෂේත්‍ර (*) පුරවන්න<br/>
                தேவையான அனைத்து புலங்களையும் (*) நிரப்பவும்<br/>
                Please fill all required fields (*)
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}