/**
 * ==========================================================================
 * JS/LANGUAGE.JS
 * Hungry Teddy - Multilingual System Controller & Dialogue Dictionary
 * Handles dynamic language switching, high-performance DOM translations, 
 * string interpolation, and serves as the central brain's vocabulary.
 * Tailored for Taste of Haldwani (Indian Cloud Kitchen).
 * ==========================================================================
 */

'use strict';

class LanguageController {
    constructor() {
        this.defaultLang = 'hinglish';
        this.currentLang = this.defaultLang;
        try {
            this.currentLang = localStorage.getItem('teddy_lang') || this.defaultLang;
        } catch(e) {}
        this.cachedUI = null; 
        
        this.translations = {
            hinglish: {
                /* =====================================
                   STATIC UI STRINGS
                   ===================================== */
                loader_sub: "Chef ko utha rahe hain...",
                nav_meet: "Teddy se Milo",
                nav_story: "Hamari Kahani",
                nav_menu: "Gourmet Menu",
                nav_exp: "Experience",
                nav_contact: "Humse Milo",
                status_sleep: "So raha hai...",
                dialogue_init: "Zzz... Kharrate... (Teddy ko uthane ke liye tap karein!)",
                name_ask: "Teddy aapko kis naam se bulaye?",
                name_ph: "Apna naam likhein...",
                name_btn: "Introduce Karein",
                btn_menu: "📖 Menu Dekhein",
                btn_reserve: "✨ Table Reserve Karein",
                
                desktop_order_title: "Apna Favorite Khana Order Karein",
                sheet_title: "Platform Choose Karein",
                mobile_order: "🍕 Khana Order Karein",
                btn_call: "📞 Restaurant ko Call Karein",
                
                story_tag: "Apron ke Peeche",
                story_title: "Taste of Haldwani ki Kahani",
                story_desc: "Kaise ek cute bhookhe bhalu ne shahar ka sabse best cloud kitchen banaya.",
                story_1_t: "Khoj",
                story_1_d: "Teddy sardiyon mein sona nahi chahta tha. Woh Haldwani ki galiyon mein nikla taaki ekdum desi aur masaledar recipes dhoondh sake.",
                story_2_t: "Secret Ingredients",
                story_2_d: "Haldwani ke fresh masale aur pyaar mila kar, Teddy ne aise dishes banaye jo seedha dil mein utar jayein.",
                story_3_t: "Experience",
                story_3_d: "Har dish Teddy-approved hai. Hum chahte hain aap apne ghar pe baith kar hamare thele wale swaad ka mazaa lein.",
                
                menu_tag: "Pyaar se banaya gaya",
                menu_title: "Teddy ka Signature Menu",
                menu_desc: "Hamare best dishes try karein, roz fresh aur premium ingredients se banaye jate hain.",
                filter_all: "Sab Kuch",
                filter_maggi: "Teddy ki Maggi",
                filter_paratha: "Garam Parathe",
                filter_rice: "Masala Rice",
                filter_pizza: "Desi Pizza",
                filter_beverage: "Kadak Chai",
                
                exp_tag: "Apni Jagah Book Karein",
                exp_title: "Teddy ke Saath Table Reserve Karein",
                exp_desc: "Cloud kitchen mein table nahi hoti, par Teddy aapke dil mein jagah zaroor reserve kar lega!",
                lbl_name: "Aapka Naam",
                ph_name: "Mehmaan ka Naam",
                lbl_guests: "Mehmaan",
                opt_1: "1 Insaan (Teddy aapke saath khayega!)",
                opt_2: "2 Mehmaan",
                opt_4: "4 Mehmaan",
                opt_6: "6+ Party Group",
                lbl_date: "Tarik",
                lbl_time: "Samay",
                btn_confirm: "Reservation Pakki Karein",
                
                cart_title: "Aapki Feast Tray 🍽️",
                cart_empty: "Aapki tray abhi khali hai. Teddy aapke order ka wait kar raha hai!",
                cart_total: "Total:",
                btn_checkout: "Order Place Karein",
                footer_desc: "Garam, swadisht comfort food aur khushiyan seedha aapke ghar tak.",

                /* =====================================
                   MENU ITEMS (TASTE OF HALDWANI)
                   ===================================== */
                menu_m1_t: "Classic Masala Maggi",
                menu_m1_d: "Bina nautanki wali thele-style Maggi, hamare special masalo ke saath.",
                menu_m2_t: "Double Masala Maggi",
                menu_m2_d: "Spicy lovers ke liye! Ekdum kadak aur teekhi maggi.",
                menu_m3_t: "Cheese Maggi",
                menu_m3_d: "Creamy aur cheesy goodness, classic masala ke saath melted.",
                menu_m4_t: "Corn Masala Maggi",
                menu_m4_d: "Sweet corn aur spicy noodles ka mazedar combination.",
                
                menu_p1_t: "Homestyle Aloo Paratha",
                menu_p1_d: "Ghar jaisa swaad, aloo ki mast stuffing aur desi ghee ki khushboo.",
                menu_p2_t: "Jeera Aloo Paratha",
                menu_p2_d: "Jeera wale chatpate aloo se bhara hua crispy paratha.",
                menu_p3_t: "Stuffed Aloo Pyaaz Paratha",
                menu_p3_d: "Pyaaz ka crunch aur aloo ka swaad. Dahi ke saath perfect!",
                
                menu_r1_t: "Street Style Masala Fried Rice",
                menu_r1_d: "Thele wali feel, fresh veggies aur chatpate street-style masalo ke saath.",
                
                menu_pz1_t: "Margherita Pizza",
                menu_pz1_d: "Classic cheese pizza, fresh tamatar aur bahut saare mozzarella ke saath.",
                menu_pz2_t: "Cheesy Onion Pizza",
                menu_pz2_d: "Bhar-bhar ke cheese aur caramelized pyaz ka jadoo.",
                menu_pz3_t: "Sweet Corn Pizza",
                menu_pz3_d: "Crispy base, hamara signature sauce, aur sweet golden corn.",
                
                menu_b1_t: "Kadak Milk Tea",
                menu_b1_d: "Haldwani ki sardi bhagane wali ekdum kadak masaledar chai.",

                /* =====================================
                   DYNAMIC DIALOGUE DICTIONARY
                   ===================================== */
                script_greet: (name) => `Kya baat hai, ${name}! Main Teddy hoon, aapka personal cute sa chef.`,
                script_hungry: (name) => `Mujhe nahi pata aapka, ${name}, par mujhe toh Double Masala Maggi ki yaad aa rahi hai!`,
                msg_lang_changed: "Arre waah! Ab apun Hinglish mein baat karega! 😄",

                flow_new_user: [
                    "Oh, naye mehmaan! Taste of Haldwani by Hungry Teddy mein welcome! 🧸",
                    {
                        text: "Mera special menu dikhane se pehle... main aapko kis naam se bulaun?",
                        action: () => {
                            if (window.App && window.App.modules.dialogue) {
                                window.App.modules.dialogue.showNameInput();
                            }
                        }
                    }
                ],
                flow_return_standard: "Arey {{name}}! Wapas aa gaye? Mujhe pata tha tumhe mere hath ki Kadak Chai aur Parathe ki yaad aayegi! 😄",
                flow_return_morning: "Good morning, {{name}}! ☀️ Nashte mein garam-garam Aloo Paratha ho jaye?",
                flow_return_afternoon: "Good afternoon, {{name}}! Lunch ka time ho gaya, Street Style Fried Rice order kar lein? 🍚",
                flow_return_evening: "Good evening, {{name}}! Sham ki bhookh ke liye ek Cheese Maggi toh banti hai! 🧀",
                flow_return_night: "Itni raat ko bhookh lagi, {{name}}? Tension mat le, tera Chef Teddy Cheesy Onion Pizza bana dega! 🌙",
                
                // Future scalability hooks
                reaction_chef_special: "Chef Teddy ki guarantee, yeh item try nahi kiya toh kya kiya!",
                reaction_cart_add: "Badhiya choice! Cart mein daal diya hai.",
                reaction_checkout: "Khana bas ban hi raha hai, payment karke order finalize kar do!",
                
                flow_festival_new_year: "Happy New Year, {{name}}! 🎉 Naya saal, naya menu, aur naya pet bharne ka bahana!",
                flow_festival_valentines: "Happy Valentine's Day! ❤️ Mera pehla pyaar toh Double Masala Maggi hai... aapka kya hai, {{name}}?",
                flow_festival_independence_india: "Happy Independence Day! 🇮🇳 Chal aaj azaadi ke jashn mein dabake khate hain!",
                flow_festival_halloween: "Bhooo! 👻 Darr gaya? Happy Halloween {{name}}! Paratha order kar warna trick kar dunga!",
                flow_festival_christmas: "Merry Christmas, {{name}}! 🎄 Santa ki tarah main bhi gol-matol hoon, par gifts mein sirf food deta hoon!",
                flow_festival_new_year_eve: "Saal ka aakhiri din hai {{name}}! Aaj diet break karna toh banta hai! 🥳",
                error_fallback: "Oops! Kuch gadbad ho gayi... lagta hai maine code ke upar chai gira di! ☕"
            },

            hindi: {
                loader_sub: "शेफ को जगा रहे हैं...",
                nav_meet: "टेडी से मिलें",
                nav_story: "हमारी कहानी",
                nav_menu: "स्वादिष्ट मेनू",
                nav_exp: "अनुभव",
                nav_contact: "संपर्क करें",
                status_sleep: "सो रहा है...",
                dialogue_init: "Zzz... खर्राटे... (टेडी को जगाने के लिए टैप करें!)",
                name_ask: "टेडी आपको किस नाम से बुलाए?",
                name_ph: "अपना नाम दर्ज करें...",
                name_btn: "परिचय दें",
                btn_menu: "📖 मेनू देखें",
                btn_reserve: "✨ टेबल बुक करें",
                
                desktop_order_title: "अपना पसंदीदा भोजन ऑर्डर करें",
                sheet_title: "अपना पसंदीदा प्लेटफ़ॉर्म चुनें",
                mobile_order: "🍕 खाना ऑर्डर करें",
                btn_call: "📞 रेस्टोरेंट को कॉल करें",
                
                story_tag: "एप्रन के पीछे",
                story_title: "टेस्ट ऑफ़ हल्द्वानी की कहानी",
                story_desc: "कैसे एक प्यारे भूखे भालू ने शहर का सबसे बेहतरीन क्लाउड किचन बनाया।",
                story_1_t: "खोज",
                story_1_d: "टेडी सर्दियों में सोना नहीं चाहता था। वह हल्द्वानी की गलियों में निकल पड़ा ताकि एकदम देसी और मज़ेदार रेसिपी ढूंढ सके।",
                story_2_t: "गुप्त सामग्रियां",
                story_2_d: "हल्द्वानी के ताज़ा मसाले और प्यार मिलाकर, टेडी ने ऐसे व्यंजन बनाए जो सीधा दिल में उतर जाएं।",
                story_3_t: "अनुभव",
                story_3_d: "हर डिश टेडी द्वारा स्वीकृत है। हम चाहते हैं कि आप अपने घर बैठे हमारे ठेले वाले स्वाद का मज़ा लें।",
                
                menu_tag: "प्यार से बनाया गया",
                menu_title: "टेडी का सिग्नेचर मेनू",
                menu_desc: "हमारे बेहतरीन व्यंजनों का आनंद लें, रोज़ ताज़ा और प्रीमियम सामग्री से बनाए जाते हैं।",
                filter_all: "सब कुछ",
                filter_maggi: "टेडी की मैगी",
                filter_paratha: "गरम पराठे",
                filter_rice: "मसाला राइस",
                filter_pizza: "देसी पिज़्ज़ा",
                filter_beverage: "कड़क चाय",
                
                exp_tag: "अपनी जगह बुक करें",
                exp_title: "टेडी के साथ टेबल रिजर्व करें",
                exp_desc: "क्लाउड किचन में टेबल नहीं होती, पर टेडी आपके दिल में जगह ज़रूर रिज़र्व कर लेगा!",
                lbl_name: "आपका नाम",
                ph_name: "अतिथि का नाम",
                lbl_guests: "मेहमान",
                opt_1: "1 व्यक्ति (टेडी आपके साथ खाएगा!)",
                opt_2: "2 मेहमान",
                opt_4: "4 मेहमान",
                opt_6: "6+ बड़ी पार्टी",
                lbl_date: "तारीख",
                lbl_time: "समय",
                btn_confirm: "आरक्षण पक्का करें",
                
                cart_title: "आपकी फूड ट्रे 🍽️",
                cart_empty: "आपकी ट्रे अभी खाली है। टेडी आपके ऑर्डर की प्रतीक्षा कर रहा है!",
                cart_total: "कुल:",
                btn_checkout: "ऑर्डर दें",
                footer_desc: "गर्म, स्वादिष्ट कम्फर्ट फूड और खुशियां सीधा आपके घर तक।",

                menu_m1_t: "क्लासिक मसाला मैगी",
                menu_m1_d: "बिना नौटंकी वाली ठेले-स्टाइल मैगी, हमारे खास मसालों के साथ।",
                menu_m2_t: "डबल मसाला मैगी",
                menu_m2_d: "तीखा खाने वालों के लिए! एकदम कड़क और मसालेदार मैगी।",
                menu_m3_t: "चीज़ मैगी",
                menu_m3_d: "क्रीमी और चीज़ी गुडनेस, क्लासिक मसाले के साथ।",
                menu_m4_t: "कॉर्न मसाला मैगी",
                menu_m4_d: "स्वीट कॉर्न और स्पाइसी नूडल्स का मज़ेदार कॉम्बिनेशन।",
                
                menu_p1_t: "होमस्टाइल आलू पराठा",
                menu_p1_d: "घर जैसा स्वाद, आलू की मस्त स्टफिंग और देसी घी की खुशबू।",
                menu_p2_t: "जीरा आलू पराठा",
                menu_p2_d: "जीरा वाले चटपटे आलू से भरा हुआ क्रिस्पी पराठा।",
                menu_p3_t: "स्टफ्ड आलू प्याज़ पराठा",
                menu_p3_d: "प्याज़ का क्रंच और आलू का स्वाद। दही के साथ परफेक्ट!",
                
                menu_r1_t: "स्ट्रीट स्टाइल मसाला फ्राइड राइस",
                menu_r1_d: "ठेले वाली फील, ताज़ा सब्ज़ियों और चटपटे स्ट्रीट-स्टाइल मसालों के साथ।",
                
                menu_pz1_t: "मार्गेरिटा पिज़्ज़ा",
                menu_pz1_d: "क्लासिक चीज़ पिज़्ज़ा, ताज़ा टमाटर और बहुत सारे मोज़ेरेला के साथ।",
                menu_pz2_t: "चीज़ी अनियन पिज़्ज़ा",
                menu_pz2_d: "भर-भर के चीज़ और कैरामेलाइज़्ड प्याज़ का जादू।",
                menu_pz3_t: "स्वीट कॉर्न पिज़्ज़ा",
                menu_pz3_d: "क्रिस्पी बेस, हमारा सिग्नेचर सॉस, और स्वीट गोल्डन कॉर्न।",
                
                menu_b1_t: "कड़क मिल्क टी",
                menu_b1_d: "हल्द्वानी की सर्दी भगाने वाली एकदम कड़क मसालेदार चाय।",
                script_greet: (name) => `क्या बात है, ${name}! मैं टेडी हूँ, आपका पर्सनल क्यूट सा शेफ।`,
                script_hungry: (name) => `मुझे आपका तो पता नहीं, ${name}, पर मुझे तो डबल मसाला मैगी की याद आ रही है!`,
                msg_lang_changed: "अरे वाह! अब मैं हिन्दी में बात करूँगा। 😊",

                flow_new_user: [
                    "ओह, नए मेहमान! टेस्ट ऑफ़ हल्द्वानी बाय हंग्री टेडी में स्वागत है! 🧸",
                    {
                        text: "मेरा स्पेशल मेनू दिखाने से पहले... मैं आपको किस नाम से बुलाऊँ?",
                        action: () => {
                            if (window.App && window.App.modules.dialogue) {
                                window.App.modules.dialogue.showNameInput();
                            }
                        }
                    }
                ],
                flow_return_standard: "अरे {{name}}! आप वापस आ गए? मुझे पता था आपको मेरे हाथ की कड़क चाय और पराठे की याद आएगी! 😄",
                flow_return_morning: "सुप्रभात, {{name}}! ☀️ नाश्ते में गरम-गरम आलू पराठा हो जाए?",
                flow_return_afternoon: "गुड आफ्टरनून, {{name}}! लंच का समय हो गया है, स्ट्रीट स्टाइल फ्राइड राइस ऑर्डर कर लें? 🍚",
                flow_return_evening: "शुभ संध्या, {{name}}! शाम की भूख के लिए एक चीज़ मैगी तो बनती है! 🧀",
                flow_return_night: "इतनी रात को भूख लगी है, {{name}}? चिंता मत करो, आपका शेफ टेडी चीज़ी अनियन पिज़्ज़ा बना देगा! 🌙",
                
                reaction_chef_special: "शेफ टेडी की गारंटी, यह आइटम ट्राई नहीं किया तो क्या किया!",
                reaction_cart_add: "बढ़िया चॉइस! कार्ट में डाल दिया है।",
                reaction_checkout: "खाना बस बन ही रहा है, पेमेंट करके ऑर्डर फाइनल कर दो!",
                
                flow_festival_new_year: "नव वर्ष की शुभकामनाएँ, {{name}}! 🎉 नया साल, नया मेनू, और नया पेट भरने का बहाना!",
                flow_festival_valentines: "हैप्पी वैलेंटाइन्स डे! ❤️ मेरा पहला प्यार तो डबल मसाला मैगी है... आपका क्या है, {{name}}?",
                flow_festival_independence_india: "स्वतंत्रता दिवस की शुभकामनाएँ! 🇮🇳 चलिए आज आज़ादी के जश्न में जमकर खाते हैं!",
                flow_festival_halloween: "भूहू! 👻 डर गए? हैप्पी हैलोवीन {{name}}! पराठा ऑर्डर करो वरना मैं डरा दूंगा!",
                flow_festival_christmas: "मेरी क्रिसमस, {{name}}! 🎄 सांता की तरह मैं भी गोल-मटोल हूँ, पर गिफ्ट्स में सिर्फ खाना देता हूँ!",
                flow_festival_new_year_eve: "साल का आखिरी दिन है {{name}}! आज डाइट ब्रेक करना तो बनता है! 🥳",
                error_fallback: "उफ़! कुछ गड़बड़ हो गई... लगता है मैंने कोड के ऊपर चाय गिरा दी! ☕"
            },

            english: {
                loader_sub: "Waking up the chef...",
                nav_meet: "Meet Teddy",
                nav_story: "Our Story",
                nav_menu: "Gourmet Menu",
                nav_exp: "Experience",
                nav_contact: "Find Us",
                status_sleep: "Sleeping...",
                dialogue_init: "Zzz... Snore... (Tap on Teddy to wake him up!)",
                name_ask: "What should Teddy call you?",
                name_ph: "Enter your name...",
                name_btn: "Introduce",
                btn_menu: "📖 View Menu",
                btn_reserve: "✨ Reserve Table",
                
                desktop_order_title: "Order Your Favorite Food",
                sheet_title: "Choose Your Favorite Platform",
                mobile_order: "🍕 Order Food",
                btn_call: "📞 Call Restaurant",
                
                story_tag: "Behind The Apron",
                story_title: "The Story of Taste of Haldwani",
                story_desc: "How a cute food-loving bear created the city's favorite cloud kitchen.",
                story_1_t: "The Discovery",
                story_1_d: "Teddy didn't want to hibernate; winter was far too long. He ventured into the streets of Haldwani to find the best desi and spicy recipes.",
                story_2_t: "The Secret Ingredients",
                story_2_d: "Combining fresh local spices with lots of love, Teddy perfected dishes that warm the heart.",
                story_3_t: "The Experience",
                story_3_d: "Every plate served is Teddy-approved. We want you to enjoy authentic street-style flavors right from your home.",
                
                menu_tag: "Crafted With Love",
                menu_title: "Teddy's Signature Menu",
                menu_desc: "Explore our curated offerings, cooked fresh daily with premium ingredients.",
                filter_all: "All Delights",
                filter_maggi: "Teddy's Maggi",
                filter_paratha: "Hot Parathas",
                filter_rice: "Masala Rice",
                filter_pizza: "Desi Pizza",
                filter_beverage: "Kadak Chai",
                
                exp_tag: "Book Your Corner",
                exp_title: "Reserve A Table With Teddy",
                exp_desc: "We're a cloud kitchen so we don't have tables, but Teddy will definitely reserve a spot in your heart!",
                lbl_name: "Your Name",
                ph_name: "Guest Name",
                lbl_guests: "Guests",
                opt_1: "1 Person (Teddy will join you!)",
                opt_2: "2 Guests",
                opt_4: "4 Guests",
                opt_6: "6+ Party Group",
                lbl_date: "Date",
                lbl_time: "Time",
                btn_confirm: "Confirm Reservation",
                
                cart_title: "Your Feast Tray 🍽️",
                cart_empty: "Your tray is currently empty. Teddy is waiting for your order!",
                cart_total: "Total:",
                btn_checkout: "Proceed to Order",
                footer_desc: "Bringing warmth, delicious comfort food, and joy straight to your home.",

                menu_m1_t: "Classic Masala Maggi",
                menu_m1_d: "The timeless street-style comfort bowl, tossed with signature spices.",
                menu_m2_t: "Double Masala Maggi",
                menu_m2_d: "For the spice lovers! An extra kick of our secret masala blend.",
                menu_m3_t: "Cheese Maggi",
                menu_m3_d: "Creamy, gooey goodness melting into classic masala noodles.",
                menu_m4_t: "Corn Masala Maggi",
                menu_m4_d: "Sweet golden corn kernels folded into hot, spicy masala noodles.",
                
                menu_p1_t: "Homestyle Aloo Paratha",
                menu_p1_d: "Soft flatbread stuffed with spiced mashed potatoes, roasted perfectly.",
                menu_p2_t: "Jeera Aloo Paratha",
                menu_p2_d: "A comforting twist with cumin-tempered potatoes inside a crisp crust.",
                menu_p3_t: "Stuffed Aloo Pyaaz Paratha",
                menu_p3_d: "Loaded with crispy onions and spiced potatoes. Served hot and fresh.",
                
                menu_r1_t: "Street Style Masala Fried Rice",
                menu_r1_d: "Wok-tossed long-grain rice with fresh vegetables and zesty spices.",
                
                menu_pz1_t: "Margherita Pizza",
                menu_pz1_d: "Classic crust with rich tomato base and molten mozzarella cheese.",
                menu_pz2_t: "Cheesy Onion Pizza",
                menu_pz2_d: "Generously topped with caramelized onions and premium melted cheese.",
                menu_pz3_t: "Sweet Corn Pizza",
                menu_pz3_d: "Crispy crust layered with signature sauce and sweet golden corn.",
                
                menu_b1_t: "Kadak Milk Tea",
                menu_b1_d: "Authentic, strong Indian chai brewed with aromatic spices.",
                script_greet: (name) => `Nice to meet you, ${name}! I'm Teddy, your personal cute chef.`,
                script_hungry: (name) => `I don't know about you, ${name}, but my tummy is craving Double Masala Maggi!`,
                msg_lang_changed: "Awesome! Let's chat in English! 👋",

                flow_new_user: [
                    "Oh, a new guest! Welcome to Taste of Haldwani by Hungry Teddy! 🧸",
                    {
                        text: "Before I show you my special menu... what should I call you?",
                        action: () => {
                            if (window.App && window.App.modules.dialogue) {
                                window.App.modules.dialogue.showNameInput();
                            }
                        }
                    }
                ],
                flow_return_standard: "Hey {{name}}! You're back! I knew you'd miss my Kadak Chai and Parathas! 😄",
                flow_return_morning: "Good morning, {{name}}! ☀️ How about some hot Aloo Paratha to start the day?",
                flow_return_afternoon: "Good afternoon, {{name}}! It's lunch time, should we order the Street Style Fried Rice? 🍚",
                flow_return_evening: "Good evening, {{name}}! Evening cravings definitely call for a Cheese Maggi! 🧀",
                flow_return_night: "Hungry this late, {{name}}? Don't worry, Chef Teddy will make you a Cheesy Onion Pizza! 🌙",

                reaction_chef_special: "Chef Teddy's guarantee, you have to try this one!",
                reaction_cart_add: "Great choice! Added to your tray.",
                reaction_checkout: "The food is almost ready, just finalize the payment!",
                
                flow_festival_new_year: "Happy New Year, {{name}}! 🎉 New year, new menu, and a new excuse to eat!",
                flow_festival_valentines: "Happy Valentine's Day! ❤️ My first love is Double Masala Maggi... what's yours, {{name}}?",
                flow_festival_independence_india: "Happy Independence Day! 🇮🇳 Let's celebrate freedom with a massive feast today!",
                flow_festival_halloween: "Bhooo! 👻 Did I scare you? Happy Halloween {{name}}! Order a Paratha or I'll trick you!",
                flow_festival_christmas: "Merry Christmas, {{name}}! 🎄 I'm round like Santa, but I only gift food!",
                flow_festival_new_year_eve: "It's the last day of the year, {{name}}! Dieting is officially canceled today! 🥳",
                error_fallback: "Oops! Something went wrong... I think I spilled chai on the code! ☕"
            }
        };

        this.uiMap = [
            { s: '.loader-subtitle', k: 'loader_sub' },
            { s: '.nav-list li:nth-child(1) a', k: 'nav_meet' },
            { s: '.nav-list li:nth-child(2) a', k: 'nav_story' },
            { s: '.nav-list li:nth-child(3) a', k: 'nav_menu' },
            { s: '.nav-list li:nth-child(4) a', k: 'nav_exp' },
            { s: '.nav-list li:nth-child(5) a', k: 'nav_contact' },
            
            { s: '#desktop-order-title', k: 'desktop_order_title' },
            { s: '#sheet-title', k: 'sheet_title' },
            { s: '#mobile-order-btn', k: 'mobile_order' },
            { s: '.call-btn', k: 'btn_call' }, 
            
            { s: '#teddy-status-badge', k: 'status_sleep', ifNotAwake: true },
            { s: '#dialogue-text', k: 'dialogue_init', ifNotAwake: true },
            { s: '#name-input-card .card-title', k: 'name_ask' },
            { s: '#user-name-input', k: 'name_ph', attr: 'placeholder' },
            { s: '#name-submit-btn', k: 'name_btn' },
            { s: '#quick-action-bar button:nth-child(1)', k: 'btn_menu' },
            { s: '#quick-action-bar button:nth-child(2)', k: 'btn_reserve' },
            { s: '#story .section-tagline', k: 'story_tag' },
            { s: '#story .section-title', k: 'story_title' },
            { s: '#story .section-description', k: 'story_desc' },
            { s: '#story .story-card:nth-child(1) h3', k: 'story_1_t' },
            { s: '#story .story-card:nth-child(1) p', k: 'story_1_d' },
            { s: '#story .story-card:nth-child(2) h3', k: 'story_2_t' },
            { s: '#story .story-card:nth-child(2) p', k: 'story_2_d' },
            { s: '#story .story-card:nth-child(3) h3', k: 'story_3_t' },
            { s: '#story .story-card:nth-child(3) p', k: 'story_3_d' },
            { s: '#menu .section-tagline', k: 'menu_tag' },
            { s: '#menu .section-title', k: 'menu_title' },
            { s: '#menu .section-description', k: 'menu_desc' },
            { s: '.filter-btn[data-category="all"]', k: 'filter_all' },
            { s: '.filter-btn[data-category="maggi"]', k: 'filter_maggi' },
            { s: '.filter-btn[data-category="paratha"]', k: 'filter_paratha' },
            { s: '.filter-btn[data-category="rice"]', k: 'filter_rice' },
            { s: '.filter-btn[data-category="pizza"]', k: 'filter_pizza' },
            { s: '.filter-btn[data-category="beverage"]', k: 'filter_beverage' },
            { s: '#experience .section-tagline', k: 'exp_tag' },
            { s: '#experience .section-title', k: 'exp_title' },
            { s: '.reservation-content > p', k: 'exp_desc' },
            { s: 'label[for="res-name"]', k: 'lbl_name' },
            { s: '#res-name', k: 'ph_name', attr: 'placeholder' },
            { s: 'label[for="res-guests"]', k: 'lbl_guests' },
            { s: '#res-guests option[value="1"]', k: 'opt_1' },
            { s: '#res-guests option[value="2"]', k: 'opt_2' },
            { s: '#res-guests option[value="4"]', k: 'opt_4' },
            { s: '#res-guests option[value="6"]', k: 'opt_6' },
            { s: 'label[for="res-date"]', k: 'lbl_date' },
            { s: 'label[for="res-time"]', k: 'lbl_time' },
            { s: '#reservation-form button[type="submit"]', k: 'btn_confirm' },
            { s: '.drawer-header h3', k: 'cart_title' },
            { s: '.empty-cart-msg', k: 'cart_empty' },
            { s: '.cart-total-row span:nth-child(1)', k: 'cart_total' },
            { s: '#checkout-btn', k: 'btn_checkout' },
            { s: '.footer-brand p', k: 'footer_desc' }
        ];
    }

    init() {
        this.injectLanguageDropdown();
        this.translateStaticDOM();
        this._bindEvents();
        this.hookIntoApp();
    }

    _bindEvents() {
        if (window.AppEventBus && window.Constants) {
            window.AppEventBus.subscribe(window.Constants.EVENTS.REQUEST_DIALOGUE, (data) => {
                if (!data || !data.key) return;
                const sequence = this.getDialogueSequence(data.key, data.vars);
                if (window.App && window.App.modules.dialogue) {
                    window.App.modules.dialogue.playSequence(sequence);
                }
            });
        }
    }

    _getTranslation(key) {
        const langData = this.translations[this.currentLang] || this.translations[this.defaultLang];
        const fallbackData = this.translations[this.defaultLang];
        return langData[key] !== undefined ? langData[key] : fallbackData[key];
    }

    _interpolate(str, vars) {
        if (!str || typeof str !== 'string') return str;
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return vars[key] !== undefined ? vars[key] : '';
        });
    }

    getDialogueSequence(key, vars = {}) {
        const langDict = this.translations[this.currentLang] || this.translations[this.defaultLang];
        const fallbackDict = this.translations[this.defaultLang];
        
        let entry = langDict[key] !== undefined ? langDict[key] : fallbackDict[key];
        if (entry === undefined) entry = fallbackDict['error_fallback'];

        if (typeof entry === 'function') {
            entry = entry(vars);
        }

        const sequence = Array.isArray(entry) ? [...entry] : [entry];

        return sequence.map(step => {
            if (typeof step === 'string') {
                return this._interpolate(step, vars);
            } else if (typeof step === 'object' && step !== null && step.text) {
                const clonedStep = { ...step };
                clonedStep.text = this._interpolate(clonedStep.text, vars);
                return clonedStep;
            }
            return step;
        });
    }

    injectLanguageDropdown() {
        const actionsContainer = document.querySelector('.header-actions');
        if (!actionsContainer) return;

        const select = document.createElement('select');
        select.id = 'lang-selector';
        select.className = 'glass-btn';
        select.setAttribute('aria-label', 'Select Language');
        
        Object.assign(select.style, {
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--border-radius-pill, 50px)',
            border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.08))',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--text-primary, #ffffff)',
            fontFamily: 'var(--font-heading, sans-serif)',
            fontWeight: '500',
            fontSize: '0.875rem',
            cursor: 'pointer',
            outline: 'none',
            marginRight: '0.5rem'
        });

        const options = [
            { val: 'hinglish', text: '🇮🇳 Hinglish' },
            { val: 'hindi', text: '🇮🇳 हिन्दी' },
            { val: 'english', text: '🇺🇸 English' }
        ];

        const frag = document.createDocumentFragment();
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.val;
            o.textContent = opt.text;
            o.style.background = '#12141d'; 
            o.style.color = '#ffffff';
            if (opt.val === this.currentLang) o.selected = true;
            frag.appendChild(o);
        });
        
        select.appendChild(frag);
        select.addEventListener('change', (e) => this.setLanguage(e.target.value));

        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn) {
            actionsContainer.insertBefore(select, soundBtn);
        } else {
            actionsContainer.prepend(select);
        }
    }

    translateStaticDOM() {
        if (!this.cachedUI) {
            this.cachedUI = this.uiMap.map(item => ({
                ...item,
                elements: document.querySelectorAll(item.s)
            }));
        }

        const isAwake = window.App?.modules?.teddy?.isAwake;

        this.cachedUI.forEach(item => {
            if (item.ifNotAwake && isAwake) return;

            const translatedText = this._getTranslation(item.k);
            if (!translatedText) return;

            item.elements.forEach(el => {
                if (item.attr) {
                    el.setAttribute(item.attr, translatedText);
                } else {
                    el.textContent = translatedText;
                }
            });
        });
    }

    hookIntoApp() {
        requestAnimationFrame(() => {
            if (window.App && window.App.bootstrapModules) {
                const originalBootstrap = window.App.bootstrapModules;
                window.App.bootstrapModules = function() {
                    originalBootstrap.call(this);
                    window.LanguageController.applyToModules(false);
                };
            }
        });
    }

    setLanguage(lang) {
        if (!this.translations[lang]) lang = this.defaultLang;
        
        this.currentLang = lang;
        try { localStorage.setItem('teddy_lang', lang); } catch(e) {}
        
        this.translateStaticDOM();
        this.applyToModules(true);
    }

    applyToModules(announceChange = false) {
        if (!window.App || !window.App.modules) return;
        const modules = window.App.modules;

        if (modules.dialogue) {
            modules.dialogue.scripts = {
                sleep: this.getDialogueSequence('script_sleep'),
                wakeUp: this.getDialogueSequence('script_wakeup'),
                askName: this._getTranslation('script_askname'),
                greetUser: (name) => this.getDialogueSequence('script_greet', {name})[0],
                hungry: (name) => this.getDialogueSequence('script_hungry', {name})[0],
                menuIntro: this._getTranslation('script_menuintro'),
                idle: this.getDialogueSequence('script_idle')
            };

            if (announceChange && modules.teddy?.isAwake) {
                modules.dialogue.skipTyping();
                modules.dialogue.playSequence(this.getDialogueSequence('msg_lang_changed'));
            }
        }

        if (modules.menu) {
            const menu = modules.menu;
            menu.menuData.forEach(item => {
                item.title = this._getTranslation(`menu_${item.id}_t`) || item.title;
                item.desc = this._getTranslation(`menu_${item.id}_d`) || item.desc;
            });

            if (!menu._langPatched) {
                const originalUpdateCartUI = menu.updateCartUI;
                menu.updateCartUI = function() {
                    originalUpdateCartUI.call(menu);
                    const emptyMsg = document.querySelector('.empty-cart-msg');
                    if (emptyMsg) {
                        emptyMsg.textContent = window.LanguageController._getTranslation('cart_empty');
                    }
                };
                menu._langPatched = true;
            }

            if (menu.currentCategory) {
                menu.renderMenu(menu.currentCategory);
            }
            menu.updateCartUI();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.LanguageController = new LanguageController();
    window.LanguageController.init();
});
