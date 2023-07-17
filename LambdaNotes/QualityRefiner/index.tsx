import QualityRefiner from './QualityRefiner';

// This will use langchain to ask a model with initially zero temperature to guess what
//  concept or term is being described in the qualities
const askForAnswer = (qualities: Quality[]) => {};

/*
 * The goal is to play a sort of "game". The user tries to get the model to consistently guess the thing
 *  they're describing.
 *
 * The player will start by thinking of a concept. Maybe there's a place to type it in, but the model isn't told.
 *
 * They then present as many "qualities" as they want.
 * A potential quality not within the spirit of the rules could just be "it's an apple".
 * Another approach would be "it's a fruit typically red or green very common to make pies out of"
 *
 * This feels like a gimme, especially for a person to guess. It's also just one quality.
 * Someone could also, theoretically, say "a pear" in good faith, and technically be 'right'.
 *
 * So instead, we phrase our qualities more axiomatically. They may not all be always true for all "apples",
 *  but they're rarely even "mostly" true for the vast majority of things that are NOT an apple.
 *
 * "They're a fruit"
 * "They're often red"
 * "They're often green"
 * "They're often some mix of red and green, more toward yellow"
 * "They have a stem"
 * "They're usually quite completely round"
 *
 * If it sometimes turns out that it guesses "pear" then you could even specifically encode the
 * negative qualities of "not a pear" to help it learn the difference.
 *
 * "Their shape isn't particularly important, despite being distinct."
 *
 * It's wordy, and maybe so complex it devolves the entire set of qualities.
 *
 * How can you bake in more of this distinction into the language of the other, more "they _are_" qualities?
 *
 * That's the whole point of the game, truly.
 * After implementing the base mechanics that call the "askForAnswer" function (which is just a quick langchain against a prompt),
 *   maybe I'll add things like "complexity score" that attempts to almost deterministically judge how complex the qualities are.
 * Maybe some kind of semantic analysis against a custom word2vec model (or maybe not custom?) that judges how "essential" each
 * quality is in a vacuum, and relative to the average vacuum created by the convolution or collection of the other qualities.
 *
 */

export default QualityRefiner;
