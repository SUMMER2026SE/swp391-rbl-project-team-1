import React, { useState } from 'react';
import { 
  HiZoomIn, 
  HiZoomOut, 
  HiRefresh, 
  HiChevronLeft, 
  HiChevronRight, 
  HiArrowsExpand,
  HiHand
} from 'react-icons/hi';

export default function PdfViewerPanel({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  pdfUrl,
  pageImageUrl 
}) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isPanMode, setIsPanMode] = useState(false);
  const [fitMode, setFitMode] = useState('width'); // 'width' | 'page'
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(z => Math.min(z + 20, 300));
  const handleZoomOut = () => setZoom(z => Math.max(z - 20, 50));
  const handleZoomReset = () => setZoom(100);
  const handleRotateRight = () => setRotation(r => (r + 90) % 360);
  const handleRotateLeft = () => setRotation(r => (r - 90 + 360) % 360);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`h-full flex flex-col bg-slate-900 border-r border-slate-800 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950' : 'relative'}`}>
      {/* Top Controls Toolbar */}
      <div className="h-12 px-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-slate-300 text-xs">
        {/* Page Navigation */}
        <div className="flex items-center gap-1.5">
          <button 
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            title="Trang trước"
          >
            <HiChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-1">
            <input 
              type="number" 
              min={1} 
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 1 && val <= totalPages) onPageChange(val);
              }}
              className="w-10 px-1 py-0.5 text-center bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono font-bold"
            />
            <span className="text-slate-400">/ {totalPages}</span>
          </div>

          <button 
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded hover:bg-slate-800 disabled:opacity-40 text-slate-300"
            title="Trang sau"
          >
            <HiChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
          <button onClick={handleZoomOut} className="p-1 hover:bg-slate-800 rounded" title="Thu nhỏ">
            <HiZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono font-semibold w-12 text-center text-[11px] text-indigo-400">{zoom}%</span>
          <button onClick={handleZoomIn} className="p-1 hover:bg-slate-800 rounded" title="Phóng to">
            <HiZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleZoomReset} className="p-1 hover:bg-slate-800 rounded text-slate-400" title="Về 100%">
            <HiRefresh className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Tools */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsPanMode(!isPanMode)}
            className={`p-1.5 rounded text-xs ${isPanMode ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
            title="Kéo trang (Pan mode)"
          >
            <HiHand className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => setFitMode(fitMode === 'width' ? 'page' : 'width')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-semibold text-slate-300"
          >
            {fitMode === 'width' ? 'Fit Width' : 'Fit Page'}
          </button>

          <button onClick={handleRotateLeft} className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Xoay trái 90°">
            ↺
          </button>
          <button onClick={handleRotateRight} className="p-1.5 hover:bg-slate-800 rounded text-slate-400" title="Xoay phải 90°">
            ↻
          </button>

          <button onClick={toggleFullscreen} className="p-1.5 hover:bg-slate-800 rounded text-slate-400 ml-1" title="Toàn màn hình">
            <HiArrowsExpand className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF View Canvas Container */}
      <div className={`flex-1 overflow-auto p-4 flex justify-center items-start ${isPanMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <div 
          className="transition-transform duration-150 ease-out shadow-2xl rounded-lg bg-white overflow-hidden relative"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            maxWidth: fitMode === 'width' ? '100%' : '800px'
          }}
        >
          {pageImageUrl ? (
            <img 
              src={pageImageUrl} 
              alt={`PDF Page ${currentPage}`}
              className="w-full h-auto block select-none pointer-events-none"
            />
          ) : (
            <div className="w-[700px] h-[950px] bg-slate-950 flex items-center justify-center text-slate-500 text-sm">
              Trang PDF #{currentPage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
