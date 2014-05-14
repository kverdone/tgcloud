// Stores entire dataset that is read in
var fullData = [];

// The subsection of data being used for the cloud
var dataset = [];

/*************************************************
**************************************************
**************************************************
*   Stores the options you can use for the cloud.
*
*   numWords - Number of words in the cloud,
*       sliced from fullData
*   svgSize - Size of the square SVG container
*   fontScale - Choice of D3 scales for assigning
*       font size for each word. Choose from 
*        linear, sqrt, log, or quantize.
*   font - Font used. Some don't look great.
*       Choose from helvetica, times, georgia,
*        verdana, comfortaa, raleway, or lato.
*   fontCase - Use different cases. Choose from
*       upper, lower, or default.
*   fontLower - Lower limit for font size.
*   fontUpper - Upper limit for font size.
*   spiral - The algorithm used to place words.
*       Choose from rectangle, archimedean,
*       or random.
*   wordSort - Choose whether to sort fullData
*       from most to least common frequency.
*   wordAngle - Choose angles the words will be
*       placed at. Choose from horizontal, 
*       vertical, or mixed.
*   angle Percent - Choose how often vertical
*       words appear for the mixed wordAngle
*       option.
*   colorList - List of colors used for the words.
*   path - Path to the CSV for reading in data.
*
**************************************************
**************************************************
**************************************************/
var options = { numWords: 25,
                svgSize: 600,
                fontScale: "linear",
                font: "times",
                fontCase: "upper",
                fontLower: 20,
                fontUpper: 60,
                spiral: "rectangle",
                wordSort: true,
                wordAngle: "mix",
                anglePercent: 0.3,
                colorList: ['#407db5', '#e67e22',
                      '#27ae60', '#8e44ad',
                      '#e74c3c'],
                path: 'kyle.csv'};

//read_test_data(options, dataset);
//read_csv_data(options, fullData);

/* 
*   Reads in data from the csv located at the 
*   path as defined in the options.
*/
function read_csv_data(options, fullData) {
    d3.csv(options.path, function (error, data) {
        data.forEach(function (d) {
            var obj = {'word': d.word,
                    'count': d.count};
            fullData.push(obj);
        });
        
        if (options.wordSort) {
            fullData.sort(compare);
        }

        build_cloud(options, fullData);
    });

}

/*
*   Takes in the fullData array and 
*   applies the necessary functions to
*   construct the word cloud.
*/
function build_cloud(options, fullData) {
    dataset = [];
    trim_dataset(options, fullData);
    initial_text_placement(options, dataset);
    determine_text_boundaries(options, dataset);
    cloud_placement_algorithm(options, dataset);
    finalize_text_placement(options, dataset);
}

function update_cloud(options,fullData) {
    d3.selectAll("text").remove();
    trim_dataset(options, fullData);
    initial_text_placement(options, dataset);
    determine_text_boundaries(options, dataset);
    cloud_placement_algorithm(options, dataset);
    finalize_text_placement(options, dataset);
}


// Returns a number between the two parameters
function rand(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
}

/* 
*   Takes the first X number of words
*   as defined in the options.
*/
function trim_dataset(options, fullData) {
    dataset = fullData.slice(0, options.numWords);
}

/*
*   Clears the svg of previous text elements
*   and creates new text elements and places
*   them offscreen.
*/
function initial_text_placement(options, dataset) {

    // Scale for the font size
    var lower = options.fontLower,
        upper = options.fontUpper,
        size;
    switch (options.fontScale) {
    case "linear":
        size = d3.scale.linear()
            .domain(d3.extent(dataset, function (d) {return +d.count; }))
            .rangeRound([lower, upper])
            .clamp(true);
        break;
    case "sqrt":
        size = d3.scale.sqrt()
            .domain(d3.extent(dataset, function (d) {return +d.count; }))
            .rangeRound([lower, upper])
            .clamp(true);
        break;
    case "log":
        size = d3.scale.log()
            .domain(d3.extent(dataset, function (d) {return +d.count; }))
            .rangeRound([lower, upper])
            .clamp(true);
        break;
    case "quantize":
        size = d3.scale.quantize()
            .domain(d3.extent(dataset, function (d) {return +d.count; }))
            .range([25, 35, 45, 55, 65]);
        break;
    default:
        size = d3.scale.linear()
            .domain(d3.extent(dataset, function (d) {return +d.count; }))
            .rangeRound([lower, upper])
            .clamp(true);
        break;
    }

    // Size of the SVG
    var dim = options.svgSize;
    var svg;
    
    /*
    *   If no SVG found, add it. Otherwise,
    *   select it.
    */
    if (d3.select("svg").empty()) {
        svg = d3.select("body")
            .append("svg")
                .attr("height", dim)
                .attr("width", dim);
        svg.append("rect")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr("fill", "#e0e0e0"); 
    } else {
        svg = d3.select("svg");
    }


    // Create Text elements in random locations offscreen
    // Determine if it should be rotated
    // Add an ID and a color from the list
    var text = svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text");
    
    text.text(function (d) {
                switch (options.fontCase) {
                case "upper":
                    return d.word.toUpperCase();
                case "lower":
                    return d.word.toLowerCase();
                default:
                    return d.word;
                }

            })
            .attr("font-size", function (d) {
                return size(d.count);
            })
            .attr("transform", function (d) {
                var x = Math.random() >= 0.5 ? rand(-500, -150) : rand(900, 1400),
                    y = Math.random() >= 0.5 ? rand(-500, -150) : rand(900, 1400);

                switch (options.wordAngle) {
                case "mixed":
                    var deg = Math.random() > options.anglePercent ? 0 : -90;
                    break;
                case "horizontal":
                    var deg = 0;
                    break;
                case "vertical":
                    var deg = -90;
                    break;
                default:
                    var deg = Math.random() > options.anglePercent ? 0 : -90;
                    break;
                }

                d.x = x;
                d.y = y;
                d.deg = deg;

                return "translate(" + x + "," + y + ")rotate(" + deg + ")";
            })
            .attr("id", function (d) {
                return d.word;
            })
            .attr("fill", function (d, i) {
                return options.colorList[i % 5];
            })
            .attr("font-family", function (d) {
                switch (options.font) {
                case "helvetica":
                case "times":
                case "bariol_light":
                case "bariol_thin":
                case "bariol_regular":
                case "bariol_bold":
                    return options.font;
                default:
                    return "times";
                }
            });
}

/*
*   For each text element, determines the 
*   boundaries of the element and stores 
*   them in the dataset for collision
*   detection.
*/
function determine_text_boundaries(options, dataset) {
    
    var text = d3.selectAll("text");

    text.each(function (d, i) {
        var box = this.getBoundingClientRect(),
            padding = 8;
        
        // The bounding box is usually too big.
        // 65% gives enough padding.
        if (d.deg === 0) {
            d.height = Math.round(box.height * 0.65);
            d.width = box.width;
        } else {
            d.height = box.height;
            d.width = Math.round(box.width * 0.65);
        }
        d.T = box.top;
        d.B = box.bottom;
        d.L = box.left;
        d.R = box.right;
    });
}

/*
*   Creates the cloud using the algorithm
*   indicated in the options.
*/
function cloud_placement_algorithm(options, dataset) {
    switch (options.spiral) {
    case "rectangle":
        rectangular_spiral(dataset);
        break;
    case "archimedean":
        archimedean_spiral(dataset);
        break;
    case "random":
        random_placement(dataset);
        break;
    default:
        rectangular_spiral(dataset);
        break;
    }
}

/*
*   Places words in a rectangular spiral,
*   starting at the center of the SVG
*   and spiraling counterclockwise.
*/
function rectangular_spiral(dataset) {
    // Rectangular Spiral Placement Algorithm
    // Outermost loop iterates through each item
    // Second loop picks locations along the spiral
    // Innermost loop checks the location against the
    // Current locations of all other Text elements

    var failed = [],
        dim = options.svgSize;
    
    for (i = 0; i < dataset.length; i++) {
        var x = 0,
            y = 0,
            X = 150,
            Y = 150,
            dx = 0,
            dy = -1,
            loops = Math.pow(Math.max(X, Y), 2);

        for (j = 0; j < loops; j++) {

            var collision = false;

            if ((-X / 2 < x && x <= X / 2) && (-Y / 2 < y && y <= Y / 2)) {
                // Place at 40% of width and 60% 
                // of height. Seems to look good.
                var xpos = dim * 0.4 + x * 3,
                    ypos = dim * 0.6 + y * 3;
                dataset[i].x = xpos;
                dataset[i].y = ypos;
                dataset[i].T = ypos - dataset[i].height;
                dataset[i].B = ypos;
                dataset[i].L = xpos;
                dataset[i].R = xpos + dataset[i].width;

            }


            if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
                var temp = -dy;
                dy = dx;
                dx = temp;
            }

            // Check for collisions
            for (k = 0; k < dataset.length; k++) {
                // Skip comparisons if we're comparing
                // the same text element
                if (k === i) {
                    continue;
                }
                if (check_rectangle_intersect(dataset[i], dataset[k])) {
                    collision = true;
                    break;
                }
            }
            
            // Check if placement makes goes out
            // of the SVG. If so, count as a collision.
            if (!collision &&
                (dataset[i].T <= 0 ||
                dataset[i].B >= dim || 
                dataset[i].L <= 0 ||
                dataset[i].R >= dim)) {
                collision = true;
            }
            
            // If on the final loop, placement
            // has failed. Move it offscreen.
            if (j === (loops - 1)) {
                dataset[i].x = -500;
                dataset[i].y = -500;
                failed.push(dataset[i]);
            }

            x += dx;
            y += dy;
            
            // If a collision happened, reset
            // the flag and restart the loop,
            // otherwise stop the loop.
            if (collision) {
                collision = false;
                continue;
            } else {
                break;
            }

        }
    }
    // Log failed placements.
    console.log("Failed Placements: ", failed.length, ": ", failed);
}


/*
*   Places words in an archimedean spiral,
*   starting at the center of the SVG
*   and spiraling clockwise.
*/
function archimedean_spiral(dataset) {
    var failed = [],
        dim = options.svgSize;
    
    for (i = 0; i < dataset.length; i++) {
            loops = 2560;
        
        for(j = 0; j < loops; j++) {
            
            collision = false;
            
            // Find next placement along archimidean spiral
            var angle = .05 * j;
            var xpos = Math.floor(dim * 0.4 + (1 + 2 * angle) * Math.cos(angle)),
                ypos = Math.floor(dim * 0.6 + (1 + 2 * angle) * Math.sin(angle));
            dataset[i].x = xpos;
            dataset[i].y = ypos;
            dataset[i].T = ypos - dataset[i].height;
            dataset[i].B = ypos;
            dataset[i].L = xpos;
            dataset[i].R = xpos + dataset[i].width;
            
            // Check for collisions
            for (k = 0; k < dataset.length; k++) {
                // Skip comparisons if we're comparing
                // the same text element
                if (k === i) {
                    continue;
                }
                if (check_rectangle_intersect(dataset[i], dataset[k])) {
                    collision = true;
                    break;
                }
            }
            
            // Check if placement makes goes out
            // of the SVG. If so, count as a collision.
            if (!collision &&
                (dataset[i].T <= 0 ||
                dataset[i].B >= dim || 
                dataset[i].L <= 0 ||
                dataset[i].R >= dim)) {
                collision = true;
            }
            
            // If on the final loop, placement
            // has failed. Move it offscreen.
            if (j === (loops - 1)) {
                dataset[i].x = -500;
                dataset[i].y = -500;
                failed.push(dataset[i]);
            }
            
            // If a collision happened, reset
            // the flag and restart the loop,
            // otherwise stop the loop.
            if (collision) {
                collision = false;
                continue;
            } else {
                break;
            }
            
            
            
        }
    }
    // Log failed placements.
    console.log("Failed Placements: ", failed.length, ": ", failed);
}
/*
*   Places words randomly.
*   TODO - paste in algorithm
*/
function random_placement(dataset) {
    var failed = [],
        dim = options.svgSize;
    
    for (i = 0; i < dataset.length; i++) {
        // Try 2000 placements
        loops = 2000;
        
        // Store location of closest point to
        // the center
        var closest = {x: -1,
                        y: -1,
                        dist: 10000};
        
        for(j = 0; j < loops; j++) {
            
            collision = false;
            
            // Pick a random spot
            var xpos = rand(0.15 * dim, 0.85 * dim),
                ypos = rand(0.15 * dim, 0.85 * dim);
            dataset[i].x = xpos;
            dataset[i].y = ypos;
            dataset[i].T = ypos - dataset[i].height;
            dataset[i].B = ypos;
            dataset[i].L = xpos;
            dataset[i].R = xpos + dataset[i].width;
            
            // Check for collisions
            for (k = 0; k < dataset.length; k++) {
                // Skip comparisons if we're comparing
                // the same text element
                if (k === i) {
                    continue;
                }
                if (check_rectangle_intersect(dataset[i], dataset[k])) {
                    collision = true;
                    break;
                }
            }
            
            // Check if placement makes goes out
            // of the SVG. If so, count as a collision.
            if (!collision &&
                (dataset[i].T <= 0 ||
                dataset[i].B >= dim || 
                dataset[i].L <= 0 ||
                dataset[i].R >= dim)) {
                collision = true;
            }
            
            // Calculate distance to "center"
            var midx = dataset[i].R - dataset[i].L,
                midy = dataset[i].B - dataset[i].T,
                distance = Math.sqrt(Math.pow(dim * 0.4 - xpos, 2) + Math.pow(dim * 0.6 - ypos  , 2));
            
            // If the has been no collision and this 
            // position is closer than the previous
            // closest, keep it
            if (!collision && 
                distance < closest.dist) {
                closest.dist = distance;
                closest.x = xpos;
                closest.y = ypos;
            }
            
            // If on the final loop, placement
            // has failed. Move it offscreen.
            if (j === (loops - 1) &&
                closest.x === -1) {
                dataset[i].x = -500;
                dataset[i].y = -500;
                failed.push(dataset[i]);
            }
            
        }
        
        // Store the closest position
        var xpos = closest.x,
            ypos = closest.y;
        dataset[i].x = xpos;
        dataset[i].y = ypos;
        dataset[i].T = ypos - dataset[i].height;
        dataset[i].B = ypos;
        dataset[i].L = xpos;
        dataset[i].R = xpos + dataset[i].width;
    }
    // Log failed placements.
    console.log("Failed Placements: ", failed.length, ": ", failed);
}


/*
*   Basic collision detection for the
*   boundary boxes of two rectangles.
*   Actually checks if NO collision is
*   possible, then returns the opposite.
*/
function check_rectangle_intersect(rectA, rectB) {
    // Function to check intersection of two bounding boxes  
    return !(rectB.L > rectA.R ||
             rectB.R < rectA.L ||
             rectB.T > rectA.B ||
             rectB.B < rectA.T);
}

/*
*   Transitions the text elements to
*   their position based on the location
*   assigned via algorithm.
*/
function finalize_text_placement(options, dataset) {
    // Update and transition Text Elements to their proper locations
    var svg = d3.select("svg");
    svg.selectAll("text")
            .data(dataset)
            .transition()
            //.delay(function(d, i) {return i / options.numWords * 50;})
            .duration(1000)
            .attr("transform", function(d) {
                if (d.deg) {
                    newX = d.x + d.width;
                } else {
                    newX = d.x;
                }
                return "translate(" + newX + "," + d.y + ")rotate(" + d.deg + ")";
            })
            .attr("fill-opacity", 1);
}

/*
*   Comparison function for sorting
*   the full data set.
*/
function compare(a,b) {
    if (+a.count < +b.count) return 1;
    if (+a.count > +b.count) return -1;
    return 0;
}

/*
*   Simple creation of a fake dataset
*   to test the cloud. Uses a set of 
*   150+ unique words and assigns 
*   random frequencies to each.
*/
function read_test_data(options, dataset) {
    var word_list = ['batter',
                        'beancurd',
                        'beans',
                        'beef',
                        'beet',
                        'berry',
                        'biscuit',
                        'bitter',
                        'boysenberry',
                        'bran',
                        'bread',
                        'breadfruit',
                        'breakfast',
                        'brisket',
                        'broccoli',
                        'broil',
                        'caviar',
                        'celery',
                        'cereal',
                        'chard',
                        'cheddar',
                        'cheese',
                        'cheesecake',
                        'chef',
                        'cherry',
                        'chew',
                        'peas',
                        'chili',
                        'chips',
                        'chives',
                        'chicken',
                        'chopsticks',
                        'chow',
                        'chutney',
                        'cilantro',
                        'cinnamon',
                        'citron',
                        'citrus',
                        'clam',
                        'cloves',
                        'cobbler',
                        'coconut',
                        'crepe',
                        'crisp',
                        'crunch',
                        'crust',
                        'cucumber',
                        'cuisine',
                        'cupboard',
                        'cupcake',
                        'curds',
                        'currants',
                        'curry',
                        'custard',
                        'margarine',
                        'marionberry',
                        'marmalade',
                        'marshmallow',
                        'potatoes',
                        'mayonnaise',
                        'meat',
                        'meatball',
                        'meatloaf',
                        'melon',
                        'menu',
                        'meringue',
                        'micronutrient',
                        'milk',
                        'milkshake',
                        'millet',
                        'mincemeat',
                        'minerals',
                        'mint',
                        'mints',
                        'mochi',
                        'molasses',
                        'mole',
                        'mozzarella',
                        'muffin',
                        'mug',
                        'munch',
                        'mushroom',
                        'mussels',
                        'chocolate',
                        'mutton',
                        'pan',
                        'pancake',
                        'papaya',
                        'parsley',
                        'parsnip',
                        'pastry',
                        'pate',
                        'patty',
                        'peach',
                        'peanut',
                        'pea',
                        'pear',
                        'pecan',
                        'peapod',
                        'mustard',
                        'pepperoni',
                        'persimmon',
                        'pickle',
                        'picnic',
                        'pilaf',
                        'pineapple',
                        'pasta',
                        'pitcher',
                        'pizza',
                        'plate',
                        'platter',
                        'plum',
                        'poached',
                        'pomegranate',
                        'pomelo',
                        'pop',
                        'popsicle',
                        'popcorn',
                        'popovers',
                        'pork',
                        'pot',
                        'potato',
                        'saffron',
                        'sage',
                        'salami',
                        'salmon',
                        'salsa',
                        'salt',
                        'sandwich',
                        'sauce',
                        'sauerkraut',
                        'sausage',
                        'savory',
                        'scallops',
                        'scrambled',
                        'seaweed',
                        'soup',
                        'sour',
                        'soy',
                        'soybeans',
                        'soysauce',
                        'spaghetti',
                        'spareribs',
                        'spatula',
                        'spices',
                        'spicy',
                        'spinach',
                        'spoon',
                        'spork',
                        'pepper',
                        'steak',
                        'pie',
                        'protein',
                        'whale',
                        'nutella',
                        'banana',
                        'squid',
                        'rice',
                        'ostrich',
                        'rhino',
                        'pita',
                        'lemon',
                        'salad',
                        'apple',
                        'burger',
                        'ice',
                        'fruit',
                        'grain',
                        'oats',
                        'whey',
                        'casein'];


    // Create the dataset using items from the list and a random size
    for (i = 0; i < word_list.length; i++) {

        var obj = {'word': word_list[i],
                   'count': rand(1,150)};

        fullData.push(obj);
    };

    if (options.wordSort) {
            fullData.sort(compare);
    }

    build_cloud(options, fullData);

}