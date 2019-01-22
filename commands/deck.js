"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const ygopro_data_1 = require("ygopro-data");
const Command_1 = require("../modules/Command");
const configs_1 = require("../modules/configs");
const data_1 = require("../modules/data");
const util_1 = require("../modules/util");
const names = ["deck", "parse"];
const func = async (msg) => {
    if (msg.attachments.length < 1 || !msg.attachments[0].filename.endsWith(".ydk")) {
        await msg.channel.createMessage("Sorry, you need to upload a deck file to use this command!");
        return;
    }
    let lang = configs_1.config.getConfig("defaultLang").getValue(msg);
    const content = util_1.trimMsg(msg);
    for (const term of content.split(/ +/)) {
        if (data_1.data.langs.indexOf(term.toLowerCase()) > -1) {
            lang = term.toLowerCase();
        }
    }
    const file = msg.attachments[0];
    const deck = await request_promise_native_1.default(file.url);
    const deckRecord = {
        extra: {},
        monster: {},
        side: {},
        spell: {},
        trap: {}
    };
    let currentSection = "";
    for (const line of deck.split(/\r|\n|\r\n/)) {
        if (line.startsWith("#") || line.startsWith("!")) {
            currentSection = line.slice(1);
            continue;
        }
        const card = await data_1.data.getCard(line, lang);
        if (card) {
            let name = card.id.toString();
            if (card.text[lang]) {
                name = card.text[lang].name;
            }
            if (currentSection === "side") {
                if (name in deckRecord.side) {
                    deckRecord.side[name]++;
                }
                else {
                    deckRecord.side[name] = 1;
                }
            }
            else if (currentSection === "extra") {
                if (name in deckRecord.extra) {
                    deckRecord.extra[name]++;
                }
                else {
                    deckRecord.extra[name] = 1;
                }
            }
            else if (currentSection === "main") {
                if (card.data.isType(ygopro_data_1.enums.type.TYPE_MONSTER)) {
                    if (name in deckRecord.monster) {
                        deckRecord.monster[name]++;
                    }
                    else {
                        deckRecord.monster[name] = 1;
                    }
                }
                else if (card.data.isType(ygopro_data_1.enums.type.TYPE_SPELL)) {
                    if (name in deckRecord.spell) {
                        deckRecord.spell[name]++;
                    }
                    else {
                        deckRecord.spell[name] = 1;
                    }
                }
                else if (card.data.isType(ygopro_data_1.enums.type.TYPE_TRAP)) {
                    if (name in deckRecord.trap) {
                        deckRecord.trap[name]++;
                    }
                    else {
                        deckRecord.trap[name] = 1;
                    }
                }
            }
        }
    }
    let out = "Contents of `" + file.filename + "`:\n";
    const monsterCount = Object.keys(deckRecord.monster).length;
    if (monsterCount > 0) {
        out += "__" + monsterCount + " Monsters__:\n";
        for (const name in deckRecord.monster) {
            if (deckRecord.monster.hasOwnProperty(name)) {
                out += deckRecord.monster[name] + " " + name + "\n";
            }
        }
    }
    const spellCount = Object.keys(deckRecord.spell).length;
    if (spellCount > 0) {
        out += "__" + spellCount + " Spells__:\n";
        for (const name in deckRecord.spell) {
            if (deckRecord.spell.hasOwnProperty(name)) {
                out += deckRecord.spell[name] + " " + name + "\n";
            }
        }
    }
    const trapCount = Object.keys(deckRecord.trap).length;
    if (trapCount > 0) {
        out += "__" + trapCount + " Traps__:\n";
        for (const name in deckRecord.trap) {
            if (deckRecord.trap.hasOwnProperty(name)) {
                out += deckRecord.trap[name] + " " + name + "\n";
            }
        }
    }
    const extraCount = Object.keys(deckRecord.extra).length;
    if (extraCount > 0) {
        out += "__" + extraCount + " Extra Deck__:\n";
        for (const name in deckRecord.extra) {
            if (deckRecord.extra.hasOwnProperty(name)) {
                out += deckRecord.extra[name] + " " + name + "\n";
            }
        }
    }
    const sideCount = Object.keys(deckRecord.side).length;
    if (sideCount > 0) {
        out += "__" + sideCount + " Side Deck__:\n";
        for (const name in deckRecord.side) {
            if (deckRecord.side.hasOwnProperty(name)) {
                out += deckRecord.side[name] + " " + name + "\n";
            }
        }
    }
    const outStrings = [];
    const MESSAGE_CAP = 2000;
    while (out.length > MESSAGE_CAP) {
        let index = out.slice(0, MESSAGE_CAP).lastIndexOf("\n");
        if (index === -1 || index >= MESSAGE_CAP) {
            index = out.slice(0, MESSAGE_CAP).lastIndexOf(".");
            if (index === -1 || index >= MESSAGE_CAP) {
                index = out.slice(0, MESSAGE_CAP).lastIndexOf(" ");
                if (index === -1 || index >= MESSAGE_CAP) {
                    index = MESSAGE_CAP - 1;
                }
            }
        }
        outStrings.push(out.slice(0, index + 1));
        out = out.slice(index + 1);
    }
    outStrings.push(out);
    const chan = await msg.author.getDMChannel();
    for (const outString of outStrings) {
        await chan.createMessage(outString);
    }
    await msg.addReaction("📬");
};
exports.cmd = new Command_1.Command(names, func);
//# sourceMappingURL=deck.js.map