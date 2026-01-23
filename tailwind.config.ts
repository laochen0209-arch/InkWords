import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        paper: "#Fdfbf7",
        ink: "#2b2b2b",
        "brand-red": "#C23E32",
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Songti SC", "serif"],
        kaiti: ["KaiTi", "STKaiti", "KaiTi_GB2312", "楷体", "serif"],
      },
    },
  },
};

export default config;
