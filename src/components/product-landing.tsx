"use client";

import Image from "next/image";
import { useState, type ComponentType } from "react";
import {
  AirplaneTiltIcon,
  ArrowCounterClockwiseIcon,
  BatteryFullIcon,
  CaretDownIcon,
  ChatCircleDotsIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  DeviceMobileIcon,
  FeatherIcon,
  GiftIcon,
  HandCoinsIcon,
  HandIcon,
  HeadphonesIcon,
  LaptopIcon,
  LightningIcon,
  MagnetIcon,
  MonitorIcon,
  PlayIcon,
  PlugIcon,
  ShieldCheckIcon,
  SparkleIcon,
  SpeakerHighIcon,
  StarIcon,
  TruckIcon,
  WatchIcon,
  WifiHighIcon,
  XCircleIcon,
  type IconProps,
} from "@phosphor-icons/react";
import type { LandingSection } from "@/lib/catalog";
import { useStore, type Language } from "@/lib/storefront";

const ICONS: Record<string, ComponentType<IconProps>> = {
  battery: BatteryFullIcon, lightning: LightningIcon, wireless: WifiHighIcon, plug: PlugIcon, screen: MonitorIcon,
  phone: DeviceMobileIcon, headphones: HeadphonesIcon, watch: WatchIcon, laptop: LaptopIcon, travel: AirplaneTiltIcon,
  magnet: MagnetIcon, sparkle: SparkleIcon, shield: ShieldCheckIcon, truck: TruckIcon, cash: HandCoinsIcon,
  return: ArrowCounterClockwiseIcon, chat: ChatCircleDotsIcon, check: CheckCircleIcon, clock: ClockIcon, gift: GiftIcon,
  star: StarIcon, sound: SpeakerHighIcon, feather: FeatherIcon, hand: HandIcon,
};

type Item = Record<string, unknown>;

/** Text of a field in the visitor's language, falling back to the other language. */
function tr(source: Item, key: string, language: Language): string {
  const own = source[`${key}_${language}`];
  const other = source[`${key}_${language === "ary" ? "fr" : "ary"}`];
  return typeof own === "string" && own ? own : typeof other === "string" ? other : "";
}

const list = (value: unknown): Item[] => (Array.isArray(value) ? (value as Item[]) : []);
const str = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * Landing page of a product, below the photos and the order form: the sections built
 * in the admin (Produits → Landing page), in their order. `orderHref` is where every
 * "order" button leads (the order form, or the add-to-cart block).
 */
export function ProductLanding({ sections, orderHref, productName }: { sections: LandingSection[]; orderHref: string; productName: string }) {
  const { language } = useStore();
  if (!sections.length) return null;

  return (
    <div className="landing">
      {sections.map((section) => (
        <LandingBlock key={section.id} section={section} language={language} orderHref={orderHref} productName={productName} />
      ))}
    </div>
  );
}

function Heading({ section, language, id }: { section: Item; language: Language; id: string }) {
  const title = tr(section, "title", language);
  const text = tr(section, "text", language);
  if (!title && !text) return null;
  return (
    <div className="landing-heading">
      {title ? <h2 id={id} dir="auto">{title}</h2> : null}
      {text ? <p dir="auto">{text}</p> : null}
    </div>
  );
}

function LandingBlock({ section, language, orderHref, productName }: { section: LandingSection; language: Language; orderHref: string; productName: string }) {
  const id = `landing-${section.id}`;
  const label = { "aria-labelledby": tr(section, "title", language) ? id : undefined };
  const image = str(section.image_url);

  switch (section.type) {
    case "hero": {
      const button = tr(section, "button", language);
      return (
        <section className="landing-section landing-hero" {...label}>
          <div className="landing-hero-copy">
            {tr(section, "kicker", language) ? <p className="section-kicker" dir="auto">{tr(section, "kicker", language)}</p> : null}
            {tr(section, "title", language) ? <h2 id={id} dir="auto">{tr(section, "title", language)}</h2> : null}
            {tr(section, "text", language) ? <p dir="auto">{tr(section, "text", language)}</p> : null}
            {button ? <a className="button button-primary" href={orderHref}>{button}</a> : null}
          </div>
          {image ? (
            <div className="landing-hero-image">
              <Image src={image} alt={productName} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized />
            </div>
          ) : null}
        </section>
      );
    }

    case "benefits":
    case "guarantee": {
      const items = list(section.items);
      if (!items.length) return null;
      return (
        <section className={`landing-section landing-${section.type}`} {...label}>
          <Heading section={section} language={language} id={id} />
          <ul className="landing-cards">
            {items.map((item, index) => {
              const Icon = ICONS[str(item.icon)] ?? CheckCircleIcon;
              return (
                <li className="landing-card" key={index}>
                  <span className="landing-card-icon" aria-hidden="true"><Icon size={26} weight="duotone" /></span>
                  {tr(item, "title", language) ? <h3 dir="auto">{tr(item, "title", language)}</h3> : null}
                  {tr(item, "text", language) ? <p dir="auto">{tr(item, "text", language)}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      );
    }

    case "image_text": {
      const points = list(section.points).map((point) => tr(point, "text", language)).filter(Boolean);
      return (
        <section className={`landing-section landing-image-text${section.image_side === "end" ? " is-reversed" : ""}`} {...label}>
          {image ? (
            <div className="landing-media">
              <Image src={image} alt={tr(section, "title", language) || productName} fill sizes="(max-width: 760px) 100vw, 50vw" unoptimized />
            </div>
          ) : null}
          <div className="landing-copy">
            {tr(section, "title", language) ? <h2 id={id} dir="auto">{tr(section, "title", language)}</h2> : null}
            {tr(section, "text", language) ? <p dir="auto">{tr(section, "text", language)}</p> : null}
            {points.length ? (
              <ul className="landing-points">
                {points.map((point, index) => <li key={index} dir="auto"><CheckIcon size={18} weight="bold" aria-hidden="true" />{point}</li>)}
              </ul>
            ) : null}
          </div>
        </section>
      );
    }

    case "video": {
      const url = str(section.url);
      if (!url) return null;
      return (
        <section className="landing-section landing-video" {...label}>
          <Heading section={section} language={language} id={id} />
          <VideoPlayer url={url} title={tr(section, "title", language) || productName} />
        </section>
      );
    }

    case "specifications": {
      const rows = list(section.rows).filter((row) => tr(row, "value", language));
      if (!rows.length) return null;
      return (
        <section className="landing-section landing-specs" {...label}>
          <Heading section={section} language={language} id={id} />
          <dl className="landing-spec-table">
            {rows.map((row, index) => (
              <div key={index}>
                <dt dir="auto">{tr(row, "label", language)}</dt>
                <dd dir="auto">{tr(row, "value", language)}</dd>
              </div>
            ))}
          </dl>
        </section>
      );
    }

    case "comparison": {
      const rows = list(section.rows).filter((row) => tr(row, "label", language));
      if (!rows.length) return null;
      const mark = (yes: unknown) => (yes
        ? <CheckCircleIcon size={22} weight="fill" className="is-yes" aria-label="✓" />
        : <XCircleIcon size={22} weight="fill" className="is-no" aria-label="✗" />);
      return (
        <section className="landing-section landing-comparison" {...label}>
          <Heading section={section} language={language} id={id} />
          <div className="landing-table-scroll">
            <table className="landing-compare">
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">—</span></th>
                  <th scope="col" className="is-us">{tr(section, "us_label", language) || productName}</th>
                  <th scope="col">{tr(section, "them_label", language)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index}>
                    <th scope="row" dir="auto">{tr(row, "label", language)}</th>
                    <td className="is-us">{mark(row.us)}</td>
                    <td>{mark(row.them)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    case "reviews": {
      const shots = Array.isArray(section.shop_reviews) ? (section.shop_reviews as { url: string; width: number; height: number }[]) : [];
      const items = list(section.items).filter((item) => tr(item, "text", language) || str(item.image_url));
      if (!shots.length && !items.length) return null;
      return (
        <section className="landing-section landing-reviews" {...label}>
          <Heading section={section} language={language} id={id} />
          {items.length ? (
            <ul className="landing-quotes">
              {items.map((item, index) => (
                <li key={index} className="landing-quote">
                  {str(item.image_url) ? <span className="landing-quote-image"><Image src={str(item.image_url)} alt="" fill sizes="96px" unoptimized /></span> : null}
                  {tr(item, "text", language) ? <blockquote dir="auto">{tr(item, "text", language)}</blockquote> : null}
                  <cite dir="auto">{[str(item.name), str(item.city)].filter(Boolean).join(" · ")}</cite>
                </li>
              ))}
            </ul>
          ) : null}
          {shots.length ? (
            <div className="landing-shots">
              {shots.map((shot) => (
                <a key={shot.url} href={shot.url} target="_blank" rel="noopener noreferrer" className="landing-shot">
                  <Image src={shot.url} alt="" width={shot.width} height={shot.height} sizes="200px" unoptimized />
                </a>
              ))}
            </div>
          ) : null}
        </section>
      );
    }

    case "faq": {
      const items = list(section.items).filter((item) => tr(item, "question", language));
      if (!items.length) return null;
      return (
        <section className="landing-section landing-faq" {...label}>
          <Heading section={section} language={language} id={id} />
          <div className="faq-list">
            {items.map((item, index) => (
              <details className="faq-item" key={index}>
                <summary><span dir="auto">{tr(item, "question", language)}</span><CaretDownIcon size={18} weight="bold" aria-hidden="true" /></summary>
                <p dir="auto">{tr(item, "answer", language)}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    case "cta": {
      const button = tr(section, "button", language);
      return (
        <section className="landing-section landing-cta" {...label}>
          {tr(section, "title", language) ? <h2 id={id} dir="auto">{tr(section, "title", language)}</h2> : null}
          {tr(section, "text", language) ? <p dir="auto">{tr(section, "text", language)}</p> : null}
          {button ? <a className="button button-primary" href={orderHref}>{button}</a> : null}
        </section>
      );
    }

    default:
      return null;
  }
}

/** YouTube loads only after a click (keeps the page fast); MP4 files play in place. */
function VideoPlayer({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);

  if (!youtube) {
    return <video className="landing-video-frame" src={url} controls preload="none" playsInline />;
  }
  const id = youtube[1];
  return playing ? (
    <iframe
      className="landing-video-frame"
      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
      title={title}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  ) : (
    <button type="button" className="landing-video-frame landing-video-poster" onClick={() => setPlaying(true)} aria-label={`▶ ${title}`}>
      <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 760px) 100vw, 800px" unoptimized />
      <span className="landing-play" aria-hidden="true"><PlayIcon size={30} weight="fill" /></span>
    </button>
  );
}
