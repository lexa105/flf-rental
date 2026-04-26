import Link from 'next/link';

// Junior Dev Note:
// This is the shared layout for all onboarding steps.
// Gotcha: The bottom navigation is fixed. Make sure page content has enough bottom padding (e.g. pb-24) so it doesn't get hidden behind the nav.

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-black text-[#e5e2e1]">
      {/* TopAppBar */}
      <header className="bg-black text-[#CCFF00] font-label-caps tracking-tighter uppercase text-xs font-bold sticky top-0 border-b border-[#222222] flex justify-between items-center w-full px-4 h-14 z-50">
        <div className="flex items-center gap-4">
          <span className="text-[#CCFF00] font-black tracking-widest italic text-base">CINEMA_CORE</span>
        </div>
        <div className="flex items-center gap-6">
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex flex-col relative z-10">
        {children}
      </div>

      {/* Bottom Padding for Nav to ensure content is not hidden */}
      <div className="h-20"></div>
    </div>
  )
}