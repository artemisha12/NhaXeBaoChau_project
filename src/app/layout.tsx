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
  title: "Nhà xe Bảo Châu — Xe ghép cao cấp Huế · Đà Nẵng · Hội An",
  description:
    "Bảo Châu Car — Dịch vụ xe ghép liên tỉnh cao cấp tuyến Huế – Đà Nẵng – Hội An. An toàn, đúng giờ, đón tận địa chỉ, giá minh bạch, không phụ thu ẩn.",
  keywords: "xe ghép Huế Đà Nẵng Hội An, đặt xe Bảo Châu, xe ghép cao cấp miền Trung",
  openGraph: {
    title: "Nhà xe Bảo Châu — Xe ghép cao cấp Huế · Đà Nẵng · Hội An",
    description: "An toàn · Tiện lợi · Đúng giờ trên mọi hành trình.",
    type: "website",
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
