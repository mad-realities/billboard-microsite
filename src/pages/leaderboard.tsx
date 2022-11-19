import Leaderboard from "../components/Leaderboard";

const LeaderboardPage = () => {
  return (
    <div className="flex flex-col items-center gap-10	py-8 text-white">
      <div className="text-4xl text-white">Leaderboard</div>
      <div className="w-11/12 grow rounded-lg border-4 border-double border-mr-pink bg-mr-black">
        <Leaderboard />
      </div>
    </div>
  );
};

export default LeaderboardPage;
