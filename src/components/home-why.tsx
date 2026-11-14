"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowCounterClockwiseIcon,
  CaretDownIcon,
  ChatCircleDotsIcon,
  HandCoinsIcon,
  PhoneCallIcon,
  ShieldCheckIcon,
  TagIcon,
  TruckIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { whatsappLink } from "@/lib/content";
import { useStore } from "@/lib/storefront";

/**
 * Brand and trust sections of the home page: why buy here, how ordering works,
 * after-sales service and FAQ. Every promise here matches the store policies
 * (delivery, 7-day returns, defective items within 48 h) so ads and pages agree.
 */
const COPY = {
  fr: {
    whyKicker: "Pourquoi m04.shop",
    whyTitle: "Votre tech sans risque, payée à la réception",
    whyText:
      "m04.shop est une boutique marocaine d’accessoires tech. Nous choisissons des écouteurs, chargeurs, power banks et supports pour leur qualité et leur prix, et nous restons joignables avant, pendant et après votre commande.",
    benefits: [
      ["Paiement à la livraison", "Vous payez en espèces au livreur, à la réception. Aucun paiement en ligne, aucune carte bancaire."],
      ["Livraison partout au Maroc", "24 à 72 h après confirmation, à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et dans toutes les villes."],
      ["Commande confirmée avec vous", "Notre équipe vous appelle ou vous écrit sur WhatsApp pour vérifier l’adresse et le produit avant l’envoi."],
      ["7 jours pour changer d’avis", "Retour possible pendant 7 jours après réception, produit complet et non utilisé (loi 31-08)."],
      ["Produit défectueux ? Échangé", "Signalez-le sous 48 h avec une photo ou une vidéo : échange ou remboursement, sans frais pour vous."],
      ["Prix clairs en dirhams", "Prix TTC affichés, offres par quantité appliquées automatiquement. Les éventuels frais de livraison sont annoncés avant la validation."],
    ],
    stepsKicker: "Commander chez nous",
    stepsTitle: "Commandez en 4 étapes simples",
    steps: [
      ["Choisissez", "Votre produit, sa couleur et l’offre qui vous convient."],
      ["Commandez en 30 secondes", "Nom, téléphone, ville et adresse. Sans compte ni carte bancaire."],
      ["Nous confirmons", "Un appel ou un message WhatsApp pour valider votre commande."],
      ["Recevez et payez", "Le livreur vous apporte le colis, vous payez en espèces à la réception."],
    ],
    serviceKicker: "Service après-vente",
    serviceTitle: "Nous restons là après la livraison",
    serviceText:
      "Une question sur l’utilisation, la compatibilité avec votre téléphone ou un souci avec votre produit ? Écrivez-nous sur WhatsApp avec votre numéro de commande (M04-…). Une personne de notre équipe vous répond.",
    serviceList: [
      "Aide pour choisir le chargeur ou l’accessoire compatible avec votre téléphone",
      "Échange ou remboursement d’un produit défectueux ou non conforme",
      "Retour sous 7 jours après réception",
      "Garantie légale contre les défauts",
    ],
    whatsapp: "Écrire sur WhatsApp",
    delivery: "Livraison",
    returns: "Retours et remboursements",
    faqKicker: "Questions fréquentes",
    faqTitle: "Vous vous demandez…",
    faq: [
      ["Comment je paie ma commande ?", "En espèces, au livreur, quand vous recevez le colis. Vous pouvez vérifier l’état extérieur du colis avant de payer."],
      ["En combien de temps je suis livré ?", "Généralement 24 à 72 heures après la confirmation, selon votre ville."],
      ["Vous livrez dans ma ville ?", "Oui, nous livrons dans toutes les villes du Maroc."],
      ["Et si le produit ne me convient pas ?", "Vous avez 7 jours après réception pour le retourner, complet, non utilisé et dans son emballage d’origine."],
      ["Que faire si mon produit est défectueux ?", "Contactez-nous sous 48 heures sur WhatsApp avec une photo ou une vidéo. Nous organisons l’échange ou le remboursement, sans frais pour vous."],
      ["Pourquoi vous m’appelez après la commande ?", "Pour confirmer votre adresse et votre choix. Une commande non confirmée n’est pas expédiée : c’est ce qui évite les erreurs de livraison."],
    ],
  },
  ary: {
    whyKicker: "علاش m04.shop",
    whyTitle: "شري التكنولوجيا ديالك بلا خوف، وخلّص ملي توصلك",
    whyText:
      "m04.shop متجر مغربي ديال إكسسوارات التكنولوجيا. كنختارو السماعات، الشواحن، الباور بانك والحوامل على حساب الجودة والثمن، وكنبقاو معاك قبل الطلب، فوقتو، ومن بعد ما توصلك السلعة.",
    benefits: [
      ["الخلاص ملي توصلك", "كتخلص كاش للموزع ملي كتوصلك السلعة. لا خلاص أونلاين ولا كارط بنكية."],
      ["التوصيل لجميع مدن المغرب", "من 24 حتى 72 ساعة من بعد التأكيد، فكازا، الرباط، مراكش، طنجة، فاس، أكادير وجميع المدن."],
      ["كنأكدو معاك الطلب", "الفريق ديالنا كيعيط ليك ولا كيكتب ليك فالواتساب باش نتأكدو من العنوان والمنتوج قبل ما نصيفطو."],
      ["7 أيام باش تبدل رأيك", "تقدر ترجع المنتوج فـ7 أيام من بعد ما يوصلك، كامل وما مستعملش (القانون 31-08)."],
      ["منتوج فيه عيب؟ كنبدلوه", "علمنا فـ48 ساعة بصورة ولا فيديو: كنبدلوه ليك ولا كنرجعو ليك فلوسك بلا مصاريف."],
      ["أثمنة واضحة بالدرهم", "الثمن اللي كتشوف هو اللي كتخلص، والعروض على الكمية كتطبق بوحدها. إلا كان شي ثمن ديال التوصيل كيبان ليك قبل التأكيد."],
    ],
    stepsKicker: "كيفاش تطلب",
    stepsTitle: "الطلب فـ4 مراحل ساهلين",
    steps: [
      ["ختار", "المنتوج، اللون والعرض اللي بغيتي."],
      ["طلب فـ30 ثانية", "الإسم، التيليفون، المدينة والعنوان. بلا حساب وبلا كارط."],
      ["كنأكدو معاك", "كنعيطو ليك ولا كنكتبو ليك فالواتساب باش نأكدو الطلب."],
      ["توصلك وتخلّص", "الموزع كيجيب ليك الكولي، وكتخلص كاش ملي توصلك."],
    ],
    serviceKicker: "خدمة ما بعد البيع",
    serviceTitle: "كنبقاو معاك حتى من بعد التوصيل",
    serviceText:
      "عندك سؤال على الاستعمال، واش متوافق مع التيليفون ديالك، ولا عندك مشكل فالمنتوج؟ كتب لينا فالواتساب مع رقم الطلب (M04-…)، وغادي يجاوبك واحد من الفريق ديالنا.",
    serviceList: [
      "نعاونوك تختار الشاحن ولا الإكسسوار اللي مناسب للتيليفون ديالك",
      "تبديل ولا رجوع الفلوس إلا كان المنتوج فيه عيب ولا ماشي هو اللي طلبتي",
      "الرجوع فـ7 أيام من بعد ما توصلك السلعة",
      "الضمان القانوني ضد العيوب",
    ],
    whatsapp: "كتب لينا فالواتساب",
    delivery: "التوصيل",
    returns: "الرجوع ورجوع الفلوس",
    faqKicker: "الأسئلة اللي كتطرح بزاف",
    faqTitle: "يمكن كتسول راسك…",
    faq: [
      ["كيفاش نخلّص؟", "كاش للموزع ملي توصلك السلعة. تقدر تشوف الكولي من برا قبل ما تخلص."],
      ["شحال كياخد التوصيل؟", "عادة من 24 حتى 72 ساعة من بعد التأكيد، على حساب المدينة."],
      ["واش كتوصلو للمدينة ديالي؟", "إيه، كنوصلو لجميع مدن المغرب."],
      ["إلا ما عجبنيش المنتوج؟", "عندك 7 أيام من بعد ما يوصلك باش ترجعو، كامل، ما مستعملش وفالباكية ديالو."],
      ["إلا كان المنتوج فيه عيب؟", "تاصل بينا فـ48 ساعة فالواتساب مع صورة ولا فيديو. غادي نبدلوه ليك ولا نرجعو ليك فلوسك بلا مصاريف."],
      ["علاش كتعيطو ليا من بعد الطلب؟", "باش نأكدو العنوان والمنتوج. الطلب اللي ما تأكدش ما كيتصيفطش، وهكا كنتفاداو الغلطات فالتوصيل."],
    ],
  },
} as const;

const BENEFIT_ICONS = [HandCoinsIcon, TruckIcon, PhoneCallIcon, ArrowCounterClockwiseIcon, ShieldCheckIcon, TagIcon];

function Heading({ kicker, title, id, children }: { kicker: string; title: string; id: string; children?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 id={id}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function HomeWhy({ whatsapp }: { whatsapp?: string }) {
  const { language } = useStore();
  const copy = COPY[language === "ary" ? "ary" : "fr"];
  const number = whatsapp || "212620638999";

  return (
    <>
      <section className="content-section why-section" aria-labelledby="why-title">
        <div className="page-wrap">
          <Heading kicker={copy.whyKicker} title={copy.whyTitle} id="why-title"><p>{copy.whyText}</p></Heading>
          <ul className="benefit-grid">
            {copy.benefits.map(([title, text], index) => {
              const Icon = BENEFIT_ICONS[index];
              return (
                <li className="benefit-card" key={title}>
                  <span className="benefit-icon" aria-hidden="true"><Icon size={26} weight="duotone" /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="content-section steps-section" aria-labelledby="steps-title">
        <div className="page-wrap">
          <Heading kicker={copy.stepsKicker} title={copy.stepsTitle} id="steps-title" />
          <ol className="step-list">
            {copy.steps.map(([title, text], index) => (
              <li className="step-card" key={title}>
                <span className="step-number" aria-hidden="true">{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="content-section service-section" aria-labelledby="service-title">
        <div className="page-wrap service-panel">
          <span className="service-icon" aria-hidden="true"><ChatCircleDotsIcon size={34} weight="duotone" /></span>
          <Heading kicker={copy.serviceKicker} title={copy.serviceTitle} id="service-title"><p>{copy.serviceText}</p></Heading>
          <ul className="service-list">
            {copy.serviceList.map((item) => (
              <li key={item}><ShieldCheckIcon size={18} weight="fill" aria-hidden="true" />{item}</li>
            ))}
          </ul>
          <div className="service-actions">
            <a className="button button-primary" href={whatsappLink(number)} target="_blank" rel="noopener noreferrer">
              <WhatsappLogoIcon size={20} weight="fill" aria-hidden="true" />{copy.whatsapp}
            </a>
            <Link className="button button-ghost" href="/politiques/livraison">{copy.delivery}</Link>
            <Link className="button button-ghost" href="/politiques/retours">{copy.returns}</Link>
          </div>
        </div>
      </section>

      <section className="content-section faq-section" aria-labelledby="faq-title">
        <div className="page-wrap">
          <Heading kicker={copy.faqKicker} title={copy.faqTitle} id="faq-title" />
          <div className="faq-list">
            {copy.faq.map(([question, answer]) => (
              <details className="faq-item" key={question}>
                <summary>
                  <span>{question}</span>
                  <CaretDownIcon size={18} weight="bold" aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
