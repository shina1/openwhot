/**
 * WhotGame AI
 *
 *  Used in the OpenWhot game (openwhot.js)
 *  
 * (C) Sochima Biereagu, 2018
 */

import _ from 'lodash';

export default class WhotAI {

	CHECK_UP = 500;
	player = { [-1]: 'cpu', [1]: 'player' };

	// get AI move
	aiMove() {

		let {cards, msg} = this.moves('cpu');
		if (cards.length === 0){
			return ['market', ];
		}

		// after recursive play() and unplay(), the card order changes,
		//  using a cloned gameState object prevents this
		let gameState = this.gameState;
		this.gameState = _.cloneDeep(gameState);

		let best_move = {move:[cards[0]]}, depth = this.getDepth();
		let max = this.alphabeta(depth, depth, -Infinity, Infinity, best_move);

		this.gameState = gameState;

		////////////
		// ...... //
		////////////

		
		// if (best_move.move[0].value)
		// 	console.log(`move = '${best_move.move[0].value}-${best_move.move[0].type}', eval = '${best_move.move[1]}'`);
		// else
		// 	console.log(`move = '${best_move.move[0]}', eval = '${best_move.move[1]}'`);

		return [best_move.move[0], best_move.move[2]];
	}


	// alphabeta search
	alphabeta(d, depth, alpha, beta, best_move) {
		let gamecards = this.gameState.cards;

		let player = this.gameState.gameTurn.who,
			player_cards = gamecards[player],
			player_cards_count = player_cards.length + gamecards.market_count[player];

		let {cards, msg} = this.moves(player),
			moves = cards.concat('market'),
			defended = (msg === 'defended');

		if(depth == 0 || !player_cards_count){
			if (player_cards_count === 0){
				return ((player=='cpu')?1:-1) * this.CHECK_UP;
			}
			return this.evaluate(this.gameState);
		}

		let best, v;
		if (player === "cpu"){
			// maximizing player
			best = -Infinity;
			for (let move of moves){
				this.play(player, move, true, null, defended);
					v = this.alphabeta(d, depth-1, alpha, beta, best_move);
				this.unplay(player, this.gameState.movesHistory.pop(), true);

				if (v > best){
					best = v;
					if (d === depth){
						best_move.move = [move, v, msg];
					}
				}
				alpha = Math.max(alpha, best);
				if (beta <= alpha) break;
			}
			return best;
		}
		else {
			// minimizing player
			best = Infinity;
			for (let move of moves){
				this.play(player, move, true, null, defended);
					v = this.alphabeta(d, depth-1, alpha, beta, best_move);
				this.unplay(player, this.gameState.movesHistory.pop(), true);

				if (v < best){
					best = v;

					if (d === depth){
						best_move.move = [move, v, msg];
					}
				}
				beta = Math.min(beta, best);
				if (beta <= alpha) break;
			}
			return best;
		}
	}


	// evaluate game state
	evaluate(state) {
		let	self = this,
			{cards} = state,
			turn = this.gameState.gameTurn.who,
			topcard = this.gameState.cards.gameCards[0];

		let card_count = {
			cpu: cards.cpu.length + cards.market_count.cpu,
			player: cards.player.length + cards.market_count.player,
		};

		return (card_count.player - card_count.cpu);
	}


	getDepth() {
		return ({
			'novice': 1,
			'amateur': 4,
			'competent': 5,
			'proficient': 7,
			'grandmaster': 10,
		})[this.gameState.difficulty];
	}

}

