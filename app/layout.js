import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/AppProvider";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "CampusConnect — Student Management Portal",
    template: "%s · CampusConnect",
  },
  description: "Track your courses, assignments, attendance and classmates in one calm, simple place.",
};

export const viewport = {
  themeColor: "#f5f7f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-accent="teal" className={font.variable}>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
