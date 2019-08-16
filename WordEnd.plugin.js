//META{"name":"WordEnd","website":"https://github.com/Aikufurr/WordEnd","source":"https://github.com/Aikufurr/WordEnd/blob/master/WordEnd.plugin.js"}*//


class WordEnd {
    getName() { return "WordEnd"; }
    getDescription() { return "Adds a word of your choice to the end of each word. Usage: end[text here]\nReport all issues to https://github.com/Aikufurr/WordEnd/issues"; }
    getVersion() { return "0.1.0"; }
    getAuthor() { return "Aikufurr"; }
    
    constructor() {
        this.classesDefault = {
            chat: "chat-3bRxxu",
            searchBar: "searchBar-2_Yu-C",
            messagesWrapper: "messagesWrapper-3lZDfY"
        };
        this.classesNormalized = {
            appMount: "da-appMount",
            chat: "da-chat",
            searchBar: "da-searchBar",
            messagesWrapper: "da-messagesWrapper"
        };
        this.classes = this.classesDefault;
    }
    
    
    load() { this.log('Loaded'); }

    getEndWord(){
        var EndWord = BdApi.loadData('WordEnd', 'ending') || "";
        this.log(EndWord)
        return EndWord
    }

    start(){
        this.log('Starting');

        this.EndWord = this.getEndWord();

        this.log("Ending word: " + this.EndWord);

        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        this.initialized = false;
        if (window.ZeresLibrary) this.initialize();
        else libraryScript.addEventListener("load", () => { this.initialize(); });
        // Fallback in case load fails to fire (https://github.com/planetarian/BetterDiscordPlugins/issues/2)
        setTimeout(this.initialize.bind(this), 5000);

    }

    error(text) {
        try {
            PluginUtilities.showToast(`[${this.getName()}] Error: ${text}`, {type:'error'});
        }
        catch (err) {}
        return console.error(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    observer({ addedNodes, removedNodes }) {
        if (!this.classes || !addedNodes || !addedNodes[0] || !addedNodes[0].classList) return;
        let cl = addedNodes[0].classList;

        if (cl.contains(this.classes.searchBar)
            || cl.contains(this.classes.chat)
            || cl.contains(this.classes.messagesWrapper)) {
            this.update();
        }
    }

    initialize(){
        if (this.initialized) return;
        this.initialized = true;

        this.update();

        try {
            PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
                "https://raw.githubusercontent.com/Aikufurr/WordEnd/master/WordEnd.plugin.js");
        }
        catch (err) {
            this.error("Couldn't update plugin.");
        }

        this.log("Initialized");
    }

    stop() {
        $('.' + this.classes.chat + ' textarea').off('keydown.wordwu');
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    // check on switch, in case BD updates emotes file while client is running
    onSwitch() {  }

    update() {
        let textArea = $('.' + this.classes.chat + ' textarea');
        if (!textArea.length) return;

        let inputBox = textArea[0];
        textArea.off('keydown.wordwu').on('keydown.wordwu', (e) => {
            // Corrupt text either when we press enter or tab-complete
            if ((e.which == 13 || e.which == 9) && inputBox.value) {
                let cursorPos = inputBox.selectionEnd;
                let value = inputBox.value;
                let tailLen = value.length - cursorPos;
                
                // If we pressed Tab, perform corruption only if the cursor is right after the closing braces.
                if (e.which == 9 && !value.substring(0, inputBox.selectionEnd).endsWith(':'))
                    return;
                // Markup format:
                // t:<text>:
                // text: text to generate emoji from
                let regex = /end\[(.*?)\]/g;
                if (regex.test(value)) {
                    value = value.replace(regex, this.doTexty.bind(this));
                    if (value == "") {
                        PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + value.length, {type: 'error'});
                        e.preventDefault();
                        return;
                    }
                    inputBox.focus();
                    inputBox.select();
                    document.execCommand("insertText", false, value);

                    // If we're using tab-completion, keep the cursor position, in case we were in the middle of a line
                    if (e.which == 9) {
                        let newCursorPos = value.length - tailLen;
                        inputBox.setSelectionRange(newCursorPos, newCursorPos);
                    }
                }
            }
        });
        
        this.initialized = true;
    }

    doTexty(match, text, offset, string, isReaction) {
        this.EndWord = this.getEndWord();
        this.log('text: ' + text);

        let output = '';

        output = text.split(" ").join(this.EndWord + " ")
        output += this.EndWord

        if (output.length > 1800)
        {
            return ""
        }
        this.log("Returning: " + output)
        return output;
    }
    getSettingsPanel() {
        const div = document.createElement('div');
        const wordsT = document.createElement('h6');
        const words = document.createElement('input');
        const br = document.createElement('br');
        const button = document.createElement('button');
        const se = document.createElement('script');
        const jq = document.createElement('script');
        se.setAttribute('type', 'text/javascript');
        se.innerHTML = "$(function() {$('#input1').on('keypress', function(e) {if (e.which == 32) return false;});});";
        jq.setAttribute('type', 'text/javascript');
        jq.src = "https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"
        button.innerText = 'Apply';
        button.style.cssFloat = 'right';
        button.style.backgroundColor = '#3E82E5';
        button.style.color = 'white';
        button.style.fontSize = '100%';
        wordsT.innerText = 'Word';
        words.placeholder = 'word to add to the end of each word, eg uwu';
        words.value = this.EndWord
        words.style.width = '100%';
        words.style.minHeight = '6ch';
        words.setAttribute("id", "input1");
        button.addEventListener('click', _ => {
            this.EndWord = words.value
            BdApi.saveData('WordEnd', 'ending', this.EndWord);
            this.EndWord = BdApi.loadData('WordEnd', 'ending') || "";
        });
        div.appendChild(wordsT);
        div.appendChild(words);
        div.appendChild(br);
        div.appendChild(button);
        document.head.appendChild(se);
        document.head.appendChild(jq);
        return div;
    }
}

/*@end @*/
