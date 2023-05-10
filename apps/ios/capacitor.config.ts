import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "dev.azarattum.amadeus",
  appName: "Amadeus",
  webDir: "../../build/public",
  ios: { path: ".", contentInset: "always" },
  server: {
    androidScheme: "https",
    url: "capacitor://localhost/home.html",
  },
};

export default config;
