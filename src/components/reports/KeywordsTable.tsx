import { AIKeyword } from '@/types';

export function KeywordsTable({ keywords }: { keywords: AIKeyword[] }) {
  return (
    <div className="border-[3px] border-black bg-white shadow-[4px_4px_0px_#000] overflow-hidden">
      <div className="border-b-[2px] border-black px-4 py-3">
        <h3 className="font-black text-sm uppercase tracking-wider">KEYWORD OPPORTUNITIES</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-[2px] border-black bg-black text-white">
              <th className="text-left px-4 py-2.5 font-black uppercase tracking-wider">Keyword</th>
              <th className="text-right px-3 py-2.5 font-black">Volume</th>
              <th className="text-right px-3 py-2.5 font-black">KD</th>
              <th className="text-center px-3 py-2.5 font-black">Opportunity</th>
              <th className="text-center px-4 py-2.5 font-black">Type</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((kw, i) => (
              <tr key={i} className="border-b border-black/10 hover:bg-[#FFE500]/20 transition-colors">
                <td className="px-4 py-3 font-bold">{kw.keyword}</td>
                <td className="px-3 py-3 text-right font-bold">{kw.volume.toLocaleString()}</td>
                <td className="px-3 py-3 text-right">
                  <span className={`font-black border-[1.5px] border-black px-1.5 py-0.5 ${
                    kw.difficulty <= 30 ? 'bg-[#4DFFB4]' :
                    kw.difficulty <= 60 ? 'bg-[#FFE500]' : 'bg-[#FF6B6B]'
                  }`}>
                    {kw.difficulty}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className={`font-black border-[1.5px] border-black px-2 py-0.5 text-[10px] uppercase ${
                    kw.opportunity === 'high' ? 'bg-[#4DFFB4]' :
                    kw.opportunity === 'medium' ? 'bg-[#FFE500]' : 'bg-white'
                  }`}>
                    {kw.opportunity}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-black border-[1.5px] border-black px-2 py-0.5 text-[10px] uppercase ${
                    kw.type === 'ranking' ? 'bg-[#4D79FF] text-white' :
                    kw.type === 'potential' ? 'bg-[#9B5DE5] text-white' : 'bg-white'
                  }`}>
                    {kw.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
