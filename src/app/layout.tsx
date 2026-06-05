import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/app/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "Xe Ghép Huế - Đà Nẵng - Hội An Giá Rẻ, Đón Tận Nơi | Xe Bảo Châu",
  description:
    "Dịch vụ xe ghép, bao xe liên tỉnh Huế - Đà Nẵng - Hội An cao cấp. Đón trả tận nhà, đúng giờ, lái xe an toàn, phục vụ chu đáo, giá rẻ minh bạch. Đặt ngay!",
  keywords: [
    "xe ghép huế đà nẵng",
    "xe ghép đà nẵng huế",
    "xe ghép hội an đà nẵng",
    "nhà xe bảo châu",
    "thuê xe ghép huế",
    "xe limousine huế đà nẵng",
    "bao xe huế đà nẵng",
    "xe bao châu huế"
  ].join(", "),
  authors: [{ name: "Nhà xe Bảo Châu" }],
  openGraph: {
    title: "Xe Ghép Huế - Đà Nẵng - Hội An Giá Rẻ | Xe Bảo Châu",
    description: "Dịch vụ xe ghép, bao xe liên tỉnh Huế - Đà Nẵng - Hội An cao cấp. Đón trả tận nơi, đúng giờ, lái xe an toàn.",
    type: "website",
    locale: "vi_VN",
    siteName: "Nhà Xe Bảo Châu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xe Ghép Huế - Đà Nẵng - Hội An Giá Rẻ | Xe Bảo Châu",
    description: "Dịch vụ xe ghép, bao xe liên tỉnh Huế - Đà Nẵng - Hội An cao cấp. Đón trả tận nơi, đúng giờ, lái xe an toàn.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
