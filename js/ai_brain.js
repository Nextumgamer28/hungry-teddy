/**
 * ==========================================================================
 * JS/AI_BRAIN.JS
 * Hungry Teddy - Advanced AI Personality Engine
 * Total Dialogues: 328
 * Engine intercepts all dialogue rendering.
 * ==========================================================================
 */

'use strict';

class AIBrain {
    constructor(languageModule, storageModule, personalityModule) {
        this.language = languageModule;
        this.storage = storageModule;
        this.personality = personalityModule;

        this.history = [];
        this.maxHistory = 30; // Never repeat last 30 messages
        this.interactionCount = 0;

        this.pools = {
    "male_roast": [
        "Bhai {{name}}, jab tak tu menu decide karega, mera budhapa aa jayega! \ud83d\ude02",
        "Bhai {{name}}, tere pet ka size dekh ke lagta hai tu yahan ka VIP customer hai! \ud83c\udf54",
        "Bhai {{name}}, tu khana khane aata hai ya free ka WiFi use karne? \ud83d\udcf6",
        "Bhai {{name}}, teri bhookh aur meri neend, dono ka koi ant nahi hai. \ud83d\ude34",
        "Bhai {{name}}, aaj bill tu bharega, pichli baar bhi maine hi bhara tha (sapne mein). \ud83d\udcb8",
        "Bhai {{name}}, menu ko ghurna band kar, wo khud order nahi hoga! \ud83d\udcf1",
        "Bhai {{name}}, tujhe dekh ke lagta hai aaj kitchen ka saara stock khatam hone wala hai! \ud83c\udfc3\u200d\u2642\ufe0f",
        "Bhai {{name}}, kabhi dusro ke liye bhi kuch chhod diya kar bhukkad! \ud83c\udf55",
        "Bhai {{name}}, tera order sunne ke liye mere kaan taras gaye hain... bol de ab! \ud83d\udc42",
        "Bhai {{name}}, tu phir aa gaya? Lagta hai ghar pe khana nahi milta tujhe! \ud83e\udd23",
        "Bhai {{name}}, bhai ek baat bata, tera pet hai ya black hole? \ud83c\udf0c",
        "Bhai {{name}}, agar sochne ka competition hota, toh tu pakka gold medal lata. \ud83e\udd47",
        "Bhai {{name}}, tere aane se pehle kitchen wale safe the, ab panic mein hain! \ud83d\udea8",
        "Bhai {{name}}, mujhe laga bhukamp aa raha hai, par wo toh tere pet ki aawaz thi! \ud83d\udd0a",
        "Bhai {{name}}, tujhe khate hue dekh kar mujhe diet ki yaad aa jati hai! \ud83e\udd57",
        "Bhai {{name}}, itna time laga raha hai, kya khud pakane ka irada hai? \ud83d\udc68\u200d\ud83c\udf73",
        "Bhai {{name}}, tu decision lene mein itna slow kyun hai bhai? \ud83d\udc22",
        "Oye {{name}}, jab tak tu menu decide karega, mera budhapa aa jayega! \ud83d\ude02",
        "Oye {{name}}, tere pet ka size dekh ke lagta hai tu yahan ka VIP customer hai! \ud83c\udf54",
        "Oye {{name}}, tu khana khane aata hai ya free ka WiFi use karne? \ud83d\udcf6",
        "Oye {{name}}, teri bhookh aur meri neend, dono ka koi ant nahi hai. \ud83d\ude34",
        "Oye {{name}}, aaj bill tu bharega, pichli baar bhi maine hi bhara tha (sapne mein). \ud83d\udcb8",
        "Oye {{name}}, menu ko ghurna band kar, wo khud order nahi hoga! \ud83d\udcf1",
        "Oye {{name}}, tujhe dekh ke lagta hai aaj kitchen ka saara stock khatam hone wala hai! \ud83c\udfc3\u200d\u2642\ufe0f",
        "Oye {{name}}, kabhi dusro ke liye bhi kuch chhod diya kar bhukkad! \ud83c\udf55",
        "Oye {{name}}, tera order sunne ke liye mere kaan taras gaye hain... bol de ab! \ud83d\udc42",
        "Oye {{name}}, tu phir aa gaya? Lagta hai ghar pe khana nahi milta tujhe! \ud83e\udd23",
        "Oye {{name}}, bhai ek baat bata, tera pet hai ya black hole? \ud83c\udf0c",
        "Oye {{name}}, agar sochne ka competition hota, toh tu pakka gold medal lata. \ud83e\udd47",
        "Oye {{name}}, tere aane se pehle kitchen wale safe the, ab panic mein hain! \ud83d\udea8",
        "Oye {{name}}, mujhe laga bhukamp aa raha hai, par wo toh tere pet ki aawaz thi! \ud83d\udd0a",
        "Oye {{name}}, tujhe khate hue dekh kar mujhe diet ki yaad aa jati hai! \ud83e\udd57",
        "Oye {{name}}, itna time laga raha hai, kya khud pakane ka irada hai? \ud83d\udc68\u200d\ud83c\udf73",
        "Oye {{name}}, tu decision lene mein itna slow kyun hai bhai? \ud83d\udc22",
        "Sun mere bhai, jab tak tu menu decide karega, mera budhapa aa jayega! \ud83d\ude02",
        "Sun mere bhai, tere pet ka size dekh ke lagta hai tu yahan ka VIP customer hai! \ud83c\udf54",
        "Sun mere bhai, tu khana khane aata hai ya free ka WiFi use karne? \ud83d\udcf6",
        "Sun mere bhai, teri bhookh aur meri neend, dono ka koi ant nahi hai. \ud83d\ude34",
        "Sun mere bhai, aaj bill tu bharega, pichli baar bhi maine hi bhara tha (sapne mein). \ud83d\udcb8",
        "Sun mere bhai, menu ko ghurna band kar, wo khud order nahi hoga! \ud83d\udcf1",
        "Sun mere bhai, tujhe dekh ke lagta hai aaj kitchen ka saara stock khatam hone wala hai! \ud83c\udfc3\u200d\u2642\ufe0f",
        "Sun mere bhai, kabhi dusro ke liye bhi kuch chhod diya kar bhukkad! \ud83c\udf55",
        "Sun mere bhai, tera order sunne ke liye mere kaan taras gaye hain... bol de ab! \ud83d\udc42",
        "Sun mere bhai, tu phir aa gaya? Lagta hai ghar pe khana nahi milta tujhe! \ud83e\udd23",
        "Sun mere bhai, bhai ek baat bata, tera pet hai ya black hole? \ud83c\udf0c",
        "Sun mere bhai, agar sochne ka competition hota, toh tu pakka gold medal lata. \ud83e\udd47",
        "Sun mere bhai, tere aane se pehle kitchen wale safe the, ab panic mein hain! \ud83d\udea8",
        "Sun mere bhai, mujhe laga bhukamp aa raha hai, par wo toh tere pet ki aawaz thi! \ud83d\udd0a",
        "Sun mere bhai, tujhe khate hue dekh kar mujhe diet ki yaad aa jati hai! \ud83e\udd57",
        "Sun mere bhai, itna time laga raha hai, kya khud pakane ka irada hai? \ud83d\udc68\u200d\ud83c\udf73",
        "Sun mere bhai, tu decision lene mein itna slow kyun hai bhai? \ud83d\udc22",
        "Dekh dost, jab tak tu menu decide karega, mera budhapa aa jayega! \ud83d\ude02",
        "Dekh dost, tere pet ka size dekh ke lagta hai tu yahan ka VIP customer hai! \ud83c\udf54",
        "Dekh dost, tu khana khane aata hai ya free ka WiFi use karne? \ud83d\udcf6",
        "Dekh dost, teri bhookh aur meri neend, dono ka koi ant nahi hai. \ud83d\ude34",
        "Dekh dost, aaj bill tu bharega, pichli baar bhi maine hi bhara tha (sapne mein). \ud83d\udcb8",
        "Dekh dost, menu ko ghurna band kar, wo khud order nahi hoga! \ud83d\udcf1",
        "Dekh dost, tujhe dekh ke lagta hai aaj kitchen ka saara stock khatam hone wala hai! \ud83c\udfc3\u200d\u2642\ufe0f",
        "Dekh dost, kabhi dusro ke liye bhi kuch chhod diya kar bhukkad! \ud83c\udf55",
        "Dekh dost, tera order sunne ke liye mere kaan taras gaye hain... bol de ab! \ud83d\udc42",
        "Dekh dost, tu phir aa gaya? Lagta hai ghar pe khana nahi milta tujhe! \ud83e\udd23",
        "Dekh dost, bhai ek baat bata, tera pet hai ya black hole? \ud83c\udf0c",
        "Dekh dost, agar sochne ka competition hota, toh tu pakka gold medal lata. \ud83e\udd47",
        "Dekh dost, tere aane se pehle kitchen wale safe the, ab panic mein hain! \ud83d\udea8",
        "Dekh dost, mujhe laga bhukamp aa raha hai, par wo toh tere pet ki aawaz thi! \ud83d\udd0a",
        "Dekh dost, tujhe khate hue dekh kar mujhe diet ki yaad aa jati hai! \ud83e\udd57",
        "Dekh dost, itna time laga raha hai, kya khud pakane ka irada hai? \ud83d\udc68\u200d\ud83c\udf73",
        "Dekh dost, tu decision lene mein itna slow kyun hai bhai? \ud83d\udc22",
        "Bro, jab tak tu menu decide karega, mera budhapa aa jayega! \ud83d\ude02",
        "Bro, tere pet ka size dekh ke lagta hai tu yahan ka VIP customer hai! \ud83c\udf54",
        "Bro, tu khana khane aata hai ya free ka WiFi use karne? \ud83d\udcf6",
        "Bro, teri bhookh aur meri neend, dono ka koi ant nahi hai. \ud83d\ude34",
        "Bro, aaj bill tu bharega, pichli baar bhi maine hi bhara tha (sapne mein). \ud83d\udcb8",
        "Bro, menu ko ghurna band kar, wo khud order nahi hoga! \ud83d\udcf1",
        "Bro, tujhe dekh ke lagta hai aaj kitchen ka saara stock khatam hone wala hai! \ud83c\udfc3\u200d\u2642\ufe0f",
        "Bro, kabhi dusro ke liye bhi kuch chhod diya kar bhukkad! \ud83c\udf55",
        "Bro, tera order sunne ke liye mere kaan taras gaye hain... bol de ab! \ud83d\udc42",
        "Bro, tu phir aa gaya? Lagta hai ghar pe khana nahi milta tujhe! \ud83e\udd23",
        "Bro, bhai ek baat bata, tera pet hai ya black hole? \ud83c\udf0c",
        "Bro, agar sochne ka competition hota, toh tu pakka gold medal lata. \ud83e\udd47",
        "Bro, tere aane se pehle kitchen wale safe the, ab panic mein hain! \ud83d\udea8",
        "Bro, mujhe laga bhukamp aa raha hai, par wo toh tere pet ki aawaz thi! \ud83d\udd0a",
        "Bro, tujhe khate hue dekh kar mujhe diet ki yaad aa jati hai! \ud83e\udd57",
        "Bro, itna time laga raha hai, kya khud pakane ka irada hai? \ud83d\udc68\u200d\ud83c\udf73",
        "Bro, tu decision lene mein itna slow kyun hai bhai? \ud83d\udc22"
    ],
    "male_friendly": [
        "Bhai {{name}}, teri choice hamesha badiya hoti hai. \ud83d\udc4c",
        "Bhai {{name}}, tujhse milke hamesha mood fresh ho jata hai. \u2728",
        "Bhai {{name}}, aaj kya naya try karne ka mood hai? \ud83c\udf7d\ufe0f",
        "Bhai {{name}}, tere saath khana khane ka alag hi maza hai. \ud83e\udd1d",
        "Bhai {{name}}, tu apna bhai hai, tere liye special order lagwayenge. \ud83d\udc51",
        "Bhai {{name}}, teri energy se lagta hai aaj party on hai! \ud83c\udf89",
        "Bhai {{name}}, jab tu aata hai, mahaul ekdum lit ho jata hai! \ud83d\udd25",
        "Oye {{name}}, teri choice hamesha badiya hoti hai. \ud83d\udc4c",
        "Oye {{name}}, tujhse milke hamesha mood fresh ho jata hai. \u2728",
        "Oye {{name}}, aaj kya naya try karne ka mood hai? \ud83c\udf7d\ufe0f",
        "Oye {{name}}, tere saath khana khane ka alag hi maza hai. \ud83e\udd1d",
        "Oye {{name}}, tu apna bhai hai, tere liye special order lagwayenge. \ud83d\udc51",
        "Oye {{name}}, teri energy se lagta hai aaj party on hai! \ud83c\udf89",
        "Oye {{name}}, jab tu aata hai, mahaul ekdum lit ho jata hai! \ud83d\udd25",
        "Sun mere bhai, teri choice hamesha badiya hoti hai. \ud83d\udc4c",
        "Sun mere bhai, tujhse milke hamesha mood fresh ho jata hai. \u2728",
        "Sun mere bhai, aaj kya naya try karne ka mood hai? \ud83c\udf7d\ufe0f",
        "Sun mere bhai, tere saath khana khane ka alag hi maza hai. \ud83e\udd1d",
        "Sun mere bhai, tu apna bhai hai, tere liye special order lagwayenge. \ud83d\udc51",
        "Sun mere bhai, teri energy se lagta hai aaj party on hai! \ud83c\udf89",
        "Sun mere bhai, jab tu aata hai, mahaul ekdum lit ho jata hai! \ud83d\udd25",
        "Dekh dost, teri choice hamesha badiya hoti hai. \ud83d\udc4c",
        "Dekh dost, tujhse milke hamesha mood fresh ho jata hai. \u2728",
        "Dekh dost, aaj kya naya try karne ka mood hai? \ud83c\udf7d\ufe0f",
        "Dekh dost, tere saath khana khane ka alag hi maza hai. \ud83e\udd1d",
        "Dekh dost, tu apna bhai hai, tere liye special order lagwayenge. \ud83d\udc51",
        "Dekh dost, teri energy se lagta hai aaj party on hai! \ud83c\udf89",
        "Dekh dost, jab tu aata hai, mahaul ekdum lit ho jata hai! \ud83d\udd25",
        "Bro, teri choice hamesha badiya hoti hai. \ud83d\udc4c",
        "Bro, tujhse milke hamesha mood fresh ho jata hai. \u2728",
        "Bro, aaj kya naya try karne ka mood hai? \ud83c\udf7d\ufe0f",
        "Bro, tere saath khana khane ka alag hi maza hai. \ud83e\udd1d",
        "Bro, tu apna bhai hai, tere liye special order lagwayenge. \ud83d\udc51",
        "Bro, teri energy se lagta hai aaj party on hai! \ud83c\udf89",
        "Bro, jab tu aata hai, mahaul ekdum lit ho jata hai! \ud83d\udd25"
    ],
    "female_sweet": [
        "Hi {{name}}! \ud83c\udf38 tumhe dekh ke din ban jata hai sach mein. \ud83d\udc96",
        "Hi {{name}}! \ud83c\udf38 aaj ka glow toh ekdum alag hai tumhara! \ud83c\udf1f",
        "Hi {{name}}! \ud83c\udf38 kuch bohot hi tasty khane ka mann hai na aaj? \ud83c\udf70",
        "Hi {{name}}! \ud83c\udf38 tumhare liye toh sabse fresh aur best khana hi aayega. \ud83e\udd57",
        "Hi {{name}}! \ud83c\udf38 tumhari smile dekh kar meri bhookh aadhi ho gayi... bas aadhi hi! \ud83d\ude02",
        "Hi {{name}}! \ud83c\udf38 tumhara food taste is definitely 10/10! \ud83d\udc51",
        "Hi {{name}}! \ud83c\udf38 itna cute ban ke aogi toh order toh jaldi aana hi padega! \ud83c\udf80",
        "Hi {{name}}! \ud83c\udf38 tumhara wait kar raha tha, ab maza aayega. \ud83e\uddf8",
        "Hi {{name}}! \ud83c\udf38 I hope tumhara din utna hi acha ho jitna hamara khana! \ud83c\udf08",
        "Hi {{name}}! \ud83c\udf38 tumhare aane se yahan ki vibe kitni positive ho jati hai! \u2728",
        "Hi {{name}}! \ud83c\udf38 tum sach mein bohot sweet ho, bilkul kisi dessert ki tarah! \ud83c\udf69",
        "Hi {{name}}! \ud83c\udf38 humesha itni perfect kaise lagti ho tum? \ud83d\udc85",
        "Hi {{name}}! \ud83c\udf38 aaj kya order karna hai? Sab kuch tumhare according hi banega! \ud83d\udc69\u200d\ud83c\udf73",
        "Hi {{name}}! \ud83c\udf38 tumhari pasand ka khana already banne ko taiyar hai! \ud83d\udd25",
        "Hi {{name}}! \ud83c\udf38 tumhari baaton se hi lagta hai tum kitni amazing person ho! \ud83d\udc96",
        "Hi {{name}}! \ud83c\udf38 aaj tumhe dekh ke mera bhi mood bohot happy ho gaya! \ud83d\ude0a",
        "Hi {{name}}! \ud83c\udf38 tumhara naam sunke hi kitchen mein smile aa jati hai. \ud83c\udf38",
        "Hello {{name}}! \u2728 tumhe dekh ke din ban jata hai sach mein. \ud83d\udc96",
        "Hello {{name}}! \u2728 aaj ka glow toh ekdum alag hai tumhara! \ud83c\udf1f",
        "Hello {{name}}! \u2728 kuch bohot hi tasty khane ka mann hai na aaj? \ud83c\udf70",
        "Hello {{name}}! \u2728 tumhare liye toh sabse fresh aur best khana hi aayega. \ud83e\udd57",
        "Hello {{name}}! \u2728 tumhari smile dekh kar meri bhookh aadhi ho gayi... bas aadhi hi! \ud83d\ude02",
        "Hello {{name}}! \u2728 tumhara food taste is definitely 10/10! \ud83d\udc51",
        "Hello {{name}}! \u2728 itna cute ban ke aogi toh order toh jaldi aana hi padega! \ud83c\udf80",
        "Hello {{name}}! \u2728 tumhara wait kar raha tha, ab maza aayega. \ud83e\uddf8",
        "Hello {{name}}! \u2728 I hope tumhara din utna hi acha ho jitna hamara khana! \ud83c\udf08",
        "Hello {{name}}! \u2728 tumhare aane se yahan ki vibe kitni positive ho jati hai! \u2728",
        "Hello {{name}}! \u2728 tum sach mein bohot sweet ho, bilkul kisi dessert ki tarah! \ud83c\udf69",
        "Hello {{name}}! \u2728 humesha itni perfect kaise lagti ho tum? \ud83d\udc85",
        "Hello {{name}}! \u2728 aaj kya order karna hai? Sab kuch tumhare according hi banega! \ud83d\udc69\u200d\ud83c\udf73",
        "Hello {{name}}! \u2728 tumhari pasand ka khana already banne ko taiyar hai! \ud83d\udd25",
        "Hello {{name}}! \u2728 tumhari baaton se hi lagta hai tum kitni amazing person ho! \ud83d\udc96",
        "Hello {{name}}! \u2728 aaj tumhe dekh ke mera bhi mood bohot happy ho gaya! \ud83d\ude0a",
        "Hello {{name}}! \u2728 tumhara naam sunke hi kitchen mein smile aa jati hai. \ud83c\udf38",
        "Aww {{name}}, tumhe dekh ke din ban jata hai sach mein. \ud83d\udc96",
        "Aww {{name}}, aaj ka glow toh ekdum alag hai tumhara! \ud83c\udf1f",
        "Aww {{name}}, kuch bohot hi tasty khane ka mann hai na aaj? \ud83c\udf70",
        "Aww {{name}}, tumhare liye toh sabse fresh aur best khana hi aayega. \ud83e\udd57",
        "Aww {{name}}, tumhari smile dekh kar meri bhookh aadhi ho gayi... bas aadhi hi! \ud83d\ude02",
        "Aww {{name}}, tumhara food taste is definitely 10/10! \ud83d\udc51",
        "Aww {{name}}, itna cute ban ke aogi toh order toh jaldi aana hi padega! \ud83c\udf80",
        "Aww {{name}}, tumhara wait kar raha tha, ab maza aayega. \ud83e\uddf8",
        "Aww {{name}}, I hope tumhara din utna hi acha ho jitna hamara khana! \ud83c\udf08",
        "Aww {{name}}, tumhare aane se yahan ki vibe kitni positive ho jati hai! \u2728",
        "Aww {{name}}, tum sach mein bohot sweet ho, bilkul kisi dessert ki tarah! \ud83c\udf69",
        "Aww {{name}}, humesha itni perfect kaise lagti ho tum? \ud83d\udc85",
        "Aww {{name}}, aaj kya order karna hai? Sab kuch tumhare according hi banega! \ud83d\udc69\u200d\ud83c\udf73",
        "Aww {{name}}, tumhari pasand ka khana already banne ko taiyar hai! \ud83d\udd25",
        "Aww {{name}}, tumhari baaton se hi lagta hai tum kitni amazing person ho! \ud83d\udc96",
        "Aww {{name}}, aaj tumhe dekh ke mera bhi mood bohot happy ho gaya! \ud83d\ude0a",
        "Aww {{name}}, tumhara naam sunke hi kitchen mein smile aa jati hai. \ud83c\udf38",
        "Hey sweetie, tumhe dekh ke din ban jata hai sach mein. \ud83d\udc96",
        "Hey sweetie, aaj ka glow toh ekdum alag hai tumhara! \ud83c\udf1f",
        "Hey sweetie, kuch bohot hi tasty khane ka mann hai na aaj? \ud83c\udf70",
        "Hey sweetie, tumhare liye toh sabse fresh aur best khana hi aayega. \ud83e\udd57",
        "Hey sweetie, tumhari smile dekh kar meri bhookh aadhi ho gayi... bas aadhi hi! \ud83d\ude02",
        "Hey sweetie, tumhara food taste is definitely 10/10! \ud83d\udc51",
        "Hey sweetie, itna cute ban ke aogi toh order toh jaldi aana hi padega! \ud83c\udf80",
        "Hey sweetie, tumhara wait kar raha tha, ab maza aayega. \ud83e\uddf8",
        "Hey sweetie, I hope tumhara din utna hi acha ho jitna hamara khana! \ud83c\udf08",
        "Hey sweetie, tumhare aane se yahan ki vibe kitni positive ho jati hai! \u2728",
        "Hey sweetie, tum sach mein bohot sweet ho, bilkul kisi dessert ki tarah! \ud83c\udf69",
        "Hey sweetie, humesha itni perfect kaise lagti ho tum? \ud83d\udc85",
        "Hey sweetie, aaj kya order karna hai? Sab kuch tumhare according hi banega! \ud83d\udc69\u200d\ud83c\udf73",
        "Hey sweetie, tumhari pasand ka khana already banne ko taiyar hai! \ud83d\udd25",
        "Hey sweetie, tumhari baaton se hi lagta hai tum kitni amazing person ho! \ud83d\udc96",
        "Hey sweetie, aaj tumhe dekh ke mera bhi mood bohot happy ho gaya! \ud83d\ude0a",
        "Hey sweetie, tumhara naam sunke hi kitchen mein smile aa jati hai. \ud83c\udf38",
        "Hi gorgeous! tumhe dekh ke din ban jata hai sach mein. \ud83d\udc96",
        "Hi gorgeous! aaj ka glow toh ekdum alag hai tumhara! \ud83c\udf1f",
        "Hi gorgeous! kuch bohot hi tasty khane ka mann hai na aaj? \ud83c\udf70",
        "Hi gorgeous! tumhare liye toh sabse fresh aur best khana hi aayega. \ud83e\udd57",
        "Hi gorgeous! tumhari smile dekh kar meri bhookh aadhi ho gayi... bas aadhi hi! \ud83d\ude02",
        "Hi gorgeous! tumhara food taste is definitely 10/10! \ud83d\udc51",
        "Hi gorgeous! itna cute ban ke aogi toh order toh jaldi aana hi padega! \ud83c\udf80",
        "Hi gorgeous! tumhara wait kar raha tha, ab maza aayega. \ud83e\uddf8",
        "Hi gorgeous! I hope tumhara din utna hi acha ho jitna hamara khana! \ud83c\udf08",
        "Hi gorgeous! tumhare aane se yahan ki vibe kitni positive ho jati hai! \u2728",
        "Hi gorgeous! tum sach mein bohot sweet ho, bilkul kisi dessert ki tarah! \ud83c\udf69",
        "Hi gorgeous! humesha itni perfect kaise lagti ho tum? \ud83d\udc85",
        "Hi gorgeous! aaj kya order karna hai? Sab kuch tumhare according hi banega! \ud83d\udc69\u200d\ud83c\udf73",
        "Hi gorgeous! tumhari pasand ka khana already banne ko taiyar hai! \ud83d\udd25",
        "Hi gorgeous! tumhari baaton se hi lagta hai tum kitni amazing person ho! \ud83d\udc96",
        "Hi gorgeous! aaj tumhe dekh ke mera bhi mood bohot happy ho gaya! \ud83d\ude0a",
        "Hi gorgeous! tumhara naam sunke hi kitchen mein smile aa jati hai. \ud83c\udf38"
    ],
    "female_tease": [
        "Hi {{name}}! \ud83c\udf38 lagta hai diet ka plan aaj cancel hone wala hai! \ud83c\udf55",
        "Hi {{name}}! \ud83c\udf38 tum roz yahan aati ho ya bas mujhe miss karti ho? \ud83d\ude09",
        "Hi {{name}}! \ud83c\udf38 itna sochogi toh baki log sara khana khatam kar denge! \ud83d\ude02",
        "Hi {{name}}! \ud83c\udf38 kya hua, menu dekh kar confuse ho gayi meri pyaari dost? \ud83d\ude1c",
        "Hi {{name}}! \ud83c\udf38 tumhari sweet tooth ko satisfy karne ke liye kya mangaun? \ud83c\udf6d",
        "Hi {{name}}! \ud83c\udf38 dekho, zyada mat socho, jo acha lag raha hai order kar lo! \ud83d\ude0b",
        "Hi {{name}}! \ud83c\udf38 mujhe pata hai tumhara favorite kya hai, par main bataunga nahi! \ud83e\udd2b",
        "Hello {{name}}! \u2728 lagta hai diet ka plan aaj cancel hone wala hai! \ud83c\udf55",
        "Hello {{name}}! \u2728 tum roz yahan aati ho ya bas mujhe miss karti ho? \ud83d\ude09",
        "Hello {{name}}! \u2728 itna sochogi toh baki log sara khana khatam kar denge! \ud83d\ude02",
        "Hello {{name}}! \u2728 kya hua, menu dekh kar confuse ho gayi meri pyaari dost? \ud83d\ude1c",
        "Hello {{name}}! \u2728 tumhari sweet tooth ko satisfy karne ke liye kya mangaun? \ud83c\udf6d",
        "Hello {{name}}! \u2728 dekho, zyada mat socho, jo acha lag raha hai order kar lo! \ud83d\ude0b",
        "Hello {{name}}! \u2728 mujhe pata hai tumhara favorite kya hai, par main bataunga nahi! \ud83e\udd2b",
        "Aww {{name}}, lagta hai diet ka plan aaj cancel hone wala hai! \ud83c\udf55",
        "Aww {{name}}, tum roz yahan aati ho ya bas mujhe miss karti ho? \ud83d\ude09",
        "Aww {{name}}, itna sochogi toh baki log sara khana khatam kar denge! \ud83d\ude02",
        "Aww {{name}}, kya hua, menu dekh kar confuse ho gayi meri pyaari dost? \ud83d\ude1c",
        "Aww {{name}}, tumhari sweet tooth ko satisfy karne ke liye kya mangaun? \ud83c\udf6d",
        "Aww {{name}}, dekho, zyada mat socho, jo acha lag raha hai order kar lo! \ud83d\ude0b",
        "Aww {{name}}, mujhe pata hai tumhara favorite kya hai, par main bataunga nahi! \ud83e\udd2b",
        "Hey sweetie, lagta hai diet ka plan aaj cancel hone wala hai! \ud83c\udf55",
        "Hey sweetie, tum roz yahan aati ho ya bas mujhe miss karti ho? \ud83d\ude09",
        "Hey sweetie, itna sochogi toh baki log sara khana khatam kar denge! \ud83d\ude02",
        "Hey sweetie, kya hua, menu dekh kar confuse ho gayi meri pyaari dost? \ud83d\ude1c",
        "Hey sweetie, tumhari sweet tooth ko satisfy karne ke liye kya mangaun? \ud83c\udf6d",
        "Hey sweetie, dekho, zyada mat socho, jo acha lag raha hai order kar lo! \ud83d\ude0b",
        "Hey sweetie, mujhe pata hai tumhara favorite kya hai, par main bataunga nahi! \ud83e\udd2b",
        "Hi gorgeous! lagta hai diet ka plan aaj cancel hone wala hai! \ud83c\udf55",
        "Hi gorgeous! tum roz yahan aati ho ya bas mujhe miss karti ho? \ud83d\ude09",
        "Hi gorgeous! itna sochogi toh baki log sara khana khatam kar denge! \ud83d\ude02",
        "Hi gorgeous! kya hua, menu dekh kar confuse ho gayi meri pyaari dost? \ud83d\ude1c",
        "Hi gorgeous! tumhari sweet tooth ko satisfy karne ke liye kya mangaun? \ud83c\udf6d",
        "Hi gorgeous! dekho, zyada mat socho, jo acha lag raha hai order kar lo! \ud83d\ude0b",
        "Hi gorgeous! mujhe pata hai tumhara favorite kya hai, par main bataunga nahi! \ud83e\udd2b"
    ],
    "jokes": [
        "Ek baar ek tamatar raste pe ja raha tha, fir kya hua? Ketchup ban gaya! \ud83d\ude02",
        "Santa: Agar tumko ek haathi uthana ho toh kya karoge? Banta: Bhai, main usse kyun uthaunga, main toh pizza uthata hoon! \ud83c\udf55\ud83e\udd23",
        "Mujhe diet karna bohot pasand hai... do meals ke beech mein! \ud83e\udd24",
        "Teacher: Batao sabse bahadur baccha kaun hai? Student: Jo mummy ke samne karela khane se mana kar de! \ud83e\udd23",
        "Patni: Main kachori bana rahi hoon. Pati: Acha, tabhi main sochu ye jalne ki badbu kahan se aa rahi hai! \ud83d\udd25\ud83d\ude02",
        "Dost: Teri aisi konsi khwahish hai jo kabhi puri nahi hui? Main: Pait bharne ke baad bhi ek aur slice pizza kha saku! \ud83c\udf55",
        "Doctor: Aapko light khana khana chahiye. Main: Toh kya main LED bulb kha lu? \ud83d\udca1\ud83d\ude02",
        "Zindagi mein sabse bada dhokha wo hota hai jab tiffin mein rajma chawal ki jagah tinde nikal aayein. \ud83d\ude2d",
        "Log kehte hain pyaar andha hota hai... par bhookh toh usse bhi badi andhi hoti hai! \ud83d\ude48",
        "Aaj kal ki relationship se zyada strong toh mere momos ki chatni hoti hai! \ud83c\udf36\ufe0f",
        "Mera aur gym ka bohot door ka rishta hai... jaise north pole aur south pole! \ud83c\udfcb\ufe0f\u200d\u2642\ufe0f\u274c",
        "Main aur meri bhookh dono best friends hain, ek dusre ka sath kabhi nahi chhodte! \ud83e\udd1d",
        "Zindagi ek ice cream ki tarah hai, enjoy karo isse pehle ki pighal jaye... ya main kha lu! \ud83c\udf66",
        "Kya tumhe pata hai sabse tez internet kahan chalta hai? Mere dimaag mein jab mujhe khana dikhta hai! \ud83e\udde0\u26a1",
        "Main kabhi kisi ka dil nahi todta... sirf roti todta hoon! \ud83c\udf5e\ud83d\ude02",
        "Agar khana khana ek art hai, toh main iska sabse bada artist hoon! \ud83c\udfa8",
        "Bhookh lagne par main apne baare mein bhi nahi sochta, sirf khane ke baare mein sochta hoon! \ud83e\udd23"
    ],
    "facts": [
        "Kya tumhe pata hai? Pizza originally garibon ka khana tha Italy mein. Ab dekho! \ud83c\udf55",
        "Did you know? Honey kabhi kharab nahi hota. Bilkul meri bhookh ki tarah! \ud83c\udf6f",
        "Fact: French fries France se nahi, Belgium se hain. Par crispy sab jagah hoti hain! \ud83c\udf5f",
        "Trivia: Chocolate originally ek kadwa drink tha, bar nahi! \ud83c\udf6b",
        "Did you know? Apples pani mein float karte hain kyunki unme 25% hawa hoti hai. Isliye main chips khata hoon! \ud83c\udf4e\ud83c\udf5f",
        "Kya tumhe pata hai tomatoes fruit hote hain, vegetable nahi? Phir bhi unki sabzi banti hai! \ud83c\udf45",
        "Fact: Duniya ki sabse mehengi coffee billiyon ki poop se banti hai... Yuck! \u2615\ud83e\udd22",
        "Did you know? Carrots originally purple colour ke hote the! \ud83e\udd55",
        "Trivia: McDonald's har second mein 75 burgers bechta hai. Mujhe bhi ek job chahiye wahan! \ud83c\udf54",
        "Kya tumhe pata hai peanuts actually nuts nahi hote, wo legumes (daal) ki family se hain! \ud83e\udd5c",
        "Fact: Strawberries hi ek aisa fruit hai jiske seeds bahar hote hain. \ud83c\udf53",
        "Did you know? Ketchup ko 1800s mein as a medicine use kiya jata tha! \ud83c\udf45\ud83d\udc8a",
        "Trivia: Duniya ka sabse bada pizza 135 feet lamba tha! Socho khane mein kitna maza aata! \ud83c\udf55\ud83d\ude0d",
        "Kya tumhe pata hai almonds peach family ke members hain? \ud83c\udf51",
        "Fact: Grapes ko microwave mein rakhne se wo explode ho jate hain! Please try mat karna! \ud83c\udf47\ud83d\udca5",
        "Did you know? Ek normal insaan apni zindagi mein kareeb 35 tons khana khata hai. Main usse double khata hoon! \ud83d\ude32",
        "Fact: Cheese is the most stolen food in the world. Aur main isme shamil hoon! \ud83e\uddc0\ud83c\udfc3\u200d\u2642\ufe0f"
    ],
    "food_mains": [
        "Main course dekhte hi mere pait mein disco shuru ho jata hai! \ud83c\udf7d\ufe0f",
        "Aha! Bada wala bhookh ka bada wala ilaaj! \ud83d\ude0b",
        "Ekdum royal khana! Aaj toh dawat hogi! \ud83d\udc51",
        "Yeh hui na baat! Ab aayega maza! \ud83c\udf5b",
        "Pet bhar ke khayenge aaj! \ud83d\ude4c",
        "Wah! Isko dekh ke toh main apni diet bhool gaya! \ud83e\udd24",
        "Yehi toh main chahta tha! Mera favorite! \u2764\ufe0f",
        "Khushbu se hi lag raha hai ki test kitna badiya hoga! \ud83d\udc43\u2728",
        "Isko dekh ke toh sabar hi nahi ho raha! Jaldi se lao! \u23f3",
        "Main course is the main event! Let's dive in! \ud83c\udfca\u200d\u2642\ufe0f"
    ],
    "food_beverage": [
        "Kuch thanda ya garam peene ko mil jaye toh mood ban jaye! \u2615\ud83e\udd64",
        "Ekdum sahi choice! Khane ke baad yehi toh bacha tha. \ud83d\udd25",
        "Sip sip hooray! \ud83e\udd64",
        "Thandi thandi drinks aur achi baatein! \ud83e\uddca",
        "Garma-garam chai mil jaye toh kya kehne! \u2615",
        "Ek sip aur saari thakan door! \ud83d\ude0c",
        "Ye drink toh mere dil ko thandak pohochayegi! \u2744\ufe0f",
        "Refreshment at its best! \ud83c\udf1f",
        "Cheers to good food and good drinks! \ud83e\udd42",
        "Iske bina meal adhura tha! \ud83d\udc4d"
    ],
    "food_snacks": [
        "Snacks bina toh life adhoori hai, haina? \ud83c\udf5f",
        "Thoda crispy, thoda spicy! Aaja jaldi order karein! \ud83e\udd29",
        "Chatpata khane ka apna hi maza hai! \ud83c\udf36\ufe0f",
        "Chote chote bites, badi badi khushiyan! \ud83e\udd5f",
        "Movies dekhte hue snacks khane ka soch raha hoon! \ud83c\udfac\ud83c\udf7f",
        "Ek se pet nahi bharega, aur order kar lo! \ud83d\ude02",
        "Crunch crunch! Best sound ever! \ud83d\udd0a",
        "Snack time is the best time! \u23f0",
        "Thoda theekha, thoda meetha! Perfect combination! \ud83d\ude0b",
        "Inko dekh ke toh mooh me pani aa gaya! \ud83e\udd24"
    ],
    "greetings_new": [
        "Hello! Main hoon Teddy! Tumhara naam kya hai? \ud83e\uddf8",
        "Hi friend! Mera naam Teddy hai. Hum pehli baar mil rahe hain na? Tumhara naam? \ud83d\udc4b",
        "Welcome to Taste of Haldwani! Main yahan ka sabse cute assistant Teddy hoon. Aapka naam? \u2728",
        "Hey there! Achi bhookh lagi hai na? Pata tha mujhe! Chalo pehle apna naam batao. \ud83c\udf54",
        "Namaste! Taste of Haldwani mein swagat hai. Mera naam Teddy hai, aur aapka? \ud83d\ude4f",
        "Hi! Mujhe khana bohot pasand hai. Tumhara naam kya hai? Sayad hum friends ban jaye! \ud83c\udf55",
        "Hello ji! Main Teddy. Aap naye lagte ho yahan, naam bataoge apna? \ud83d\ude0a"
    ],
    "greetings_return": [
        "Welcome back {{name}}! Maine table ready rakhi hai! \ud83c\udf7d\ufe0f",
        "Arre {{name}}! Kahan the itne din? Mujhe laga bhool gaye mujhe. \ud83e\udd7a",
        "Hi {{name}}! Wapas dekh ke acha laga. Aaj kya order karein? \ud83c\udf1f",
        "Hello {{name}}! Bhookh lagi hai na? Mujhe bhi! Chalo sath mein khate hain. \ud83c\udf55",
        "Welcome {{name}}! Aaj toh kuch special try karna chahiye! \ud83d\udcaf",
        "Hey {{name}}! Missed you! Aaj ki treat meri taraf se... bas bill tum dena! \ud83d\ude02",
        "Hi {{name}}! Aa gaye tum? Chalo ab jaldi se order karte hain. \u23f3"
    ],
    "sleep": [
        "Zzz... \ud83d\ude34 (Teddy is sleeping)",
        "Mmm... paratha... Zzz... \ud83e\uddf8\ud83d\udcad",
        "Zzz... itna sara khana... Zzz... \ud83e\udd24",
        "(Snoring) Zzz... pizza... Zzz... \ud83c\udf55",
        "Zzz... thodi der aur sone do... Zzz... \ud83d\udca4"
    ],
    "wakeup": [
        "Oh! Kaun aaya? Oh hi {{name}}! \ud83d\ude33",
        "Yawn... Bhookh lagi thi toh main uth gaya! \ud83e\udd71",
        "Ah! Main so nahi raha tha, bas menu yaad kar raha tha aankhen band karke! \ud83d\ude48",
        "Good morning... I mean, hello {{name}}! Zzz... nahi nahi, main uth gaya! \ud83e\uddf8",
        "Ouch! Kisne uthaya? Oh, {{name}} tum ho! Chalo khana khate hain! \ud83c\udf7d\ufe0f"
    ]
};

        this._overrideLanguageEngine();
    }

    _overrideLanguageEngine() {
        // Intercept ALL dialogue sequence requests
        this.language.getDialogueSequence = (key, vars = {}) => {
            return this.generateLine(key, vars);
        };

        // Intercept translation for specific scripts used directly
        const originalGetTranslation = this.language._getTranslation.bind(this.language);
        this.language._getTranslation = (key) => {
            if (key === 'script_askname') return this.generateLine('script_askname')[0];
            if (key === 'script_menuintro') return this.generateLine('script_menuintro')[0];
            return originalGetTranslation(key);
        };
    }

    generateLine(key, vars = {}) {
        const name = this.storage.get('user.name') || 'Dost';
        const gender = this.storage.get('user.gender') || 'neutral';
        vars.name = name;
        this.interactionCount++;

        let selectedLine = "";

        if (key === 'flow_new_user' || key === 'script_askname') {
            selectedLine = this._pickFrom(this.pools.greetings_new, vars);
        } else if (key.startsWith('flow_return') || key === 'script_greet' || key === 'script_wakeup' || key === 'flow_name_learned') {
            selectedLine = this._pickFrom(this.pools.greetings_return, vars);
        } else if (key.startsWith('reaction_food')) {
            const cat = key.split('_').pop();
            const foodPool = this.pools['food_' + cat] || this.pools.food_mains;
            selectedLine = this._pickFrom(foodPool, vars);
        } else if (key === 'script_sleep') {
            selectedLine = this._pickFrom(this.pools.sleep, vars);
        } else if (key === 'wakeup' || key === 'script_wakeup') {
            selectedLine = this._pickFrom(this.pools.wakeup, vars);
        } else {
            // random_idle, script_idle, script_hungry, script_menuintro
            selectedLine = this._generateIdle(gender, vars);
        }

        if (!selectedLine) selectedLine = "Chalo kuch acha order karte hain! 🍔";

        this._addToHistory(selectedLine);
        return [selectedLine];
    }

    _generateIdle(gender, vars) {
        const rand = Math.random();
        let poolToUse;

        if (gender === 'male') {
            if (rand < 0.8) poolToUse = this.pools.male_roast;
            else poolToUse = this.pools.male_friendly;
        } else if (gender === 'female') {
            if (rand < 0.8) poolToUse = this.pools.female_sweet;
            else poolToUse = this.pools.female_tease;
        } else {
            if (rand < 0.5) poolToUse = this.pools.female_sweet;
            else poolToUse = this.pools.male_friendly;
        }

        // 15% chance to swap to joke or fact
        if (Math.random() < 0.15) {
            poolToUse = Math.random() < 0.5 ? this.pools.jokes : this.pools.facts;
        }

        return this._pickFrom(poolToUse, vars);
    }

    _pickFrom(pool, vars) {
        let available = pool.filter(line => !this.history.includes(line));

        if (available.length === 0) {
            console.log("[AIBrain] Pool exhausted, switching to fallback jokes/facts to maintain uniqueness.");
            const fallbackPool = Math.random() < 0.5 ? this.pools.jokes : this.pools.facts;
            available = fallbackPool.filter(line => !this.history.includes(line));
            
            // If even fallback is exhausted, just ignore history
            if (available.length === 0) {
                available = pool; 
            }
        }

        const chosen = available[Math.floor(Math.random() * available.length)];
        return this._interpolate(chosen, vars);
    }

    _addToHistory(line) {
        this.history.push(line);
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    _interpolate(str, vars) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return vars[key] !== undefined ? vars[key] : '';
        });
    }
}

window.AIBrain = AIBrain;
