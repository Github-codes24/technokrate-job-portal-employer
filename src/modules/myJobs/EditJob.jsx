import React, { useRef, useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import {
  ArrowLeft, Bold, Italic, Underline, Strikethrough,
  Link, List, ListOrdered, ChevronDown, ChevronLeft, ChevronRight,
  Briefcase, MapPin, DollarSign, GraduationCap,
  Calendar, Users, Save, AlertCircle, CheckCircle,
  Award, TrendingUp, FileText, X, Plus, Check, Wifi,
} from 'lucide-react'
import { Country, State, City } from 'country-state-city'
import { updateJob, getJobDetails, getJobPostType, getJobOptions } from '../../redux/slices/companyJobs/jobSlice'
import { fetchCountries } from '../../redux/slices/location/locationSlice'
import {
  getAllCategories,
  getSubCategoriesByCategoryId,
  getDesignationsBySubCategoryId,
  clearSubCategories,
  clearDesignations,
} from '../../redux/slices/category/categorySlice'

// ─── Constants Fallbacks ──────────────────────────────────────────────────────
const DEFAULT_EDUCATION_OPTIONS = ['10th Pass', '12th Pass', 'ITI', 'Diploma', 'Graduate', 'Post Graduate']
const DEFAULT_JOB_TYPES = ['Full-Time', 'Part-Time', 'Internship']
const DEFAULT_WORK_MODES = ['On-Site', 'Remote', 'Hybrid']
const DEFAULT_SALARY_TYPES = ['Monthly', 'Yearly']
const DEFAULT_JOB_LEVELS = ['Entry-Level', 'Mid-Level', 'Senior-Level']
const DEFAULT_EXPERIENCE_RANGES = ['Fresher', '0-1 Years', '1-3 Years', '3-5 Years', '5-8 Years', '8+ Years']

// ─── Strip HTML for validation length check ───────────────────────────────────
const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, '').trim()

// ─── Validation ───────────────────────────────────────────────────────────────
const validationSchema = Yup.object({
  jobTitle: Yup.string()
    .required('Job title is required')
    .min(5, 'Min 5 characters')
    .max(80, 'Max 80 characters')
    .matches(/^[a-zA-Z0-9\s()/\-&+.,#]+$/, 'Job title contains invalid characters'),
  categoryId: Yup.string().required('Category is required'),
  subCategoryId: Yup.string().required('Sub-category is required'),
  designationId: Yup.string().required('Designation is required'),
  countryCode: Yup.string().required('Country is required'),
  stateCode: Yup.string().required('State is required'),
  cityName: Yup.string().required('City is required'),
  skillsRequired: Yup.array()
    .of(
      Yup.string()
        .trim()
        .required('Skill name cannot be empty')
        .min(2, 'Skill must be at least 2 characters')
        .max(35, 'Skill cannot exceed 35 characters')
        .matches(/^[a-zA-Z0-9\s.+\-/#]+$/, 'Skill contains invalid characters')
    )
    .min(1, 'At least one skill is required')
    .max(15, 'Maximum 15 skills allowed')
    .required('Required'),
  minSalary: Yup.number()
    .typeError('Must be a number')
    .required('Required')
    .positive('Must be a positive number')
    .integer('Must be an integer')
    .min(0, 'Min salary must be at least 0')
    .max(10000000, 'Min salary cannot exceed ₹1,00,00,000'),
  maxSalary: Yup.number()
    .typeError('Must be a number')
    .required('Required')
    .integer('Must be an integer')
    .min(0, 'Max salary must be at least 0')
    .max(10000000, 'Max salary cannot exceed ₹1,00,00,000'),
  salaryType: Yup.string().required('Salary type is required'),
  education: Yup.array().of(Yup.string()).min(1, 'Select at least one education level').required(),
  experience: Yup.string().required('Experience is required'),
  jobType: Yup.string().required('Job type is required'),
  workMode: Yup.string().required('Work mode is required'),
  vacancies: Yup.number()
    .typeError('Must be a number')
    .required('Required')
    .positive('Must be a positive number')
    .integer('Must be an integer')
    .min(1, 'At least 1 vacancy is required')
    .max(1000, 'Vacancies cannot exceed 1000'),
  expireDate: Yup.string()
    .required('Expiry date is required')
    .test('is-future', 'Expiry date must be in the future', function (value) {
      if (!value) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(value);
      return inputDate >= today;
    }),
  jobLevel: Yup.string().required('Job level is required'),
  description: Yup.string()
    .required('Job description is required')
    .test('min-text', 'Job description must be at least 50 characters', v => stripHtml(v).length >= 50)
    .test('max-text', 'Job description cannot exceed 2500 characters', v => stripHtml(v).length <= 2500),
  responsibilities: Yup.string()
    .required('Responsibilities are required')
    .test('min-text', 'Responsibilities must be at least 50 characters', v => stripHtml(v).length >= 50)
    .test('max-text', 'Responsibilities cannot exceed 2500 characters', v => stripHtml(v).length <= 2500),
  postJobType: Yup.string().required('Select a posting type'),
})

const stepFields = [
  ['jobTitle', 'categoryId', 'subCategoryId', 'designationId', 'skillsRequired', 'countryCode', 'stateCode', 'cityName', 'jobType', 'workMode'],
  ['minSalary', 'maxSalary', 'salaryType', 'education', 'experience', 'vacancies', 'expireDate', 'jobLevel'],
  ['description', 'responsibilities'],
  ['postJobType'],
]

// ─── Multi-Select Education ───────────────────────────────────────────────────
const MultiSelectEducation = ({ formik, name = 'education', label = 'Education', options = DEFAULT_EDUCATION_OPTIONS, required }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = formik.values[name] || []
  const hasError = formik.touched[name] && formik.errors[name]
  const eduOptions = (options && options.length > 0) ? options : DEFAULT_EDUCATION_OPTIONS

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const toggle = (opt) => {
    const next = selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]
    formik.setFieldValue(name, next)
    formik.setFieldTouched(name, true, false)
  }
  const removeChip = (opt, e) => {
    e.stopPropagation()
    formik.setFieldValue(name, selected.filter(x => x !== opt))
    formik.setFieldTouched(name, true, false)
  }

  return (
    <div ref={ref} className="relative space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <GraduationCap className="w-4 h-4 text-gray-400" />
        {label}{required && <span className="text-red-500 text-xs">*</span>}
      </label>
      <div onClick={() => setOpen(o => !o)}
        className={`min-h-[42px] w-full border-2 rounded-xl px-3 py-2 flex items-center flex-wrap gap-1.5 cursor-pointer transition-all bg-white
          ${hasError ? 'border-red-400' : open ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-400'}`}>
        {selected.length === 0
          ? <span className="text-sm text-gray-400 flex-1">Select education level(s)</span>
          : selected.map(opt => (
            <span key={opt} className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {opt}
              <button type="button" onClick={e => removeChip(opt, e)} className="hover:text-purple-900 ml-0.5"><X className="w-3 h-3" /></button>
            </span>
          ))
        }
        <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 max-h-60 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-50 sticky top-0 bg-white">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Select all that apply</p>
          </div>
          {eduOptions.map(opt => {
            const checked = selected.includes(opt)
            return (
              <button key={opt} type="button" onClick={() => toggle(opt)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${checked ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50/50'}`}>
                <span className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${checked ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                  {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </span>
                {opt}
              </button>
            )
          })}
          {selected.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-50 flex items-center justify-between sticky bottom-0 bg-white">
              <span className="text-[11px] text-gray-400">{selected.length} selected</span>
              <button type="button" onClick={() => { formik.setFieldValue(name, []); formik.setFieldTouched(name, true, false) }}
                className="text-[11px] font-semibold text-red-400 hover:text-red-600">Clear all</button>
            </div>
          )}
        </div>
      )}
      {hasError && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {formik.errors[name]}</p>}
    </div>
  )
}

// ─── Rich Toolbar ─────────────────────────────────────────────────────────────
const RichToolbar = ({ editorRef }) => {
  const exec = (cmd) => {
    editorRef.current?.focus()
    if (cmd === 'createLink') {
      const url = prompt('Enter URL:', 'https://')
      if (url) document.execCommand('createLink', false, url)
    } else {
      document.execCommand(cmd, false, null)
    }
  }
  const tools = [
    { Icon: Bold, cmd: 'bold', title: 'Bold' },
    { Icon: Italic, cmd: 'italic', title: 'Italic' },
    { Icon: Underline, cmd: 'underline', title: 'Underline' },
    { Icon: Strikethrough, cmd: 'strikeThrough', title: 'Strikethrough', sep: true },
    { Icon: Link, cmd: 'createLink', title: 'Insert Link' },
    { Icon: List, cmd: 'insertUnorderedList', title: 'Bullet List', sep: true },
    { Icon: ListOrdered, cmd: 'insertOrderedList', title: 'Numbered List' },
  ]
  return (
    <div className="flex items-center gap-0.5 px-3 py-2 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
      {tools.map(({ Icon, cmd, title, sep }) => (
        <React.Fragment key={cmd}>
          {sep && <div className="w-px h-5 bg-gray-300 mx-1.5" />}
          <button
            type="button"
            title={title}
            onMouseDown={e => {
              e.preventDefault()
              exec(cmd)
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-600 transition-all hover:scale-105"
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}

const RichEditor = ({ placeholder, onChange, onBlur, defaultValue = '', error, stableKey }) => {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && defaultValue && !editorRef.current.innerHTML.trim()) {
      editorRef.current.innerHTML = defaultValue
    }
  }, [stableKey])

  return (
    <div key={stableKey}
      className={`border rounded-xl overflow-hidden transition-all ${error ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'
        }`}>
      <RichToolbar editorRef={editorRef} />
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        onBlur={onBlur}
        className="w-full min-h-[160px] max-h-[320px] overflow-auto px-4 py-3 text-sm text-gray-700 outline-none bg-white whitespace-pre-wrap break-words break-all overflow-wrap-anywhere max-w-full
                    [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5"
        data-placeholder={placeholder}
        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
      />
      <style>{`[contenteditable]:empty:before{content:attr(data-placeholder);color:#9ca3af;pointer-events:none;}`}</style>
    </div>
  )
}

// ─── Form Components ──────────────────────────────────────────────────────────
const FormSection = ({ title, icon: Icon, children, description }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 rounded-t-2xl">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 rounded-lg"><Icon className="w-4 h-4 text-purple-600" /></div>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {description && <p className="text-xs text-gray-500 mt-1 ml-7 sm:ml-8">{description}</p>}
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
)

const SelectField = ({ label, name, required, icon: Icon, placeholder, options = [], loading, disabled, formik, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const hasError = formik.touched[name] && formik.errors[name]
  const currentVal = formik.values[name]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formattedOptions = useMemo(() => {
    return (options || []).map(o => {
      if (typeof o === 'object' && o !== null) {
        const val = o._id !== undefined ? o._id : (o.value !== undefined ? o.value : o.id)
        const lbl = o.name || o.label || o.title || String(val)
        return { value: String(val ?? ''), label: String(lbl ?? '') }
      }
      return { value: String(o ?? ''), label: String(o ?? '') }
    })
  }, [options])

  const safeOptions = useMemo(() => {
    if (currentVal === undefined || currentVal === null || currentVal === '') return formattedOptions
    const found = formattedOptions.some(o => o.value === String(currentVal))
    if (found) return formattedOptions
    return [{ value: String(currentVal), label: String(currentVal) }, ...formattedOptions]
  }, [formattedOptions, currentVal])

  const selectedOption = safeOptions.find(o => o.value === String(currentVal))

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return safeOptions
    return safeOptions.filter(o => o.label.toLowerCase().includes(search.toLowerCase().trim()))
  }, [safeOptions, search])

  const handleSelect = (val) => {
    if (disabled || loading) return
    formik.setFieldValue(name, val, true)
    formik.setFieldTouched(name, true, false)
    formik.setFieldError(name, undefined)
    if (onChange) {
      onChange({ target: { name, value: val } })
    }
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={ref} className="relative space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}{required && <span className="text-red-500 text-xs">*</span>}
      </label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setOpen(o => !o)}
          className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all bg-white text-left flex items-center justify-between cursor-pointer
            disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
            ${hasError ? 'border-red-400' : open ? 'border-purple-500 ring-2 ring-purple-100' : 'border-gray-200 hover:border-purple-300'}`}
        >
          <span className={selectedOption && selectedOption.value !== '' ? 'text-gray-900 font-medium truncate' : 'text-gray-400 truncate'}>
            {loading ? 'Loading…' : (selectedOption && selectedOption.value !== '' ? selectedOption.label : placeholder || 'Select option')}
          </span>
          {loading ? (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin flex-shrink-0 ml-2" />
          ) : (
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          )}
        </button>

        {open && !disabled && !loading && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col">
            {safeOptions.length > 6 && (
              <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-purple-500 bg-white"
                />
              </div>
            )}
            <div className="overflow-y-auto max-h-52 divide-y divide-gray-50">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-400 text-center">No options found</div>
              ) : (
                filteredOptions.map(opt => {
                  const isSelected = String(currentVal) === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between cursor-pointer
                        ${isSelected ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700 hover:bg-purple-50/60'}`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-purple-600 flex-shrink-0 ml-2" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
      {hasError && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{formik.errors[name]}</p>}
    </div>
  )
}

const FormField = ({ label, name, type = 'text', placeholder, icon: Icon, required, formik }) => {
  const hasError = formik.touched[name] && formik.errors[name]
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}{required && <span className="text-red-500 text-xs">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
        <input type={type} name={name} value={formik.values[name]}
          onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={placeholder}
          className={`w-full border-2 rounded-xl py-2.5 text-sm outline-none transition-all
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${hasError ? 'border-red-400' : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100'}`} />
      </div>
      {hasError && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" />{formik.errors[name]}</p>}
    </div>
  )
}

const JobTypeCard = ({ label, credits, desc, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 text-left border-2 cursor-pointer rounded-xl p-4 transition-all duration-200
      hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5
      ${selected ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-white shadow-md' : 'border-gray-200 bg-white hover:border-purple-300'}`}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'border-purple-600' : 'border-gray-300'}`}>
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-in zoom-in duration-300" />}
      </div>
      <span className="text-sm font-bold text-gray-800">{label}</span>
    </div>
    <p className="text-xs text-gray-500 leading-relaxed">
      Posting 1 {label.toLowerCase()} consumes <span className="text-purple-600 font-semibold">{credits} job credit{credits > 1 ? 's' : ''}</span>. {desc}
    </p>
  </button>
)

const Stepper = ({ steps, currentStep }) => (
  <div className="flex items-center gap-0 mb-6 sm:mb-8 overflow-x-auto pb-2">
    {steps.map((step, idx) => {
      const isCompleted = idx < currentStep
      const isActive = idx === currentStep
      return (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all duration-300
              ${isCompleted ? 'bg-purple-600 border-purple-600 text-white'
                : isActive ? 'bg-white border-purple-600 text-purple-600 shadow-md shadow-purple-100'
                  : 'bg-white border-gray-200 text-gray-400'}`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <span className={`mt-1 sm:mt-1.5 text-[11px] sm:text-xs font-medium whitespace-nowrap text-center
              ${isActive ? 'text-purple-600 font-semibold' : isCompleted ? 'text-purple-400' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 min-w-[24px] sm:min-w-[40px] h-0.5 mx-1.5 sm:mx-2 mb-4 sm:mb-5 transition-all duration-500 ${idx < currentStep ? 'bg-purple-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      )
    })}
  </div>
)

// ─── Main ─────────────────────────────────────────────────────────────────────
const EditJob = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { id } = useParams()

  const [currentStep, setCurrentStep] = useState(0)
  const [skillInput, setSkillInput] = useState('')

  const { jobDetail, jobDetailLoading, loading: jobLoading, error: jobError } = useSelector(s => s.job)
  const { jobPostTypes, jobPostTypesLoading, jobPostTypeError, jobOptions } = useSelector(s => s.job)
  const { categories, subCategories, designations, loading: catLoading, subLoading, desigLoading } = useSelector(s => s.category)
  const { countries: apiCountries } = useSelector(s => s.location)

  const toId = (v) => {
    if (!v) return ''
    if (typeof v === 'string' || typeof v === 'number') return String(v)
    if (typeof v === 'object') return toId(v._id) || toId(v.id) || toId(v.value) || ''
    return ''
  }

  const formatDateInput = (value) => {
    if (!value) return ''
    if (typeof value === 'string') { const m = value.match(/^(\d{4}-\d{2}-\d{2})/); if (m) return m[1] }
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }

  const skillsToArray = (skills) => {
    if (!skills) return []
    if (Array.isArray(skills)) {
      return skills.map(s => {
        if (typeof s === 'string') return s.trim()
        if (typeof s === 'object') return s.name || s.label || s.skill || ''
        return String(s).trim()
      }).filter(Boolean)
    }
    if (typeof skills === 'string') return skills.split(',').map(s => s.trim()).filter(Boolean)
    return []
  }

  const educationToArray = (edu) => {
    if (!edu) return []
    if (Array.isArray(edu)) return edu.map(e => (typeof e === 'object' ? e.name || e.label || e.education || '' : String(e).trim())).filter(Boolean)
    if (typeof edu === 'string') return edu.split(',').map(e => e.trim()).filter(Boolean)
    return []
  }

  const getLocationText = (value) => {
    if (value === null || value === undefined) return ''
    if (typeof value === 'object') return value.name || value.cityName || value.city || value.stateName || value.state || value.label || ''
    return String(value).trim()
  }

  const getStateCodeFromName = (countryCode, name) => {
    if (!countryCode || !name) return ''
    const str = getLocationText(name)
    if (!str) return ''
    const states = State.getStatesOfCountry(countryCode)
    const found = states.find(s =>
      s.isoCode.toLowerCase() === str.toLowerCase() ||
      s.name.toLowerCase() === str.toLowerCase()
    )
    return found ? found.isoCode : str
  }

  const extractLocation = (jobObj) => {
    if (!jobObj) return { countryCode: 'IN', stateCode: '', cityName: '' }
    const advInfo = jobObj?.advanceInformation || {}

    const rawLocObj = (target) => {
      if (!target) return {}
      if (Array.isArray(target)) return target[0] || {}
      if (typeof target === 'object') return target
      return {}
    }

    const mergedLoc = {
      ...rawLocObj(advInfo?.location),
      ...rawLocObj(advInfo?.jobLocation),
      ...rawLocObj(jobObj?.location),
      ...rawLocObj(jobObj?.jobLocation),
    }

    const countryVal = mergedLoc.countryCode || mergedLoc.country_code || mergedLoc.countryName || mergedLoc.country || jobObj?.countryCode || jobObj?.countryName || jobObj?.country || 'IN'
    const countryStr = getLocationText(countryVal)
    let countryCode = 'IN'
    if (countryStr) {
      if (Country.getCountryByCode(countryStr.toUpperCase())) {
        countryCode = countryStr.toUpperCase()
      } else {
        const foundC = Country.getAllCountries().find(c => c.name.toLowerCase() === countryStr.toLowerCase())
        if (foundC) countryCode = foundC.isoCode
      }
    }

    const stateVal = mergedLoc.stateCode || mergedLoc.state_code || mergedLoc.isoCode || mergedLoc.stateName || mergedLoc.state || mergedLoc.region || mergedLoc.province || jobObj?.stateCode || jobObj?.stateName || jobObj?.state || ''
    const stateCode = getStateCodeFromName(countryCode, stateVal)

    const stateName = State.getStateByCodeAndCountry(stateCode, countryCode)?.name || getLocationText(stateVal)

    const cityCandidates = [
      mergedLoc.cityName,
      mergedLoc.city,
      mergedLoc.name,
      mergedLoc.city_name,
      mergedLoc.locationName,
      mergedLoc.locality,
      mergedLoc.town,
      mergedLoc.village,
      mergedLoc.area,
      jobObj?.cityName,
      jobObj?.city,
      jobObj?.locationName,
    ].map(getLocationText).filter(Boolean)


    console.log(jobDetail.jobLocation);



    const filteredCityCandidates = cityCandidates.filter(c => {
      const lower = c.toLowerCase()
      if (stateName && lower === stateName.toLowerCase()) return false
      if (stateCode && lower === stateCode.toLowerCase()) return false
      if (countryCode && lower === countryCode.toLowerCase()) return false
      return true
    })

    let foundCity = filteredCityCandidates[0] || ''

    if (stateCode && countryCode) {
      const validCities = City.getCitiesOfState(countryCode, stateCode)
      if (validCities.length > 0) {
        const match = validCities.find(c => c.name.toLowerCase() === foundCity.toLowerCase())
        if (match) {
          foundCity = match.name
        } else {
          const candidateInState = filteredCityCandidates.find(cand => validCities.some(c => c.name.toLowerCase() === cand.toLowerCase()))
          if (candidateInState) {
            foundCity = validCities.find(c => c.name.toLowerCase() === candidateInState.toLowerCase())?.name || candidateInState
          }
        }
      }
    }

    return {
      countryCode,
      stateCode,
      cityName: foundCity
    }
  }

  const getVacanciesValue = (jobObj) => {
    if (!jobObj) return ''
    const advInfo = jobObj?.advanceInformation || jobObj?.advanceInfo || jobObj?.details || {}

    const knownCandidates = [
      advInfo.vacancies,
      advInfo.vacancy,
      advInfo.totalVacancies,
      advInfo.noOfVacancies,
      advInfo.numberOfVacancies,
      advInfo.vacancyCount,
      advInfo.total_vacancies,
      advInfo.no_of_vacancies,
      jobObj.vacancies,
      jobObj.vacancy,
      jobObj.totalVacancies,
      jobObj.noOfVacancies,
      jobObj.numberOfVacancies,
      jobObj.vacancyCount,
      jobObj.total_vacancies,
      jobObj.no_of_vacancies,
      jobObj.vacancy_count,
    ]

    const foundKnown = knownCandidates.find(val => val !== undefined && val !== null && val !== '')
    if (foundKnown !== undefined && foundKnown !== null) return String(foundKnown)

    const searchKeys = (targetObj) => {
      if (!targetObj || typeof targetObj !== 'object') return null
      for (const [key, val] of Object.entries(targetObj)) {
        if (/vacan/i.test(key) && val !== undefined && val !== null && val !== '') {
          if (typeof val === 'number' || typeof val === 'string') return String(val)
        }
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const nested = searchKeys(val)
          if (nested) return nested
        }
      }
      return null
    }

    const deepFound = searchKeys(jobObj)
    return deepFound || ''
  }

  // Initial Fetch
  useEffect(() => {
    dispatch(fetchCountries())
    dispatch(getAllCategories())
    dispatch(getJobDetails(id))
    dispatch(getJobOptions())
    dispatch(getJobPostType())
    return () => { dispatch(clearSubCategories()); dispatch(clearDesignations()) }
  }, [dispatch, id])

  const job = (jobDetail && (toId(jobDetail) === toId(id) || toId(jobDetail._id) === toId(id) || toId(jobDetail.id) === toId(id) || !id)) ? jobDetail : (jobDetail || null)
  const adv = job?.advanceInformation || {}
  const jobKey = job ? toId(job._id || job.id || id) : 'loading'
  const locData = useMemo(() => extractLocation(job), [job])

  const catId = toId(job?.jobSeekerCategoryId) || toId(job?.categoryId) || toId(job?.category) || ''
  const subId = toId(job?.jobSeekerSubCategoryId) || toId(job?.subCategoryId) || toId(job?.subCategory) || ''
  const desigId = toId(job?.jobRole) || toId(job?.designationId) || toId(job?.designation) || toId(job?.role) || ''

  // Fetch cascading options when job is loaded
  useEffect(() => {
    if (!job || (toId(job._id) !== toId(id) && toId(job.id) !== toId(id))) return
    if (catId) dispatch(getSubCategoriesByCategoryId(catId))
    if (subId) dispatch(getDesignationsBySubCategoryId(subId))
  }, [job, id, catId, subId, dispatch])

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      jobTitle: job?.jobTitle || job?.title || '',
      countryCode: locData.countryCode || 'IN',
      stateCode: locData.stateCode || '',
      cityName: locData.cityName || '',
      categoryId: catId,
      subCategoryId: subId,
      designationId: desigId,
      skillsRequired: skillsToArray(job?.skillsRequired || job?.skills || adv.skillsRequired || adv.skills),
      minSalary: job?.salaryRange?.minSalary ?? job?.minSalary ?? adv.minSalary ?? '',
      maxSalary: job?.salaryRange?.maxSalary ?? job?.maxSalary ?? adv.maxSalary ?? '',
      salaryType: job?.salaryType ?? job?.salaryRange?.salaryType ?? adv.salaryType ?? '',
      education: educationToArray(adv.education || job?.education),
      experience: adv.experience || job?.experience || '',
      jobType: adv.jobType || job?.jobType || '',
      workMode: job?.workMode || adv.workMode || job?.jobMode || '',
      vacancies: getVacanciesValue(job),
      expireDate: formatDateInput(adv.expireDate || job?.expireDate || job?.expirationDate),
      jobLevel: adv.jobLevel || job?.jobLevel || '',
      description: job?.jobDescription || job?.description || adv.jobDescription || '',
      responsibilities: job?.jobResponsibilities || job?.responsibilities || adv.jobResponsibilities || '',
      postJobType: job?.postJobType || job?.jobPostType || job?.postingType || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        jobTitle: values.jobTitle,
        jobLocation: {
          name: values.cityName,
          cityName: values.cityName,
          city: values.cityName,
          stateCode: values.stateCode,
          stateName: State.getStateByCodeAndCountry(values.stateCode, values.countryCode)?.name || values.stateCode,
          countryCode: values.countryCode,
          countryName: Country.getCountryByCode(values.countryCode)?.name || values.countryCode,
        },
        skillsRequired: values.skillsRequired,
        jobRole: values.designationId,
        workMode: values.workMode,
        salaryRange: { minSalary: Number(values.minSalary), maxSalary: Number(values.maxSalary) },
        salaryType: values.salaryType,
        vacancies: Number(values.vacancies),
        vacancy: Number(values.vacancies),
        totalVacancies: Number(values.vacancies),
        advanceInformation: {
          education: values.education,
          experience: values.experience,
          jobType: values.jobType,
          vacancies: Number(values.vacancies),
          vacancy: Number(values.vacancies),
          totalVacancies: Number(values.vacancies),
          expireDate: values.expireDate,
          jobLevel: values.jobLevel,
        },
        jobDescription: values.description,
        jobResponsibilities: values.responsibilities,
        categoryId: values.categoryId,
        subCategoryId: values.subCategoryId,
        jobSeekerCategoryId: values.categoryId,
        jobSeekerSubCategoryId: values.subCategoryId,
        postJobType: values.postJobType,
        jobPostType: values.postJobType,
      }
      try {
        await dispatch(updateJob({ id, jobData: payload })).unwrap()
        toast.success('✨ Job updated successfully!')
        navigate('/my-job')
      } catch (err) {
        toast.error(err?.message || 'Failed to update job')
      }
    },
  })

  const countryOptions = useMemo(() => {
    if (apiCountries && apiCountries.length > 0) {
      return apiCountries.map(c => ({
        _id: c.isoCode || c.code || c._id,
        name: c.flag ? `${c.flag} ${c.name}` : c.name,
        rawName: c.name,
      }))
    }
    return Country.getAllCountries().map(c => ({ _id: c.isoCode, name: c.name }))
  }, [apiCountries])
  const stateOptions = useMemo(() => {
    if (!formik.values.countryCode) return []
    return State.getStatesOfCountry(formik.values.countryCode).map(s => ({ _id: s.isoCode, name: s.name }))
  }, [formik.values.countryCode])
  const cityOptions = useMemo(() => {
    if (!formik.values.countryCode || !formik.values.stateCode) return []
    return City.getCitiesOfState(formik.values.countryCode, formik.values.stateCode).map(c => ({ _id: c.name, name: c.name }))
  }, [formik.values.countryCode, formik.values.stateCode])

  const handleCountryChange = (e) => {
    formik.setFieldValue('countryCode', e.target.value);
    formik.setFieldValue('stateCode', '');
    formik.setFieldValue('cityName', '')
  }
  const handleStateChange = (e) => {
    formik.setFieldValue('stateCode', e.target.value);
    formik.setFieldValue('cityName', '')
  }
  const handleCategoryChange = (e) => {
    const v = e.target.value;
    formik.setFieldValue('categoryId', v);
    formik.setFieldTouched('categoryId', true, false);
    formik.setFieldError('categoryId', undefined);
    formik.setFieldValue('subCategoryId', '');
    formik.setFieldValue('designationId', '');
    dispatch(clearSubCategories());
    dispatch(clearDesignations());
    if (v) dispatch(getSubCategoriesByCategoryId(v))
  }
  const handleSubCategoryChange = (e) => {
    const v = e.target.value;
    formik.setFieldValue('subCategoryId', v);
    formik.setFieldTouched('subCategoryId', true, false);
    formik.setFieldError('subCategoryId', undefined);
    formik.setFieldValue('designationId', '');
    dispatch(clearDesignations());
    if (v) dispatch(getDesignationsBySubCategoryId(v))
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (!s) return
    if (s.length < 2) { toast.error('Skill must be at least 2 characters'); return }
    if (s.length > 35) { toast.error('Skill cannot exceed 35 characters'); return }
    if (!/^[a-zA-Z0-9\s.+\-/#]+$/.test(s)) { toast.error('Skill contains invalid characters'); return }
    if (formik.values.skillsRequired.some(x => x.toLowerCase() === s.toLowerCase())) { toast.error('Skill already added'); return }
    if (formik.values.skillsRequired.length >= 15) { toast.error('Maximum of 15 skills allowed'); return }
    formik.setFieldValue('skillsRequired', [...formik.values.skillsRequired, s])
    formik.setFieldTouched('skillsRequired', true, false)
    setSkillInput('')
  }
  const removeSkillAt = (idx) => {
    formik.setFieldValue('skillsRequired', formik.values.skillsRequired.filter((_, i) => i !== idx))
    formik.setFieldTouched('skillsRequired', true, false)
  }

  const handleNext = async () => {
    const fields = stepFields[currentStep]
    fields.forEach(f => formik.setFieldTouched(f, true, false))
    const errors = await formik.validateForm()
    if (!fields.some(f => errors[f])) setCurrentStep(s => s + 1)
  }
  const handleSaveChanges = async () => {
    const fields = stepFields[currentStep]
    fields.forEach(f => formik.setFieldTouched(f, true, false))
    const errors = await formik.validateForm()
    if (!fields.some(f => errors[f])) formik.submitForm()
  }

  const steps = [
    { id: 'basic', label: 'Basic Info', icon: Briefcase },
    { id: 'details', label: 'Job Details', icon: GraduationCap },
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'posting', label: 'Posting Type', icon: TrendingUp },
  ]
  const isLastStep = currentStep === steps.length - 1

  if (jobDetailLoading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');`}</style>
      <div className="min-h-screen bg-gradient-to-br from-purple-200/30 via-white to-purple-200/30" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-9xl mx-auto p-3 sm:p-5 bg-white rounded-xl">

          <div className="flex items-center gap-4 mb-6">
            <button type="button" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors group">
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-purple-600 transition-colors cursor-pointer" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Edit Job Posting</h1>
              <p className="text-sm text-gray-500 mt-1">Update your job details to attract the right candidates</p>
            </div>
          </div>

          <Stepper steps={steps} currentStep={currentStep} />

          {jobError && (
            <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600">{jobError}</p>
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} className="space-y-6">

            {currentStep === 0 && (
              <FormSection title="Basic Information" icon={Briefcase} description="Core details about the job position">
                <div className="space-y-5">
                  <FormField label="Job Title" name="jobTitle" required icon={Briefcase} placeholder="e.g., Senior Frontend Developer" formik={formik} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <SelectField label="Category" name="categoryId" required icon={GraduationCap} placeholder="Select Category" options={categories} loading={catLoading} formik={formik} onChange={handleCategoryChange} />
                    <SelectField label="Sub-Category" name="subCategoryId" required icon={GraduationCap} placeholder="Select Sub-Category" options={subCategories} loading={subLoading} disabled={!formik.values.categoryId} formik={formik} onChange={handleSubCategoryChange} />
                    <SelectField label="Designation / Job Role" name="designationId" required icon={Award} placeholder="Select Designation" options={designations} loading={desigLoading} disabled={!formik.values.subCategoryId} formik={formik} />
                  </div>

                  {(formik.values.categoryId || formik.values.subCategoryId || formik.values.designationId) && (
                    <div className="flex flex-wrap gap-2">
                      {formik.values.categoryId && <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium"><CheckCircle className="w-3 h-3" />{categories.find(c => c._id === formik.values.categoryId)?.name || 'Category selected'}</span>}
                      {formik.values.subCategoryId && <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium"><CheckCircle className="w-3 h-3" />{subCategories.find(s => s._id === formik.values.subCategoryId)?.name || 'Sub-category selected'}</span>}
                      {formik.values.designationId && <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium"><CheckCircle className="w-3 h-3" />{designations.find(d => d._id === formik.values.designationId)?.name || 'Designation selected'}</span>}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700"><Award className="w-4 h-4 text-gray-400" /> Skills Required <span className="text-red-500 text-xs">*</span></label>
                    <div className={`border-2 rounded-xl px-4 py-3 transition-all ${formik.touched.skillsRequired && formik.errors.skillsRequired ? 'border-red-400 ring-1 ring-red-200' : 'border-gray-200 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100'}`}>
                      <div className="flex flex-wrap gap-2 items-center">
                        {formik.values.skillsRequired.map((skill, idx) => (
                          <span key={`${skill}-${idx}`} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            <span className="text-xs font-medium">{skill}</span>
                            <button type="button" onClick={() => removeSkillAt(idx)} className="text-purple-600 hover:text-purple-800"><X className="w-3.5 h-3.5" /></button>
                          </span>
                        ))}
                        <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                          onBlur={() => formik.setFieldTouched('skillsRequired', true)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                          placeholder="Type a skill and press Enter"
                          className="flex-1 min-w-[200px] border-none outline-none text-sm bg-transparent placeholder-gray-400 p-1" />
                        <button type="button" onClick={addSkill} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer">
                          <Plus className="w-4 h-4 text-purple-600" /> Add
                        </button>
                      </div>
                    </div>
                    {formik.touched.skillsRequired && formik.errors.skillsRequired && <p className="text-red-500 text-xs flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {formik.errors.skillsRequired}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1 space-y-4">
                      <SelectField label="Country" name="countryCode" required placeholder="Select country" options={countryOptions} formik={formik} onChange={handleCountryChange} />
                    </div>
                    <div className="md:col-span-1 space-y-4">
                      <SelectField label="State" name="stateCode" required icon={MapPin} placeholder="Select state" options={stateOptions} disabled={!formik.values.countryCode} formik={formik} onChange={handleStateChange} />
                    </div>
                    <div className="md:col-span-1 space-y-4">
                      <SelectField label="City" name="cityName" required icon={MapPin} placeholder="Select city" options={cityOptions} disabled={!formik.values.stateCode} formik={formik} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SelectField
                      label="Job Type"
                      name="jobType"
                      required
                      placeholder="Select job type"
                      options={(jobOptions?.jobTypes?.length ? jobOptions.jobTypes : DEFAULT_JOB_TYPES).map(v => ({ _id: v, name: v }))}
                      formik={formik}
                    />
                    <SelectField
                      label="Work Mode"
                      name="workMode"
                      required
                      icon={Wifi}
                      placeholder="Select work mode"
                      options={(jobOptions?.workModes?.length ? jobOptions.workModes : DEFAULT_WORK_MODES).map(v => ({ _id: v, name: v }))}
                      formik={formik}
                    />
                  </div>
                </div>
              </FormSection>
            )}

            {currentStep === 1 && (
              <FormSection title="Job Details" icon={DollarSign} description="Salary, education, experience requirements">
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-600" /> Salary Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField label="Min Salary" name="minSalary" required type="number" placeholder="e.g., 30000" formik={formik} />
                      <FormField label="Max Salary" name="maxSalary" required type="number" placeholder="e.g., 50000" formik={formik} />
                      <SelectField
                        label="Salary Type"
                        name="salaryType"
                        required
                        options={(jobOptions?.salaryTypes?.length ? jobOptions.salaryTypes : DEFAULT_SALARY_TYPES).map(v => ({ _id: v, name: v }))}
                        formik={formik}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="relative">
                      <MultiSelectEducation
                        formik={formik}
                        name="education"
                        label="Education"
                        options={jobOptions?.educationLevels?.length ? jobOptions.educationLevels : DEFAULT_EDUCATION_OPTIONS}
                        required
                      />
                    </div>
                    <SelectField
                      label="Experience"
                      name="experience"
                      required
                      options={(jobOptions?.experienceRanges?.length ? jobOptions.experienceRanges : DEFAULT_EXPERIENCE_RANGES).map(v => ({ _id: v, name: v }))}
                      formik={formik}
                    />
                    <SelectField
                      label="Job Level"
                      name="jobLevel"
                      required
                      options={(jobOptions?.jobLevels?.length ? jobOptions.jobLevels : DEFAULT_JOB_LEVELS).map(v => ({ _id: v, name: v }))}
                      formik={formik}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Vacancies" name="vacancies" required type="number" icon={Users} placeholder="e.g., 5" formik={formik} />
                    <FormField label="Expiry Date" name="expireDate" required type="date" icon={Calendar} formik={formik} />
                  </div>
                </div>
              </FormSection>
            )}

            {currentStep === 2 && (
              <FormSection title="Description & Responsibilities" icon={FileText} description="Detailed information about the role">
                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <FileText className="w-4 h-4 text-gray-400" /> Job Description <span className="text-red-500 text-xs">*</span>
                    </label>
                    <RichEditor stableKey={`desc-${jobKey}`} placeholder="Describe the role..."
                      defaultValue={formik.values.description}
                      onChange={val => formik.setFieldValue('description', val)}
                      onBlur={() => formik.setFieldTouched('description', true)}
                      error={formik.touched.description && formik.errors.description} />
                    {formik.touched.description && formik.errors.description &&
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formik.errors.description}</p>}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <CheckCircle className="w-4 h-4 text-gray-400" /> Key Responsibilities <span className="text-red-500 text-xs">*</span>
                    </label>
                    <RichEditor stableKey={`resp-${jobKey}`} placeholder="List the day-to-day responsibilities..."
                      defaultValue={formik.values.responsibilities}
                      onChange={val => formik.setFieldValue('responsibilities', val)}
                      onBlur={() => formik.setFieldTouched('responsibilities', true)}
                      error={formik.touched.responsibilities && formik.errors.responsibilities} />
                    {formik.touched.responsibilities && formik.errors.responsibilities &&
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formik.errors.responsibilities}</p>}
                  </div>
                </div>
              </FormSection>
            )}

            {currentStep === 3 && (
              <FormSection title="Posting Type" icon={TrendingUp} description="Choose how you want to promote this job">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {jobPostTypesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500 py-6 w-full justify-center">
                        <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        Loading posting types...
                      </div>
                    ) : jobPostTypeError || jobPostTypes.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 text-sm text-red-400 py-6 w-full justify-center">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Failed to load posting types</span>
                        <button type="button" onClick={() => dispatch(getJobPostType())} className="mt-2 px-4 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">Retry</button>
                      </div>
                    ) : (
                      jobPostTypes.map((type) => (
                        <JobTypeCard
                          key={type.value}
                          label={type.label}
                          credits={type.credit}
                          desc="Select this plan to update your posting visibility"
                          selected={formik.values.postJobType === type.value}
                          onClick={() => formik.setFieldValue('postJobType', type.value)}
                        />
                      ))
                    )}
                  </div>
                  {formik.touched.postJobType && formik.errors.postJobType && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formik.errors.postJobType}</p>}
                </div>
              </FormSection>
            )}

            <div className="flex items-center justify-between gap-4 pt-4 pb-8">
              {currentStep === 0
                ? <button type="button" onClick={() => navigate('/my-job')} className="px-6 py-2.5 text-purple-600 font-medium rounded-xl hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer">Cancel</button>
                : <button type="button" onClick={() => setCurrentStep(s => s - 1)} className="flex items-center gap-2 px-6 py-2.5 text-gray-600 font-medium rounded-xl border-2 border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /> Back</button>
              }
              {isLastStep
                ? <button type="button" onClick={handleSaveChanges} disabled={jobLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer">
                  {jobLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                </button>
                : <button type="button" onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              }
            </div>
          </form>

          <div className="text-center pt-6 pb-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">© 2025 MyJob – Technokrate Hire. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default EditJob
