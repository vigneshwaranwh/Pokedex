const POKEMON = 1;

function pickRandom(arr) {

    return arr[Math.floor(Math.random() * arr.length)];

}

function padStats(stat, val, sep, len) {

    val = val || "xx";

    let output = `

    ${stat.toString()}${sep.repeat(len - (val.toString().length + stat.toString().length))}${val.toString()}`;

    return output;

}

class Pokedex extends React.Component {

    constructor(props) {
    
        super(props);
    
        this.state = {
    
            requestRoot: "https://pokeapi.co/api/v2/pokemon/",
    
            pokemonIndex: POKEMON,
    
            pokemonData: {},
    
            pokemonDescription: "",
    
            speciesData: {},
    
            evoSprites: [],
    
            evoNames: [],
    
            moves: [],
    
            loading: false 
        
        };

        this.nextPokemon = this.nextPokemon.bind(this);
    
        this.previousPokemon = this.previousPokemon.bind(this);
    
        this.pickPokemon = this.pickPokemon.bind(this);
  
    }

    nextPokemon() {

        const next = Math.min(this.state.pokemonIndex + 1, 949);

        this.setState({ pokemonIndex: next }, this.changePokemon);

    }
    
    previousPokemon() {

        const prev = Math.max(this.state.pokemonIndex - 1, 1);

        this.setState({ pokemonIndex: prev }, this.changePokemon);

    }
    
    pickPokemon(no) {

        this.setState({ pokemonIndex: no }, this.changePokemon);

    }
    
    componentDidMount() {

        this.changePokemon();

    }

    changePokemon() {

        this.setState({ loading: true });
        
        const request = `${this.state.requestRoot}${this.state.pokemonIndex}/`;

        fetch(request, {
            
            cache: "force-cache" 
        
        }).

        then(response => response.json()).

        then(data => {

            this.setState({
        
                pokemonData: data,
        
                pokemonIndex: data.id 
            
            });

            const speciesRequest = data.species.url;
      
            return fetch(speciesRequest);
    
        }).
    
        then(response => response.json()).
    
        then(data => {
    
            this.setState({
    
                speciesData: data,

                description: pickRandom(

                    data.flavor_text_entries.filter(e => e.language.name === "en").map(e => e.flavor_text)
                    
                ),

                loading: false 
            
            });

            const evo_chain = data.evolution_chain.url;

            fetch(evo_chain).

            then(response => response.json()).

            then(data => {

                const api = "https://pokeapi.co/api/v2/pokemon/";

                const first = data.chain;

                let second;

                let third;

                let evos = [];

                if (first) {

                    const e1 = fetch(`${api}${first.species.name}/`);

                    evos.push(e1);
          
                    second = first.evolves_to[0];
        
                }

                if (second) {
                    
                    const e2 = fetch(`${api}${second.species.name}/`);
                    
                    third = second.evolves_to[0];

                    evos.push(e2);

                }

                if (third) {

                    const e3 = fetch(`${api}${third.species.name}/`);

                    evos.push(e3);

                }

                Promise.all(evos).
                
                then(responses => Promise.all(responses.map(value => value.json()))).
                
                then(dataList => {
                
                    const sprites = dataList.map(v => v.sprites.front_default);
                
                    const names = dataList.map(n => n.name);
                
                    this.setState({ evoSprites: sprites, evoNames: names });
                
                });
                
            });
            
        });
        
    }

    render() {

        const pData = this.state.pokemonData;

        const sData = this.state.speciesData;

        return (

            React.createElement("div", { className: "pokedex" },
          
                React.createElement(LeftPanel, {
            
                    pData: pData,
            
                    sData: sData,
            
                    no: this.state.pokemonIndex,
            
                    description: this.state.description 
                
                }),
        
                React.createElement(Divider, null),
                
                React.createElement(RightPanel, {
                
                    pData: pData,
                
                    sData: sData,
                
                    evoSprites: this.state.evoSprites,
                
                    evoNames: this.state.evoNames,
                
                    controls: { next: this.nextPokemon, prev: this.previousPokemon, pick: this.pickPokemon },
                
                    no: this.state.pokemonIndex 
                    
                })

            )
                
        );

    }

}

function LeftPanel(props) {

    const pData = props.pData;

    if (typeof pData === "object" && Object.keys(pData).length !== 0) {

        return (

            React.createElement("div", { className: "panel left-panel" }, 
        
                React.createElement(PokemonName, { name: pData.name, no: props.no }), 
        
                React.createElement(PokemonSprite, { src: pData.sprites }), 
        
                React.createElement(PokemonDescription, { description: props.description, no: props.no })
            
            )

        );
  
    } 
    
    else {
        
        return Loading();
    }
}
  
function PokemonName(props) {

    return (
        
        React.createElement("div", { className: "pokemon-name screen" },

            props.name, 
            
            React.createElement("span", { className: "name-no" }, "no. ", props.no)
            
        )
        
    );
  
}

class PokemonSprite extends React.Component {

    constructor(props) {
      
        super(props);
      
        this.state = {
      
            front: true,
      
            shiny: false,
      
            female: false 
        
        };

        this.toggleGender = this.toggleGender.bind(this);
      
        this.toggleShiny = this.toggleShiny.bind(this);
      
        this.toggleFront = this.toggleFront.bind(this);
    
    }

    buildImage() {

        const dir = this.state.front ? "front" : "back";

        const gender = this.state.female ? "_female" : "";

        const shiny = this.state.shiny ? "_shiny" : "_default";

        return dir + shiny + gender;

    }

    toggleGender() {

        this.setState({ female: !this.state.female }, () => {
          
            if (this.props.src[this.buildImage()]) {
          
                return;
          
            } 
            
            else {
          
                this.setState({ female: false });
          
            }
        
        });
      
    }

    toggleShiny() {
   
        this.setState({ shiny: !this.state.shiny }, () => {
          
            if (this.props.src[this.buildImage()]) {
          
                return;
          
            } 
            
            else {
            
                this.setState({ shiny: false });
          
            }
        
        });
      
    }

    toggleFront() {
        
        this.setState({ front: !this.state.front }, () => {
        
            if (this.props.src[this.buildImage()]) {
        
                return;
        
            } 
            
            else {
            
                this.setState({ front: false });
          
            }
        
        });
      
    }

    render() {

        const imgSrc = this.props.src[this.buildImage()] || this.props.src["front_default"];

        const funcs = { gender: this.toggleGender, front: this.toggleFront, shiny: this.toggleShiny };
        
        return (
          
            React.createElement("div", null, 
          
                React.createElement("img", { src: imgSrc, alt: "pokemon", className: "pokemon-sprite" }), 
            
                React.createElement(SpriteControls, {
          
                    funcs: funcs,
            
                    gender: this.state.female,
            
                    shiny: this.state.shiny,
            
                    front: this.state.front 
            
                })
            
            )

        );

    }

}

function SpriteControls(props) {
    
    return (
      
        React.createElement("div", { className: "sprite-controls" }, 
      
            React.createElement("div", 
            
                {
                
                    className: "sprite-control sprite-controls-gender " + (props.gender ? "sprite-control-selected" : ""),
                
                    onClick: props.funcs.gender 
                
                }, 
    
                    React.createElement("i", { className: "fas fa-venus" })
            
            ), 
  
            React.createElement("div", 
            
                {
                
                    className: "sprite-control sprite-controls-shiny " + (props.shiny ? "sprite-control-selected" : ""),
                
                    onClick: props.funcs.shiny 
                
                },
        
                React.createElement("span", null, "shiny")
                
            ), 
  
            React.createElement("div", 
            
                {
            
                        className: "sprite-control sprite-controls-rotate " + (!props.front ? "sprite-control-selected" : ""),
            
                        onClick: props.funcs.front 
                    
                }, 
        
                React.createElement("i", { className: "fas fa-undo" })

            )
            
        )
        
    );
  
}
  
function PokemonDescription(props) {
    
    return React.createElement("div", { className: "pokemon-description screen" }, props.description);

}

function Divider(props) {
    
    return (
      
        React.createElement(
                
            "div", { className: "divider" }, 
      
            React.createElement("div", { className: "gap" }), 
            
            React.createElement("div", { className: "hinge" }), 
            
            React.createElement("div", { className: "gap" }), 
            
            React.createElement("div", { className: "hinge" }), 
            
            React.createElement("div", { className: "gap" }), 
            
            React.createElement("div", { className: "hinge" }), 
            
            React.createElement("div", { className: "gap" })

        )
            
    );

}
  
function RightPanel(props) {
    
    const types = props.pData.types;
    
    const stats = props.pData.stats;
    
    const moves = props.pData.moves;
  
    if (types) {
    
        return (
    
            React.createElement("div", { className: "panel right-panel" }, 
    
                React.createElement(
                    
                    "div", { className: "panel-row" }, 
        
                    React.createElement(PokemonStats, { stats: stats }), 
        
                    React.createElement(PokemonType, { types: types })
                    
                ),
            
                React.createElement(PokemonEvolution, { evoSprites: props.evoSprites, evoNames: props.evoNames }), 
            
                React.createElement(ButtonChrome, null), 
        
                React.createElement(MoveList, { moves: moves }), 
        
                React.createElement(PokedexControls, { controls: props.controls, no: props.no })
                
            )
                
        );
  
    } else {
        
        return Loading();

    }

}
  
function PokemonStats(props) {

    const stats = props.stats;

    return (

        React.createElement("div", { className: "screen stats" },
        
            stats.map(s => 
                
                {
            
                    const name = s.stat.name;
                
                    const value = s.base_stat;
        
                    return React.createElement(StatLine, { name: name, value: value, key: name });
                
                }
                
            )
        
        )
        
    );
  
}

function StatLine(props) {

    return (

        React.createElement("div", 
        
            { 
                
                className: "stat-line" 
            
            },
        
            padStats(props.name, props.value, ".", 20)
        
        )
        
    );

}

function PokemonType(props) {

    const types = props.types;

    return (

        React.createElement("div", 
        
            {

                className: "type-list" 
            
            }, 
        
            React.createElement("div", { className: "panel-header" }, "Types"), 
        
            React.createElement("div", 
            
                {

                    className: "type-box" 
                    
                },
      
                types.map(t => 
                    
                    {
            
                        const type = t.type.name;
                    
                        return React.createElement(Type, { type: type, key: type });
        
                    }

                )

            )

        )

    ); 

}

function PokemonEvolution(props) {

    const e1 = props.evoSprites[0];
    
    const e2 = props.evoSprites[1];
    
    const e3 = props.evoSprites[2];
    
    const n1 = props.evoNames[0];
    
    const n2 = props.evoNames[1];
    
    const n3 = props.evoNames[2];
  
    return (

        React.createElement("div", 

            {
                
                className: "panel-row panel-evo" 
            }, 
    
            React.createElement(PokemonSpriteSmall, { src: e1, evo: "I", name: n1 }), 
            
            React.createElement(PokemonSpriteSmall, { src: e2, evo: "II", name: n2 }), 
            
            React.createElement(PokemonSpriteSmall, { src: e3, evo: "III", name: n3 })
        )

    );
  
}

function PokemonSpriteSmall(props) {

    let evoImage;
  
    if (props.src) {

        evoImage = React.createElement("img", { src: props.src, alt: "pokemon", className: "pokemon-sprite pokemon-sprite-small" });

    } 
    
    else {

        evoImage = React.createElement(PokeBall, null);

    }
  
    return (

        React.createElement(
            
            "div", null, 
        
            React.createElement("div", { className: "flex-center" }, 
        
                React.createElement("div", { className: "evo-num" }, props.evo)

            ),
    
            evoImage, 
        
            React.createElement("div", { className: "screen evo-name" }, props.name || "No Data")
        
        )
        
    );
  
}

function PokeBall(props) {

    return (

        React.createElement(
            
            "div", { className: "pokemon-sprite pokemon-sprite-small empty-evo" },

            React.createElement(
                
                "div", { className: "poke-ball" }, 

                React.createElement("div", { className: "poke-ball-top" }), 

                React.createElement("div", { className: "poke-ball-center" }, 

                React.createElement("div", { className: "poke-ball-dot" })), 

                React.createElement("div", { className: "poke-ball-bottom" })
                
            )
        
        )
        
    );
    
}
  
function ButtonChrome(props) {

    return (

        React.createElement(
        
            "div", { className: "panel-row blue-buttons" }, 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" }), 
        
            React.createElement("div", { className: "blue-button" })

        )
        
    );
  
}

class MoveList extends React.Component {

    constructor(props) {
        
        super(props);
        
        this.state = {
        
            index: 0,
        
            currentMove: {},
        
            loading: false 
        
        };
  
        this.nextMove = this.nextMove.bind(this);
        
        this.prevMove = this.prevMove.bind(this);
    
    }

    componentDidMount() {

        this.loadMoves();

    }

    loadMoves() {

        this.setState({ loading: true, index: this.state.index }, () => 
        
            {

                fetch(this.props.moves[this.state.index].move.url).

                then(response => response.json()).

                then(data => 
                        
                    {

                        this.setState({ currentMove: data, loading: false });

                    }
                        
                );

            }
            
        );

    }

    componentDidUpdate(prevProps) {

        if (this.props.moves !== prevProps.moves) {

            this.setState({ index: 0 }, this.loadMoves);

        }

    }

    nextMove() {

        const nextIndex = Math.min(this.state.index + 1, this.props.moves.length - 1);

        this.setState({ index: nextIndex }, this.loadMoves);

    }

    prevMove() {

        const nextIndex = Math.max(this.state.index - 1, 0);

        this.setState({ index: nextIndex }, this.loadMoves);

    }

    render() {

        let moves;

        if (this.state.loading || Object.keys(this.state.currentMove).length === 0) {

            moves = React.createElement(MovesLoading, null);

        } 
        
        else {

            const lvl = this.props.moves[this.state.index].version_group_details[0].level_learned_at;

            moves = React.createElement(MoveEntry, { move: this.state.currentMove, lvl: lvl });

        }

        return (

            React.createElement(
                
                "div", { className: "move-list" },
      
                moves, 
        
                React.createElement(
                    
                    "div", { className: "move-controls" }, 
        
                    React.createElement("div", { className: "move-arrow", onClick: this.prevMove }, 
            
                    React.createElement("i", { className: "fas fa-caret-up" })), 

                    React.createElement("div", { className: "move-arrow", onClick: this.nextMove }, 
            
                    React.createElement("i", { className: "fas fa-caret-down" }))
                    
                )
                
            )
                
        );

    }

}

function MovesLoading() {

    return (

        React.createElement(
            
            "div", { className: "move-body move-screen screen" }, 
      
            React.createElement("div", { className: "move-left" }, 
        
            React.createElement("div", { className: "move-name", style: { textTransform: "none" } }, "xxxxx xxxxx"), 
    
            React.createElement("div", { className: "move-stat" }, padStats("Accuracy", "xx", ".", 16)), 
        
            React.createElement("div", { className: "move-stat" }, padStats("Power", "xx", ".", 16)), 
        
            React.createElement("div", { className: "move-stat" }, padStats("PP", "xx", ".", 16))), 
        
            React.createElement(
                
                "div", { className: "move-right" }, 
        
                React.createElement("div", { className: "move-type" }, "Type: xxxxx"), 
    
                React.createElement("div", { className: "move-learn" }, "Learn: Lvl xx")
            
            )
        
        )
        
    );
  
}
  
function MoveEntry(props) {

    const move = props.move;

    const name = move.name || move.names.filter(m => m.language.name === "en")[0].name;

    const acc = move.accuracy;
    
    const pow = move.power;
    
    const pp = move.pp;
    
    const type = move.type.name;
    
    const lvl = props.lvl;
    
    return (

        React.createElement(
            
            "div", { className: "move-body move-screen screen" }, 

            React.createElement("div", { className: "move-left" }, 

            React.createElement("div", { className: "move-name" }, name), 

            React.createElement("div", { className: "move-stat" }, padStats("Accuracy", acc, ".", 16)), 

            React.createElement("div", { className: "move-stat" }, padStats("Power", pow, ".", 16)), 

            React.createElement("div", { className: "move-stat" }, padStats("PP", pp, ".", 16))), 
        
            React.createElement(
                
                "div", { className: "move-right" }, 

                React.createElement("div", { className: "move-type" }, "Type: ", type), 
            
                React.createElement("div", { className: "move-learn" }, "Learn: Lvl ", lvl)
                
            )
            
        )
            
    );

}

function PokedexControls(props) {

    return (

        React.createElement(
            
            "div", { className: "panel-row controls" }, 
        
            React.createElement(Button, { dir: "left", onClick: props.controls.prev }), 
            
            React.createElement(NumInput, { no: props.no, func: props.controls.pick }), 
            
            React.createElement(Button, { dir: "right", onClick: props.controls.next })
        
        )
        
    );
    
}
  
function Button(props) {
    
    return React.createElement("div", { className: "button", onClick: props.onClick });

}
  
class NumInput extends React.Component {

    constructor(props) {

        super(props);

        this.state = 

        {

            id: 1 

        };
  
        this.handleChange = this.handleChange.bind(this);

        this.handleClick = this.handleClick.bind(this);

    }

    handleChange(e) {

        e.preventDefault();

        this.setState({ id: e.target.value });

    }
    
    handleClick(e) {
        
        e.preventDefault();

        this.props.func(this.state.id);

    }

    render() {

        return (

            React.createElement(
            
                "div", null, 
            
                React.createElement("input", {
            
                type: "number",
            
                className: "screen num-input",
            
                placeholder: this.props.no,
            
                onChange: this.handleChange }), 
        
                React.createElement("div", { className: "submit", onClick: this.handleClick })
                
            )
                
        );
        
    }

}

function Loading() {

    return React.createElement("h1", null, "LOADING...");

}
  
function Type(props) {

    return React.createElement("div", { className: "type " + props.type }, props.type);

}
  
ReactDOM.render( React.createElement(Pokedex, null), document.getElementById("root"));