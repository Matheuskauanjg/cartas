// src/utils/gameUtils.js

export const verifyPlayerDeck = (players, originalDecks) => {
    // Verifica se o deck do jogador foi alterado inesperadamente
    players.forEach((player, index) => {
      const originalDeck = originalDecks[index];
  
      // Se o deck do jogador foi alterado, isso significa que houve um erro
      if (JSON.stringify(player.whiteCards) !== JSON.stringify(originalDeck.whiteCards)) {
        console.error(`Erro: O deck de ${player.name} foi alterado inesperadamente.`);
      }
    });
  };
  
  export const shuffleDeck = (deck) => {
    // Função para embaralhar o deck de cartas
    return deck.sort(() => Math.random() - 0.5);
  };
  
  export const initializeGameState = (players, blackCards, whiteCards) => {
    // Inicializa o estado do jogo e o deck de cartas dos jogadores
    const originalDecks = players.map(player => ({
      name: player.name,
      whiteCards: player.whiteCards
    }));
  
    return {
      originalDecks,
      blackCard: shuffleDeck(blackCards)[0],  // Embaralha a carta preta
      whiteCards: shuffleDeck(whiteCards),  // Embaralha as cartas brancas
    };
  };
  
  export const updatePlayerDeck = (players, playerName, selectedCard) => {
    // Atualiza o deck do jogador após ele jogar uma carta
    return players.map((player) => {
      if (player.name === playerName) {
        player.whiteCards = player.whiteCards.filter(card => card !== selectedCard);
      }
      return player;
    });
  };
  
  export const addCardsToPlayer = (players, playerName, cards) => {
    // Adiciona novas cartas ao deck de um jogador
    return players.map(player => {
      if (player.name === playerName) {
        player.whiteCards = [...player.whiteCards, ...cards];
      }
      return player;
    });
  };
  