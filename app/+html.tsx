import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";
import { SITE } from "./constants/seo";

// Runs only during static web export in Node.js — not in the browser.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#1d4ed8" />
        <meta name="application-name" content={SITE.name} />
        <meta name="author" content={SITE.name} />
        <meta name="geo.region" content="PH-ISU" />
        <meta name="geo.placename" content="Ilocos Sur, Philippines" />

        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
