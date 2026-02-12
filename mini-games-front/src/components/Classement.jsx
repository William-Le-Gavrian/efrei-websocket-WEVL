import { Trophy, Skull } from 'lucide-react';

function Classement({ leaderboard, currentPseudo }) {
  // Agréger tous jeux confondus
  const globalRanking = Object.values(
    leaderboard.reduce((acc, entry) => {
      if (!acc[entry.pseudo]) {
        acc[entry.pseudo] = { pseudo: entry.pseudo, wins: 0, losses: 0 };
      }
      acc[entry.pseudo].wins += entry.wins;
      acc[entry.pseudo].losses += entry.losses;
      return acc;
    }, {})
  );

  const winnersRanking = [...globalRanking].sort((a, b) => b.wins - a.wins);
  const losersRanking = [...globalRanking].sort((a, b) => b.losses - a.losses);

  const RankingTable = ({ title, icon, data, statKey, color }) => (
    <div className="flex-1 min-w-[280px] p-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${color.bg}`}>
          {icon}
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">{title}</h2>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">Aucun joueur</p>
      ) : (
        <div className="space-y-2">
          {data.map((player, index) => (
            <div
              key={player.pseudo}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                player.pseudo === currentPseudo
                  ? `${color.highlight} border ${color.border}`
                  : 'bg-slate-800/40 border border-transparent hover:border-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-black ${
                  index === 0 ? `${color.bg} text-white` : 'bg-slate-700/50 text-slate-400'
                }`}>
                  {index + 1}
                </span>
                <span className="font-bold text-sm uppercase tracking-wider">{player.pseudo}</span>
              </div>
              <span className={`text-sm font-black ${color.text}`}>
                {player[statKey]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto font-gaming">
      <h1 className="text-3xl font-black text-center uppercase tracking-tighter mb-8">Classement</h1>
      <div className="flex flex-col sm:flex-row gap-6">
        <RankingTable
          title="Top Gagnants"
          icon={<Trophy size={20} className="text-yellow-400" />}
          data={winnersRanking}
          statKey="wins"
          color={{
            bg: 'bg-yellow-500/20',
            text: 'text-yellow-400',
            highlight: 'bg-yellow-500/10',
            border: 'border-yellow-500/20',
          }}
        />
        <RankingTable
          title="Top Perdants"
          icon={<Skull size={20} className="text-red-400" />}
          data={losersRanking}
          statKey="losses"
          color={{
            bg: 'bg-red-500/20',
            text: 'text-red-400',
            highlight: 'bg-red-500/10',
            border: 'border-red-500/20',
          }}
        />
      </div>
    </div>
  );
}

export default Classement;
