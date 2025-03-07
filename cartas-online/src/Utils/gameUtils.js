// src/utils/gameUtils.js

export const initializeGameState = (players, blackCards, whiteCards) => {
    // Inicializa o estado do jogo e o deck de cartas dos jogadores
    const originalDecks = players.map(player => ({
      name: player.name,
      whiteCards: player.whiteCards // Armazena o deck original
    }));
  
    return {
      originalDecks,  // Salva o deck original de cada jogador
      blackCard: shuffleDeck(blackCards)[0],  // Embaralha a carta preta
      whiteCards: shuffleDeck(whiteCards),  // Embaralha as cartas brancas
    };
  };
  
  // Atualiza o deck do jogador após ele jogar uma carta
  export const updatePlayerDeck = (players, playerName, selectedCard) => {
    return players.map((player) => {
      if (player.name === playerName) {
        player.whiteCards = player.whiteCards.filter(card => card !== selectedCard);
      }
      return player;
    });
  };
  
  // Função para embaralhar as cartas
  export const shuffleDeck = (deck) => {
    return deck.sort(() => Math.random() - 0.5);
  };
  