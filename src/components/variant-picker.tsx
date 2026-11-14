"use client";

import { useId } from "react";
import type { Product } from "@/lib/catalog";
import { useStore } from "@/lib/storefront";

type ProductVariant = Product["variants"][number];

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const optionOf = (variant: ProductVariant) => (variant.capacity ?? "").trim();
/** Colour name of a variant; older products only have a swatch and use the name as the colour. */
const colorOf = (variant: ProductVariant) => (variant.color_hex ? (variant.color || variant.name).trim() : "");

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item).toLowerCase();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Colour swatches plus a second choice (Puissance, Taille…) shown as buttons or a list,
 * as set per product in the admin. The pair (colour, option) resolves to one variant;
 * combinations out of stock or not sold are disabled. Products whose variants have
 * neither colour nor option keep plain name buttons.
 */
export function VariantPicker({
  product,
  selected,
  onSelect,
}: {
  product: Product;
  selected: ProductVariant | undefined;
  onSelect: (variant: ProductVariant) => void;
}) {
  const { t } = useStore();
  const selectId = useId();
  const variants = product.variants;
  const structured = variants.length > 0 && variants.every((item) => colorOf(item) || optionOf(item));

  if (!structured) {
    return (
      <fieldset className="variant-picker">
        <legend>{t("variants")}</legend>
        <div className="variant-options">
          {variants.map((item) => (
            <button
              className={`variant-option${selected?.id === item.id ? " is-selected" : ""}`}
              disabled={!item.available}
              type="button"
              key={item.id}
              aria-pressed={selected?.id === item.id}
              onClick={() => onSelect(item)}
            >
              {item.name}{!item.available ? ` · ${t("outOfStock")}` : ""}
            </button>
          ))}
        </div>
      </fieldset>
    );
  }

  const colors = unique(variants, colorOf);
  const options = unique(variants, optionOf).map(optionOf);
  const currentColor = selected ? colorOf(selected) : colors[0] ? colorOf(colors[0]) : "";
  const currentOption = selected ? optionOf(selected) : options[0] ?? "";
  const optionLabel = product.variant_option_label?.trim() || t("variants");

  /** Best variant for a colour/option pair: exact and in stock, then in stock, then exact. */
  function resolve(color: string, option: string, keep: "color" | "option") {
    const fixed = (item: ProductVariant) => (keep === "color" ? same(colorOf(item), color) : same(optionOf(item), option));
    const exact = (item: ProductVariant) => same(colorOf(item), color) && same(optionOf(item), option);
    return variants.find((item) => exact(item) && item.available)
      ?? variants.find((item) => fixed(item) && item.available)
      ?? variants.find(exact)
      ?? variants.find(fixed);
  }

  const choose = (variant: ProductVariant | undefined) => {
    if (variant) onSelect(variant);
  };

  /** In-stock variant for this option with the current colour (any colour when there are none). */
  const optionVariant = (option: string) =>
    variants.find((item) => same(optionOf(item), option) && (!colors.length || same(colorOf(item), currentColor)) && item.available);

  return (
    <>
      {colors.length ? (
        <fieldset className="variant-picker">
          <legend>{`${t("color")} : ${currentColor}`}</legend>
          <div className="variant-options color-options">
            {colors.map((item) => {
              const name = colorOf(item);
              const available = variants.some((variant) => same(colorOf(variant), name) && variant.available);
              const isSelected = same(name, currentColor);
              return (
                <button
                  className={`color-option${isSelected ? " is-selected" : ""}`}
                  disabled={!available}
                  type="button"
                  key={name}
                  aria-pressed={isSelected}
                  aria-label={`${name}${!available ? `, ${t("outOfStock")}` : ""}`}
                  title={name}
                  style={{ background: item.color_hex ?? undefined }}
                  onClick={() => choose(resolve(name, currentOption, "color"))}
                />
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {options.length ? (
        product.option_display === "select" ? (
          <div className="variant-picker variant-select">
            <label htmlFor={selectId}>{optionLabel}</label>
            <select
              id={selectId}
              value={currentOption}
              onChange={(event) => choose(resolve(currentColor, event.target.value, "option"))}
            >
              {options.map((option) => {
                const available = !!optionVariant(option);
                return (
                  <option key={option} value={option} disabled={!available}>
                    {option}{!available ? ` · ${t("outOfStock")}` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        ) : (
          <fieldset className="variant-picker">
            <legend>{`${optionLabel} : ${currentOption}`}</legend>
            <div className="variant-options">
              {options.map((option) => {
                const available = !!optionVariant(option);
                const isSelected = same(option, currentOption);
                return (
                  <button
                    className={`variant-option${isSelected ? " is-selected" : ""}`}
                    disabled={!available}
                    type="button"
                    key={option}
                    aria-pressed={isSelected}
                    onClick={() => choose(resolve(currentColor, option, "option"))}
                  >
                    {option}{!available ? ` · ${t("outOfStock")}` : ""}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )
      ) : null}
    </>
  );
}
