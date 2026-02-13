import 'dotenv/config';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

export async function connectDB() {
    await client.connect();
    db = client.db("minigame_wevl");
    console.log("✅ Connecté à MongoDB Atlas");
}

export async function saveGameResult({ winner, loser, gameType, scores }) {
    await db.collection("game_results").insertOne({
        winner: winner.pseudo,
        loser: loser.pseudo,
        gameType,
        scores,
        date: new Date()
    });
}

export async function getLeaderboard() {
    const wins = await db.collection("game_results").aggregate([
        { $group: { _id: { pseudo: "$winner", gameType: "$gameType" }, wins: { $sum: 1 } } },
        { $project: { _id: 0, pseudo: "$_id.pseudo", gameType: "$_id.gameType", wins: 1 } }
    ]).toArray();

    const losses = await db.collection("game_results").aggregate([
        { $group: { _id: { pseudo: "$loser", gameType: "$gameType" }, losses: { $sum: 1 } } },
        { $project: { _id: 0, pseudo: "$_id.pseudo", gameType: "$_id.gameType", losses: 1 } }
    ]).toArray();

    const map = {};
    for (const w of wins) {
        const key = `${w.pseudo}_${w.gameType}`;
        map[key] = { pseudo: w.pseudo, gameType: w.gameType, wins: w.wins, losses: 0 };
    }
    for (const l of losses) {
        const key = `${l.pseudo}_${l.gameType}`;
        if (!map[key]) map[key] = { pseudo: l.pseudo, gameType: l.gameType, wins: 0, losses: l.losses };
        else map[key].losses = l.losses;
    }
    return Object.values(map).sort((a, b) => b.wins - a.wins);
}
