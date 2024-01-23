module MotAleatoire exposing (getRandomWord)

import Random exposing (int,initialSeed, Seed, step, Generator)


getRandomWord : List String -> Int -> String
getRandomWord wordList seed =
    let
        randomIndexGenerator =
            Random.int 0 (List.length wordList - 1)
        (randomIndex, _) =
            Random.step randomIndexGenerator (initialSeed seed)
        randomElement =
            List.take 1 (List.drop randomIndex wordList)
    in
    Maybe.withDefault "Default word" (List.head randomElement)