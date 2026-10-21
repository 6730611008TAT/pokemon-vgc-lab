# Data sources

Pokémon, learnsets, moves, items, abilities and descriptions: https://github.com/smogon/pokemon-showdown/tree/master/data (snapshot 2026-10-21).
Pokémon Showdown is a community simulator, not The Pokémon Company. Descriptions are in English from that data source. Role tags are heuristics based on base stats and available moves, not official categories.
Artwork: https://www.pokemon.com/us/pokedex ; local artwork URLs listed in image-sources.json. Added species use official remote artwork on demand. Internet is required for those images.
Showdown import/export format: https://github.com/smogon/pokemon-showdown/blob/master/sim/TEAMS.md
Rule reference: https://play.pokemon.com/en-us/resources/rules/ . Profiles in this app perform preliminary checks only. No claim of complete tournament legality validation is made.
Species includes base National Dex #1–1025 and the special forms already in the project. Learnset lists may include historical moves in National Dex mode. SV mode filters to Gen 9 learnset sources; transfer, event, combination and origin restrictions still require an external validator.

Item sprites: https://github.com/PokeAPI/sprites/tree/master/sprites/items (community-hosted game sprites). Local files and source URLs are listed in item-image-sources.json. 533 of 585 catalogue entries have downloaded images; 52 use a neutral box icon. No claim of official Pokémon affiliation is made.

Updated item artwork: 573 of 585 entries now have local images. Missing names: Berry, Bitter Berry, Burnt Berry, Gold Berry, Ice Berry, Mint Berry, Miracle Berry, Mystery Berry, Pink Bow, Polkadot Bow, PRZ Cure Berry, PSN Cure Berry. Corrected Z-Crystal filenames to the held-item variant and King’s Rock punctuation. Pretty Feather and Berserk Gene use the community-hosted Smogon sprite repository: https://github.com/smogon/sprites/tree/master/src/minisprites/items . Individual source URLs are in item-image-sources.json. These are community-hosted references, not a claim that every sprite is official artwork.
