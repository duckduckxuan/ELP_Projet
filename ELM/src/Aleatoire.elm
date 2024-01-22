module Aleatoire exposing (getRandomWord)

import Random exposing (initialSeed, int, Seed, step, Generator)
import List exposing (head)
import Maybe exposing (withDefault)

getRandomWord : String -> Int -> String
getRandomWord previousWord seed =
    let
        wordList = 
            [ "a", "anywhere", "below", "burn", "climb", "able", "apartment", "bend",
             "bus", "close", "about", "appear", "beneath", "business", "clothes", "above", "approach", "beside"
            ]
        randomIndexGenerator =
            Random.int 0 (List.length wordList - 1)
        (randomIndex, _) =
            Random.step randomIndexGenerator (initialSeed seed)
        randomElement =
            List.take 1 (List.drop randomIndex wordList)
    in
    Maybe.withDefault "Default word" (List.head randomElement)