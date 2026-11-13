/**
 * Search content for m04.shop: the brand names people type, the product words they
 * search for, and a written introduction for each category page. French is what most
 * Moroccan shoppers type in Google, so titles and meta descriptions are French; the
 * pages also carry the Darija text shown in the store.
 */

export const BRAND_NAMES = ["m04.shop", "M04 Shop", "m04", "M04", "m04shop", "m04 shop"];

export const SITE_KEYWORDS = [
  "m04", "m04 shop", "m04.shop", "m04shop", "boutique tech Maroc", "accessoires tech Maroc",
  "AirPods Maroc", "AirPods prix Maroc", "écouteurs sans fil Maroc", "écouteur bluetooth Maroc",
  "support PC portable Maroc", "support laptop Maroc", "chargeur rapide Maroc", "chargeur iPhone Maroc",
  "power bank Maroc", "batterie externe Maroc", "montre connectée Maroc", "accessoires téléphone Maroc",
  "paiement à la livraison", "livraison partout au Maroc", "Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès",
];

type CategorySeo = {
  /** Page heading and <title>, in French. */
  title: string;
  /** Darija heading shown under the French title. */
  titleAry: string;
  description: string;
  intro: { fr: string; ary: string };
  keywords: string[];
};

const CATEGORY_SEO: Record<string, CategorySeo> = {
  "supports-pc": {
    title: "Supports PC portable au Maroc",
    titleAry: "حوامل الحاسوب فالمغرب",
    description: "Supports PC portable et laptop réglables au Maroc : posture plus droite, ordinateur mieux ventilé. Paiement à la livraison, livraison partout au Maroc.",
    intro: {
      fr: "Un support PC portable remonte l’écran à hauteur des yeux : moins de douleurs au cou et au dos, et un ordinateur qui chauffe moins. Nos supports en aluminium sont réglables, pliables et tiennent dans un sac. Vous commandez en ligne, vous payez à la livraison, partout au Maroc.",
      ary: "الحامل ديال الحاسوب كيطلّع الشاشة لمستوى العينين: ما بقاش الضهر والرقبة كيوجعوك، والحاسوب كيسخن أقل. الحوامل ديالنا من الألومنيوم، كيتعدلو وكيتطواو وكيدخلو فالصاك. طلب أونلاين وخلّص ملي توصلك السلعة فاي مدينة فالمغرب.",
    },
    keywords: ["support PC portable Maroc", "support laptop Maroc", "support ordinateur portable", "support MacBook Maroc", "حامل الحاسوب"],
  },
  airpods: {
    title: "AirPods au Maroc : AirPods Pro, AirPods 3 et 4",
    titleAry: "AirPods فالمغرب",
    description: "AirPods au Maroc au meilleur prix : AirPods Pro, AirPods 3, AirPods 4. Livraison partout au Maroc et paiement à la livraison sur m04.shop.",
    intro: {
      fr: "Retrouvez nos AirPods : AirPods Pro avec réduction de bruit, AirPods 3 et AirPods 4, avec leur boîtier de charge. Chaque modèle est présenté avec son prix en dirhams, ses couleurs et nos offres à partir de 2 pièces. Paiement à la livraison et livraison dans toutes les villes du Maroc.",
      ary: "لقا عندنا AirPods: AirPods Pro بعزل الصوت، AirPods 3 و AirPods 4 مع البواط ديال الشحن. كل موديل فيه الثمن بالدرهم، الألوان والعروض من حبتين وفوق. خلّص ملي توصلك السلعة، والتوصيل لجميع مدن المغرب.",
    },
    keywords: ["AirPods Maroc", "AirPods Pro Maroc", "AirPods prix Maroc", "AirPods 4 Maroc", "AirPods 3 Maroc"],
  },
  audio: {
    title: "Écouteurs sans fil et audio au Maroc",
    titleAry: "سماعات بلا خيط فالمغرب",
    description: "Écouteurs sans fil Bluetooth, intra-auriculaires et casques au Maroc. Bon son, bonne autonomie, paiement à la livraison partout au Maroc.",
    intro: {
      fr: "Écouteurs sans fil Bluetooth pour le sport, le travail ou les appels : nous choisissons des modèles avec un son clair, un micro net et une bonne autonomie. Comparez les prix en dirhams, choisissez votre couleur et payez à la livraison, où que vous soyez au Maroc.",
      ary: "سماعات بلا خيط بالبلوتوث للرياضة، الخدمة ولا المكالمات: كنختارو موديلات فيهم صوت واضح، ميكرو نقي وباطري كتدوم. قارن الأثمنة بالدرهم، اختار اللون ديالك وخلّص ملي توصلك السلعة فاي بلاصة فالمغرب.",
    },
    keywords: ["écouteurs sans fil Maroc", "écouteur bluetooth Maroc", "kitman bluetooth", "casque bluetooth Maroc", "سماعات بلوتوث"],
  },
  chargeurs: {
    title: "Chargeurs rapides au Maroc",
    titleAry: "الشواحن السريعة فالمغرب",
    description: "Chargeurs rapides USB-C 20W et plus, câbles et chargeurs iPhone et Samsung au Maroc. Paiement à la livraison, livraison partout au Maroc.",
    intro: {
      fr: "Un bon chargeur rapide recharge votre téléphone en moitié moins de temps sans abîmer la batterie. Nous proposons des chargeurs USB-C Power Delivery pour iPhone, Samsung et les autres smartphones, ainsi que les câbles qui vont avec. Paiement à la livraison partout au Maroc.",
      ary: "الشارجور السريع كيشارجي التليفون فنص الوقت بلا ما يخسر الباطري. عندنا شواحن USB-C Power Delivery للآيفون، سامسونغ وباقي التليفونات، والكابلات ديالهم. خلّص ملي توصلك السلعة فجميع مدن المغرب.",
    },
    keywords: ["chargeur rapide Maroc", "chargeur iPhone Maroc", "chargeur Samsung Maroc", "chargeur 20W", "chargeur USB-C Maroc", "شارجور"],
  },
  energie: {
    title: "Power banks et batteries externes au Maroc",
    titleAry: "باور بانك فالمغرب",
    description: "Power banks et batteries externes 10 000 à 20 000 mAh au Maroc, charge rapide. Paiement à la livraison, livraison partout au Maroc.",
    intro: {
      fr: "Une power bank garde votre téléphone allumé en voyage, au travail ou pendant une coupure. Choisissez la capacité qu’il vous faut, de 10 000 à 20 000 mAh, avec charge rapide et plusieurs sorties. Livraison dans tout le Maroc, paiement à la réception.",
      ary: "الباور بانك كيخلّي التليفون ديالك شاعل فالسفر، فالخدمة ولا ملي كيطفى الضو. اختار الكابيسيتي اللي محتاج، من 10 000 حتى 20 000 mAh، بشحن سريع وبزاف ديال المخارج. التوصيل لجميع المغرب والخلاص ملي توصلك.",
    },
    keywords: ["power bank Maroc", "batterie externe Maroc", "power bank 20000mAh", "باور بانك"],
  },
  watch: {
    title: "Montres connectées au Maroc",
    titleAry: "الساعات الذكية فالمغرب",
    description: "Montres connectées et smartwatches au Maroc : notifications, sport, santé. Paiement à la livraison, livraison partout au Maroc.",
    intro: {
      fr: "Une montre connectée affiche vos notifications, compte vos pas et suit votre sommeil et votre rythme cardiaque. Nos smartwatches fonctionnent avec iPhone et Android. Commandez en ligne et payez à la livraison, partout au Maroc.",
      ary: "الساعة الذكية كتوريك النوتيفيكاسيون، كتحسب الخطوات وكتتبع النعاس ودقات القلب. الساعات ديالنا كيخدمو مع الآيفون والأندرويد. طلب أونلاين وخلّص ملي توصلك السلعة فجميع المغرب.",
    },
    keywords: ["montre connectée Maroc", "smartwatch Maroc", "montre intelligente Maroc", "ساعة ذكية"],
  },
  accessoires: {
    title: "Accessoires téléphone et PC au Maroc",
    titleAry: "إكسسوارات التليفون والحاسوب فالمغرب",
    description: "Accessoires tech au Maroc pour téléphone et ordinateur. Prix en dirhams, paiement à la livraison, livraison partout au Maroc.",
    intro: {
      fr: "Les petits accessoires qui changent le quotidien : pour votre téléphone, votre ordinateur et votre bureau. Chaque produit est choisi pour sa qualité et son prix. Paiement à la livraison et livraison dans toutes les villes du Maroc.",
      ary: "الإكسسوارات الصغار اللي كيسهلو عليك النهار: للتليفون، الحاسوب والمكتب. كل منتوج مختار على حساب الجودة والثمن. خلّص ملي توصلك السلعة، والتوصيل لجميع مدن المغرب.",
    },
    keywords: ["accessoires téléphone Maroc", "accessoires PC Maroc", "accessoires tech Maroc"],
  },
};

const LABELS: Record<string, string> = {
  bureau: "Accessoires de bureau",
  pc: "Accessoires PC",
  phone: "Accessoires téléphone",
};

/** Search content for a category; categories without written copy get a generated one. */
export function categorySeo(slug: string, name: string): CategorySeo {
  const known = CATEGORY_SEO[slug];
  if (known) return known;
  const label = LABELS[slug] ?? name;
  return {
    title: `${label} au Maroc`,
    titleAry: `${name} فالمغرب`,
    description: `${label} au meilleur prix au Maroc sur m04.shop. Paiement à la livraison, livraison partout au Maroc.`,
    intro: {
      fr: `Découvrez notre sélection ${label.toLowerCase()} : des produits choisis pour leur qualité, avec leur prix en dirhams. Vous payez à la livraison, partout au Maroc.`,
      ary: `اكتاشف الاختيارات ديالنا ديال ${name}: منتوجات مختارة على حساب الجودة، بالثمن بالدرهم. خلّص ملي توصلك السلعة فجميع المغرب.`,
    },
    keywords: [`${label} Maroc`, `${name} prix Maroc`],
  };
}

export function categoryPath(slug: string): string {
  return `/categories/${encodeURIComponent(slug)}`;
}
