import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Search, ChevronDown, ChevronUp, X,
  Clock, Lock, ArrowRight, MapPin,
  Briefcase, GraduationCap, IndianRupee, Users,
  ChevronRight, Loader2, AlertCircle
} from 'lucide-react'
import {
  getAllCategories,
  getSubCategoriesByCategoryId,
  getDesignationsBySubCategoryId,
  clearSubCategories,
  clearDesignations,
} from '../../../redux/slices/category/categorySlice'
import {
  setFilters,
  resetFilters,
  searchCandidates,
  fetchCandidateFilters,
} from '../../../redux/slices/database/databaseSlice'
import {
  fetchStates,
  fetchCitiesByState,
} from '../../../redux/slices/location/locationSlice'
import { fetchRemainingCredits } from '../../../redux/slices/candidateUnlock/creditDeductionSlice'
import BuyCreditsModal from '../../../components/common/BuyCreditsModal'

// ─── Static Data ──────────────────────────────────────────────────────────────
const RECENT_SEARCHES = [
  { id: 1, text: "Field Sales Executive | Nagpur | 0–1 yrs | ₹0.5–₹1L | 12th Pass" },
  { id: 2, text: "Field Sales Executive | Wardha | 0–1 yrs | ₹1–₹1.5L | Diploma" },
  { id: 3, text: "Angular Developer | Nagpur | 1–2 yrs | ₹3–₹3.5L | Graduate" },
]

const EDUCATION_OPTIONS = ['10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate']
const EDUCATION_API_MAP = {
  '10th Pass': '10th pass',
  '12th Pass': '12th pass',
  'ITI':       'iti',
  'Diploma':   'diploma',
  'Graduate':  'graduate',
  'Post Graduate': 'post graduate',
}
const EXP_MIN_OPTIONS = ['0','1','2','3','4','5','6','7','8','9','10','10+']
const EXP_MAX_OPTIONS = ['1','2','3','4','5','6','7','8','9','10','10+','15+']
const SALARY_CURRENT  = ['₹0–₹1 Lac','₹1–₹2 Lacs','₹2–₹3 Lacs','₹3–₹5 Lacs','₹5–₹8 Lacs','₹8–₹12 Lacs','₹12–₹20 Lacs','₹20 Lacs+']
const SALARY_EXPECTED = ['₹1–₹2 Lacs','₹2–₹3 Lacs','₹3–₹5 Lacs','₹5–₹8 Lacs','₹8–₹12 Lacs','₹12–₹20 Lacs','₹20 Lacs+']

// ─── Searchable Select ────────────────────────────────────────────────────────
const SearchableSelect = ({ value, onChange, options, placeholder, loading, disabled, icon: Icon, searchable }) => {
  const [open,  setOpen]  = useState(false)
  const [query, setQuery] = useState('')
  const ref    = useRef(null)
  const inpRef = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setQuery('') } }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  useEffect(() => { if (open && searchable) inpRef.current?.focus() }, [open, searchable])

  const filtered = searchable && query
    ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
    : options

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 rounded-xl px-3.5 py-[9px] text-sm border transition-all
          ${disabled
            ? 'bg-gray-50 border-gray-100 cursor-not-allowed opacity-50'
            : open
              ? 'border-purple-500 bg-purple-50/20 shadow-sm'
              : 'bg-white border-gray-200 hover:border-purple-400'
          }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${value ? 'text-purple-500' : 'text-gray-300'}`} strokeWidth={2} />}
          <span className={`truncate ${value ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>{value || placeholder}</span>
        </span>
        {loading
          ? <Loader2 className="w-3.5 h-3.5 text-purple-400 animate-spin" />
          : open
            ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 overflow-hidden">
          {searchable && (
            <div className="px-2.5 pt-2 pb-1.5 border-b border-gray-50">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <Search className="w-3 h-3 text-gray-400 flex-shrink-0" strokeWidth={2.5} />
                <input
                  ref={inpRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none"
                />
                {query && <button onClick={() => setQuery('')}><X className="w-3 h-3 text-gray-400 hover:text-gray-600" /></button>}
              </div>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 p-3 text-center">No results found</p>
              : filtered.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                  className={`w-full text-left text-sm px-3.5 py-2.5 transition-colors
                    ${value === opt.label ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50/50'}`}
                >
                  {opt.label}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Label ────────────────────────────────────────────────────────────────────
const Label = ({ children, required, optional }) => (
  <p className="text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
    {children}
    {required && <span className="text-red-400">*</span>}
    {optional && <span className="font-normal text-gray-400">(optional)</span>}
  </p>
)

const SubLabel = ({ children }) => (
  <p className="text-[11px] text-gray-400 mb-1">{children}</p>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const RightSidebar = ({ remainingCredits, onBuyCreditsClick }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="w-64 flex-shrink-0 space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
              <Lock className="w-3 h-3 text-purple-600" strokeWidth={2.5} />
            </span>
            <span className="text-xs font-bold text-gray-700">Database Credits</span>
          </div>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
        </button>

        {open && (
          <div className="px-3 pb-3 space-y-2 border-t border-gray-50">
            <div className="mt-2 bg-purple-50/80 border border-purple-100 rounded-xl p-3">
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Available Credits</p>
              <p className="text-2xl font-black text-purple-900 mt-0.5">{remainingCredits ?? 0}</p>
            </div>

            <div className="mt-2 space-y-1.5">
              {[['1 Profile Unlock','= 1 Credit'],['1 Excel Download','= 2 Credits']].map(([a,b]) => (
                <div key={a} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <Lock className="w-3 h-3 text-gray-300" strokeWidth={2} />
                  <span className="text-[11px] text-gray-500 flex-1">{a}</span>
                  <span className="text-[11px] font-bold text-gray-700">{b}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 px-0.5 leading-relaxed">
              Already-unlocked profiles cost 1 credit for Excel export.
            </p>
            <button
              type="button"
              onClick={onBuyCreditsClick}
              className="w-full cursor-pointer flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-[11px] font-bold rounded-xl py-2.5 transition shadow-sm shadow-purple-200"
            >
              Buy Credits <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const SearchCandidate = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { categories, subCategories, designations, loading, subLoading, desigLoading } =
    useSelector(s => s.category)
  const { states, citiesByState, statesLoading, citiesLoading } =
    useSelector(s => s.location || {})
  const { filterOptions } = useSelector(s => s.database || {})
  const { remainingCredits } = useSelector(s => s.creditDeduction || {})

  // Local UI state
  const [cat,   setCat]   = useState(null)
  const [sub,   setSub]   = useState(null)
  const [desig, setDesig] = useState(null)
  const [stateObj, setStateObj] = useState(null)
  const [cityObj,  setCityObj]  = useState(null)
  const [expMinLabel, setExpMinLabel] = useState(null)
  const [expMaxLabel, setExpMaxLabel] = useState(null)
  const [salaryLabel, setSalaryLabel] = useState(null)
  const [edu,   setEdu]   = useState([])
  const [searchType, setSearchType] = useState('any')
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false)

  // Validation Logic
  const isFormInvalid = !cat || !sub || !desig;

  useEffect(() => {
    dispatch(getAllCategories())
    dispatch(fetchStates())
    dispatch(fetchCandidateFilters())
    dispatch(fetchRemainingCredits())
  }, [dispatch])

  const educationList = filterOptions?.education?.length
    ? filterOptions.education
    : EDUCATION_OPTIONS;

  const ctcList = filterOptions?.ctc?.length
    ? filterOptions.ctc
    : SALARY_EXPECTED;

  const expList = filterOptions?.experience?.length
    ? filterOptions.experience
    : ['0-1 Years', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years'];

  const onCat = opt => {
    setCat(opt); setSub(null); setDesig(null)
    dispatch(clearSubCategories())
    dispatch(getSubCategoriesByCategoryId(opt.value))
  }
  const onSub = opt => {
    setSub(opt); setDesig(null)
    dispatch(clearDesignations())
    dispatch(getDesignationsBySubCategoryId(opt.value))
  }
  const onState = opt => {
    setStateObj(opt)
    setCityObj(null)
    if (opt?.label || opt?.isoCode) {
      dispatch(fetchCitiesByState({
        countryCode: 'IN',
        stateCode: opt.isoCode || opt.code || opt.value || opt.label,
        stateName: opt.label,
      }))
    }
  }

  const toggleEdu = e => setEdu(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e])

  const handleReset = () => {
    setSearchType('any'); setCat(null); setSub(null); setDesig(null)
    dispatch(clearSubCategories()); dispatch(clearDesignations())
    setStateObj(null); setCityObj(null)
    setExpMinLabel(null); setExpMaxLabel(null)
    setSalaryLabel(null); setEdu([])
    dispatch(resetFilters())
  }

// const handleSearch = () => {
//   if (isFormInvalid) return;

//   const filters = {
//     searchingFor: searchType,
//     state: stateObj?.label || '',
//     city: cityObj?.label || '',
//     minExperience: expMinLabel || '',
//     maxExperience: expMaxLabel || '',
//     education: edu.length > 0 ? EDUCATION_API_MAP[edu[edu.length - 1]] : '',
//     category: cat?.value || '',
//     subCategory: sub?.value || '',
//     designation: desig?.value || '',
//     ...(searchType === 'fresher'
//       ? { expectedCTC: salaryLabel || '', currentCTC: '' }
//       : { currentCTC: salaryLabel || '', expectedCTC: '' }
//     ),
//     page: 1,
//     limit: 10,
//   }

//   dispatch(setFilters(filters)) // This now saves to localStorage via Slice
//   dispatch(searchCandidates(filters))
//   navigate('/database/search/filtered')
// }


const handleSearch = () => {
  if (isFormInvalid) return;

  const filters = {
    searchingFor: searchType === 'any' ? 'any' : 'any',
    searchTypeUI: searchType,
    state: stateObj?.label || '',
    city: cityObj?.label || '',
    minExperience: '',
    maxExperience: '',
    education: edu.length > 0 ? EDUCATION_API_MAP[edu[edu.length - 1]] : '',
    category: cat?.value || '',
    subCategory: sub?.value || '',
    designation: desig?.value || '',
    currentCTC: '',
    expectedCTC: '',
    page: 1,
    limit: 10,
  }

  dispatch(setFilters(filters))
  dispatch(searchCandidates(filters))
  navigate('/database/search/filtered')
}

  const catOpts   = categories.map(c  => ({ value: c._id,  label: c.name }))
  const subOpts   = subCategories.map(s => ({ value: s._id, label: s.name }))
  const desigOpts = designations.map(d  => ({ value: d._id, label: d.name }))

  // Only real data from backend Location APIs (no static fallback)
  const stateOpts = Array.isArray(states)
    ? states.map(s => ({
        value: s.name,
        label: s.name,
        isoCode: s.isoCode,
      }))
    : []

  const selectedStateName = stateObj?.label || stateObj?.value || ''
  const apiCities = selectedStateName ? citiesByState[selectedStateName] : null
  const cityOpts = (stateObj && Array.isArray(apiCities))
    ? apiCities.map(c => {
        const cityName = typeof c === 'string' ? c : (c?.name || '')
        return { value: cityName, label: cityName }
      })
    : []

  const isFresher  = searchType === 'fresher'
  const salaryOpts = isFresher ? SALARY_EXPECTED : SALARY_CURRENT

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <div className="min-h-screen bg-white rounded-xl p-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-9xl mx-auto space-y-5">

          {/* Banner */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 40%, #9333EA 70%, #DB2777 100%)' }}
          >
            <p className="text-purple-200 text-[10px] font-bold  tracking-widest mb-1 flex items-center gap-1.5">
              <span className="w-0.5 h-3 bg-pink-300 rounded-full" />
                Database &gt; Search Candidates
            </p>
            <h1 className="text-white text-xl font-extrabold">Search Candidates</h1>
            <p className="text-purple-200/80 text-xs mt-0.5">Find the right talent from our database of verified professionals</p>
            <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
            <div className="absolute right-24 bottom-0 w-12 h-12 rounded-full bg-pink-500/20 pointer-events-none" />
          </div>

          <div className="flex gap-5 items-start">

            {/* Form */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Search bar */}
              {/* <div className="px-5 py-3.5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-2.5 bg-[#F4F5FA] border border-gray-200 rounded-xl px-3.5 py-2.5">
                  <Search className="w-3.5 h-3.5 text-purple-400" strokeWidth={2.5} />
                  <input
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    placeholder="Quick search by name, skill, or keyword…"
                  />
                </div>
              </div> */}

              <div className="p-5 space-y-5">

                {/* A – Searching For */}
                <div>
                  <Label required>Searching For</Label>
                  <div className="flex gap-2">
                    {[
                      ['fresher',     'Freshers Only', Users],
                      ['experienced', 'Experienced Only', Briefcase],
                      ['any',         'Any', Search],
                    ].map(([v, l, I]) => (
                      <button
                        key={v} type="button"
                        onClick={() => { setSearchType(v); setExpMinLabel(null); setExpMaxLabel(null) }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                          ${searchType === v
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                          }`}
                      >
                        <I className="w-3.5 h-3.5" strokeWidth={2} />{l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* B – Job Role */}
                <div>
                  <Label required>Job Role</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <SubLabel>Category <span className="text-red-500">*</span></SubLabel>
                      <SearchableSelect value={cat?.label} onChange={onCat} options={catOpts} placeholder="Select Category" loading={loading} icon={Briefcase} searchable />
                    </div>
                    <div>
                      <SubLabel>Sub-category <span className="text-red-500">*</span></SubLabel>
                      <SearchableSelect value={sub?.label} onChange={onSub} options={subOpts} placeholder="Select Sub-category" loading={subLoading} disabled={!cat} icon={ChevronRight} searchable />
                    </div>
                    <div>
                      <SubLabel>Designation <span className="text-red-500">*</span></SubLabel>
                      <SearchableSelect value={desig?.label} onChange={setDesig} options={desigOpts} placeholder="Select Designation" loading={desigLoading} disabled={!sub} icon={ChevronRight} searchable />
                    </div>
                  </div>
                </div>

                {/* C – Location */}
                <div>
                  <Label>Location <span className="text-gray-400">(Optional)</span></Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <SubLabel>State</SubLabel>
                      <SearchableSelect
                        value={stateObj?.label}
                        onChange={onState}
                        options={stateOpts}
                        placeholder={statesLoading ? "Loading states..." : "Select State"}
                        loading={statesLoading}
                        icon={MapPin}
                        searchable
                      />
                    </div>
                    <div>
                      <SubLabel>City</SubLabel>
                      <SearchableSelect
                        value={cityObj?.label}
                        onChange={setCityObj}
                        options={cityOpts}
                        placeholder={citiesLoading ? "Loading cities..." : (stateObj ? "Select City" : "Select state first")}
                        loading={citiesLoading}
                        disabled={!stateObj}
                        icon={MapPin}
                        searchable
                      />
                    </div>
                  </div>
                </div>

                {/* D – Experience */}
                {searchType !== 'fresher' && (
                  <div>
                    <Label>Experience  <span className="text-gray-400">(Optional)</span></Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <SubLabel>Minimum</SubLabel>
                        <SearchableSelect
                          value={expMinLabel}
                          onChange={o => setExpMinLabel(o.value)}
                          options={expList.map(v => ({ value: v, label: v }))}
                          placeholder="Min experience" icon={Briefcase}
                        />
                      </div>
                      <div>
                        <SubLabel>Maximum</SubLabel>
                        <SearchableSelect
                          value={expMaxLabel}
                          onChange={o => setExpMaxLabel(o.value)}
                          options={expList.map(v => ({ value: v, label: v }))}
                          placeholder="Max experience" icon={Briefcase}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* E – Salary */}
                <div>
                  <Label>{isFresher ? 'Expected CTC' : 'Current CTC'} <span className="text-gray-400">(Optional)</span></Label>
                  <div className="grid grid-cols-2 gap-3">
                    <SearchableSelect
                      value={salaryLabel}
                      onChange={o => setSalaryLabel(o.label)}
                      options={ctcList.map(v => ({ value: v, label: v }))}
                      placeholder={isFresher ? 'Expected CTC range' : 'Current CTC range'}
                      icon={IndianRupee}
                    />
                  </div>
                </div>

                {/* F – Education */}
                <div>
                  <Label optional>Minimum Education</Label>
                  <div className="flex flex-wrap gap-2">
                    {educationList.map(e => {
                      const on = edu.includes(e)
                      return (
                        <button
                          key={e} type="button" onClick={() => toggleEdu(e)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all
                            ${on
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-200'
                              : 'bg-white text-gray-500 border-gray-200 hover:border-purple-400 hover:text-purple-600'
                            }`}
                        >
                          <GraduationCap className="w-3 h-3" strokeWidth={2} />
                          {e}
                          {on && <X className="w-3 h-3 opacity-70" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button type="button" onClick={handleReset}
                    className="text-sm font-semibold text-gray-400 hover:text-gray-600 transition">
                    Reset filters
                  </button>
                  
                  <div className="flex items-center gap-4">
                    {isFormInvalid && (
                      <span className="flex items-center gap-1.5 text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                        <AlertCircle className="w-3 h-3" />
                        Select Role details to search
                      </span>
                    )}
                    <button 
                      type="button" 
                      onClick={handleSearch}
                      disabled={isFormInvalid}
                      className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-xl transition-all shadow-md 
                        ${isFormInvalid 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                          : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white shadow-purple-200'
                        }`}
                    >
                      <Search className="w-4 h-4" strokeWidth={2.5} />
                      Search Candidates
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <RightSidebar
              remainingCredits={remainingCredits}
              onBuyCreditsClick={() => setIsBuyCreditsOpen(true)}
            />
          </div>

          <p className="text-center text-[11px] text-gray-400 pb-2">
            © 2024 MyJob – Job Portal. All rights reserved.
          </p>
        </div>
      </div>

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </>
  )
}

export default SearchCandidate