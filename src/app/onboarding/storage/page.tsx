import { addLocations } from "../actions"

// Junior Dev Note:
// This component handles the third step where users set their primary and secondary storage locations.
// Gotcha: The visual map area is currently static and decorative. It doesn't update based on form inputs.

export default function StorageSetupPage() {
  return (
    <main className="min-h-[calc(100vh-120px)] p-6 max-w-7xl mx-auto flex flex-col pt-12 pb-24 w-full">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-sm text-[#c3f400]">STEP 03</span>
            <span className="font-label-caps text-sm text-[#333333]">/ 05</span>
          </div>
          <span className="font-label-caps text-sm text-[#c3f400]">STORAGE LOCATIONS</span>
        </div>
        <div className="w-full h-[2px] bg-[#1A1A1A] flex">
          <div className="w-1/5 h-full bg-[#c3f400] opacity-40"></div>
          <div className="w-1/5 h-full bg-[#c3f400] opacity-40"></div>
          <div className="w-1/5 h-full bg-[#c3f400]"></div>
          <div className="w-1/5 h-full bg-transparent"></div>
          <div className="w-1/5 h-full bg-transparent"></div>
        </div>
      </div>

      {/* Main Layout: Bento Grid Style */}
      <form action={addLocations} className="grid grid-cols-12 gap-4">
        {/* Address Inputs (Left Column) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          
          {/* Primary Home Address */}
          <div className="bg-[#0F0F0F] border border-[#222222] p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#c3f400]"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-caps text-xs text-[#c3f400] mb-1">LOCATION_01</p>
                <h2 className="font-h3 text-xl text-white">PRIMARY HOME</h2>
              </div>
              <span className="material-symbols-outlined text-[#c3f400]" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <label className="font-label-caps text-xs text-[#666666] block mb-2">STREET ADDRESS</label>
                <input 
                  name="primaryStreet"
                  required
                  className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 placeholder:text-[#333333]" 
                  placeholder="e.g. 124 Industrial Dr" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="font-label-caps text-xs text-[#666666] block mb-2">CITY</label>
                  <input 
                    name="primaryCity"
                    required
                    className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 placeholder:text-[#333333]" 
                    placeholder="Los Angeles" 
                    type="text"
                  />
                </div>
                <div className="relative">
                  <label className="font-label-caps text-xs text-[#666666] block mb-2">POSTAL CODE</label>
                  <input 
                    name="primaryZip"
                    required
                    className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 placeholder:text-[#333333]" 
                    placeholder="90001" 
                    type="text"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Storage */}
          <div className="bg-[#0F0F0F] border border-[#222222] p-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#333333] group-focus-within:bg-[#c3f400] transition-colors"></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="font-label-caps text-xs text-[#666666] mb-1">LOCATION_02</p>
                <h2 className="font-h3 text-xl text-white">GEAR STORAGE</h2>
              </div>
              <span className="material-symbols-outlined text-[#333333]">inventory_2</span>
            </div>
            
            <div className="space-y-6 opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <label className="font-label-caps text-xs text-[#666666] block mb-2">STREET ADDRESS (OPTIONAL)</label>
                <input 
                  name="secondaryStreet"
                  className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 placeholder:text-[#333333]" 
                  placeholder="e.g. Unit 402, Vault Storage" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="font-label-caps text-xs text-[#666666] block mb-2">CITY</label>
                  <input 
                    name="secondaryCity"
                    className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 placeholder:text-[#333333]" 
                    placeholder="Burbank" 
                    type="text"
                  />
                </div>
                <div className="relative">
                  <label className="font-label-caps text-xs text-[#666666] block mb-2">SECURITY TYPE</label>
                  <select className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#c3f400] transition-colors text-white py-2 focus:ring-0 px-0 appearance-none">
                    <option>CLIMATE CONTROLLED</option>
                    <option>STANDARD VAULT</option>
                    <option>OFFICE SPACE</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button type="submit" className="w-full bg-[#c3f400] text-black font-label-caps text-sm py-4 tracking-[0.2em] flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            SAVE_AND_CONTINUE
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Visual Map Area (Right Column) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <div className="h-full min-h-[400px] bg-[#0F0F0F] border border-[#222222] relative overflow-hidden group">
            <div className="absolute inset-0 bg-cover bg-center grayscale opacity-50 group-hover:opacity-70 transition-opacity bg-[#222]"></div>
            <div className="absolute inset-0 map-gradient"></div>
            
            {/* Marker 1: Home */}
            <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="bg-[#c3f400] text-black p-2 mb-1 shadow-lg shadow-[#c3f400]/20 border-2 border-black">
                <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>home</span>
              </div>
              <div className="bg-black/80 backdrop-blur-sm border border-[#222222] px-3 py-1">
                <span className="font-mono-data text-[10px] text-[#c3f400] tracking-tighter">LOC_01: HOME_BASE</span>
              </div>
            </div>
            
            {/* Marker 2: Gear (Draft state) */}
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 flex flex-col items-center opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all">
              <div className="bg-[#1A1A1A] text-[#c3f400] p-2 mb-1 border border-[#c3f400]/30">
                <span className="material-symbols-outlined">inventory_2</span>
              </div>
              <div className="bg-black/80 backdrop-blur-sm border border-[#222222] px-3 py-1">
                <span className="font-mono-data text-[10px] text-[#666666] tracking-tighter">LOC_02: PENDING...</span>
              </div>
            </div>

            {/* Interface Overlays */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <div className="bg-black/90 border border-[#222222] px-4 py-2">
                <p className="font-label-caps text-[10px] text-[#666666] mb-1">LAT / LONG</p>
                <p className="font-mono-data text-xs text-[#c3f400] tracking-widest">34.0522° N, 118.2437° W</p>
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-black/90 border border-[#222222] p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0F0F0F] border border-[#222222] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#c3f400]">verified_user</span>
                </div>
                <div>
                  <p className="font-label-caps text-xs text-white">PRECISION ENCRYPTION</p>
                  <p className="font-body-sm text-[10px] text-[#666666]">Location data is AES-256 protected for gear safety.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="p-2 border border-[#333333] hover:border-[#c3f400] transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button type="button" className="p-2 border border-[#333333] hover:border-[#c3f400] transition-colors">
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Meta Info Strip */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0F0F0F] border border-[#222222] p-4 flex flex-col gap-1">
              <p className="font-label-caps text-[10px] text-[#666666]">HUB_STATUS</p>
              <p className="font-mono-data text-sm text-[#CCFF00]">ACTIVE_READY</p>
            </div>
            <div className="bg-[#0F0F0F] border border-[#222222] p-4 flex flex-col gap-1">
              <p className="font-label-caps text-[10px] text-[#666666]">COURIER_ZONE</p>
              <p className="font-mono-data text-sm text-white">ZONE_04 [L.A.]</p>
            </div>
            <div className="bg-[#0F0F0F] border border-[#222222] p-4 flex flex-col gap-1">
              <p className="font-label-caps text-[10px] text-[#666666]">PICKUP_AVAIL</p>
              <p className="font-mono-data text-sm text-white">24/7 ACCESS</p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}