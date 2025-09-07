
/**
 * The GameContainer class is responsible for allowing classes to access HTML elements.
 *  Primarily consists of the areas where the game will be played, messages will be displayed, and user input will be taken.
 * The methods provide access to these elements via accessors.
 */
class GameContainer {

    /**
     * The constructor initializes references to various HTML elements by their IDs so that we don't have to repeatedly query the DOM.
     */
    constructor() {
        this.userInput = document.getElementById("userInput");
        this.goButton = document.getElementById("goButton");
        this.messageArea = document.getElementById("message");
        this.promptArea = document.getElementById("promptArea");
        this.playStage = document.getElementById("playStage");
        this.buttonArea = document.getElementById("buttonArea");
    }

    getPlayStage() {
        return this.playStage;
    }

    getMessageArea() {
        return this.messageArea;
    }

    getUserInput() {
        return this.userInput;
    }

    getGoButton() {
        return this.goButton;
    }

    getPromptArea() {
        return this.promptArea;
    }
    getButtonArea() {
        return this.buttonArea;
    }
}


/**
 * The Messenger class is responsible for displaying messages to the user.
 *  The strings are stored in a separate constant file.
 */
class Messenger {
    /**
     * 
     * @param {GameContainer} container obj so that we can access the  area where the messages will be displayed.
     */
    constructor(container) {
        this.messageArea = container.getMessageArea();
    }

    /**
     *  Displays a message in the message area.
     * @param {string}  message to be displayed. Depends on the current game state.
     */
    displayMessage(message) {
        this.messageArea.innerText = message;
    }

    /**
     * Clears the message area.
     */
    clearMessage() {
        this.messageArea.innerText = "";
    }
}


/**
 *  The Validator class is responsible for ensuring that the user inputted values are valid.
 */
class Validator {

    /**
     *  Checks if the input is a valid integer from 3 to 7.
     *  The method checks if the status of the input, type, and if it is within range.
     */
    constructor(messenger) {
        this.messenger = messenger;
    }
    checkInput(input) {
        if (input === null || input === undefined || isNaN(input)) {
            this.messenger.displayMessage(MESSAGES["WRONG_INPUT_TYPE"]);
            return false;
        }

        if (input < 3 || input > 7) {
            this.messenger.displayMessage(MESSAGES["NOT_IN_RANGE"]);
            return false;
        }
        return true;
    }
}

/**
 * The GameButton class represents an individual button in the game.
 * It handles the appearance and location of the button on the screen..
 */
class GameButton {
    /**
     * The constructor primarily sets up the appearance and adds it to the container.
     * @param {number} id, unique and is used to check the order for the game.
     * @param {string} color  
     * @param {HTMLElement} container 
     */
    constructor(id, color, container) {
        this.id = id;
        this.color = color;
        this.buttonObj = document.createElement("button");
        this.buttonObj.style.backgroundColor = color;
        this.buttonObj.style.width = STYLE_CONFIG["BUTTON_WIDTH"];
        this.buttonObj.style.height = STYLE_CONFIG["BUTTON_HEIGHT"];
        this.buttonObj.style.margin = STYLE_CONFIG["MARGIN"];
        this.buttonObj.style.display = "inline-block";
        container.appendChild(this.buttonObj);
    }

    /**
     * Shows the number on the button, which is its id and order in the sequence.
     * The +1 is because the id starts from 0 .
     */
    showNumber() {
        this.buttonObj.textContent = this.id + 1;
    }

    /**
     * Hides the number on the button, to be used for when guessing.
     */
    hideNumber() {
        this.buttonObj.textContent = "";
    }

    /**
     * Sets the location of the button to the specified x and y coordinates.
     * The location is randomized during the scrambling phase.
     * @param {number} x 
     * @param {number} y 
     */
    setLocation(x, y) {
        this.buttonObj.style.position = "absolute";
        this.buttonObj.style.left = x + "px";
        this.buttonObj.style.top = y + "px";
    }

}

/**
 * The ButtonManager class is responsible for creating and managing multiple GameButton instances.
 */
class ButtonManager {
    /**
     * The constructor initializes the button manager with a container for the buttons.
     * @param {GameContainer} container 
     */
    constructor(container) {
        this.buttons = [];
        this.container = container.getButtonArea();
    }

    /**
     *  Creates the specified number of buttons with random colors for the game.
     * @param {number} btnNum, represents the amount of buttons to be made.
     */
    makeButton(btnNum) {
        let availableColors = [...STYLE_CONFIG["BUTTON_COLORS"]];// copy so we dont modify the original

        for (let i = 0; i < btnNum; i++) {
            const randomIdx = Math.floor(Math.random() * availableColors.length);
            const btnColor = availableColors[randomIdx];
            availableColors.splice(randomIdx, 1); // remove  selected color so we dont repeat colors

            let newButton = new GameButton(i, btnColor, this.container);
            this.buttons.push(newButton);
            newButton.showNumber();
        }
    }

    /**
     * Clears all buttons from the container.
     */
    clearButtons() {
        this.container.innerHTML = "";
        this.buttons = [];
    }
}


/**
 * The GameManager class is the main controller for the game.
 * The class initializes all other classes and manages the flow of the game.
 */
class GameManager {
    constructor() {
        this.gameContainer = new GameContainer();
        this.messenger = new Messenger(this.gameContainer);
        this.buttonManager = new ButtonManager(this.gameContainer);
        this.validator = new Validator(this.messenger);

        this.gameInProgress = false;
        this.clickedOrder = [];
        this.ogOrder = [];

        this.userInput = this.gameContainer.getUserInput();
        this.goButton = this.gameContainer.getGoButton();
        this.goButton.addEventListener("click", () => this.initGame());
    }

    /**
     * Initializes the game when the "Go" button is clicked.
     * FIrst checks if a game is ongoing, then validates user input, and starts the game if valid.
     */
    initGame() {
        if (this.gameInProgress) {
            this.buttonManager.clearButtons();
            this.messenger.clearMessage();
            this.ogOrder = [];
            this.clickedOrder = []; // for resets
            this.gameInProgress = false;
        }
        let userValue = parseInt(this.userInput.value.trim());
        if (this.validator.checkInput(userValue)) {
            this.buttonManager.makeButton(userValue);
            this.messenger.displayMessage(MESSAGES["START"]);
            this.gameInProgress = true;
            this.playGame(userValue);
        }
    }

    /**
     * 
     * @param {number} userValue , the number of seconds to show the buttons and the number of times to scramble.
     */
    async playGame(userValue) {
        this.ogOrder = this.buttonManager.buttons.map(button => button.id); // map the id to the original order
        this.clickedOrder = []; // the order the user clicked which is then compared to the original order for correctness

        await this.pause(userValue * 1000); // pause for the number of seconds the user inputted

        this.buttonManager.buttons.forEach(button => button.hideNumber());

        await this.scrambleButtons(userValue); // scrambles the buttons
        this.memoryTest(); // starts the guessing game

    }

    /**
     * Pauses the game for a specified number of seconds.
     * Utilized during scrambling phase.
     * @param {number} seconds 
     * @returns {Promise}  
     */
    async pause(seconds) {
        return new Promise(wait => setTimeout(wait, seconds));
    }

    /**
     * Scrambles the buttons' positions on the screen.
     * @param {number} times - The number of times to scramble the buttons.
     */
    async scrambleButtons(times) {

        /**\
         * ChatGPT helped with fetching button size , getting the current size of the window and the formula for calculating the x and y coords.
         *  to ensure the buttons stay within the viewport.
        */
        const btnWidth = this.buttonManager.buttons[0].buttonObj.offsetWidth;
        const btnHeight = this.buttonManager.buttons[0].buttonObj.offsetHeight;
        const margin = STYLE_CONFIG["EDGE_MARGIN"];

        for (let i = 0; i < times; i++) {
            this.buttonManager.buttons.forEach(button => {
                const maxX = window.innerWidth - btnWidth - margin;
                const maxY = window.innerHeight - btnHeight - margin;

                const x = margin + Math.random() * (maxX - margin);
                const y = margin + Math.random() * (maxY - margin);

                button.setLocation(x, y);
            });

            await this.pause(2000);
        }
    }

    /**
     * Runs the guessing game .
     */
    memoryTest() {
        this.messenger.displayMessage(MESSAGES["GAME_STARTED"]);
        this.buttonManager.buttons.forEach(button => {
            button.buttonObj.onclick = null; // clean any previous event listeners

            button.buttonObj.addEventListener("click", () => { // event listener per button that the user clicks
                this.checkClick(button);
            });
        });
    }

    /**
     * Checks the user's click and determines if it matches the xpected order.
     * @param {Object} button - The button that was clicked.
     */
    checkClick(button) {
        const expected = this.ogOrder[this.clickedOrder.length];

        if (button.id === expected) {
            button.showNumber();
            this.clickedOrder.push(button.id); // add right guesses to the clicked order 

            if (this.clickedOrder.length === this.ogOrder.length) {
                this.messenger.displayMessage(MESSAGES["WIN"]);
            }
        } else {
            this.messenger.displayMessage(MESSAGES["LOSE"]);

            this.buttonManager.buttons.forEach(btn => btn.showNumber()); // after mistake, reveal order

            this.buttonManager.buttons.forEach(btn => (btn.buttonObj.onclick = null)); // prevents any clicks to go through after losing

        }

    }
}

/**
 * Loads the game once the DOM content is fully loaded.
 */
document.addEventListener("DOMContentLoaded", () => {
    new GameManager();
});

/**
 * AI use acknowledgement: Sections of the code were assisted by AI (ChatGPT). The sections where it was used have been commented accordingly. 
 */ 