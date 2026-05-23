import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
