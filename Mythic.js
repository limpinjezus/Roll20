//GIST: https://gist.github.com/limpinjezus/22ec0c1411328125c477

//FUNCTION DECLARATIONS
var Mythic = Mythic || (function() {
    'use strict';
    
    var version = 0.1,
        schemaVersion = 0.0,
        
        //FATE CHART
        odds = ['impossible', 'no way', 'very unlikely', 'unlikely', 'even', 'somewhat likely', 'likely', 'very likely', 'near sure thing', 'a sure thing', 'has to be'],
        oddsImpossible = [-20, 0 , 0, 5, 5, 10, 15, 25, 50],
        oddsNoWay = [0, 5, 5, 10, 15, 25, 35, 50, 75],
        oddsVeryUnlikely = [5, 5, 10, 15, 25, 45, 50, 65, 85],
        oddsUnlikely = [5, 10, 15, 20, 35, 50, 55, 75, 90],
        oddsEven = [10, 15, 25, 35, 50, 65, 75, 85, 95],
        oddsSomewhatLikely = [20, 25, 45, 50, 65, 80, 85, 90, 95],
        oddsLikely = [25, 35, 50, 55, 75, 85, 90, 95, 100],
        oddsVeryLikely = [45, 50, 65, 75, 85, 90, 95, 95, 105],
        oddsNearSureThing = [50, 55, 75, 80, 90, 95, 95, 100, 115],
        oddASureThing = [55, 65, 80, 85, 90, 95, 95, 110, 125],
        oddsHasToBe = [80, 85, 90, 95, 950, 100, 100, 130, 145],
    
    //SHOW HELP
    showHelp = function(infoMsg, player) {
        infoMsg = ' --name|Mythic --title|Mythic Help --leftsub|Version --rightsub|' + version +' --!Help|This API script provides functions to assist in using the Mythic Roleplaying game mechanics within Roll20. --Usage|**Mythic** (//commands//) (//command parameters//) --^1Commands| --^2Help|Use this command to display this Help. --^2Chaos| Use this command with no (//parameters//) to display the current Chaos Factor. --^3Parameter *1|//+//  Increments the Chaos Factor by 1. ie. **Mythic Chaos Increment**  --^3Parameter *2|//-//  Decrements the Chaos Factor by 1. ie. **Mythic Chaos Decrement**  --^3Parameter *3|//Set// (//value//) - Sets the Chaos Factor to a value between 1 and 9. ie. **Mythic Chaos Set 5**' + infoMsg;
        handleOutput(infoMsg, player);
    },
    
    showChaosFactor = function(infoMsg, player) {
        infoMsg = ' --name|Mythic --title|Chaos Factor --leftsub|Version --rightsub|' + version +' --Chaos Factor|[[' + state.Mythic.chaosFactor + ']]' + infoMsg;
        handleOutput(infoMsg, player);
    },
    
    incrementChaosFactor = function(infoMsg, player) {
        state.Mythic.chaosFactor++;
        if (state.Mythic.chaosFactor > 9) {
            state.Mythic.chaosFactor = 9;
            infoMsg = ' --format|error --ERROR|The Chaos Factor has reached its maximum and cannot be incremented.';
        };
        showChaosFactor(infoMsg, player);
    },
    
    decrementChaosFactor = function(infoMsg, player) {
        state.Mythic.chaosFactor--;
        if (state.Mythic.chaosFactor < 1) {
            state.Mythic.chaosFactor = 1;
            infoMsg = ' --format|error --ERROR|The Chaos Factor has reached its minimum and cannot be decremented.';
        };
        showChaosFactor(infoMsg, player);
    },
    
    setChaosFactor = function(setValue, infoMsg, player) {
        state.Mythic.chaosFactor = setValue;
        showChaosFactor(infoMsg, player);
    },
    
    processInlinerolls = function (msg) {
        if (_.has(msg, 'inlinerolls')) {
            return _.chain(msg.inlinerolls)
                    .reduce(function(previous, current, index) {
                        previous['$[[' + index + ']]'] = current.results.total || 0;
                        return previous;
                    },{})
                    .reduce(function(previous, current, index) {
                        return previous.replace(index, current);
                    }, msg.content)
                    .value();
        }
    },
    
    handleOutput = function(infoMsg, player) {
        sendChat('API', ' --name|Mythic --leftsub|Version --rightsub|' + version + infoMsg, function(ops) {
            PowerCard.Process(ops[0], player);
        });
    },
    
    fateChartRoll = function(infoMsg, oddsNumber, player) {
        var fateMsg;
        sendChat('API', '[[1d100]]', function(ops){
            var fateResult = processInlinerolls (ops[0]);
            if (fateResult <= oddsNumber) {
                if (fateResult <= Math.floor(oddsNumber/5)) {
                    fateMsg = ' --Answer|EXCEPTION YES';
                }
                else {
                    fateMsg = ' --Answer|YES';
                }
            }
            if (fateResult > oddsNumber) {
                if (fateResult >= (101 - (Math.floor((100 - oddsNumber)/5)))) {
                    fateMsg = ' --Answer|EXCEPTIONAL NO';
                }
                else {
                    fateMsg = ' --Answer|NO'; 
                }
            }
            infoMsg =  ' --!question|' + infoMsg + ' --title|Odds Question ' + fateMsg + ' --Roll|' + fateResult + ' --Fate Chart %|' + oddsNumber;
            handleOutput(infoMsg, player);
        });
    },
    
    //HANDLE INPUT
    handleInput = function(msg) {
     	if (msg.type !== "api") {
    			return;
    		};
        if (msg.content.split(' ',1)[0].toLowerCase() === '!mythic') {
            var n = msg.content.split(" --");
            var token = "";
            var tag = -1;
            var content = "";
            var mythicCommand = {};
            var mythicContent = {};
            var oddsNumber;
            
            //var oargs, args, lcMsg, oddsNumber;
            var infoMsg = '';
            var player = getObj('player', msg.playerid); 
	
            /*oargs = msg.content.split(" ");
            lcMsg = msg.content.toLowerCase();
            args = lcMsg.split(" ");*/
            
            //CREATE MESSAGE ARRAY
            n.shift();
            n.forEach(function(token) {
        		//tag = token.substring(0, token.indexOf("|"));
                tag = tag+1;
        		content = token.substring(token.indexOf("|") + 1);
        		mythicCommand[tag] = content.toLowerCase();
                mythicContent[tag] = content;
                //sendChat('', mythicCommand[tag] + ' tag: ' + tag + ' length: ' + n.length); //debug
                //sendChat('', mythicContent[tag] + ' ' + tag); //debug
        	});
            
            if(n.length < 1) {
                showHelp(infoMsg, player);
            			return;
            }
            
            switch(mythicCommand[0]) {
                case 'help':
                    showHelp(infoMsg, player);
        				return;
                    break;
                case 'chaos':
                    if(n.length < 2) {
                        showChaosFactor(infoMsg, player);
                		   return;
                    }
                    switch(mythicCommand[1]) {
                        case 'show':
                            showChaosFactor(infoMsg, player);
                    	        return;
                            break;
                        case 'set':
                            var infoMsg = ' --!Note|The Chaos Factor has been set.'
                            if(isNaN(parseInt(mythicCommand[2])) || parseInt(mythicCommand[2]) < 1 || parseInt(mythicCommand[2]) > 9 || n.length < 3 ) {
                                var infoMsg = ' --format|error --ERROR|The Chaos factor cannot be set to ' + mythicCommand[2] + '. The Chaos Factor must be a number between 1 and 9.';
                                showChaosFactor(infoMsg, player);
                                return;
                            };
                            setChaosFactor(parseInt(mythicCommand[2]), infoMsg, player);
                                return;
                            break;
                        case '+':
                            var infoMsg = ' --!Note|The Chaos Factor has been incremented.';
                            incrementChaosFactor(infoMsg, player);
        			            return;
                            break;
                        case '-':
                            var infoMsg = ' --!Note|The Chaos Factor has been decremented.';
                            decrementChaosFactor(infoMsg, player);
        			            return;
                            break;
                    }
                    break;
                case 'odds':
                    if(n.length < 2) {
                        var infoMsg = ' --format|error --ERROR|You must supply one of the following odds values with the odds command: --Odds|impossible, no way, very unlikely, unlikely, even, somewhat likely, likely, very likely, near sure thing, a sure thing, has to be';
                        showHelp(infoMsg, player);
                    	   return;
                    }
                    switch(mythicCommand[1]) {
                        case 'impossible':
                            oddsNumber = oddsImpossible[state.Mythic.chaosFactor-1];
                            break;
                        case 'no way':
                            oddsNumber = oddsNoWay[state.Mythic.chaosFactor-1];
                            break;
                        case 'very unlikely':
                            oddsNumber = oddsVeryUnlikely[state.Mythic.chaosFactor-1];
                            break;
                        case 'unlikely':
                            oddsNumber = oddsUnlikely[state.Mythic.chaosFactor-1];
                            break;
                        case 'even':
                            oddsNumber = oddsEven[state.Mythic.chaosFactor-1];
                            break;
                        case 'somewhat likely':
                            oddsNumber = oddsSomewhatLikely[state.Mythic.chaosFactor-1];
                            break;
                        case 'likely':
                            oddsNumber = oddsLikely[state.Mythic.chaosFactor-1];
                            break;
                        case 'very likely':
                            oddsNumber = oddsVeryLikely[state.Mythic.chaosFactor-1];
                            break;
                        case 'near sure thing':
                            oddsNumber = oddsNearSureThing[state.Mythic.chaosFactor-1];
                            break;
                        case 'a sure thing':
                            oddsNumber = oddsASureThing[state.Mythic.chaosFactor-1];
                            break;
                        case 'has to be':
                            oddsNumber = oddsHasToBe[state.Mythic.chaosFactor-1];
                            break;
                    }
                    var infoMsg = ' --!Note|' + mythicContent[2];
                    fateChartRoll(infoMsg, oddsNumber, player);
    		            return;
                    break;
                default:
                    var infoMsg = ' --format|error --ERROR|Invalid Mythic script command.';
                    showHelp(infoMsg, player);
            }
    		/*switch(args[0]) {
    			case '!mythic':
                    if('help' === args[1] || ( !_.has(msg,'selected') && args.length < 2)) {
    					showHelp(infoMsg, player);
    					return;
    				}
                    if('chaos' === args[1] && args.length < 3) {
        				showChaosFactor(infoMsg, player);
    					return;
    				}
                    if('chaos' === args[1] && args.length > 2) {
                		switch(args[2]) {
                            case '+':
                                var infoMsg = ' --!Note|The Chaos Factor has been incremented.';
                                incrementChaosFactor(infoMsg, player);
        				            return;
                                break;
                            case '-':
                                var infoMsg = ' --!Note|The Chaos Factor has been decremented.';
                                decrementChaosFactor(infoMsg, player);
        				            return;
                                break;
                            case 'set':
                                var infoMsg = ' --!Note|The Chaos Factor has been set.'
                                if(isNaN(parseInt(args[3])) || parseInt(args[3]) < 1 || parseInt(args[3]) > 9 || args.length < 4 ) {
                                    var infoMsg = ' --format|error --ERROR|The Chaos Factor must be a number between 1 and 9.';
                                    showChaosFactor(infoMsg, player);
                                    return;
                                };
                                setChaosFactor(parseInt(args[3]), infoMsg, player);
                                    return;
                                break;
                            default:
                                var infoMsg = ' --format|error --ERROR|**'+ msg.content +'//** is not a valid command.';
                                showHelp(infoMsg, player);
                		}
    				}
                    if('odds' === args[1] && args.length > 2) {
                        for (var i = 0; i < odds.length; i++) {
                            //if (args[2] === odds[i]) {
                            //    var oddsValue = args[2];
                            var match = '/' + odds[i] + '/';
                            var oddsValue = lcMsg.match(/has to be/);
                            //}
                        }
                		switch(args[2]) {
                            case oddsValue:
                                switch (oddsValue) {
                                    case 'impossible':
                                        oddsNumber = oddsImpossible[state.Mythic.chaosFactor-1];
                                        break;
                                    case 'even':
                                        oddsNumber = oddsEven[state.Mythic.chaosFactor-1];
                                        break;
                                    case 'has to be':
                                        oddsNumber = oddsHasToBe[state.Mythic.chaosFactor-1];
                                        break;
                                }
                                var infoMsg = ' --!Note|' + msg.content.replace(oargs[0] + ' ' + oargs[1] + ' ' + oargs[2],'');
                                fateChartRoll(infoMsg, oddsNumber, player);
            			            return;
                                break;
                            default:
                                var infoMsg = ' --format|error --ERROR|**'+ args[2] +'//** is not a valid odds. Use one of the following. --Odds|impossible, no way, very unlikely, unlikely, even, somewhat likely, likely, very likely, near sure thing, a sure thing, has to be';
                                showHelp(infoMsg, player);
    				    }
    				}
                    if('odds' === args[1] && args.length < 3) {
                            var infoMsg = ' --format|error --ERROR|**'+ msg.content +'//** is not a valid command. You must supply an odds value with the odds command.';
                    	    showHelp(infoMsg, player);
        					return;
                    }
    				break;
            }*/
        }
	},
    
    checkInstall = function() {
        if( ! _.has(state,'Mythic') || state.Mythic.version !== schemaVersion) {
            log('Mythic: Resetting state');
            /* Default Settings stored in the state. */
            state.Mythic = {
    			version: schemaVersion,
                chaosFactor: 5
			};
		}
	},
 
	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};
    
    /*fateChart = function() {
        var oddseven = [10, 15, 25, 35, 50, 65, 75, 85, 95];
    };*/
 
	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers,
        //FateChart: fateChart
	};
    
}());

on("ready",function(){
    'use strict';
 
    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
		Mythic.CheckInstall();
		Mythic.RegisterEventHandlers();
        //Mythic.FateChart();
    } else {
        log('----------------------------------------------------------------------------');
        log('Mythic requires the following modules to work.');
        log('isGM v0.6');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('PowerCards v.2.3.2');
        log('PowerCards GIST: https://gist.github.com/Sky-Captain-13/452330a3d926b32da49c');
        log('----------------------------------------------------------------------------');
    }
});
