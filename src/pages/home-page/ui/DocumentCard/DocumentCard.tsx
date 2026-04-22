
export const DocumentCard = () => {
  return (
    <div className="overflow-hidden rounded-lg border w-[200px] h-[280px] bg-white cursor-pointer hover:shadow-md transition-all">
      <div className="hatching aspect-3/3"></div>
      <div className="p-[10px] flex flex-col gap-[5px]">
        <span className="text-lg font-semibold truncate">Document title Document titleDocument title</span>
        <span className="text-sm text-gray-400">
          {new Date().toISOString()}
        </span>
      </div>
    </div>
  )
}