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
    weight: "font-normal",
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
  }
  
};
