import { addEquipment } from "../actions"

// Junior Dev Note:
// This component handles the second step where users add their first piece of gear.
// Gotcha: There are two submit buttons here (Add Item, Bulk Import, and a Skip button). 
// 'formNoValidate' is used on the skip button to bypass HTML5 validation.

export default function GearSetupPage() {
  return (
    <main className="flex-grow flex flex-col items-center cinema-grid pt-12 pb-24 px-4">
      {/* Progress Stepper */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between items-center mb-4">
          <span className="font-label-caps text-sm text-[#c3f400]">STEP 02</span>
          <span className="font-label-caps text-sm text-[#474746]">INITIAL_ASSET_INGEST</span>
        </div>
        <div className="h-1 w-full bg-[#201f1f] flex gap-1">
          <div className="h-full w-1/5 bg-[#c3f400]"></div>
          <div className="h-full w-1/5 bg-[#c3f400]"></div>
          <div className="h-full w-1/5 bg-[#353534]"></div>
          <div className="h-full w-1/5 bg-[#353534]"></div>
          <div className="h-full w-1/5 bg-[#353534]"></div>
        </div>
      </div>

      <form action={addEquipment} className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel: Form */}
        <div className="lg:col-span-7 bg-[#0F0F0F] border border-[#222222] p-8">
          <div className="mb-8">
            <h1 className="font-h2 text-h2 text-white mb-2 uppercase">GEAR_LISTING</h1>
            <p className="font-body-sm text-[#c8c6c5]">Register your primary production equipment to initialize the warehouse database.</p>
          </div>
          
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="font-label-caps text-sm text-[#c8c6c5] block mb-2">ASSET_NAME</label>
                <input 
                  name="name"
                  required
                  className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#CCFF00] focus:ring-0 text-white font-mono-data py-2 placeholder:text-[#353534] transition-colors" 
                  placeholder="e.g. ARRI ALEXA 35" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="font-label-caps text-sm text-[#c8c6c5] block mb-2">CATEGORY</label>
                  <select 
                    name="category"
                    className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#CCFF00] focus:ring-0 text-white font-mono-data py-2 appearance-none transition-colors"
                  >
                    <option>CAMERA_BODY</option>
                    <option>LENS_PRIME</option>
                    <option>LENS_ZOOM</option>
                    <option>LIGHTING</option>
                    <option>GRIP</option>
                    <option>AUDIO</option>
                  </select>
                </div>
                <div className="group">
                  <label className="font-label-caps text-sm text-[#c8c6c5] block mb-2">SERIAL_NO</label>
                  <input 
                    name="serialNumber"
                    className="w-full bg-[#0F0F0F] border-0 border-b-2 border-[#333333] focus:border-[#CCFF00] focus:ring-0 text-white font-mono-data py-2 placeholder:text-[#353534] transition-colors" 
                    placeholder="SN-000000" 
                    type="text"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex items-center gap-4">
              <button type="submit" className="bg-[#CCFF00] text-black font-label-caps px-8 h-12 hover:opacity-90 active:scale-95 transition-all">
                ADD_ITEM
              </button>
              <button type="button" className="text-[#CCFF00] font-label-caps px-6 h-12 border border-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-all">
                BULK_IMPORT
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Visual Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1A1A1A] border border-[#333333] h-full overflow-hidden flex flex-col">
            <div className="bg-[#222222] px-4 py-2 border-b border-[#333333]">
              <span className="font-label-caps text-sm text-[#CCFF00]">DATABASE_PREVIEW</span>
            </div>
            <div className="flex-grow p-6 flex flex-col">
              <div className="border border-[#222222] bg-[#0F0F0F] p-4 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#222222] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#333333]">videocam</span>
                </div>
                <div className="flex-grow">
                  <div className="h-2 w-24 bg-[#333333] mb-2"></div>
                  <div className="h-2 w-16 bg-[#222222]"></div>
                </div>
              </div>
              <div className="border border-dashed border-[#333333] flex-grow flex flex-col items-center justify-center p-8 text-center">
                <span className="material-symbols-outlined text-[#333333] text-4xl mb-4">inventory_2</span>
                <p className="font-mono-data text-xs text-[#353534] uppercase tracking-widest">Awaiting local asset entry</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="lg:col-span-12 mt-8 flex justify-between items-center w-full">
          <button type="submit" formNoValidate className="font-label-caps text-sm text-[#474746] hover:text-white transition-colors">
            SKIP_FOR_NOW
          </button>
          <button type="submit" formNoValidate className="bg-[#CCFF00] text-black font-label-caps flex items-center gap-2 px-12 h-14 hover:scale-[1.02] active:scale-95 transition-all">
            CONTINUE
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </form>
    </main>
  )
}