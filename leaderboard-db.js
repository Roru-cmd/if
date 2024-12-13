import { database } from './firebase-config';
import { ref, push, onValue, query, orderByChild, limitToFirst } from "firebase/database";

// Добавление нового результата
export const addScore = async (name, score) => {
  const scoresRef = ref(database, 'leaderboard');
  await push(scoresRef, { name, score });
};

// Получение списка лучших результатов
export const getLeaderboard = (callback) => {
  const scoresRef = query(ref(database, 'leaderboard'), orderByChild('score'), limitToFirst(10));
  onValue(scoresRef, (snapshot) => {
    const data = snapshot.val();
    const leaderboard = Object.values(data || {}).sort((a, b) => b.score - a.score);
    callback(leaderboard);
  });
};
