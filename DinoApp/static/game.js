// import sendMessage from "./socket.js"


class Game {
    static INITIAL_VELOCITY = 100
    static ACCELERATION = Game.INITIAL_VELOCITY / -15
    static UNIT = 0.6

    constructor() {
        this.gameOver = false;

        // set the dino configurations
        this.dino = document.createElement('img');
        this.dino.src = 'static/files/dino/dino.png';
        this.dino_velocity = 0.5
        this.dino.id = "dino"
        this.dino.width = 100
        this.dino.style.bottom = "0%"
        this.dino_stationary = true

        // set the dino style
        this.grid = document.getElementById("grid")
        this.grid.appendChild(this.dino)
        // this.dino_halt_position = this.dino.offsetTop


        // jumping
        this.jumping = false
        this.time = 0


        // trees    
        this.tree_frequency = 1
        this.tree_speed = 100 / 20

        // score
        this.score = 0
        this.trees_crossed = 0

    }

    jump = () => {
        if (this.gameOver) {
            return;
        }
        if (!this.dino_stationary) {
            return;
        }
        this.dino_stationary = false
        this.dino.style.transition = `bottom ${this.dino_velocity}s`;
        this.dino.style.bottom = `50%`;

        // After 2 seconds, move the this.dino back to its original position
        setTimeout(() => {
            // console.log("set downwards");
            this.dino.style.bottom = '0%';
            this.jumping = false;
            setTimeout(() => {

                // console.log("dino stationary")
                this.dino_stationary = true;
            }, this.dino_velocity * 800)
        }, this.dino_velocity * 1000);
    }

    setClosestTree = () => {
        if (this.gameOver) {
            return;
        }
        var div = document.getElementById("grid");

        if (div) {
            var images = div.getElementsByTagName("img");

            // Convert images HTMLCollection to an array for iteration
            var imagesArray = Array.from(images);

            var current_closest_tree = undefined
            imagesArray.forEach((image) => {
                if ((image.offsetLeft > (this.dino.offsetLeft))) {

                    if (!current_closest_tree) {
                        current_closest_tree = image
                    }
                }
            });
            if ((current_closest_tree && this.closest_tree) && this.closest_tree.offsetLeft < current_closest_tree.offsetLeft) {
                this.trees_crossed += 1
                console.log("tree crossed")
            }
            this.closest_tree = current_closest_tree
        } else {
            console.log("Div element not found.");
        }
    }

    addTree() {
        if (this.gameOver) {
            return;
        }
        var randomAdditionChoice = Math.floor(Math.random() * 2);
        if (!randomAdditionChoice) {
            // console.log("no tree added")
            return;
        }
        // List of image paths
        var imagePaths = [
            "static/files/dino/tree-1.png",
            "static/files/dino/tree-2.png",
            "static/files/dino/tree-3.jpg",
            "static/files/dino/tree-4.jpg",
            // Add more image paths as needed
        ];

        // Randomly select an image path
        var randomImagePath = imagePaths[Math.floor(Math.random() * imagePaths.length)];

        // Create the image element
        var image = document.createElement("img");
        image.src = randomImagePath;


        // Set CSS styles for image transition
        image.style.position = "absolute";
        image.style.left = "140%";
        image.style.transition = `left ${this.tree_speed}s linear`;
        image.width = 80
        image.height = 100

        // Get the div element by id
        var grid = document.getElementById("grid");

        // Append the image to the div element
        grid.appendChild(image);

        // Trigger the transition by setting the left property after a short delay
        setTimeout(function () {
            image.style.left = "-10%";
        }, 100);

    }

    purgeTrees() {
        if (this.gameOver) {
            return;
        }
        var div = document.getElementById("grid");

        if (div) {
            var images = div.getElementsByTagName("img");

            // Convert images HTMLCollection to an array for iteration
            var imagesArray = Array.from(images);

            imagesArray.forEach(function (image) {
                if (image.offsetLeft < 20) {

                    image.remove();
                }
            });
        } else {
            console.log("Div element not found.");
        }

    }

    checkOverlapping = () => {
        if (this.gameOver) {
            return;
        }
        var image1 = this.dino
        var image2 = this.closest_tree

        if (image1 && image2) {
            var rect1 = image1.getBoundingClientRect();
            var rect2 = image2.getBoundingClientRect();

            // Check for overlap
            var overlap = !(rect1.right < rect2.left ||
                rect1.left > rect2.right ||
                rect1.bottom < rect2.top ||
                rect1.top > rect2.bottom);

            return overlap;
        } else {
            // console.log("Image element not found.");
            return false;
        }

    }

    setGameInfo = () => {
        if (this.gameOver) {
            return;
        }
        // dino position
        var dino_pos_tag = document.getElementById("game-info-position")
        var dino_position = game.dino_halt_position - game.dino.offsetTop
        dino_pos_tag.innerHTML = dino_pos_tag.innerHTML.split(":")[0] + `: ${dino_position}`

        // closest tree
        dino_pos_tag = document.getElementById("game-info-tree")
        if (this.closest_tree) {
            var closest_tree_dist = game.closest_tree.offsetLeft - (game.dino.offsetLeft + this.dino.width)
        } else {
            var closest_tree_dist = "-"
        }
        dino_pos_tag.innerHTML = dino_pos_tag.innerHTML.split(":")[0] + `: ${closest_tree_dist}`

        // score
        dino_pos_tag = document.getElementById("game-info-score")
        this.score += this.tree_speed / 10
        dino_pos_tag.innerHTML = dino_pos_tag.innerHTML.split(":")[0] + `: ${Math.floor(this.score)}`

        // trees crossed
        dino_pos_tag = document.getElementById("game-info-crossed")
        dino_pos_tag.innerHTML = dino_pos_tag.innerHTML.split(":")[0] + `: ${this.trees_crossed}`

        this.getMove()
    }

    getMove = () => {
        if (this.closest_tree) {
            var closest_tree_dist = game.closest_tree.offsetLeft - (game.dino.offsetLeft + this.dino.width)
        } else {
            var closest_tree_dist = 1000
        }
        var data = {
            "crossed": this.trees_crossed,
            "position": this.dino_halt_position - this.dino.offsetTop,
            "score": this.score,
            "closest_tree": closest_tree_dist
        }
        console.log(JSON.stringify(data))
        sendMessage(JSON.stringify(data))
    }

}
game = new Game()

// when space is pressed
var handleJump = function (event) {
    if (event.code === "Space") {
        game.jump()
    }
}
window.addEventListener("keydown", handleJump);
// setInterval(game.addTree, game.tree_frequency * 3000)
var gameInfoInterval = setInterval(() => {
    game.setGameInfo()
}, 50)

var addTreeInterval = setInterval(() => {
    game.addTree()
}, 1000)


var purgeTreesInterval = setInterval(() => {
    game.purgeTrees()
}, 3000)


var checkOverlappingInterval = setInterval(() => {
    if (game.checkOverlapping()) {
        var fail = document.getElementById("game-info-fail")
        fail.style.display = "block"
        game.score = 0;
        game.trees_crossed = 0;
        game.gameOver = true;
        clearInterval(addTreeInterval)
        clearInterval(purgeTreesInterval)
        clearInterval(setClosestTreeInterval)
        window.removeEventListener("keydown", handleJump);


    } else {
        var fail = document.getElementById("game-info-fail")
        fail.style.display = "none"

    }
}, 50)


var setClosestTreeInterval = setInterval(() => {
    game.setClosestTree()
}, 50)


setTimeout(() => {
    game.dino_halt_position = game.dino.offsetTop
}, 100)

