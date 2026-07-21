import React, { useState } from 'react';

export default function BoundingBoxOverlayPanel({ 
  selectedQuestion, 
  blockMap = {}, 
  activeBlockId,
  onSelectBlock,
  currentPage = 1 
}) {
  const [hoveredBlockId, setHoveredBlockId] = useState(null);

  const regions = selectedQuestion?.regions || {};
  const questionBlocks = (regions.questionBlocks || []).map(id => blockMap[id]).filter(Boolean);
  const imageBlocks = (regions.imageBlocks || []).map(id => blockMap[id]).filter(Boolean);
  const formulaBlocks = (regions.formulaBlocks || []).map(id => blockMap[id]).filter(Boolean);
  const optionABlocks = (regions.optionA || []).map(id => blockMap[id]).filter(Boolean);
  const optionBBlocks = (regions.optionB || []).map(id => blockMap[id]).filter(Boolean);
  const optionCBlocks = (regions.optionC || []).map(id => blockMap[id]).filter(Boolean);
  const optionDBlocks = (regions.optionD || []).map(id => blockMap[id]).filter(Boolean);

  const mappedBlocks = [
    ...questionBlocks.map(b => ({ ...b, role: 'QUESTION', colorStyle: 'border-blue-500 bg-blue-500/15 text-blue-300 badge-blue' })),
    ...optionABlocks.map(b => ({ ...b, role: 'OPTION A', colorStyle: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 badge-green' })),
    ...optionBBlocks.map(b => ({ ...b, role: 'OPTION B', colorStyle: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 badge-green' })),
    ...optionCBlocks.map(b => ({ ...b, role: 'OPTION C', colorStyle: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 badge-green' })),
    ...optionDBlocks.map(b => ({ ...b, role: 'OPTION D', colorStyle: 'border-emerald-500 bg-emerald-500/15 text-emerald-300 badge-green' })),
    ...formulaBlocks.map(b => ({ ...b, role: 'FORMULA', colorStyle: 'border-purple-500 bg-purple-500/15 text-purple-300 badge-purple' })),
    ...imageBlocks.map(b => ({ ...b, role: 'IMAGE', colorStyle: 'border-orange-500 bg-orange-500/15 text-orange-300 badge-orange' }))
  ];

  const hoveredBlock = hoveredBlockId ? blockMap[hoveredBlockId] : null;

  return (
    <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 text-slate-100 relative">
      {/* Header Bar */}
      <div className="h-12 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Bounding Box Overlay Canvas
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-indigo-400 font-semibold">{mappedBlocks.length} Khối Ánh Xạ</span>
          {selectedQuestion && (
            <span className="bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-800 text-[11px] font-bold">
              Câu {selectedQuestion.questionOrder}
            </span>
          )}
        </div>
      </div>

      {/* Main Overlay List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!selectedQuestion ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl mb-3">
              🔲
            </div>
            <p className="text-xs max-w-xs leading-relaxed">
              Chọn một câu hỏi ở danh sách bên phải để hiển thị các vùng Bounding Box và Block IDs tương ứng.
            </p>
          </div>
        ) : mappedBlocks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/50 rounded-xl border border-slate-800/80">
            Chưa có Block ID nào được gán cho Câu {selectedQuestion.questionOrder}.
          </div>
        ) : (
          mappedBlocks.map((b, idx) => {
            const isSelected = activeBlockId === b.id;
            const isHovered = hoveredBlockId === b.id;

            return (
              <div
                key={b.id || idx}
                onMouseEnter={() => setHoveredBlockId(b.id)}
                onMouseLeave={() => setHoveredBlockId(null)}
                onClick={() => onSelectBlock && onSelectBlock(b.id)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${b.colorStyle} ${
                  isSelected ? 'ring-2 ring-indigo-400 shadow-lg scale-[1.01]' : 'hover:border-indigo-400'
                }`}
              >
                {/* Block Header Info */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      {b.role}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-200">ID: {b.id}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">
                    Thứ tự #{b.order || idx + 1} | Trang {b.page || currentPage}
                  </span>
                </div>

                {/* Bounding Box Coordinates */}
                <div className="text-[11px] font-mono text-slate-400 mb-2">
                  bbox: [{b.bbox?.map((n) => Math.round(n))?.join(', ')}]
                </div>

                {/* Content Preview */}
                {b.content && (
                  <p className="text-xs font-sans text-slate-200 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {typeof b.content === 'string' ? b.content : JSON.stringify(b.content)}
                  </p>
                )}

                {/* Image Block Preview */}
                {b.image && (
                  <div className="mt-2.5">
                    <img
                      src={b.image}
                      alt={b.id}
                      className="max-h-36 rounded-lg border border-slate-700 shadow bg-slate-900 object-contain"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredBlock && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur border border-indigo-500/50 p-3 rounded-xl shadow-2xl z-20 text-xs space-y-1">
          <div className="flex justify-between items-center text-indigo-300 font-mono font-bold">
            <span>🔍 BLOCK HOVER PREVIEW: {hoveredBlock.id}</span>
            <span>Trang {hoveredBlock.page}</span>
          </div>
          <div className="text-slate-300 font-mono text-[11px]">
            Tọa độ Bounding Box: [{hoveredBlock.bbox?.join(', ')}]
          </div>
          {hoveredBlock.content && (
            <div className="text-slate-200 line-clamp-2 italic text-[11.5px] bg-slate-950 p-1.5 rounded">
              "{typeof hoveredBlock.content === 'string' ? hoveredBlock.content : JSON.stringify(hoveredBlock.content)}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
