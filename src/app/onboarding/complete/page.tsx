import Link from "next/link"

// Junior Dev Note:
// This is the final step of onboarding. 
// Gotcha: Currently it statically redirects to `/` dashboard. We don't have dashboard implemented yet but that's the next step.

export default function OnboardingCompletePage() {
  return (
    <main className="flex-grow flex items-center justify-center px-4 py-12 bg-[#000000] relative overflow-hidden h-full">
      {/* Abstract Background Visual Flair */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#CCFF00] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#CCFF00] blur-[100px] rounded-full"></div>
      </div>
      
      <div className="max-w-4xl w-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Hero Completion Card (Asymmetric Bento) */}
          <div className="md:col-span-8 bg-[#0F0F0F] border border-[#222222] p-8 flex flex-col justify-between relative overflow-hidden success-glow min-h-[400px]">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-[#CCFF00] text-6xl opacity-20" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
            </div>
            <div>
              <p className="font-label-caps text-xs text-[#CCFF00] mb-4">SYSTEM ACTIVATION COMPLETE</p>
              <h1 className="font-h1 text-4xl md:text-5xl text-[#CCFF00] leading-none mb-6">Welcome to Cinema Core</h1>
              <p className="font-body-lg text-lg text-[#c8c6c5] max-w-md mb-8">Your professional production ecosystem is now online. All hardware synced, permissions granted, and assets indexed.</p>
            </div>
            <div className="mt-auto">
              <Link href="/" className="group inline-flex items-center gap-4 bg-[#CCFF00] text-black px-8 py-5 font-label-caps text-sm tracking-[0.2em] hover:opacity-90 transition-all active:scale-95 duration-75">
                GO TO DASHBOARD
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
              </Link>
            </div>
          </div>
          
          {/* Profile Summary Panel */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-[#1A1A1A] border border-[#333333] p-6 flex-grow">
              <p className="font-label-caps text-xs text-[#c8c6c5] mb-6 border-b border-[#333333] pb-2">PROFILE_SUMMARY</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#222222] border border-[#CCFF00] overflow-hidden flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#CCFF00]">person</span>
                </div>
                <div>
                  <h3 className="font-h3 text-xl text-white leading-tight">Operator</h3>
                  <p className="font-mono-data text-xs text-[#CCFF00]">PRO</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#222222]">
                  <span className="font-label-caps text-[10px] text-[#c8c6c5]">ACTIVE_PLAN</span>
                  <span className="bg-[#CCFF00] text-black px-2 py-0.5 font-label-caps text-[9px]">ENTERPRISE</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#222222]">
                  <span className="font-label-caps text-[10px] text-[#c8c6c5]">SYNC_STATUS</span>
                  <span className="font-mono-data text-xs text-[#18c051]">STABLE</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-label-caps text-[10px] text-[#c8c6c5]">STORAGE_NODE</span>
                  <span className="font-mono-data text-xs text-white">US_WEST_01</span>
                </div>
              </div>
            </div>
            
            {/* Small Stat Module */}
            <div className="bg-[#0F0F0F] border border-[#222222] p-4 flex items-center justify-between">
              <div>
                <p className="font-label-caps text-[10px] text-[#c8c6c5]">NEXT_SESSION</p>
                <p className="font-mono-data text-sm text-white">12:00:00:00</p>
              </div>
              <span className="material-symbols-outlined text-[#333333]">schedule</span>
            </div>
          </div>
          
          {/* Technical Details Bento */}
          <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-[#0F0F0F] border border-[#222222] p-6 hover:border-[#CCFF00] transition-colors cursor-default">
              <span className="material-symbols-outlined text-[#CCFF00] mb-3">videocam</span>
              <p className="font-label-caps text-[10px] text-[#c8c6c5] mb-1">CONNECTED_GEAR</p>
              <p className="font-h3 text-xl text-white">1 UNITS</p>
            </div>
            <div className="bg-[#0F0F0F] border border-[#222222] p-6 hover:border-[#CCFF00] transition-colors cursor-default">
              <span className="material-symbols-outlined text-[#CCFF00] mb-3">dns</span>
              <p className="font-label-caps text-[10px] text-[#c8c6c5] mb-1">DATA_LAKE</p>
              <p className="font-h3 text-xl text-white">4.2 PB</p>
            </div>
            <div className="bg-[#0F0F0F] border border-[#222222] p-6 hover:border-[#CCFF00] transition-colors cursor-default">
              <span className="material-symbols-outlined text-[#CCFF00] mb-3">group</span>
              <p className="font-label-caps text-[10px] text-[#c8c6c5] mb-1">TEAM_NODES</p>
              <p className="font-h3 text-xl text-white">08 ACTIVE</p>
            </div>
            <div className="bg-[#0F0F0F] border border-[#222222] p-6 hover:border-[#CCFF00] transition-colors cursor-default">
              <span className="material-symbols-outlined text-[#CCFF00] mb-3">security</span>
              <p className="font-label-caps text-[10px] text-[#c8c6c5] mb-1">ENCRYPTION</p>
              <p className="font-h3 text-xl text-white">AES-256</p>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  )
}