import React from 'react'

const range = (start, end) => {
  const res = []
  for (let i = start; i <= end; i++) res.push(i)
  return res
}

const Pagination = ({ page = 1, totalPages: rawTotalPages = 1, onPageChange = () => {}, maxVisible = 5 }) => {
  const totalPages = Math.max(1, rawTotalPages)

  const siblingCount = Math.floor((maxVisible - 1) / 2)

  let start = Math.max(2, page - siblingCount)
  let end = Math.min(totalPages - 1, page + siblingCount)

  if (end - start + 1 < maxVisible - 2) {
    // grow window when near edges
    const need = (maxVisible - 2) - (end - start + 1)
    if (start > 2) start = Math.max(2, start - need)
    else if (end < totalPages - 1) end = Math.min(totalPages - 1, end + need)
  }

  const pages = [1]
  if (start > 2) pages.push('left-ellipsis')
  pages.push(...range(start, end))
  if (end < totalPages - 1) pages.push('right-ellipsis')
  if (totalPages > 1) pages.push(totalPages)

  const btnBase =
    'w-10 h-10 rounded-lg text-sm font-semibold transition flex items-center justify-center'

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`${btnBase} border border-gray-200 bg-white text-gray-500 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {pages.map((p, idx) => {
        if (p === 'left-ellipsis' || p === 'right-ellipsis') {
          return (
            <span key={p + idx} className="px-2 text-sm text-gray-400">
                ...
              </span>
          )
        }

        const isActive = p === page
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            aria-current={isActive ? 'page' : undefined}
            className={`${btnBase} ${isActive ? 'bg-purple-600 text-white shadow-md border-none' : 'border border-gray-200 bg-white text-gray-600 hover:bg-purple-50'}`}
          >
            {p}
          </button>
        )
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`${btnBase} border border-gray-200 bg-white text-gray-500 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}

export default Pagination
