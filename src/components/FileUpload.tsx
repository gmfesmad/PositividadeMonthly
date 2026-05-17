interface FileUploadProps {
  onFile: (file: File) => void
  loading?: boolean
}

export function FileUpload({ onFile, loading }: FileUploadProps) {
  return (
    <label
      className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 px-6 py-8 transition hover:border-pink-400/50 hover:bg-white/8 ${loading ? 'pointer-events-none opacity-60' : ''}`}
    >
      <span className="text-3xl" aria-hidden>
        📂
      </span>
      <span className="text-center text-sm font-medium text-white/90">
        {loading ? 'A processar…' : 'Carrega o JSON do mês'}
      </span>
      <span className="text-center text-xs text-white/50">
        Export Instagram (message_*.json) ou formato com lista de messages
      </span>
      <input
        type="file"
        accept=".json,application/json"
        className="sr-only"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </label>
  )
}
