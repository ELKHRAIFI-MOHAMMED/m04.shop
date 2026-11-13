"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type Language = "fr" | "ary";

const messages = {
  fr: {
    shipping: "Livraison partout au Maroc · Paiement à la livraison",
    home: "Accueil",
    shop: "La boutique",
    categories: "Catégories",
    offers: "Nouveautés",
    search: "Rechercher un produit…",
    searchLabel: "Rechercher",
    cart: "Panier",
    light: "Passer au thème clair",
    dark: "Passer au thème sombre",
    language: "الدارجة",
    eyebrow: "La technologie, en mieux",
    tagline: "Tech & accessoires",
    heroTitle: "Le bon choix.\nAu bon prix.",
    heroText: "Des accessoires tech utiles, sélectionnés avec soin et livrés jusque chez vous.",
    discover: "Découvrir la boutique",
    seeOffers: "Voir les nouveautés",
    freeDelivery: "Livraison partout au Maroc",
    cod: "Paiement à la livraison",
    support: "Une équipe à votre écoute",
    ourCategories: "Votre univers tech",
    categoryIntro: "Les bons accessoires pour chaque jour.",
    allProducts: "Les essentiels du moment",
    productsFound: "produit(s)",
    new: "Nouveau",
    best: "Best-seller",
    sale: "Promo",
    add: "Ajouter au panier",
    unavailable: "Indisponible",
    adding: "Ajout…",
    added: "Ajouté au panier",
    addError: "Ajout impossible. Réessayez.",
    all: "Tout voir",
    sort: "Trier par",
    recent: "Nouveautés",
    priceLow: "Prix croissant",
    priceHigh: "Prix décroissant",
    inStock: "En stock",
    min: "Prix min.",
    max: "Prix max.",
    clear: "Effacer les filtres",
    noProducts: "Aucun produit ne correspond à votre recherche.",
    viewProduct: "Voir le produit",
    priceFrom: "À partir de",
    footerText: "La technologie utile, choisie avec soin.",
    quickLinks: "Navigation",
    help: "Besoin d’aide ?",
    contact: "Contactez-nous",
    rights: "Tous droits réservés.",
    selected: "Sélectionné pour vous",
    stock: "En stock",
    outOfStock: "Rupture de stock",
    description: "Description",
    variants: "Choisissez une option",
    back: "Retour à la boutique",
    subtotal: "Sous-total",
    catalogTitle: "La boutique m04.shop",
    catalogText: "Parcourez notre sélection et trouvez l’accessoire qu’il vous faut.",
    filterCategory: "Catégorie",
    filters: "Filtres",
    loading: "Chargement…",
    loadError: "La boutique est momentanément indisponible. Vérifiez la connexion et réessayez.",
    retry: "Réessayer",
    noImage: "Photo à venir",
    productNotFound: "Ce produit est introuvable ou n’est plus disponible.",
    quantity: "Quantité",
    buyNow: "Ajouter au panier",
    trustTitle: "Achetez en toute confiance",
    trustText: "Paiement à la livraison, produits sélectionnés et livraison partout au Maroc.",
    cartTitle: "Votre panier",
    emptyCart: "Votre panier est vide.",
    continueShopping: "Continuer vos achats",
    deliveryOrder: "Livraison et commande",
    fullName: "Nom complet",
    phone: "Téléphone",
    city: "Ville",
    address: "Adresse",
    deliveryNote: "Note pour la livraison (facultatif)",
    confirmOrder: "Confirmer la commande",
    processing: "Traitement…",
    remove: "Retirer",
    decreaseQuantity: "Diminuer la quantité",
    increaseQuantity: "Augmenter la quantité",
    cartLoadError: "Impossible de charger le panier.",
    cartUpdateError: "Stock insuffisant ou mise à jour impossible.",
    cartRemoveError: "Impossible de retirer cet article.",
    orderError: "La commande n’a pas pu être enregistrée. Vérifiez vos informations et réessayez.",
    orderReceived: "Commande reçue",
    thankYou: "Merci pour votre commande.",
    reference: "Référence",
    total: "Total",
    emptyProduct: "Aucun produit disponible pour le moment.",
    productGallery: "Galerie du produit",
    chooseOffer: "Choisissez votre offre",
    onePiece: "1 pièce",
    color: "Couleur",
    perUnit: "la pièce",
    saveLabel: "Économisez",
    viewCart: "Voir le panier et commander",
    district: "Quartier (facultatif)",
    yourOrder: "Votre commande",
    offerLabel: "Offre",
    lineError: "Ce choix n’est pas disponible. Choisissez une autre option.",
    deliveryDetails: "Vos coordonnées de livraison",
    phoneHint: "Nous vous appelons pour confirmer avant l’envoi.",
    offersTitle: "Les offres du moment",
    offersText: "Promotions et prix réduits à partir de 2 pièces.",
    categoriesTitle: "Nos catégories",
    bestTitle: "Les plus vendus",
    bestText: "Les produits que nos clients commandent le plus.",
    allTitle: "Tous les produits",
    showMore: "Afficher plus de produits",
    previous: "Précédent",
    next: "Suivant",
    slide: "Slide",
    close: "Fermer",
    followUs: "Suivez-nous",
    policies: "Informations",
    writeUs: "Écrivez-nous sur WhatsApp",
    offerFrom: "dès",
    reviewImage: "Avis client",
    pageNotFound: "Cette page n’existe pas.",
    heroKicker: "Livraison partout au Maroc",
    heroLine1: "Accessoires tech",
    heroLine2: "au Maroc.",
    heroFor: "Pour vos",
    heroIntro: "AirPods, écouteurs sans fil, chargeurs rapides, power banks et supports PC, choisis avec soin. Vous payez seulement à la livraison.",
    heroPrimary: "Découvrir la boutique",
    heroSecondary: "Voir les offres",
    heroBadge: "Vous payez à la réception",
    exploreCategories: "Explorer par catégorie",
    exploreText: "Trouvez vite l’accessoire qu’il vous faut.",
    productsCount: "produits",
    orderNow: "Commander maintenant",
    orderNowText: "Remplissez le formulaire, nous vous appelons pour confirmer. Paiement à la livraison.",
    orderButton: "Commander",
    or: "ou",
    orderSent: "Commande envoyée",
    keywordsLabel: "Recherches populaires",
  },
  ary: {
    shipping: "التوصيل لجميع مدن المغرب · خلّص ملي توصلك السلعة",
    home: "الرئيسية",
    shop: "المتجر",
    categories: "الفئات",
    offers: "الجديد",
    search: "قلب على شي منتوج…",
    searchLabel: "قلب",
    cart: "السلّة",
    light: "دير المود الفاتح",
    dark: "دير المود الغامق",
    language: "Français",
    eyebrow: "التكنولوجيا بطريقة أحسن",
    tagline: "تكنولوجيا وإكسسوارات",
    heroTitle: "اختيار مزيان.\nبثمن مناسب.",
    heroText: "إكسسوارات تكنولوجية نافعة، مختارة بعناية وكنوصلوها حتى لباب دارك.",
    discover: "شوف المتجر",
    seeOffers: "شوف الجديد",
    freeDelivery: "التوصيل لجميع مدن المغرب",
    cod: "خلّص ملي توصلك السلعة",
    support: "حنا هنا باش نعاونوك",
    ourCategories: "عالم التكنولوجيا ديالك",
    categoryIntro: "إكسسوارات نافعة لكل نهار.",
    allProducts: "مختارين ليك دابا",
    productsFound: "منتوج",
    new: "جديد",
    best: "الأكثر مبيعاً",
    sale: "تخفيض",
    add: "زيد للسلّة",
    unavailable: "ما بقاش متوفر",
    adding: "كنزيدو…",
    added: "تزاد للسلّة",
    addError: "ما قدرناش نزيدوه. عاود جرّب.",
    all: "شوف الكل",
    sort: "رتب حسب",
    recent: "الجديد",
    priceLow: "الثمن من الصغير للكبير",
    priceHigh: "الثمن من الكبير للصغير",
    inStock: "المتوفر",
    min: "أقل ثمن",
    max: "أكثر ثمن",
    clear: "مسح الاختيارات",
    noProducts: "ما لقينا حتى منتوج بهاد البحث.",
    viewProduct: "شوف المنتوج",
    priceFrom: "ابتداءً من",
    footerText: "تكنولوجيا نافعة، مختارة بعناية.",
    quickLinks: "تصفح",
    help: "محتاج شي مساعدة؟",
    contact: "تاصل بينا",
    rights: "جميع الحقوق محفوظة.",
    selected: "مختار ليك",
    stock: "متوفر",
    outOfStock: "سالَى من المخزون",
    description: "التفاصيل",
    variants: "اختار النوع",
    back: "رجع للمتجر",
    subtotal: "المجموع",
    catalogTitle: "متجر m04.shop",
    catalogText: "تصفح الاختيارات ديالنا ولقي الإكسسوار اللي محتاج.",
    filterCategory: "الفئة",
    filters: "الاختيارات",
    loading: "كنحملو…",
    loadError: "المتجر ما خدامش دابا. تأكد من الاتصال وعاود جرّب.",
    retry: "عاود جرّب",
    noImage: "الصورة قريباً",
    productNotFound: "هاد المنتوج ما لقيناهش أو ما بقاش متوفر.",
    quantity: "الكمية",
    buyNow: "زيد للسلّة",
    trustTitle: "شري وانت مرتاح",
    trustText: "خلّص ملي توصلك السلعة، منتوجات مختارة وتوصيل لجميع مدن المغرب.",
    cartTitle: "السلّة ديالك",
    emptyCart: "السلّة ديالك خاوية.",
    continueShopping: "كمل التسوق",
    deliveryOrder: "التوصيل والطلب",
    fullName: "الاسم الكامل",
    phone: "التليفون",
    city: "المدينة",
    address: "العنوان",
    deliveryNote: "ملاحظة للتوصيل (اختياري)",
    confirmOrder: "أكد الطلب",
    processing: "كنعالجو الطلب…",
    remove: "حيد",
    decreaseQuantity: "نقص الكمية",
    increaseQuantity: "زيد الكمية",
    cartLoadError: "ما قدرناش نحملو السلّة.",
    cartUpdateError: "الكمية ما بقاتش متوفرة أو ما قدرناش نبدلوها.",
    cartRemoveError: "ما قدرناش نحيدو هاد المنتوج.",
    orderError: "ما قدرناش نسجلو الطلب. تأكد من المعلومات وعاود جرّب.",
    orderReceived: "توصلنا بالطلب",
    thankYou: "شكراً على الطلب ديالك.",
    reference: "رقم الطلب",
    total: "المجموع",
    emptyProduct: "ما كاين حتى منتوج متوفر دابا.",
    productGallery: "صور المنتوج",
    chooseOffer: "اختار العرض ديالك",
    onePiece: "حبة وحدة",
    color: "اللون",
    perUnit: "للحبة",
    saveLabel: "وفّر",
    viewCart: "شوف السلّة وكمل الطلب",
    district: "الحي (اختياري)",
    yourOrder: "الطلب ديالك",
    offerLabel: "العرض",
    lineError: "هاد الاختيار ما متوفرش. اختار شي حاجة أخرى.",
    deliveryDetails: "المعلومات ديال التوصيل",
    phoneHint: "غادي نعيطو ليك باش نأكدو قبل الإرسال.",
    offersTitle: "العروض ديال دابا",
    offersText: "تخفيضات وأثمنة مزيانة من حبتين وفوق.",
    categoriesTitle: "الفئات ديالنا",
    bestTitle: "الأكثر مبيعاً",
    bestText: "المنتوجات اللي كيطلبوها الكليان بزاف.",
    allTitle: "جميع المنتوجات",
    showMore: "شوف منتوجات أخرى",
    previous: "اللي قبل",
    next: "اللي من بعد",
    slide: "صورة",
    close: "سد",
    followUs: "تابعنا",
    policies: "معلومات",
    writeUs: "كتب لينا فالواتساب",
    offerFrom: "من",
    reviewImage: "رأي كليان",
    pageNotFound: "هاد الصفحة ما كايناش.",
    heroKicker: "التوصيل لجميع مدن المغرب",
    heroLine1: "إكسسوارات التكنولوجيا",
    heroLine2: "فالمغرب.",
    heroFor: "عندنا",
    heroIntro: "AirPods، سماعات بلا خيط، شواحن سريعة، باور بانك وحوامل الحاسوب، مختارين بعناية. ما كتخلّص حتى توصلك السلعة.",
    heroPrimary: "شوف المتجر",
    heroSecondary: "شوف العروض",
    heroBadge: "خلّص ملي توصلك السلعة",
    exploreCategories: "تصفح حسب الفئة",
    exploreText: "لقا دغيا الإكسسوار اللي محتاج.",
    productsCount: "منتوج",
    orderNow: "طلب دابا",
    orderNowText: "عمّر الفورمولير وغادي نعيطو ليك باش نأكدو. الخلاص ملي توصلك السلعة.",
    orderButton: "طلب",
    or: "ولا",
    orderSent: "الطلب تصيفط",
    keywordsLabel: "اللي كيقلبو عليه بزاف",
  },
} as const;

type TranslationKey = keyof (typeof messages)["fr"];

type StoreContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  dark: boolean;
  toggleTheme: () => void;
  t: (key: TranslationKey) => string;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function subscribeToPreferences(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("m04-preferences-changed", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("m04-preferences-changed", onChange);
  };
}

function getLanguageSnapshot(): Language {
  return localStorage.getItem("m04-language") === "fr" ? "fr" : "ary";
}

function getLanguageServerSnapshot(): Language {
  return "ary";
}

// The brand is black-first: dark unless the visitor chose the light theme.
function getThemeSnapshot() {
  return localStorage.getItem("m04-theme") !== "light";
}

function getThemeServerSnapshot() {
  return true;
}

function updatePreference(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new Event("m04-preferences-changed"));
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeToPreferences, getLanguageSnapshot, getLanguageServerSnapshot);
  const dark = useSyncExternalStore(subscribeToPreferences, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ary" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("light", !dark);
  }, [language, dark]);

  const value: StoreContextValue = {
    language,
    setLanguage: (nextLanguage) => updatePreference("m04-language", nextLanguage),
    dark,
    toggleTheme: () => updatePreference("m04-theme", dark ? "light" : "dark"),
    t: (key) => messages[language][key],
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

const categoryNames: Record<string, { fr: string; ary: string }> = {
  accessoires: { fr: "Accessoires", ary: "إكسسوارات" },
  airpods: { fr: "AirPods", ary: "AirPods" },
  audio: { fr: "Audio", ary: "الصوتيات" },
  bureau: { fr: "Bureau", ary: "المكتب" },
  chargeurs: { fr: "Chargeurs", ary: "الشواحن" },
  energie: { fr: "Énergie", ary: "الطاقة" },
  watch: { fr: "Montres", ary: "الساعات" },
  pc: { fr: "PC", ary: "الحواسيب" },
  "supports-pc": { fr: "Supports PC", ary: "حوامل الحاسوب" },
  phone: { fr: "Téléphones", ary: "التليفونات" },
};

/** Words typed one after another in the home hero, after "Pour vos" / "عندنا". */
export const HERO_WORDS: Record<Language, string[]> = {
  fr: ["AirPods", "écouteurs sans fil", "chargeurs rapides", "supports PC", "power banks", "montres connectées"],
  ary: ["AirPods", "السماعات بلا خيط", "الشواحن السريعة", "حوامل الحاسوب", "الباور بانك", "الساعات الذكية"],
};

export function translateCategory(slug: string, fallback: string, language: Language) {
  return categoryNames[slug]?.[language] ?? fallback;
}

export function formatPrice(value: string | number, language: Language) {
  const amount = new Intl.NumberFormat(language === "ary" ? "ar-MA" : "fr-MA", {
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
  return `${amount} DH`;
}
