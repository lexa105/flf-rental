import { updateProfile } from "../actions"

// Junior Dev Note:
// This component handles the first step of onboarding where the user sets their name and role.
// Gotcha: We are using Server Actions (updateProfile) directly in the form's `action` attribute.
// This means the form submission is handled on the server without needing `useEffect` or `useState`.

export default function ProfileSetupPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-start pt-12 pb-24 px-6 max-w-4xl mx-auto w-full">
      <div className="w-full mb-16">
        <div className="flex justify-between items-center mb-4">
          <span className="font-label-caps text-sm text-[#CCFF00]">STEP 01 // PROFILE</span>
          <span className="font-mono-data text-xs text-[#333333]">1/5</span>
        </div>
        <div className="h-1 w-full bg-[#0F0F0F] relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#CCFF00] w-1/5"></div>
        </div>
        {/* <div className="grid grid-cols-5 mt-4 gap-1">
          <div className="h-0.5 bg-[#CCFF00]"></div>
          <div className="h-0.5 bg-[#222222]"></div>
          <div className="h-0.5 bg-[#222222]"></div>
          <div className="h-0.5 bg-[#222222]"></div>
          <div className="h-0.5 bg-[#222222]"></div>
        </div> */}
      </div>
      
      <form action={updateProfile} className="w-full grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative group">
            <div className="w-48 h-48 bg-[#0F0F0F] border border-[#222222] flex items-center justify-center overflow-hidden transition-all group-hover:border-[#CCFF00]">
              <div className="absolute inset-0 bg-black flex flex-col items-center justify-center opacity-100 transition-all">
                <span className="material-symbols-outlined text-4xl text-[#CCFF00] mb-2">add_a_photo</span>
                <span className="font-label-caps text-[10px] text-white">UPLOAD PHOTO</span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#CCFF00] text-black p-1">
              <span className="material-symbols-outlined text-lg">edit</span>
            </div>
          </div>
          <p className="font-body-sm text-[#c4c9ac] text-center mt-6 max-w-[200px]">
            Drag and drop your RAW profile image or browse files. Max 10MB.
          </p>
        </div>
        
        <div className="md:col-span-8 flex flex-col gap-10">
          <div>
            <h1 className="font-h2 text-h2 text-[#ffffff] mb-2 uppercase italic tracking-tighter">CREATE PROFILE</h1>
            <p className="font-body-lg text-[#c8c6c5]">Enter a profile full name for others.</p>
          </div>
          
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-sm text-[#c4c9ac] flex justify-between">
                <span>FULL_NAME</span>
                <span className="text-[#333333]">[REQUIRED]</span>
              </label>
              <input 
                name="fullName"
                required
                className="bg-[#0F0F0F] border-b-2 border-t-0 border-l-0 border-r-0 border-[#333333] text-white p-4 font-mono-data focus:outline-none focus:border-[#CCFF00] focus:ring-0 placeholder:text-[#333333] transition-colors" 
                placeholder="ENTER OPERATOR NAME..." 
                type="text"
              />
            </div>
          </div>
          
          <div className="mt-8 flex flex-col gap-4">
            <button type="submit" className="bg-[#CCFF00] text-black font-label-caps py-4 px-8 flex justify-between items-center hover:scale-[1.01] active:scale-95 transition-all group">
              <span>CONTINUE</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
        </div>
      </form>      
    </main>
  )
}