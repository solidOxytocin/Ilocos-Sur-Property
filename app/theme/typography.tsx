interface TextTheme {
  size: "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-xl";
  weight:
    | "font-thin"
    | "font-extralight"
    | "font-light"
    | "font-normal"
    | "font-medium"
    | "font-semibold"
    | "font-bold"
    | "font-extrabold"
    | "font-black";
}

export const typography = {
  bigTextBold:{
    size: "text-3xl ",
    weight: "font-bold",
  },
  bigText:{
    size: "text-3xl ",
    weight: "font-medium",
  }
  ,
  title: {
    size: "text-xl",
    weight: "font-bold",
  },
  headerBold: {
    size: "text-lg",
    weight: "font-bold",
  },
  header: {
    size: "text-lg",
    weight: "font-medium",
  },
  normalBold: {
    size: "text-base",
    weight: "font-bold",
  },
  normal: {
    size: "text-base",
    weight: "font-normal",
  },
  pill:{
    size: "text-xs",
    weight: "font-semibold",
  },
  detailPill:{
    size: "text-base",
    weight: "font-semibold",
  }
  
};

// Dummy export to prevent Expo Router from complaining about missing default export
export default function TypographyIgnored() { return null; }
