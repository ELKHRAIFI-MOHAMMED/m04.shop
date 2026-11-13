# m04.shop storefront

The Next.js storefront for the m04.shop commerce project. It uses the Laravel API in `../back.m04.shop` for products, categories, cart and checkout.

## Run locally

Start the API from `../back.m04.shop`:

```powershell
php artisan serve --port=8001
```

Then start the storefront:

```powershell
npm run dev
```

The app runs at `http://localhost:3000`. Set the public API URLs in `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8001/api/v1
NEXT_PUBLIC_BACKEND_URL=http://localhost:8001
```

## Storefront features

- Darija (`ary`, Arabic script and RTL) and French (`fr`, LTR); Darija is the default.
- Light and dark themes, with the visitor's choice saved in local storage.
- Product and category browsing, search, price and stock filters, and sorting.
- Product galleries and variant selection, cart updates, and cash-on-delivery checkout.
- Responsive layout for desktop and mobile.

Categories are read from the Laravel API. Category creation and editing are handled by the existing Laravel administration.

## Checks

```powershell
npm run lint
npm run build
```
