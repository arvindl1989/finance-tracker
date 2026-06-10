import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { TickerWrapper } from "@/components/layout/ticker-wrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header />
        <TickerWrapper />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
