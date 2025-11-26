import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const MessageBanner = () => {
    const [quote,setQuote] = useState({});
    const [langIndex, setLangIndex] = useState(0);
    const [show, setShow] = useState(true);
    const [paused, setPaused] = useState(false);

    useEffect(()=>{
        handleQuote();
    },[]);

    const languages = ["english","hindi","telugu"];

    // When a quote is loaded, start rotating through the three languages
    // Rotation is paused while `paused` is true (e.g., on hover)
    useEffect(() => {
        if (!quote || !quote.english) return;
        let intervalId = null;
        let timeoutId = null;

        const startInterval = () => {
            // rotate every 5s (slow)
            intervalId = setInterval(() => {
                // Fade out, change language, then fade in
                setShow(false);
                timeoutId = setTimeout(() => {
                    setLangIndex((prev) => (prev + 1) % languages.length);
                    setShow(true);
                }, 300);
            }, 5000);
        };

        if (!paused) startInterval();

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [quote, paused]);

    const Quotes = [
    {
        "id": 1,
        "theme": "Duty/Integrity",
        "english": "The tradition of the Raghu clan is that life may be lost, but a promise must never be broken.",
        "hindi": "रघुकुल रीत सदा चलि आई। प्राण जाई पर वचन न जाई॥",
        "telugu": "ప్రాణం పోయినా మాట తప్పకూడదు।"
    },
    {
        "id": 2,
        "theme": "Highest Truth",
        "english": "Truth is the highest virtue (Dharma).",
        "hindi": "नास्ति सत्यात् परो धर्मः।",
        "telugu": "సత్యమే గొప్ప ధర్మం."
    },
    {
        "id": 3,
        "theme": "Motherland",
        "english": "Mother and Motherland are greater than heaven itself.",
        "hindi": "जननी जन्मभूमिश्च स्वर्गादपि गरीयसी।",
        "telugu": "తల్లి మరియు మాతృభూమి స్వర్గం కంటే గొప్పవి."
    },
    {
        "id": 4,
        "theme": "Protection",
        "english": "Dharma protects those who protect it.",
        "hindi": "धर्मो रक्षति रक्षितः।",
        "telugu": "ధర్మాన్ని రక్షించేవారిని ధర్మం రక్షిస్తుంది."
    },
    {
        "id": 5,
        "theme": "Grief",
        "english": "Grief destroys courage, learning, and everything; there is no enemy like grief.",
        "hindi": "शोको नाशयते धैर्यं।",
        "telugu": "శోకం ధైర్యాన్ని, జ్ఞానాన్ని నశిస్తుంది."
    },
    {
        "id": 6,
        "theme": "Inner Enemies",
        "english": "The root of all evil is Lust, Anger, and Greed.",
        "hindi": "काम, क्रोध, मद, लोभ की जब लग मन में खान।",
        "telugu": "కామము, క్రోధము, లోభము నాశనానికి మార్గాలు."
    },
    {
        "id": 7,
        "theme": "Willpower",
        "english": "Enthusiasm is powerful; there is no greater strength than enthusiasm.",
        "hindi": "उत्साहो बलवानार्य, नास्त्युत्साहात् परं बलं।",
        "telugu": "ఉత్సాహం కంటే గొప్ప బలం లేదు."
    },
    {
        "id": 8,
        "theme": "Leadership",
        "english": "A king must protect his subjects like a father protects his children.",
        "hindi": "राजा को पिता की तरह अपनी प्रजा की रक्षा करनी चाहिए।",
        "telugu": "రాజు తన ప్రజలను తండ్రిలాగా రక్షించాలి."
    },
    {
        "id": 9,
        "theme": "Virtue",
        "english": "There is nothing superior to righteousness and morality.",
        "hindi": "धर्म और सदाचार से बढ़कर कुछ नहीं है।",
        "telugu": "ధర్మం మరియు నైతికతకు మించినది లేదు."
    },
    {
        "id": 10,
        "theme": "Action",
        "english": "What one does, one must face the consequences of.",
        "hindi": "जैसा कर्म वैसा फल।",
        "telugu": "ఏం చేస్తే అదే తిరిగి వస్తుంది।"
    },
    {
        "id": 11,
        "theme": "Wisdom",
        "english": "Knowledge is the supreme light.",
        "hindi": "ज्ञानं परमं ज्योतिः।",
        "telugu": "జ్ఞానమే పరమ వెలుగు."
    },
    {
        "id": 12,
        "theme": "Patience",
        "english": "One who practices forbearance succeeds.",
        "hindi": "जो धैर्य रखता है, वही सफल होता है।",
        "telugu": "సహనం పాటించే వారే విజయం సాధిస్తారు।"
    },
    {
        "id": 13,
        "theme": "Sincerity",
        "english": "The heart's sincerity is the only true devotion.",
        "hindi": "हृदय की सरलता ही सच्ची भक्ति है।",
        "telugu": "హృదయపూర్వక సరళతే నిజమైన భక్తి."
    },
    {
        "id": 14,
        "theme": "Friendship",
        "english": "A true friend is one who stands by you in times of difficulty.",
        "hindi": "सच्चा मित्र वही है जो मुश्किल में साथ दे।",
        "telugu": "కష్టకాలంలో తోడుండేవాడే నిజమైన స్నేహితుడు।"
    },
    {
        "id": 15,
        "theme": "Ego",
        "english": "Ego is the greatest obstacle to liberation.",
        "hindi": "अहंकार मुक्ति के मार्ग में सबसे बड़ी बाधा है।",
        "telugu": "అహంకారం మోక్షానికి అతిపెద్ద అడ్డంకి."
    },
    {
        "id": 16,
        "theme": "Time",
        "english": "Time is the destroyer of all things.",
        "hindi": "कालः सर्वं विनाशयति।",
        "telugu": "కాలం అన్నిటినీ నాశనం చేస్తుంది।"
    },
    {
        "id": 17,
        "theme": "Perseverance",
        "english": "No task is impossible for a determined person.",
        "hindi": "दृढ़ निश्चयी व्यक्ति के लिए कोई भी कार्य असंभव नहीं है।",
        "telugu": "దృఢ నిశ్చయం ఉన్నవారికి ఏ పనీ అసాధ్యం కాదు।"
    },
    {
        "id": 18,
        "theme": "Charity",
        "english": "Giving generously brings immense merit.",
        "hindi": "उदारता से दान करने से अपार पुण्य मिलता है।",
        "telugu": "ఉదారంగా దానం చేయడం గొప్ప పుణ్యం।"
    },
    {
        "id": 19,
        "theme": "Respect",
        "english": "Respect for elders is the sign of a good life.",
        "hindi": "बड़ों का सम्मान अच्छे जीवन की निशानी है।",
        "telugu": "పెద్దల పట్ల గౌరవం మంచి జీవితానికి నిదర్శనం।"
    },
    {
        "id": 20,
        "theme": "Justice",
        "english": "The voice of the people is the voice of God.",
        "hindi": "प्रजा की वाणी ही ईश्वर की वाणी है।",
        "telugu": "ప్రజల వాణే దైవ వాణి."
    },
    {
        "id": 21,
        "theme": "Non-Violence",
        "english": "Non-violence is the ultimate duty.",
        "hindi": "अहिंसा परमो धर्मः।",
        "telugu": "అహింసయే పరమ ధర్మం."
    },
    {
        "id": 22,
        "theme": "Contentment",
        "english": "Contentment is the highest wealth.",
        "hindi": "संतोष ही सबसे बड़ा धन है।",
        "telugu": "సంతోషమే గొప్ప సంపద."
    },
    {
        "id": 23,
        "theme": "Self-Control",
        "english": "The senses must be controlled by the mind.",
        "hindi": "इंद्रियों को मन द्वारा नियंत्रित किया जाना चाहिए।",
        "telugu": "ఇంద్రియాలను మనస్సు ద్వారా నియంత్రించాలి."
    },
    {
        "id": 24,
        "theme": "Truth's Power",
        "english": "Truth alone triumphs.",
        "hindi": "सत्यमेव जयते।",
        "telugu": "సత్యమే గెలుస్తుంది."
    },
    {
        "id": 25,
        "theme": "Right Path",
        "english": "The path of Dharma is often difficult.",
        "hindi": "धर्म का मार्ग अक्सर कठिन होता है।",
        "telugu": "ధర్మ మార్గం తరచుగా కష్టంగా ఉంటుంది."
    },
    {
        "id": 26,
        "theme": "Humility",
        "english": "Humility brings honor.",
        "hindi": "विनम्रता सम्मान लाती है।",
        "telugu": "వినయం గౌరవాన్ని తెస్తుంది।"
    },
    {
        "id": 27,
        "theme": "Anger",
        "english": "Anger leads to confusion of the mind.",
        "hindi": "क्रोध मन की भ्रांति की ओर ले जाता है।",
        "telugu": "కోపం మనస్సులో గందరగోళానికి దారితీస్తుంది।"
    },
    {
        "id": 28,
        "theme": "Destiny",
        "english": "Destiny is the consequence of past actions.",
        "hindi": "भाग्य पिछले कर्मों का परिणाम है।",
        "telugu": "గతం కర్మల ఫలితమే అదృష్టం."
    },
    {
        "id": 29,
        "theme": "Worry",
        "english": "Worry is a fire that burns the heart.",
        "hindi": "चिंता हृदय को जलाने वाली आग है।",
        "telugu": "చింత హృదయాన్ని కాల్చే అగ్ని."
    },
    {
        "id": 30,
        "theme": "Inner Peace",
        "english": "Peace is found within, not in external objects.",
        "hindi": "शांति बाहर नहीं, भीतर पाई जाती है।",
        "telugu": "శాంతి బయట కాదు, లోపలే దొరుకుతుంది।"
    },
    {
        "id": 31,
        "theme": "Speech",
        "english": "Speak sweetly and truthfully.",
        "hindi": "मीठा और सत्य बोलना चाहिए।",
        "telugu": "మధురంగా మరియు నిజాయితీగా మాట్లాడాలి।"
    },
    {
        "id": 32,
        "theme": "Advice",
        "english": "Accept good counsel from any source.",
        "hindi": "किसी भी स्रोत से अच्छी सलाह स्वीकार करें।",
        "telugu": "ఏ మూలం నుండైనా మంచి సలహా స్వీకరించండి।"
    },
    {
        "id": 33,
        "theme": "Action/Fate",
        "english": "Man is the maker of his own destiny.",
        "hindi": "मनुष्य अपने भाग्य का निर्माता स्वयं है।",
        "telugu": "మనుష్యుడే తన విధికి తానే కర్త."
    },
    {
        "id": 34,
        "theme": "Self-Real.",
        "english": "Know the Self, for that is the highest wisdom.",
        "hindi": "आत्मा को जानो, क्योंकि वही परम ज्ञान है।",
        "telugu": "ఆత్మను తెలుసుకోండి, అదే పరమ జ్ఞానం."
    },
    {
        "id": 35,
        "theme": "Unity",
        "english": "All beings are interconnected by the Supreme Soul.",
        "hindi": "सभी प्राणी परमात्मा से जुड़े हुए हैं।",
        "telugu": "అన్ని జీవులు పరమాత్మచే అనుసంధానించబడ్డాయి।"
    },
    {
        "id": 36,
        "theme": "Humility",
        "english": "The tree laden with fruit bows down.",
        "hindi": "फलदार वृक्ष झुक जाता है।",
        "telugu": "పండ్లతో నిండిన చెట్టు వంగుతుంది।"
    },
    {
        "id": 37,
        "theme": "Greed",
        "english": "There is no end to greed.",
        "hindi": "लालच का कोई अंत नहीं है।",
        "telugu": "దురాశకు అంతం లేదు।"
    },
    {
        "id": 38,
        "theme": "Forgiveness",
        "english": "Forgiveness is a strength, not a weakness.",
        "hindi": "क्षमा शक्ति है, कमजोरी नहीं।",
        "telugu": "క్షమ అనేది బలం, బలహీనత కాదు।"
    },
    {
        "id": 39,
        "theme": "Faith",
        "english": "Faith is the bridge between the mind and the soul.",
        "hindi": "विश्वास मन और आत्मा के बीच का सेतु है।",
        "telugu": "విశ్వాసం మనస్సు మరియు ఆత్మ మధ్య వంతెన।"
    },
    {
        "id": 40,
        "theme": "Truthfulness",
        "english": "One should never resort to falsehood for personal gain.",
        "hindi": "व्यक्तिगत लाभ के लिए झूठ का सहारा कभी नहीं लेना चाहिए।",
        "telugu": "వ్యక్తిగత లాభం కోసం అబద్ధం చెప్పకూడదు।"
    },
    {
        "id": 41,
        "theme": "Courage",
        "english": "Fear disappears with courage.",
        "hindi": "साहस से भय दूर होता है।",
        "telugu": "ధైర్యంతో భయం తొలగిపోతుంది।"
    },
    {
        "id": 42,
        "theme": "Goodness",
        "english": "Good company leads to good thoughts.",
        "hindi": "अच्छी संगति अच्छे विचारों की ओर ले जाती है।",
        "telugu": "మంచి స్నేహం మంచి ఆలోచనలకు దారితీస్తుంది।"
    },
    {
        "id": 43,
        "theme": "Selfless",
        "english": "Serve others without expectation of reward.",
        "hindi": "बिना इनाम की अपेक्षा के दूसरों की सेवा करें।",
        "telugu": "ప్రతిఫలం ఆశించకుండా ఇతరులకు సేవ చేయండి।"
    },
    {
        "id": 44,
        "theme": "Knowledge",
        "english": "Knowledge dispels the darkness of ignorance.",
        "hindi": "ज्ञान अज्ञान के अंधकार को दूर करता है।",
        "telugu": "జ్ఞానం అజ్ఞానం యొక్క చీకటిని తొలగిస్తుంది।"
    },
    {
        "id": 45,
        "theme": "Simplicity",
        "english": "A simple life is a noble life.",
        "hindi": "एक साधारण जीवन एक महान जीवन है।",
        "telugu": "ఒక సాధారణ జీవితం ఒక గొప్ప జీవితం।"
    },
    {
        "id": 46,
        "theme": "Time's Flow",
        "english": "Time flows like a river, never returning.",
        "hindi": "समय नदी की तरह बहता है, कभी वापस नहीं आता।",
        "telugu": "సమయం నదిలా ప్రవహిస్తుంది, తిరిగి రాదు।"
    },
    {
        "id": 47,
        "theme": "Evil",
        "english": "Evil always destroys itself.",
        "hindi": "बुराई हमेशा खुद को नष्ट करती है।",
        "telugu": "చెడు ఎల్లప్పుడూ తనను తాను నాశనం చేసుకుంటుంది।"
    },
    {
        "id": 48,
        "theme": "Gratitude",
        "english": "Gratitude is the memory of the heart.",
        "hindi": "कृतज्ञता हृदय की स्मृति है।",
        "telugu": "కృతజ్ఞత హృదయం యొక్క జ్ఞాపకం।"
    },
    {
        "id": 49,
        "theme": "Speech",
        "english": "The arrow shot by a bow may not kill, but the word spoken by the mouth surely does.",
        "hindi": "धनुष से छोड़ा गया तीर शायद न मारे, लेकिन मुंह से निकला वचन ज़रूर मारता है।",
        "telugu": "విల్లు నుండి విడిచిన బాణం చంపకపోవచ్చు, కానీ నోటి నుండి వచ్చిన మాట ఖచ్చితంగా చంపుతుంది।"
    },
    {
        "id": 50,
        "theme": "Inner Strength",
        "english": "The mind is the only friend and the only enemy of the soul.",
        "hindi": "मन ही आत्मा का एकमात्र मित्र और एकमात्र शत्रु है।",
        "telugu": "మనస్సే ఆత్మకు ఏకైక మిత్రుడు, ఏకైక శత్రువు।"
    }
];
const handleQuote = () =>{
    const randomIndex = Math.floor(Math.random() * Quotes.length);
    setQuote(Quotes[randomIndex]);
}

        return (
        <div
            className="w-full bg-yellow-50 text-yellow-900 font-semibold p-3 text-center shadow-md border-b border-yellow-400"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {quote && 
                <div>
                    <p
                        className={`mb-1 italic transition-opacity duration-10000 ${show ? 'opacity-100' : 'opacity-0'}`}
                        aria-live="polite"
                    >
                        "{quote[languages[langIndex]]}"
                    </p>
                    <p className="text-sm">- {quote.theme}</p>
                </div>
            }
        </div>
    );
};

export default MessageBanner;
