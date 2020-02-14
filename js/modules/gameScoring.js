// SCORING CLASS USED

export class ScoreGame {
    constructor (expected,  given) {
        this.machine_answers = expected;
        this.player_answers = [];
    }

    scoreRowValues(machine_ans, player_ans) {
        // Check if values are the same. If not, return to what extent they are different.
        // If you find a position that is correct, do not count it anymore, check the rest instead.
        let m_ans, p_ans;
        let num_black_peg = 0;
        let num_white_peg = 0;
        let result = {};
        let p_reduced = [];
        let m_reduced = [];
    
        // Check for any correctly positioned pegs.
        for (let i = 0; i < machine_ans.length; i++) {
            m_ans = machine_ans[i];
            p_ans = player_ans[i];
            if (m_ans == p_ans) {
                num_black_peg += 1;
            } else {
                m_reduced.push(m_ans);
                p_reduced.push(p_ans);
            }
        }
        result[1] = num_black_peg;
        result[2] = num_white_peg;
    
        // Check for white pegs from the reduced array where positioned scored pegs have been removed.
        if (num_black_peg == machine_ans.length) {
            return result;
        } else {
            // check for white pegs
            for (let j = 0; j < p_reduced.length; j++) {
                if (m_reduced.includes(p_reduced[j])) { num_white_peg += 1;}
            }
            result[2] = num_white_peg;
        }
        // return the result of the pegs
        return result;
    }

    scoreFullBoard(){
        
    }

}