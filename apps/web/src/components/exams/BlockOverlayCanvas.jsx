import React from 'react';

export default function BlockOverlayCanvas({ selectedQuestion, blockMap, currentPage = 1 }) {
  if (!selectedQuestion) {
    return (
      <div class="h-full flex items-center justify-center p-8 bg-slate-900 rounded-2xl text-slate-400 border border-slate-800">
        <p class="text-sm">Chọn một câu hỏi ở danh sách bên phải để xem các vùng Bounding Box trên tài liệu.</p>
      </div>
    );
  }

  const regions = selectedQuestion.regions || {};
  const questionBlocks = (regions.questionBlocks || []).map(id => blockMap?.[id]).filter(Boolean);
  const imageBlocks = (regions.imageBlocks || []).map(id => blockMap?.[id]).filter(Boolean);
  const formulaBlocks = (regions.formulaBlocks || []).map(id => blockMap?.[id]).filter(Boolean);

  const optionABlocks = (regions.optionA || []).map(id => blockMap?.[id]).filter(Boolean);
  const optionBBlocks = (regions.optionB || []).map(id => blockMap?.[id]).filter(Boolean);
  const optionCBlocks = (regions.optionC || []).map(id => blockMap?.[id]).filter(Boolean);
  const optionDBlocks = (regions.optionD || []).map(id => blockMap?.[id]).filter(Boolean);

  const allMappedBlocks = [
    ...questionBlocks.map(b => ({ ...b, role: 'QUESTION', color: 'border-indigo-500 bg-indigo-500/10 text-indigo-300' })),
    ...imageBlocks.map(b => ({ ...b, role: 'IMAGE', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' })),
    ...formulaBlocks.map(b => ({ ...b, role: 'FORMULA', color: 'border-purple-500 bg-purple-500/10 text-purple-300' })),
    ...optionABlocks.map(b => ({ ...b, role: 'OPTION A', color: 'border-amber-500 bg-amber-500/10 text-amber-300' })),
    ...optionBBlocks.map(b => ({ ...b, role: 'OPTION B', color: 'border-amber-500 bg-amber-500/10 text-amber-300' })),
    ...optionCBlocks.map(b => ({ ...b, role: 'OPTION C', color: 'border-amber-500 bg-amber-500/10 text-amber-300' })),
    ...optionDBlocks.map(b => ({ ...b, role: 'OPTION D', color: 'border-amber-500 bg-amber-500/10 text-amber-300' }))
  ];

  return (
    <div class="h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div class="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <h3 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          Bounding Box Overlay (Câu {selectedQuestion.questionOrder})
        </h3>
        <span class="text-xs font-mono text-indigo-400 font-semibold">{allMappedBlocks.length} Khối Ánh Xạ</span>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        {allMappedBlocks.length === 0 ? (
          <div class="p-6 text-center text-slate-500 text-xs">
            Chưa có khối Block ID nào được ánh xạ cho câu hỏi này.
          </div>
        ) : (
          allMappedBlocks.map((b, idx) => (
            <div key={b.id || idx} class={`p-3 rounded-xl border ${b.color} transition-all duration-200 shadow-md`}>
              <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700">
                  {b.role} - ID: {b.id}
                </span>
                <span class="text-[10px] font-mono text-slate-400">
                  bbox: [{b.bbox?.map(n => Math.round(n))?.join(', ')}]
                </span>
              </div>
              {b.content && (
                <p class="text-xs font-sans text-slate-200 leading-relaxed mt-1">
                  {b.content}
                </p>
              )}
              {b.image && (
                <div class="mt-2">
                  <img src={b.image} alt={b.id} class="max-h-32 rounded-lg border border-slate-700 shadow" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
