# Realty Listing App – PRODUCT REQ

## 1. Overview
- Goal: Allow admin to list properties and buyers to browse, filter, view on map, and contact.
- Platforms: Web + Mobile (Expo RN or web-first).
- Success for v1: Admin can publish properties; buyers can view listing, filter, view realty in map, redirected to admins contact(soc. med. or phone number messaging or calling)

## 2. Users & Roles
- Admin: Manages property listings and statuses.
- Buyer (Guest): Browse, filter, view details, map, contact via buttons.
- Buyer (Logged-in): Same as guest + can “mark interested” and message admin.

## 3. Core Features (V1)

### 3.1 Admin
- Create/edit/delete property with images.
- Fields: title, price, address, coords, status (Available/Sold/new/Under Negotiation), etc.
- View list with search/filter and interested count.

### 3.2 Buyer
- View property list with filters (price range, location, type).
- View property details page (images, description, contact buttons).
- View Interested(favourites) properties
- Map view Will be redirected to google maps

### 3.3 Auth & Interaction
- Login/Signup (email + password) or social media .
- Guest browsing.
- Logged-in: send message to admin per property.
- Logged-in: click “Interested” once per property (increments counter).

### 3.4 Non-Functional
- Fast perceived load (basic caching, pagination).
- Simple, responsive UI.

## 4. Out of Scope (V1)
- Payments, mortgage calculators.
- Multi-language.
- Complex notifications.
