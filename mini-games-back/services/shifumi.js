export const getWinner = (choiceA, choiceB) => {
  if (choiceA === choiceB) return 'draw';

  const rules = {
    pierre: 'ciseaux',
    feuille: 'pierre',
    ciseaux: 'feuille'
  };

  return rules[choiceA] === choiceB ? 'playerA' : 'playerB';
};