import { useState, useCallback, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import headerImg from './assests/Gemini_Generated_Image_hd3vqrhd3vqrhd3v.png';
import logoImg from './assests/logo.png';
import img1 from './assests/1.jpg';
import img2 from './assests/2.jpg';
import img3 from './assests/3.jpg';
import img4 from './assests/4.jpg';
import img5 from './assests/5.jpg';
import img6 from './assests/6.jpg';
import img7 from './assests/7.jpg';

const FloatingBackground = () => {
  const images = [img1, img2, img3, img4, img5, img6, img7];
  const positions = [
    { top: '5%', left: '2%', rotate: '-10deg' },
    { top: '15%', right: '4%', rotate: '15deg' },
    { top: '45%', left: '3%', rotate: '10deg' },
    { top: '65%', right: '2%', rotate: '-12deg' },
    { top: '85%', left: '5%', rotate: '8deg' },
    { top: '30%', left: '85%', rotate: '-15deg' },
    { top: '75%', left: '1%', rotate: '5deg' },
  ];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.25 }}>
      {positions.map((pos, i) => (
        <img
          key={i}
          src={images[i % images.length]}
          alt=""
          style={{
            position: 'absolute',
            width: '130px',
            height: 'auto',
            borderRadius: '12px',
            border: '8px solid white',
            outline: '1px solid rgba(124, 0, 0, 0.12)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transition: 'transform 0.5s ease-out',
            ...pos,
            transform: `rotate(${pos.rotate})`
          }}
        />
      ))}
    </div>
  );
};

const Send = ({ style }) => (
  <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

// REPLACE your entire PROVINCE_DATA object with this fixed version.
// The ONLY change is: every divisions{} key now exactly matches its
// corresponding entry in the districts[] array — fixing the 7 broken dropdowns.

const PROVINCE_DATA = {
  'බස්නාහිර පළාත / மேற்கு மாகாணம் / Western Province': {
    districts: [
      'කොළඹ දිස්ත්‍රික්කය / கொழும்பு மாவட்டம் / Colombo District',
      'ගම්පහ දිස්ත්‍රික්කය / கம்பஹா மாவட்டம் / Gampaha District',
      'කළුතර දිස්ත්‍රික්කය / களுத்துறை மாவட்டம் / Kalutara District'
    ],
    divisions: {
      'කොළඹ දිස්ත්‍රික්කය / கொழும்பு மாவட்டம் / Colombo District': ['කොළඹ / கொழும்பு / Colombo','දෙහිවල / தெஹிவளை / Dehiwala','මොරටුව / மொரட்டுவை / Moratuwa','ශ්‍රී ජයවර්ධනපුර කෝට්ටේ / ஸ்ரீ ஜயவர்தனபுர கோட்டை / Sri Jayawardenepura Kotte','මහරගම / மகரகம / Maharagama','කෙසෙල්බාව / கேஸ்பேவ / Kesbewa','හෝමාගම / ஹோமாகம / Homagama','පාදුක්ක / பாதுக்கா / Padukka','කඩුවෙල / கடுவெல / Kaduwela','කොලොන්නාව / கொலொன்னாவ / Kolonnawa','සීතාවක / சீதாவக / Seethawaka'],
      'ගම්පහ දිස්ත්‍රික්කය / கம்பஹா மாவட்டம் / Gampaha District': ['ගම්පහ / கம்பஹா / Gampaha','මීගමුව / நீர்கொழும்பு / Negombo','කටාන / கட்டான / Katana','දිවුලපිටිය / திவுலபிட்டிய / Divulapitiya','මිරිගම / மிரிகம / Mirigama','මිනුවන்ගොඩ / மினுவங்கொட / Minuwangoda','අත්තනගල්ල / அத்தனகல்ல / Attanagalla','ජාඇල / ஜா-எல / Ja-Ela','වත්තල / வத்தளை / Wattala','මහර / மஹார / Mahara','දොම්පෙ / தொம்பே / Dompe','කැලණිය / கெலணியா / Kelaniya','බියගම / பியாகம / Biyagama'],
      'කළුතර දිස්ත්‍රික්කය / களுத்துறை மாவட்டம் / Kalutara District': ['කළුතර / களுத்துறை / Kalutara','පානදුර / பாணந்துறை / Panadura','බණ්ඩාරගම / பண்டாரகம / Bandaragama','හොරණ / ஹொரணை / Horana','බුලත්සිංහල / புலத்சிங்கல / Bulathsinhala','මදුරාවල / மதுராவள / Madurawela','දොඩංගොඩ / தொடங்கொட / Dodangoda','මතුගම / மாதுகம / Mathugama','අගලවත්ත / அகலவத்த / Agalawatta','පාලින්දනුවර / பாலிந்தனுவர / Palindanuwara','වලල්ලාවිට / வலல்லாவிட்ட / Walallawita']
    }
  },
  'මධ්‍යම පළාත / மத்திய மாகாணம் / Central Province': {
    districts: [
      'මහනුවර දිස්ත්‍රික්කය / கண்டி மாவட்டம் / Kandy District',
      'මාතලේ දිස්ත්‍රික්කය / மாத்தளை மாவட்டம் / Matale District',
      'නුවරඑළිය දිස්ත්‍රික්කය / நுவரெலியா மாவட்டம் / Nuwara Eliya District'
    ],
    divisions: {
      'මහනුවර දිස්ත්‍රික්කය / கண்டி மாவட்டம் / Kandy District': ['මහනුවර / கண்டி / Kandy','අකුරණ / அகுரணை / Akurana','පූජාපිටිය / பூஜாபிட்டிய / Pujapitiya','පත්තදුම්බර / பத்ததும்பர / Pathadumbara','හරිස්පත්තුව / ஹரிஸ்பத்துவ / Harispattuwa','යතිනුවර / யதிநுவர / Yatinuwara','ගඟවටකොරළේ / கங்கவடகொரளை / Gangawata Korale','උඩුදුම්බර / உடுதும்பர / Ududumbara','පස්බාගේ කොරළේ / பஸ்பாகே கொரளை / Pasbage Korale','ගඟ ඉහළ කොරළේ / கங்க இஹல கொரளை / Gangaihala Korale','ඩෙල්තොට / டெல்தோட்ட / Deltota','හුන්නස්ගිරිය / ஹுன்னஸ்கிரிய / Hunnasgiriya','තෙල්දෙනිය / தெல்தெனிய / Teldeniya','කුන්දසාලේ / குந்தசாலை / Kundasale','මිනිපේ / மினிப்பே / Minipe','මැදදුම්බර / மெததும்பர / Medadumbara','උඩුනුවර / உடுநுவர / Udunuwara','දොලුව / தொலுவ / Doluwa','ගම්පොළ / கம்பொளை / Gampola','නාවලපිටිය / நாவலபிட்டிய / Nawalapitiya'],
      'මාතලේ දිස්ත්‍රික්කය / மாத்தளை மாவட்டம் / Matale District': ['මාතලේ / மாத்தளை / Matale','දඹුල්ල / தம்புள்ள / Dambulla','ගලේවෙල / கலேவெல / Galewela','රත්තොට / ரத்தோட்ட / Rattota','උකුයෙල / உகுயெல / Ukuwela','නාවුල / நாவுல / Naula','විල්ගමුව / வில்கமுவ / Wilgamuwa','අම්බන්ගඟ කොරළේ / அம்பன்கங்க கொரளை / Ambanganga Korale','ලග්ගල / லக்கல / Laggala-Pallegama'],
      'නුවරඑළිය දිස්ත්‍රික්කය / நுவரெலியா மாவட்டம் / Nuwara Eliya District': ['නුවරඑළිය / நுவரெலியா / Nuwara Eliya','හඟුරන්කෙත / ஹங்குரங்கெத்த / Hanguranketha','කොත්මලේ / கொத்மலை / Kothmale','වල්ලාපනේ / வலப்பனே / Walapane','අඹගමුව / அம்பகமுவ / Ambagamuwa']
    }
  },
  'දකුණු පළාත / தெற்கு மாகாணம் / Southern Province': {
    districts: [
      'ගාල්ල දිස්ත්‍රික්කය / காலி மாவட்டம் / Galle District',
      'මාතර දිස්ත්‍රික්කය / மாத்தறை மாவட்டம் / Matara District',
      'හම්බන්තොට දිස්ත්‍රික්කය / ஹம்பாந்தோட்டை மாவட்டம் / Hambantota District'
    ],
    divisions: {
      'ගාල්ල දිස්ත්‍රික්කය / காலி மாவட்டம் / Galle District': ['ගාල්ල / காலி / Galle','අක්මීමන / அக்மீமன / Akmeemana','බලපිටිය / பலபிட்டிய / Balapitiya','බෙන්තොට / பெந்தோட்ட / Bentota','එල්පිටිය / எல்பிட்டிய / Elpitiya','ගෝනපිනුවල / கோனபினுவல / Gonapinuwala','හබරාදුව / ஹபராதுவ / Habaraduwa','හික්කඩුව / ஹிக்கடுவ / Hikkaduwa','ඉමදුව / இமதுவ / Imaduwa','කරාපිටිය / கராப்பிட்டிய / Karapitiya','නෙළුව / நெழுவ / Neluwa','තිහගොඩ / திஹகொட / Thihagoda','වැලිවිට / வெலிவிட்ட / Welivitiya-Divithura','යාක්කලමුල්ල / யக்கலமுல்ல / Yakkalamulla'],
      'මාතර දිස්ත්‍රික්කය / மாத்தறை மாவட்டம் / Matara District': ['මාතර / மாத்தறை / Matara','අකුරැස්ස / அக்குரெஸ்ஸ / Akuressa','අතුරලිය / அத்துரலிய / Athuraliya','දෙවිනුවර / தேவிநுவர / Devinuwara','දික්වැල්ල / திக்குவல்ல / Dickwella','හකමන / ஹக்மண / Hakmana','කඹුරුපිටිය / கம்புறுப்பிட்டிய / Kamburupitiya','කිරින්ද පුහුල්වැල්ල / கிரிந்த புஹுல்வெல்ல / Kirinda Puhulwella','කොටපොල / கொட்டப்பொல / Kotapola','මලිම්බඩ / மலிம்பட / Malimbada','මොරවක / மொரவக / Morawaka','පස්ගොඩ / பஸ்கொட / Pasgoda','පිටබැද්දර / பிடபட்டர / Pitabeddara','වැලිගම / வெலிகம / Weligama'],
      'හම්බන්තොට දිස්ත්‍රික්කය / ஹம்பாந்தோட்டை மாவட்டம் / Hambantota District': ['හම්බන්තොට / ஹம்பாந்தோட்டை / Hambantota','අම්බලන්තොට / அம்பலாந்தோட்டை / Ambalantota','අඟුණුකොළපැලැස්ස / அங்குனுகொலபெலஸ்ஸ / Angunakolapelessa','බෙලිඅත්ත / பெலியட்ட / Beliatta','ලුණුගම්වෙහෙර / லுணுகம்வெஹெர / Lunugamvehera','ඔකෙවෙල / ஒகெவெல / Okewela','සූරියවැව / சூரியவெவ / Sooriyawewa','තංගල්ල / தங்கல்ல / Tangalle','තිස්සමහාරාම / திஸ்ஸமஹாராம / Tissamaharama','වීරකැටිය / வீரகெட்டிய / Weeraketiya']
    }
  },
  'උතුරු පළාත / வடக்கு மாகாணம் / Northern Province': {
    districts: [
      'යාපනය දිස්ත්‍රික්කය / யாழ்ப்பாணம் மாவட்டம் / Jaffna District',
      'කිලිනොච්චි දිස්ත්‍රික්කය / கிளிநொச்சி மாவட்டம் / Kilinochchi District',
      'මන්නාරම දිස්ත්‍රික්කය / மன்னார் மாவட்டம் / Mannar District',
      'වවුනියාව දිස්ත්‍රික්කය / வவுனியா மாவட்டம் / Vavuniya District',
      'මුලතිව් දිස්ත්‍රික්කය / முல்லைத்தீவு மாவட்டம் / Mullaitivu District'
    ],
    divisions: {
      'යාපනය දිස්ත්‍රික්කය / யாழ்ப்பாணம் மாவட்டம் / Jaffna District': ['යාපනය / யாழ்ப்பாணம் / Jaffna','ඩෙල්ෆ්ට් / டெல்ஃப்ட் / Delft','කයිට්ස් / கைட்ஸ் / Kayts','කන්කසන්තුරේ / காங்கேசன்துறை / Kankesanthurai','නල්ලූර් / நல்லூர் / Nallur','සන්දිලිප්පයි / சந்திலிப்பாய் / Sandilipay','චාවකච්චේරි / சாவகச்சேரி / Chavakachcheri','උඩුවිල් / உடுவில் / Uduvil','වල්වෙටිතුරේ / வல்வெட்டித்துறை / Valvettithurai','පොයින්ට් පේඩ්රෝ / பொயிண்ட் பேட்ரோ / Point Pedro','කොපයි / கோப்பாய் / Kopay','කරයිනගර් / கரைநகர் / Karainagar','චුන්නාගම් / சுன்னாகம் / Chunnakam','මරුදනාර්මඩම් / மருதனார்மடம் / Maruthanamadam','තෙලිප්පලෙයි / தெல்லிப்பழை / Tellippalai'],
      'කිලිනොච්චි දිස්ත්‍රික්කය / கிளிநொச்சி மாவட்டம் / Kilinochchi District': ['කිලිනොච්චි / கிளிநொச்சி / Kilinochchi','කන්ඩවල් / கண்டவல் / Kandavalai','කරච්චි / கரச்சி / Karachchi','පච්චිලාපල්ලී / பச்சிலைப்பள்ளி / Pachchilaipalli'],
      'මන්නාරම දිස්ත්‍රික්කය / மன்னார் மாவட்டம் / Mannar District': ['මන්නාරම / மன்னார் / Mannar','මඩු / மடு / Madhu','මන්තයි බටහිර / மாந்தை மேற்கு / Manthai West','මුසලි / முசலி / Musali','නනට්ටන් / நானாட்டான் / Nanattan'],
      'වවුනියාව දිස්ත්‍රික්කය / வவுனியா மாவட்டம் / Vavuniya District': ['වවුනියාව / வவுனியா / Vavuniya','වවුනියාව උතුර / வவுனியா வடக்கு / Vavuniya North','වවුනියාව දකුණ / வவுனியா தெற்கு / Vavuniya South','වවුනියාව දකුණු බටහිර / வவுனியா தென்மேற்கு / Vavuniya South West'],
      'මුලතිව් දිස්ත්‍රික්කය / முல்லைத்தீவு மாவட்டம் / Mullaitivu District': ['මුලතිව් / முல்லைத்தீவு / Mullaitivu','මරිටයිම්පට්ටු / மரிடைம்பட்டு / Maritimepattu','ඔඩ්ඩුසුඩ්ඩාන් / ஒட்டுசுட்டான் / Oddusuddan','පුදුකුඩියිරිප්පු / புதுக்குடியிருப்பு / Puthukudiyiruppu','තුනක්කයි / துணுக்காய் / Thunukkai','වෙලිකන්ඩල් / வெலிகண்டல் / Welikandal']
    }
  },
  'නැගෙනහිර පළාත / கிழக்கு மாகாணம் / Eastern Province': {
    districts: [
      'ත්‍රිකුණාමලය දිස්ත්‍රික්කය / திருகோணமலை மாவட்டம் / Trincomalee District',
      'මඩකලපුව දිස්ත්‍රික්කය / மட்டக்களப்பு மாவட்டம் / Batticaloa District',
      'අම්පාර දිස්ත්‍රික්කය / அம்பாறை மாவட்டம் / Ampara District'
    ],
    divisions: {
      'ත්‍රිකුණාමලය දිස්ත්‍රික්කය / திருகோணமலை மாவட்டம் / Trincomalee District': ['ත්‍රිකුණාමලය / திருகோணமலை / Trincomalee','කන්තලේ / கந்தளாய் / Kantale','කින්නියා / கிண்ணியா / Kinniya','කුච්චවේලි / குச்சவெளி / Kuchchaveli','මුතූර් / மூதூர் / Muttur','පදවිය / பதவியா / Padaviya','සෙරුවිල / செருவில / Seruvila','වෙරුගල් / வெருகல் / Verugal','තම්පලගමුව / தம்பலகாமம் / Thambalagamuwa','ගෝමරන්කඩවල / கோமரங்கடவல / Gomarankadawala','ලංකාපුර / லங்காபுர / Lankaapura'],
      'මඩකලපුව දිස්ත්‍රික්කය / மட்டக்களப்பு மாவட்டம் / Batticaloa District': ['මඩකලපුව / மட்டக்களப்பு / Batticaloa','ආරයම්පති / ஆரயம்பதி / Aarayampathy','කල්කුඩි / கற்குடி / Kalkudah','කට්ටන්කුඩි / கட்டான்குடி / Kattankudy','කොරළයිපත්තු / கோறளைப்பற்று / Koralaipattu','කොරළයිපත්තු උතුර / கோறளைப்பற்று வடக்கு / Koralaipattu North','කොරළයිපත්තු දකුණ / கோறளைப்பற்று தெற்கு / Koralaipattu South','මන්මුනායි උතුර / மண்முனை வடக்கு / Manmunai North','මන්මුනායි බටහිර / மண்முனை மேற்கு / Manmunai West','මන්මුනායි දකුණ / மண்முனை தெற்கு / Manmunai South','මන්මුනායි දකුණු බටහිර / மண்முனை தென்மேற்கு / Manmunai South West','මන්මුනායි උතුරු බටහිර / மண்முனை வடமேற்கு / Manmunai North West','පොරතීව්පත්තු / பொரதீவுப்பற்று / Poratheevupattu'],
      'අම්පාර දිස්ත්‍රික්කය / அம்பாறை மாவட்டம் / Ampara District': ['අම්පාර / அம்பாறை / Ampara','අක්කරයිපත්තුව / அக்கரைப்பற்று / Akkaraipattu','අලයඩිවෙම්බු / ஆலையடிவேம்பு / Alayadiwembu','දමන / தமன / Damana','දේහිඅත්තකණ්ඩිය / தெய்வத்தகண்டிய / Dehiattakandiya','ඉරක්කාමම් / இறக்காமம் / Irakkamam','කල්මුණේ / கல்முனை / Kalmunai','කරයිතිව් / கரைத்தீவு / Karaitivu','ලහුගල / லஹுகல / Lahugala','මහඔය / மகோயா / Mahaoya','නාමල්ඔය / நாமல்ஓயா / Namaloya','නාවිතන්වැලි / நாவிதன்வெளி / Navithanveli','නින්දවූර් / நிந்தவூர் / Nintavur','පොතුවිල් / பொத்துவில் / Pottuvil','සයින්දමරුදු / சாய்ந்தமருது / Sainthamaruthu','සමන්තුරෙයි / சம்மாந்துறை / Sammanthurai','තිරුක්කෝවිල් / திருக்கோவில் / Thirukkovil','උහන / உஹன / Uhana']
    }
  },
  'වයඹ පළාත / வடமேற்கு மாகாணம் / North Western Province': {
    districts: [
      'කුරුණෑගල දිස්ත්‍රික්කය / குருநாகல் மாவட்டம் / Kurunegala District',
      'පුත්තලම දිස්ත්‍රික්කය / புத்தளம் மாவட்டம் / Puttalam District'
    ],
    divisions: {
      'කුරුණෑගල දිස්ත්‍රික්කය / குருநாகல் மாவட்டம் / Kurunegala District': ['කුරුණෑගල / குருநாகல் / Kurunegala','අලව්ව / அலவ்வ / Alawwa','අඹන්පොල / அம்பன்பொல / Ambanpola','බිංගිරිය / பிங்கிரிய / Bingiriya','උඩුබද්දාව / உடுபத்தாவ / Udubaddawa','ගල්ගමුව / கல்கமுவ / Galgamuwa','ගිරිබාව / கிரிபாவ / Giribawa','ඉබ්බාගමුව / இப்பாகமுவ / Ibbagamuwa','කටුපොත / கட்டுபொத்த / Katupotha','කොබෙයිගනේ / கொப்பெய்கனே / Kobeigane','කොටවෙහෙර / கொட்டவெஹெர / Kotavehera','කුලියාපිටිය / குலியாப்பிட்டிய / Kuliyapitiya','කුලියාපිටිය නැගෙනහිර / குலியாப்பிட்டிய கிழக்கு / Kuliyapitiya East','කුලියාපිටිය බටහිර / குலியாப்பிட்டிய மேற்கு / Kuliyapitiya West','මහව / மஹவ / Mahawa','මල්ලවපිටිය / மல்லவப்பிட்டிய / Mallawapitiya','මාවතගම / மாவத்தகம / Mawathagama','මීගලෑව / மீகலேவ / Meegalewa','මොරගොල්ලගම / மொரகொல்லகம / Moragollagama','නාරම්මල / நாரம்மல / Narammala','නිකවැරටිය / நிகவரட்டிய / Nikaweratiya','පන්නල / பன்னல / Pannala','පොල්ගහවෙල / பொல்கஹவெல / Polgahawela','පොල්පිතිගම / பொல்பித்திகம / Polpithigama','රස්නායකපුර / ரஸ்நாயகபுர / Rasnayakaapura','රිදීගම / ரிதிகம / Rideegama','වරිපොල / வரியப்பொல / Wariyapola','වීරඹුගෙදර / வீரம்புகெதர / Weerambugedara'],
      'පුත්තලම දිස්ත්‍රික්කය / புத்தளம் மாவட்டம் / Puttalam District': ['පුත්තලම / புத்தளம் / Puttalam','අනම්මඩුව / அனம்மடுவ / Anamaduwa','ආරච්චිකට්ටුව / ஆரச்சிக்கட்டுவ / Arachchikattuwa','කල්පිටිය / கல்பிட்டிய / Kalpitiya','කරුවලගස්වැව / கருவலகஸ்வேவ / Karuwalagaswewa','මහකුඹුක්කඩවල / மககும்புக்கடவல / Mahakumbukkadawala','මහවැව / மஹவெவ / Mahawa','මාරවිල / மாரவில / Marawila','මුන්දලම / முண்டலம / Mundalama','නත්තන්ඩිය / நத்தாண்டிய / Nattandiya','නවගත්තේගම / நவகத்தேகம / Nawagattegama','පල්ලම / பல்லம / Pallama','වෙන්නප්පුව / வெண்ணப்புவ / Wennappuwa']
    }
  },
  'උතුරු මැද පළාත / வட மத்திய மாகாணம் / North Central Province': {
    districts: [
      'අනුරාධපුර දිස්ත්‍රික්කය / அனுராதபுரம் மாவட்டம் / Anuradhapura District',
      'පොළොන්නරුව දිස්ත්‍රික්කය / பொலன்னறுவை மாவட்டம் / Polonnaruwa District'
    ],
    divisions: {
      'අනුරාධපුර දිස්ත්‍රික්කය / அனுராதபுரம் மாவட்டம் / Anuradhapura District': ['අනුරාධපුර / அனுராதபுரம் / Anuradhapura','ගල්නෑව / கல்நேவ / Galnewa','ගලෙන්බිඳුණුවැව / கலெண்பிந்துணுவெவ / Galenbindunuwewa','හොරොව්පතාන / ஹொரோவ்பத்தான / Horowpothana','ඉපලෝගම / இபலோகம / Ipalogama','කහටගස්දිගිලිය / கஹடகஸ்திகிலிய / Kahatagasdigiliya','කැබිතිගොල්ලෑව / கெபிதிகொல்லாவ / Kebithigollewa','කිරාන්ඩියාව / கிராண்டியாவ / Kirindiyawa','මැදවච්චිය / மெதவச்சிய / Medawachchiya','මිහින්තලේ / மிஹிந்தலை / Mihintale','නච්චදූව / நச்சதுவ / Nachchaduwa','නොච්චියාගම / நொச்சியாகம / Nochchiyagama','නුගලවෙව / நுவரகம்பலத்த கிழக்கு / Nuwaragam Palatha East','නුගලවෙව බටහිර / நுவரகம்பலத்த மேற்கு / Nuwaragam Palatha West','පදවිය / பதவியா / Padaviya','පලගල / பலகல / Palagala','රාජාංගනය / ராஜாங்கனய / Rajanganaya','තඹුත්තේගම / தம்புத்தேகம / Thambuttegama','තිරප්පනේ / திரப்பனே / Thirappane'],
      'පොළොන්නරුව දිස්ත්‍රික්කය / பொலன்னறுவை மாவட்டம் / Polonnaruwa District': ['පොළොන්නරුව / பொலன்னறுவை / Polonnaruwa','දඹලගස්වැව / தம்பலகஸ்வேவ / Dimbulagala','හිඟුරක්ගොඩ / ஹிங்குரக்கொட / Hingurakgoda','ලංකාපුර / லங்காபுர / Lankaapura','මැදිරිගිරිය / மெதிரிகிரிய / Medirigiriya','තමන්කඩුව / தமன்கடுவ / Thamankaduwa']
    }
  },
  'ඌව පළාත / ஊவா மாகாணம் / Uva Province': {
    districts: [
      'බදුල්ල දිස්ත්‍රික්කය / பதுளை மாவட்டம் / Badulla District',
      'මොණරාගල දිස්ත්‍රික්කය / மொணராகலை மாவட்டம் / Monaragala District'
    ],
    divisions: {
      'බදුල්ල දිස්ත්‍රික්කය / பதுளை மாவட்டம் / Badulla District': ['බදුල්ල / பதுளை / Badulla','බණ්ඩාරවෙල / பண்டாரவெல / Bandarawela','හල්දුම්මුල්ල / ஹல்தும்முல்ல / Haldummulla','හාලිඇල / ஹாலிஎல / Hali-Ela','කන්දකැටිය / கண்டகெட்டிய / Kandaketiya','මහියංගනය / மஹியங்கண / Mahiyanganaya','මීගහකියුල / மீகஹகிவுல / Meegahakivula','පස්සර / பஸ்ஸர / Passara','රිදීමාලියද්ද / ரிதிமாலியத்த / Rideemaliyadda','සොරනතොට / சோரணத்தொட்ட / Soranathota','උවපරණගම / உவபரணகம / Uva Paranagama','වෙල්ලවය / வெல்லவய / Wellawaya'],
      'මොණරාගල දිස්ත්‍රික්කය / மொணராகலை மாவட்டம் / Monaragala District': ['මොණරාගල / மொணராகலை / Monaragala','බිබිල / பிபில / Bibile','බුත්තල / புத்தல / Buttala','කතරගම / கதிர்காமம் / Kataragama','මඩුල්ල / மதுல்ல / Madulla','මෙදගම / மெதகம / Medagama','සියඹලාණ්ඩුව / சியம்பலாண்டுவ / Siyambalanduwa','තනමල්විල / தனமல்வில / Thanamalvila','වෙල්ලවය / வெல்லவய / Wellawaya']
    }
  },
  'සබරගමුව පළාත / சபரகமுவ மாகாணம் / Sabaragamuwa Province': {
    districts: [
      'රත්නපුර දිස්ත්‍රික්කය / இரத்தினபுரி மாவட்டம் / Ratnapura District',
      'කෑගල්ල දිස්ත්‍රික්කය / கேகாலை மாவட்டம் / Kegalle District'
    ],
    divisions: {
      'රත්නපුර දිස්ත්‍රික්කය / இரத்தினபுரி மாவட்டம் / Ratnapura District': ['රත්නපුර / இரத்தினபுரி / Ratnapura','අයගම / அயகம / Ayagama','බලංගොඩ / பலங்கொட / Balangoda','ඇහැලියගොඩ / எஹலியகொட / Eheliyagoda','ඇලපත / எலபத / Elapatha','කලවාන / கலவான / Kalawana','කිරිඇල්ල / கிரியெல்ல / Kiriella','කුරුවිට / குருவிட்ட / Kuruwita','නිවිතිගල / நிவித்திகல / Nivithigala','ඔපනායක / ஒப்பநாயக்க / Opanayaka','පැල්මඩුල්ල / பெல்மடுல / Pelmadulla'],
      'කෑගල්ල දිස්ත්‍රික්කය / கேகாலை மாவட்டம் / Kegalle District': ['කෑගල්ල / கேகாலை / Kegalle','අරනායක / அரநாயக்க / Aranayaka','බුලත්කොහුපිටිය / புலத்கொஹுபிட்டிய / Bulathkohupitiya','දෙහිඕවිට / தெஹியோவிட்ட / Dehiovita','දෙරණියගල / தெரணியகல / Deraniyagala','ගලිගමුව / கலிகமுவ / Galigamuwa','මාවනැල්ල / மாவனல்ல / Mawanella','රඹුක්කන / ரம்புக்கன / Rambukkana','වරිපොල / வரியப்பொல / Warakapola','යට්ටියන්තොට / யட்டியந்தோட்ட / Yatiyantota']
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
    background: 'radial-gradient(circle at top left, #f8fafc 0%, #e2e8f0 100%)', 
    padding: 'clamp(10px, 4vw, 40px) clamp(8px, 2vw, 16px)', 
    fontFamily: '"Outfit", "Noto Sans Sinhala", "Noto Sans Tamil", -apple-system, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: { 
    maxWidth: '1200px', 
    width: '100%',
    margin: '0 auto', 
    background: 'rgba(255, 255, 255, 0.98)', 
    borderRadius: '32px', 
    boxShadow: '0 40px 100px -20px rgba(10, 25, 47, 0.15), 0 0 40px rgba(0, 0, 0, 0.02)', 
    overflow: 'hidden',
    border: '1.5px solid rgba(10, 25, 47, 0.15)',
    backdropFilter: 'blur(20px)'
  },
  header: { 
    position: 'relative',
    background: '#0a192f', 
    padding: 'clamp(100px, 15vw, 160px) clamp(16px, 5vw, 48px) clamp(40px, 10vw, 80px)', 
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
    height: '160px',
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
    marginTop: '20px', 
    marginBottom: '32px',
    gap: '8px',
    maxWidth: '800px',
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid rgba(10, 25, 47, 0.1)',
    boxShadow: '0 20px 40px rgba(10, 25, 47, 0.12)',
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
    background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)', 
    color: '#fff', 
    boxShadow: '0 8px 25px rgba(10, 25, 47, 0.3)',
    transform: 'translateY(-2px)',
  },
  tabInactive: { 
    background: 'transparent', 
    color: '#6B7280',
    border: '1px solid transparent',
    '&:hover': {
      background: 'rgba(10, 25, 47, 0.05)',
      color: '#0a192f'
    }
  },
  form: { padding: 'clamp(24px, 5vw, 48px) clamp(16px, 6vw, 64px)' },
  fieldRow: { display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' },
  label: { width: '320px', minWidth: '280px', paddingTop: '12px', fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: 1.5, flexShrink: 0 },
  inputWrap: { flex: 1, minWidth: '300px' },
  sel: { ...base, WebkitAppearance: 'none', appearance: 'none', cursor: 'pointer', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center', paddingRight: '40px', border: '2.5px solid #F3F4F6', '&:focus': { borderColor: '#0a192f', boxShadow: '0 0 0 5px rgba(10, 25, 47, 0.1)' } },
  inp: { ...base, userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#0a192f', border: '2px solid #F3F4F6' },
  inpOther: { ...base, marginTop: '12px', borderColor: '#3b82f6', background: '#f8fafc', userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#0a192f', borderRadius: '14px' },
  ta:  { ...base, minHeight: '120px', resize: 'vertical', lineHeight: '1.7', userSelect: 'text', WebkitUserSelect: 'text', caretColor: '#0a192f', border: '2px solid #F3F4F6', borderRadius: '16px' },
  radioGroup: { display: 'flex', gap: '20px', paddingTop: '10px', flexWrap: 'wrap' },
  radioLabel: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '12px 20px', borderRadius: '16px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', border: '2px solid #F3F4F6', background: '#fff' },
  radioInput: { width: '22px', height: '22px', accentColor: '#0a192f', cursor: 'pointer', marginTop: '1px', flexShrink: 0 },
  submitContainer: { marginTop: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '20px 64px', background: 'linear-gradient(135deg, #0a192f 0%, #112240 100%)', color: '#fff', border: 'none', borderRadius: '18px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', width: '100%', maxWidth: '600px', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', fontFamily: 'inherit', boxShadow: '0 15px 30px rgba(10, 25, 47, 0.3)', letterSpacing: '0.5px' },
  submitBtnDisabled: { background: '#E5E7EB', cursor: 'not-allowed', boxShadow: 'none', color: '#9CA3AF' },
  warningText: { fontSize: '13px', color: '#0a192f', textAlign: 'center', margin: 0, lineHeight: 1.8, fontWeight: '500' },
  message: { padding: '20px 24px', borderRadius: '14px', textAlign: 'center', marginTop: '24px', fontSize: '15px', lineHeight: 1.7, fontWeight: '600' },
  msgSuccess: { background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  msgError:   { background: '#fef2f2', border: '1.5px solid #fecaca', color: '#0a192f', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' },
  divider: { border: 'none', borderTop: '2px solid #F3F4F6', margin: '48px 0' },
  sectionTitle: { fontSize: '18px', fontWeight: '900', color: '#0a192f', marginBottom: '24px', marginTop: '12px', lineHeight: 1.4, display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '0.2px' },
  checkboxGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', paddingTop: '12px' },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', border: '2px solid #F3F4F6', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: '#fff' },
  checkboxLabelChecked: { border: '2px solid #0a192f', background: '#f0f9ff', boxShadow: '0 10px 20px rgba(10, 25, 47, 0.08)', transform: 'translateY(-1px)' },
  checkboxInput: { width: '20px', height: '20px', accentColor: '#0a192f', cursor: 'pointer', marginTop: '4px', flexShrink: 0 },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '16px 24px',
    background: '#fff',
    border: '2.5px solid #0a192f',
    borderRadius: '16px',
    color: '#0a192f',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    marginBottom: '20px',
    boxShadow: '0 8px 20px rgba(10, 25, 47, 0.08)'
  },
};

const L = ({ si, ta, en, color }) => (
  <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
    <span style={{ display: 'block', color: color || '#0a192f', fontSize: '14px', fontWeight: '800', letterSpacing: '0.2px' }}>{si}</span>
    <span style={{ display: 'block', color: color || '#112240', fontSize: '13px', fontWeight: '500', opacity: color ? 1 : 0.9 }}>{ta}</span>
    <span style={{ display: 'block', color: color || '#6B7280', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '1px' }}>{en}</span>
  </span>
);

const F = ({ si, ta, en, children }) => (
  <div style={styles.fieldRow} className="field-row">
    <label style={styles.label} className="label-col"><L si={si} ta={ta} en={en} /></label>
    <div style={styles.inputWrap} className="input-wrap">{children}</div>
  </div>
);

const RadioGroup = ({ name, value, onChange, options }) => (
  <div style={styles.radioGroup}>
    {options.map(opt => (
      <label key={opt.value} style={styles.radioLabel} className="radio-label">
        <input type="radio" name={name} value={opt.value} checked={value === opt.value} onChange={onChange} style={styles.radioInput} />
        <span>
          <span style={{ display: 'block', color: '#0a192f', fontSize: '13px', fontWeight: '600' }}>{opt.si}</span>
          <span style={{ display: 'block', color: '#112240', fontSize: '11px' }}>{opt.ta}</span>
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
            <span style={{ display: 'block', color: '#0a192f', fontSize: '12px', fontWeight: '600' }}>{opt.si}</span>
            <span style={{ display: 'block', color: '#112240', fontSize: '11px' }}>{opt.ta}</span>
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
  const [dobParts,               setDobParts]               = useState({ day: '', month: '', year: '' });

  useEffect(() => {
    const s = document.createElement('script');
    s.src = 'https://cdn.userway.org/widget.js';
    s.setAttribute('data-account','XfZSO2MTQw');
    s.setAttribute('data-size','large');
    s.setAttribute('data-button_size', 'large');
    s.async = true;
    document.body.appendChild(s);
    return () => { if (document.body.contains(s)) document.body.removeChild(s); };
  }, []);

  // Sync dobParts to personData.dob (YYYY-MM-DD)
  useEffect(() => {
    const { day, month, year } = dobParts;
    if (day && month && year) {
      const formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      if (personData.dob !== formattedDob) {
        setPersonData(prev => ({ ...prev, dob: formattedDob }));
      }
    } else if (!day && !month && !year) {
      if (personData.dob !== '') {
        setPersonData(prev => ({ ...prev, dob: '' }));
      }
    }
  }, [dobParts, personData.dob]);

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

  const handleDobPartChange = (e) => {
    const { name, value } = e.target;
    if (value !== '' && !/^\d+$/.test(value)) return;
    if (name === 'day' && value.length > 2) return;
    if (name === 'month' && value.length > 2) return;
    if (name === 'year' && value.length > 4) return;
    setDobParts(prev => ({ ...prev, [name]: value }));
  };

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
      <FloatingBackground />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;500;600;700;800&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;}
        button,select,input,textarea{font-family:'Noto Sans Sinhala','Noto Sans Tamil',sans-serif!important;}
        button:focus,select:focus,input:focus,textarea:focus{border-color:#0a192f!important;outline:none!important;box-shadow:0 0 0 4px rgba(10, 25, 47, 0.15)!important;}
        .sbtn:hover:not(:disabled){background:linear-gradient(135deg, #0a192f 0%, #112240 100%)!important; transform: translateY(-2px); box-shadow: 0 12px 20px -3px rgba(10, 25, 47, 0.4)!important;}
        .sbtn:active:not(:disabled){transform: translateY(0);}
        .hint{font-size:12px;color:#6B7280;margin:6px 0 0;line-height:1.5;}
        .cb-label:hover{border-color:#0a192f!important;background:#f0f9ff!important;transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.05);}
        .radio-label:hover{background:#f0f9ff!important;}
        html{scroll-behavior:auto!important;}
        ::selection { background: #0a192f; color: white; }
        .float-anim {
          animation: floating 8s ease-in-out infinite;
        }
        @keyframes floating {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }

        /* Responsive Media Queries */
        @media (max-width: 1024px) {
          .field-row { gap: 16px !important; margin-bottom: 20px !important; }
          .label-col { width: 260px !important; min-width: 200px !important; }
        }

        @media (max-width: 768px) {
          .field-row { flex-direction: column !important; align-items: stretch !important; gap: 8px !important; margin-bottom: 24px !important; }
          .label-col { width: 100% !important; min-width: auto !important; padding-top: 0 !important; margin-bottom: 4px !important; }
          .input-wrap { min-width: auto !important; width: 100% !important; }
          .tab-container { width: 95% !important; gap: 4px !important; padding: 4px !important; }
          .tab-btn { padding: 10px 8px !important; font-size: 13px !important; }
          .form-card { border-radius: 20px !important; }
          .submit-btn { padding: 16px 32px !important; font-size: 16px !important; }
          .logo-img { height: 100px !important; top: 15px !important; }
          .section-title { font-size: 16px !important; }
          .header-box { min-height: 260px !important; }
        }

        @media (max-width: 480px) {
          .tab-btn span { font-size: 11px !important; }
          .tab-btn strong { font-size: 12px !important; }
          .logo-img { height: 80px !important; }
        }
      `}</style>

      <div style={styles.card} className="form-card">
        {/* HEADER */}
        <div style={styles.header} className="header-box">
          <img src={headerImg} alt="Header Background" style={styles.headerImg} />
          <img src={logoImg} alt="Logo" className="logo-img" style={{ 
            position: 'absolute', 
            top: '10px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            height: '140px', 
            zIndex: 10, 
            filter: 'drop-shadow(0 4px 12px rgba(159, 132, 132, 0.6))' 
          }} />
          <div style={styles.headerOverlay} />
          <div style={styles.headerContent}></div>
        </div>
        <div style={styles.tabContainer} className="tab-container">
          <button style={{...styles.tab,...(!isCompany?styles.tabActive:styles.tabInactive)}} onClick={()=>switchTab('person')} className="tab-btn">
            <div><L si="♿ රැකියා අපේක්ෂිත ආබාධ සහිත තැනැත්තන් ලියාපදිංචි කිරීමේ පෝරමය" ta="அங்கவீனமுற்ற நபர்களின் குடிமக்கள் பதிவுப் படிவம்  " en="Persons with Disabilities Registration Form" color={!isCompany ? '#fff' : undefined} /></div>
          </button>
          <button style={{...styles.tab,...(isCompany?styles.tabActive:styles.tabInactive)}} onClick={()=>switchTab('company')} className="tab-btn">
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
            <div style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',border:'2px solid #3b82f6',borderRadius:'12px',padding:'22px 20px',marginBottom:'24px',display:'flex',flexDirection:'column',gap:'12px',alignItems:'center',textAlign:'center'}}>
              <div>
                <p style={{ margin:'0 0 8px', color:'#0a192f', fontSize:'14px', fontWeight:'700', lineHeight:1.8 }}>
                  ආබාධ සහිත තැනැත්තන් රැකියා ගත කරන ආයතන සඳහා රජය මගින් සේවකයන්ගේ වැටුපෙන් 50% ක වැටුප් සහනාධාරයක් (රු. 15,000 ක උපරිමයකට යටත්ව)  <span style={{color:'#2563eb',fontWeight:'700'}}>මාස 24ක්</span> දක්වා ගෙවීම් සිදු කරනු ලැබේ.
                </p>
                <p style={{ margin:'0 0 6px', color:'#112240', fontSize:'12px', lineHeight:1.8 }}>
                அங்கவீனமுற்ற நபர்களைப் பணிக்கமர்த்தும் நிறுவனங்களுக்கு, ஊழியர்களின் சம்பளத்தில் 50 சதவீதம் (அதிகபட்சமாக ரூ. 15,000 வரை) ஊதிய மானியமாக 24 மாதங்கள் வரை அரசினால் வழங்கப்படும். 
                </p>
                <p style={{ margin:0, color:'#112240', fontSize:'12px', lineHeight:1.8 }}>
                For institutions employing persons with disabilities, the government will provide a wage subsidy of 50% of the employees' salaries (subject to a maximum of Rs. 15,000) for up to 24 months. 
                </p>
              </div>
            </div>

            <p style={styles.sectionTitle}>📍 ස්ථානීය  තොරතුරු · வசிப்பிட விபரங்கள்  · Location Details</p>
            <F si="පළාත *" ta="மாகாணம் *" en="Province *">
              <select name="province" value={companyData.province} onChange={handleCompanyChange} style={styles.sel}>
                <option value="">-- පළාත / மாகாணம் / Province --</option>
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
            <p style={styles.sectionTitle}>🏢 ආයතනය පිලිබඳ තොරතුරු · நிறுவன தகவல்கள் · Office Information</p>
            <F si="ආයතනයේ නම *" ta="நிறுவனத்தின் பெயர் *" en="Office / Company Name *">
              <input type="text" name="officeName" value={companyData.officeName} onChange={handleCompanyChange} style={styles.inp} maxLength={100} autoComplete="off"/>
              <p className="hint">{companyData.officeName.length}/100</p>
            </F>
            <F si="ලිපිනය" ta="முழு முகவரி" en="Address">
              <textarea name="address" value={personData.address} onChange={handlePersonChange} style={styles.ta} rows={3} maxLength={250} autoComplete="off"/>
              <p className="hint">{personData.address.length}/250</p>
            </F>
            <F si="ආයතනයේ  දුරකථනය අංකය *" ta="தொலைபேசி *" en="Official Contact Number *">
              <input type="tel" name="contact" value={companyData.contact} onChange={handleCompanyChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
            <F si="සම්බන්ධ කළ හැකි නිලධාරියාගේ නම" ta="தொடர்புகொள்ள வேண்டிய உத்தியோகத்தரின் பெயர்" en="Contact Officer Name">
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
            <F si="පිළිගත හැකි ආබාධිතතා වර්ග" ta="ஏற்ககூடிய அங்கவீனத்தின் தன்மைகள்" en="Types of Disability Accepted">
              <div>
                <button type="button" onClick={() => setShowCompanyDisabilities(!showCompanyDisabilities)} style={styles.toggleBtn}>
                  <span>📍 ආබාධිතතා වර්ග තෝරන්න / அங்கவீனத்தின் வகைகளைத் தேர்ந்தெடுக்கவும் / Select Disability Types</span>
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
                        <span style={{ display: 'block', color: '#0a192f', fontSize: '13px', fontWeight: '700' }}>ඕනෑම ආබාධයක්</span>
                        <span style={{ display: 'block', color: '#112240', fontSize: '12px' }}>எந்த குறைபாடும்</span>
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
            <F si="ගෙවිය හැකි අවම වැටුප" ta="சம்பளம்" en="Minimum Salary">
              <input type="text" name="pay" value={companyData.pay} onChange={handleCompanyChange} style={styles.inp} maxLength={50} placeholder="Rs. XXXXX" autoComplete="off"/>
            </F>
            <F si="EPF / ETF  *" ta="ஈபிஎஃப் / ஈடிஎஃப் *" en="EPF / ETF *">
              <RadioGroup name="epfEtf" value={companyData.epfEtf} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'ගෙවනු ලැබේ ',ta:'ஆம்',en:'Yes'},
                {value:'No', si:'ගෙවනු නොලැබේ ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
            <F si="පෙර පුහුණු වැඩසටහනක්  *" ta="பயிற்சி திட்டம் *" en="Training Programme *">
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
            <F si="නිල ඇඳුම්" ta="சீருடைகள்" en="Uniforms">
              <RadioGroup name="supplyClothes" value={companyData.supplyClothes} onChange={handleCompanyChange} options={[
                {value:'Yes',si:'සපයනු ලැබේ',ta:'ஆம',en:'Yes'},
                {value:'No', si:'සපයනු නොලැබේ',ta:'இல்லை',en:'No'},
              ]}/>
            </F>
          </>)}

          {/* ══════════ DISABLED PERSON FORM ══════════ */}
          {!isCompany && (<>
            <div style={{background:'linear-gradient(135deg,#eff6ff,#dbeafe)',border:'2px solid #3b82f6',borderRadius:'12px',padding:'22px 20px',marginBottom:'24px',display:'flex',flexDirection:'column',gap:'12px',alignItems:'center',textAlign:'center'}}>
              <div style={{width:'100%'}}>
                <p style={{margin:'0 0 6px',color:'#0a192f',fontSize:'14px',fontWeight:'700',lineHeight:1}}>
                  එක් පුද්ගලයකු සඳහා <span style={{color:'#2563eb'}}>එක් වරක් පමණක්</span> පෝරමය භාවිතා කරන්න.
                </p>
                <p style={{margin:'0 0 4px',color:'#112240',fontSize:'12px',lineHeight:1.8}}>
                  ஒருவருக்கு <span style={{color:'#2563eb',fontWeight:'700'}}>ஒரு முறை மட்டுமே</span> படிவத்தைப் பயன்படுத்தவும்.
                </p>
                <p style={{margin:0,color:'#112240',fontSize:'12px',lineHeight:1.8}}>
                  Use the form <strong>once per person</strong> only.
                </p>
              </div>
            </div>

            <p style={styles.sectionTitle}>📍 <L si="ස්ථානීය තොරතුරු" ta="வசிப்பிட விபரங்கள்" en="Location Details" /></p>
            <F si="පළාත *" ta="மாகாணம் *" en="Province *">
              <select name="province" value={personData.province} onChange={handlePersonChange} style={styles.sel}>
                <option value="">-- පළාත / மாகாணம் / Province --</option>
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
            <F si="ග්‍රාම නිලධාරි කොට්ඨාශය" ta="கிராம நிலதாரியின் பிரிவு " en="GN Division">
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
            <F si="දුරකථනය අංකය   *" ta="தொலைபேசி எண் *" en="Phone Number *">
              <input type="tel" name="phone" value={personData.phone} onChange={handlePersonChange} style={styles.inp} maxLength={15} placeholder="0XX XXX XXXX" autoComplete="off"/>
            </F>
            <F si="උපන් දිනය" ta="பிறந்த திகதி" en="Date of Birth">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  name="year" 
                  placeholder="YYYY" 
                  value={dobParts.year} 
                  onChange={handleDobPartChange}
                  style={{ ...styles.inp, width: '40%', textAlign: 'center' }} 
                  inputMode="numeric"
                />
                <input 
                  type="text" 
                  name="month" 
                  placeholder="MM" 
                  value={dobParts.month} 
                  onChange={handleDobPartChange}
                  style={{ ...styles.inp, width: '30%', textAlign: 'center' }} 
                  inputMode="numeric"
                />
                <input 
                  type="text" 
                  name="day" 
                  placeholder="DD" 
                  value={dobParts.day} 
                  onChange={handleDobPartChange}
                  style={{ ...styles.inp, width: '30%', textAlign: 'center' }} 
                  inputMode="numeric"
                />
              </div>
              <p style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                YYYY-MM-DD (e.g. 1995-05-20)
              </p>
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
                  <option value="">-- හැඳුනුම්පත් වර්ගය / அடையாள வகை / ID Type --</option>
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
            <p style={styles.sectionTitle}>♿ <L si="ආබාධිතභාවය පිළිබඳ තොරතුරු" ta="அங்கவீனத்தின் தகவல்கள்" en="Disability Details" /></p>

            {/* ✅ FIX 3: Multi-checkbox for person */}
            <F si="ආබාධිත වර්ගීකරණය  " ta="அங்கவீனத்தின் தன்மை" en="Type of Disability">
              <div>
                <button type="button" onClick={() => setShowPersonDisabilities(!showPersonDisabilities)} style={styles.toggleBtn}>
                  <span>📍 ආබාධිතතා වර්ගය තෝරන්න / அங்கவீனத்தின் வகைகளைத் தேர்ந்தெடுக்கவும் / Select Disability Types</span>
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